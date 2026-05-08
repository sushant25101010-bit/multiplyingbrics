import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0"
import { Ratelimit } from "npm:@upstash/ratelimit@1";
import { Redis } from "npm:@upstash/redis@1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const clientIP = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await ratelimit.limit(`search:${clientIP}`);
    
    if (!success) {
      return new Response(JSON.stringify({ error: "Too many requests" }), { 
        status: 429, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { material_id, pincode } = await req.json()

    if (!material_id || !pincode) {
      return new Response(JSON.stringify({ error: "material_id and pincode are required" }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 1. Exact Pincode Match
    let { data: listings, error } = await supabase
      .from('listings')
      .select(`
        *,
        vendor:vendors(*),
        material:materials(*)
      `)
      .eq('material_id', material_id)
      .eq('pincode', pincode)
      .eq('in_stock', true)
      .order('price_per_unit', { ascending: true })

    if (error) throw error

    let fallback_pincode: string | undefined;
    let fallback_area: string | undefined;

    // 2. Fallback if no results
    if (listings && listings.length === 0) {
      const pinApi = Deno.env.get("POSTALPIN_API_BASE") || "https://api.postalpincode.in/pincode";
      const pinRes = await fetch(`${pinApi}/${pincode}`);
      const pinData = await pinRes.json();

      if (pinData && pinData[0]?.Status === "Success") {
        const postOffices = pinData[0].PostOffice;
        if (postOffices && postOffices.length > 0) {
          // Find all pincodes in the same district/taluka
          const district = postOffices[0].District;
          // In a real production app, you might have a table of geo-pincodes.
          // For this requirement, we'll try to find listings from other vendors 
          // that serve this district or nearby pincodes provided by the API.
          const nearbyPincodes = Array.from(new Set(postOffices.map((po: any) => po.Pincode))) as string[];
          
          if (nearbyPincodes.length > 0) {
             const { data: fallbackListings, error: fbError } = await supabase
              .from('listings')
              .select(`
                *,
                vendor:vendors(*),
                material:materials(*)
              `)
              .eq('material_id', material_id)
              .in('pincode', nearbyPincodes)
              .eq('in_stock', true)
              .order('price_per_unit', { ascending: true })

             if (!fbError && fallbackListings && fallbackListings.length > 0) {
               listings = fallbackListings;
               fallback_pincode = nearbyPincodes[0]; // Simplified fallback ref
               fallback_area = district;
             }
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      listings, 
      fallback_pincode, 
      fallback_area 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
