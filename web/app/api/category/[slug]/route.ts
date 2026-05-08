import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient()
  
  try {
    // 1. Fetch category
    const { data: category, error: catErr } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', params.slug)
      .single()

    if (catErr || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // 2. Fetch materials in this category
    const { data: materials } = await supabase
      .from('materials')
      .select('*')
      .eq('category_id', category.id)
      .order('name')

    return NextResponse.json({ category, materials: materials || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
