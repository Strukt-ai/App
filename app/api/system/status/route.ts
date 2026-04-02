import { NextResponse } from 'next/server'
import { register } from '@/instrumentation'

// Initialize server-side OpenTelemetry once per module load
try {
  register()
} catch (e) {
  console.error('OTel register failed', e)
}

export async function GET() {
  const uptime = process.uptime()
  const serverTime = new Date().toISOString()

  return NextResponse.json({
    ok: true,
    message: 'System status OK',
    serverTime,
    uptime,
  })
}
