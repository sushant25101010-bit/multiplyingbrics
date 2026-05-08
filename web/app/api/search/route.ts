import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const material_id = searchParams.get('material_id')
  const pincode = searchParams.get('pincode')

  if (!material_id || !pincode) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const response = await fetch(`${supabaseUrl}/functions/v1/search-listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ material_id, pincode }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Search failed' }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
