import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single()
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  try {
    const body = await request.json()
    const { 
      price_per_unit, 
      in_stock, 
      notes,
      available_stock,
      delivery_availability,
      service_pincodes,
      status
    } = body

    const updatePayload: any = { updated_at: new Date().toISOString() }
    
    if (price_per_unit !== undefined) updatePayload.price_per_unit = price_per_unit
    if (in_stock !== undefined) updatePayload.in_stock = in_stock
    if (notes !== undefined) updatePayload.notes = notes
    if (available_stock !== undefined) updatePayload.available_stock = available_stock
    if (delivery_availability !== undefined) updatePayload.delivery_availability = delivery_availability
    if (service_pincodes !== undefined) updatePayload.service_pincodes = service_pincodes
    if (status !== undefined) updatePayload.status = status // Allows pause/activate

    const { data, error } = await supabase
      .from('listings')
      .update(updatePayload)
      .eq('id', params.id)
      .eq('vendor_id', vendor.id) // Ensure vendor owns it
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single()
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', params.id)
    .eq('vendor_id', vendor.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
