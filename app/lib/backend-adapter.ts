/**
 * Universal Backend Adapter
 * Converts HTTP calls to direct function calls
 * Seamlessly switches between HTTP proxy and direct imports
 */

import { getBackendUrl } from './backend-config'

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
 * Universal method call
 * In production: calls direct Python/Node functions
 * In development: falls back to HTTP proxy
 */
export async function callBackend(request: BackendRequest): Promise<BackendResponse> {
  // Backend has been moved outside; always use HTTP proxy
  return callHttpBackend(request)
}

/*
 * Direct backend function calls originally supported server-side imports of
 * the Python modules. Since the backend has been relocated to an external
 * service, this code is no longer used. It may be deleted in the future but
 * is retained here for reference.
 */
async function callDirectBackend(request: BackendRequest): Promise<BackendResponse> {
  throw new Error('Direct backend calls are disabled when using an external backend')
}

/**
 * HTTP proxy implementation
 */
async function callHttpBackend(request: BackendRequest): Promise<BackendResponse> {
  let backendUrl: string
  try {
    backendUrl = getBackendUrl()
  } catch (err) {
    console.error('[backend-adapter] unable to determine backend URL', err)
    return {
      status: 500,
      data: { error: 'Backend URL not configured' },
      headers: {}
    }
  }

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
    console.error('HTTP backend call error:', error)
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
