import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify admin
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { action, rejection_note } = await request.json()

    // Map action to status
    const status = action === 'approve' ? 'approved' : 'rejected'

    // Update vendor status
    const { error: vendorError } = await supabase
      .from('vendors')
      .update({ 
        status: status,
        rejection_note: rejection_note || null
      })
      .eq('id', params.id)

    if (vendorError) {
      console.error("VENDOR UPDATE ERROR:", vendorError)
      throw vendorError
    }

    // If approved, also upgrade the user's role to 'vendor'
    if (action === 'approved') {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('user_id')
        .eq('id', params.id)
        .single()
        
      if (vendorData?.user_id) {
        const { error: userError } = await supabase
          .from('users')
          .update({ role: 'vendor' })
          .eq('id', vendorData.user_id)
          
        if (userError) throw userError
      }
    }

    return NextResponse.json({ success: true, message: `Vendor successfully ${action}` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
