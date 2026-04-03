/**
 * Universal Backend Adapter
 * Routes all requests to backend via HTTP proxy
 * All backend services (Python FastAPI) run as separate processes
 */

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'

export interface BackendRequest {
  method: RequestMethod
  path: string
  query?: Record<string, string>
  body?: any
  headers?: Record<string, string>
}

export interface BackendResponse {
  status: number
  data: any
  headers: Record<string, string>
}

/**
 * Universal backend call via HTTP proxy
 * All requests are routed to the backend server running on NEXT_PUBLIC_BACKEND_URL
 * This ensures frontend and backend are properly decoupled
 */
export async function callBackend(request: BackendRequest): Promise<BackendResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
  
  try {
    const url = new URL(request.path, backendUrl)
    if (request.query) {
      Object.entries(request.query).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...request.headers
      }
    }

    if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      fetchOptions.body = JSON.stringify(request.body)
    }

    const response = await fetch(url.toString(), fetchOptions)
    const data = await response.json()

    return {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries())
    }
  } catch (error) {
    console.error('Backend call error:', error)
    return {
      status: 500,
      data: { error: error instanceof Error ? error.message : 'Network error' },
      headers: {}
    }
  }
}


/**
 * Client-side fetch wrapper that uses universal adapter
 */
export async function universalFetch(url: string, options: RequestInit = {}) {
  const [pathWithQuery] = url.split('?')
  const query = new URLSearchParams(url.split('?')[1] || '')
  const queryObj: Record<string, string> = {}
  query.forEach((v, k) => {
    queryObj[k] = v
  })

  const body = options.body ? JSON.parse(options.body as string) : undefined
  const headers: Record<string, string> = {}
  if (options.headers instanceof Headers) {
    options.headers.forEach((v, k) => {
      headers[k] = v
    })
  } else if (typeof options.headers === 'object') {
    Object.assign(headers, options.headers)
  }

  const response = await callBackend({
    path: pathWithQuery.replace(/^\/api/, ''),
    method: (options.method || 'GET') as RequestMethod,
    body,
    query: queryObj,
    headers
  })

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    json: async () => response.data,
    text: async () => JSON.stringify(response.data),
    headers: new Headers(response.headers),
    clone: () => ({ ok: true, json: async () => response.data })
  }
}
