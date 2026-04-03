/**
 * Universal Backend Adapter
 * Converts HTTP calls to an external backend proxy.
 */

import { getBackendUrl } from './backend-config'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'

export interface BackendRequest {
  method: RequestMethod
  path: string
  query?: Record<string, string>
  body?: unknown
  headers?: Record<string, string>
}

export interface BackendResponse {
  status: number
  data: unknown
  headers: Record<string, string>
}

export async function callBackend(request: BackendRequest): Promise<BackendResponse> {
  return callHttpBackend(request)
}

async function callHttpBackend(request: BackendRequest): Promise<BackendResponse> {
  let backendUrl: string
  try {
    backendUrl = getBackendUrl()
  } catch (err) {
    console.error('[backend-adapter] unable to determine backend URL', err)
    return {
      status: 500,
      data: { error: 'Backend URL not configured' },
      headers: {},
    }
  }

  try {
    const url = new URL(request.path, backendUrl)
    if (request.query) {
      Object.entries(request.query).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const isBufferBody = typeof Buffer !== 'undefined' && Buffer.isBuffer(request.body)
    const isUint8Body = request.body instanceof Uint8Array
    const isArrayBufferBody = request.body instanceof ArrayBuffer
    const isStringBody = typeof request.body === 'string'

    const fetchOptions: RequestInit = {
      method: request.method,
      headers: { ...request.headers }
    }

    if (request.body != null && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      if (isBufferBody || isUint8Body || isArrayBufferBody || isStringBody) {
        fetchOptions.body = request.body as BodyInit
      } else {
        if (!fetchOptions.headers || !(fetchOptions.headers as Record<string, string>)['Content-Type']) {
          fetchOptions.headers = {
            ...(fetchOptions.headers as Record<string, string>),
            'Content-Type': 'application/json',
          }
        }
        fetchOptions.body = JSON.stringify(request.body)
      }
    }

    const response = await fetch(url.toString(), fetchOptions)
    const contentType = response.headers.get('content-type') || ''

    let data: unknown
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else if (
      contentType.startsWith('text/') ||
      contentType.includes('svg') ||
      contentType.includes('xml') ||
      contentType.includes('html')
    ) {
      data = await response.text()
    } else {
      data = Buffer.from(await response.arrayBuffer())
    }

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

  let body: unknown = options.body
  if (typeof options.body === 'string') {
    const contentType =
      options.headers instanceof Headers
        ? options.headers.get('Content-Type') || options.headers.get('content-type') || ''
        : typeof options.headers === 'object' && options.headers
          ? String((options.headers as Record<string, string>)['Content-Type'] || (options.headers as Record<string, string>)['content-type'] || '')
          : ''

    if (contentType.includes('application/json')) {
      try {
        body = JSON.parse(options.body)
      } catch {
        body = options.body
      }
    }
  }

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
    text: async () => (typeof response.data === 'string' ? response.data : JSON.stringify(response.data)),
    headers: new Headers(response.headers),
    clone: () => ({ ok: true, json: async () => response.data })
  }
}
