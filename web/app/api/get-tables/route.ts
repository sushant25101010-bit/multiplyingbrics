import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json({ tables: Object.keys(data.definitions || {}) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message })
  }
}
