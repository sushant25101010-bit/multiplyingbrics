import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendVendorNotificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { vendor_id, listing_id, message } = await request.json()

    if (!vendor_id || !message) {
      return NextResponse.json({ error: 'Vendor and message are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        buyer_id: user.id,
        vendor_id,
        listing_id,
        message,
        status: 'open'
      })
      .select()
      .single()

    if (error) throw error

    // Async Email Notification - decoupled so it never blocks enquiry creation
    ;(async () => {
      try {
        // Fetch buyer details
        const { data: buyer } = await supabase.from('users').select('full_name, phone, email').eq('id', user.id).single()
        
        // Fetch vendor details
        const { data: vendorData } = await supabase.from('vendors').select('business_name, user_id').eq('id', vendor_id).single()
        let vendorEmail = ''
        let vendorName = vendorData?.business_name || 'Vendor'
        if (vendorData?.user_id) {
          const { data: vendorUser } = await supabase.from('users').select('email').eq('id', vendorData.user_id).single()
          if (vendorUser?.email) vendorEmail = vendorUser.email
        }

        // Fetch listing details
        let productName = 'Product'
        let categoryName = 'Category'
        if (listing_id) {
          const { data: listingData } = await supabase.from('listings').select('material_id').eq('id', listing_id).single()
          if (listingData?.material_id) {
            const { data: materialData } = await supabase.from('materials').select('name, category_id').eq('id', listingData.material_id).single()
            if (materialData) {
              productName = materialData.name
              if (materialData.category_id) {
                const { data: categoryData } = await supabase.from('categories').select('name').eq('id', materialData.category_id).single()
                if (categoryData) categoryName = categoryData.name
              }
            }
          }
        }

        // Extract potential details from message if no direct fields exist
        // As per current structure, quantity and pincode are not separate fields in the POST payload
        // We will pass 'Not specified' or parse from message if we wanted, but the prompt says 
        // "quantityRequested", "deliveryAddress", "pincode" are required in template.
        // We'll pass placeholders for anything missing, or parse it simply:
        
        if (vendorEmail) {
          await sendVendorNotificationEmail({
            vendorEmail,
            vendorName,
            customerName: buyer?.full_name || 'Anonymous Buyer',
            customerPhone: buyer?.phone || 'Not provided',
            customerEmail: buyer?.email || 'Not provided',
            productName,
            categoryName,
            quantityRequested: data.quantity_requested?.toString() || 'As per enquiry',
            deliveryAddress: 'Not specified',
            pincode: data.pincode || 'Not specified',
            enquiryDate: new Date(data.created_at || Date.now()).toLocaleString(),
            enquiryId: data.id
          })
        }
      } catch (err) {
        console.error('Failed to process vendor email notification:', err)
      }
    })();
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
