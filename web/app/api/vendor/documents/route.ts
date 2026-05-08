import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: vendor, error: vendorErr } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (vendorErr || !vendor) {
    return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const doc_type = formData.get('doc_type') as string

    if (!file || !doc_type) {
      return NextResponse.json({ error: 'File and doc_type are required' }, { status: 400 })
    }

    if (!['gst', 'pan', 'trade_licence'].includes(doc_type)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const storagePath = `${vendor.id}/${doc_type}_${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('vendor-documents')
      .upload(storagePath, file)

    if (uploadError) throw uploadError

    const { data: doc, error: dbError } = await supabase
      .from('documents')
      .insert({
        vendor_id: vendor.id,
        doc_type,
        storage_path: storagePath
      })
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({ success: true, document: doc })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
