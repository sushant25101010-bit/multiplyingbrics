import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { avatar_url } = await request.json()

    const { error } = await supabase
      .from('users')
      .update({ avatar_url })
      .eq('id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true, avatar_url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
