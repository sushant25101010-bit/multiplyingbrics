import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category_id = searchParams.get('category_id')
  
  const supabase = createClient()
  
  let query = supabase.from('materials').select('*').order('name')
  
  if (category_id) {
    query = query.eq('category_id', category_id)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
