import { NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const script = searchParams.get('script')
    if (!script) return NextResponse.json({ error: 'No script provided' })
    const { stdout, stderr } = await execFileAsync(process.execPath, [script], { cwd: 'd:\\multiplyingbrics\\web' })
    return NextResponse.json({ stdout, stderr })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stderr: err.stderr })
  }
}
