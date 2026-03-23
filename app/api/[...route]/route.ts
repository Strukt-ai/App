import { NextRequest, NextResponse } from 'next/server'
import { callBackend } from '@/lib/backend-adapter'

// Allowed API path prefixes — block unknown routes from reaching backend
const ALLOWED_PREFIXES = [
  '/api/runs',
  '/api/sam3d',
  '/api/system',
  '/api/worker',
  '/api/admin',
  '/api/debug',
  '/api/proxy-glb',
  '/api/payments',
  '/api/user',
]

// Max request body size (50MB for image uploads, enforced client-side too)
const MAX_BODY_BYTES = 50 * 1024 * 1024

async function handler(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname
    const queryString = request.nextUrl.search

    // Block requests to unknown API paths
    const isAllowed = ALLOWED_PREFIXES.some(prefix => path.startsWith(prefix))
    if (!isAllowed) {
      return NextResponse.json({ error: 'Unknown API endpoint' }, { status: 404 })
    }

    const method = request.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'
    const headers: Record<string, string> = {}

    // Extract headers
    request.headers.forEach((value, key) => {
      if (!['host', 'x-forwarded-for', 'x-forwarded-proto', 'x-forwarded-host'].includes(key)) {
        headers[key] = value
      }
    })

    // Parse body
    let body: unknown = undefined
    let rawBody: Buffer | undefined = undefined
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = headers['content-type'] || ''
      if (contentType.includes('application/json')) {
        try {
          body = JSON.parse(await request.text())
        } catch {
          body = await request.text()
        }
      } else if (request.body) {
        // Binary / multipart / SVG — read raw bytes for passthrough
        rawBody = Buffer.from(await request.arrayBuffer())
        if (rawBody.length > MAX_BODY_BYTES) {
          return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
        }
      }
    }

    // Parse query string
    const query: Record<string, string> = {}
    new URLSearchParams(queryString).forEach((value, key) => {
      query[key] = value
    })

    // Call universal backend adapter
    const response = await callBackend({
      path,
      method,
      body: rawBody ?? body,
      query,
      headers
    })

    // Create headers for response
    const newHeaders = new Headers(response.headers)
    const allowedOrigins = (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim())
    const reqOrigin = request.headers.get('origin') || ''
    if (allowedOrigins.includes(reqOrigin)) {
      newHeaders.set('Access-Control-Allow-Origin', reqOrigin)
    }
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return new NextResponse(JSON.stringify(response.data), {
      status: response.status,
      headers: newHeaders,
    })
  } catch (error) {
    console.error('API proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    )
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
export const HEAD = handler
