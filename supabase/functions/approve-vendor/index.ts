import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Need service role to bypass RLS to check admin and update
    )

    // Verify admin role via JWT
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) throw new Error('Unauthorized')

    const { data: userData, error: roleError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (roleError || userData.role !== 'admin') {
      return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { vendor_id, action, rejection_note } = await req.json()

    if (action === 'approve') {
      // 1. Get user_id from vendor
      const { data: vendor, error: vErr } = await supabaseClient.from('vendors').select('user_id').eq('id', vendor_id).single()
      if (vErr) throw vErr;

      // 2. Update vendor status
      await supabaseClient.from('vendors').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', vendor_id)
      
      // 3. Update user role
      await supabaseClient.from('users').update({ role: 'vendor' }).eq('id', vendor.user_id)
      
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } else if (action === 'reject') {
      const { data: vendor, error: vErr } = await supabaseClient.from('vendors').select('user_id').eq('id', vendor_id).single()
      if (vErr) throw vErr;

      await supabaseClient.from('vendors').update({ status: 'rejected', rejection_note }).eq('id', vendor_id)
      await supabaseClient.from('users').update({ role: 'buyer' }).eq('id', vendor.user_id)

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    } else {
       throw new Error('Invalid action')
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
