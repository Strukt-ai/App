/**
 * Universal Backend Adapter
 * Converts HTTP calls to direct function calls
 * Seamlessly switches between HTTP proxy and direct imports
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
 * Handler for /runs endpoints
 */
async function handleRunsEndpoint(
  path: string,
  method: RequestMethod,
  body: any,
  query?: Record<string, string>
): Promise<BackendResponse> {
  // Match patterns like:
  // /runs                          - GET/POST all runs
  // /runs/{id}                     - GET/PUT/DELETE specific run
  // /runs/{id}/generate-3d         - POST trigger generation
  // /runs/{id}/detect-rooms        - POST detect rooms
  // /runs/{id}/download/blend      - GET download blend file
  // /runs/{id}/upload              - POST upload image
  // /runs/{id}/status              - GET job status
  // /runs/{id}/email               - POST send email
  // /runs/{id}/svg                 - GET/POST svg
  // /runs/{id}/render              - POST render
  // /runs/{id}/meta                - PUT save metadata

  const match = path.match(/^\/runs(?:\/([^/]+))?(?:\/(.+))?$/)
  const [, runId, action] = match || []

  // Import backend modules
  const fastapi = await import('../../backend/fastapi_main')
  const jobQueue = await import('../../backend/job_queue')
  const auth = await import('../../backend/auth')
  const azure = await import('../../backend/azure_sync')

  try {
    if (!runId) {
      // List all runs or create new
      if (method === 'GET') {
        const runs = await fastapi.get_all_runs()
        return { status: 200, data: runs, headers: {} }
      } else if (method === 'POST') {
        const newRun = await fastapi.create_run(body)
        return { status: 201, data: newRun, headers: {} }
      }
    } else if (!action) {
      // Single run operations
      if (method === 'GET') {
        const run = await fastapi.get_run(runId)
        return { status: 200, data: run, headers: {} }
      } else if (method === 'PUT') {
        const updated = await fastapi.update_run(runId, body)
        return { status: 200, data: updated, headers: {} }
      } else if (method === 'DELETE') {
        await fastapi.delete_run(runId)
        return { status: 204, data: {}, headers: {} }
      }
    } else {
      // Sub-actions
      switch (action) {
        case 'generate-3d':
          if (method === 'POST') {
            const job = await fastapi.generate_3d(runId, body)
            return { status: 201, data: job, headers: {} }
          }
          break

        case 'detect-rooms':
          if (method === 'POST') {
            const rooms = await fastapi.detect_rooms(runId, body)
            return { status: 200, data: rooms, headers: {} }
          }
          break

        case 'download/blend':
          if (method === 'GET') {
            const blend = await fastapi.download_blend(runId)
            return { status: 200, data: blend, headers: { 'Content-Type': 'application/octet-stream' } }
          }
          break

        case 'upload':
          if (method === 'POST') {
            const uploaded = await fastapi.upload_file(runId, body)
            return { status: 200, data: uploaded, headers: {} }
          }
          break

        case 'status':
          if (method === 'GET') {
            const status = await fastapi.get_run_status(runId)
            return { status: 200, data: status, headers: {} }
          }
          break

        case 'email':
          if (method === 'POST') {
            await fastapi.send_run_email(runId, body)
            return { status: 200, data: { sent: true }, headers: {} }
          }
          break

        case 'svg':
          if (method === 'GET') {
            const svg = await fastapi.get_run_svg(runId)
            return { status: 200, data: { svg }, headers: { 'Content-Type': 'image/svg+xml' } }
          } else if (method === 'POST') {
            await fastapi.save_run_svg(runId, body.svg)
            return { status: 200, data: { saved: true }, headers: {} }
          }
          break

        case 'render':
          if (method === 'POST') {
            const job = await fastapi.trigger_render(runId, body)
            return { status: 201, data: job, headers: {} }
          }
          break

        case 'meta':
          if (method === 'PUT') {
            await fastapi.save_run_metadata(runId, body)
            return { status: 200, data: { saved: true }, headers: {} }
          }
          break
      }
    }
  } catch (error) {
    console.error('Runs endpoint error:', error)
    return {
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Request failed' },
      headers: {}
    }
  }

  return { status: 404, data: { error: 'Not found' }, headers: {} }
}

/**
 * Handler for /system endpoints
 */
async function handleSystemEndpoint(
  path: string,
  method: RequestMethod
): Promise<BackendResponse> {
  const fastapi = await import('../../backend/fastapi_main')

  if (path === '/system/health' || path === '/health') {
    const health = await fastapi.get_health()
    return { status: 200, data: health, headers: {} }
  } else if (path === '/system/status') {
    const status = await fastapi.get_system_status()
    return { status: 200, data: status, headers: {} }
  } else if (path === '/system/metrics') {
    const metrics = await fastapi.get_metrics()
    return { status: 200, data: metrics, headers: {} }
  }

  return { status: 404, data: { error: 'Not found' }, headers: {} }
}

/**
 * Handler for /auth endpoints
 */
async function handleAuthEndpoint(
  path: string,
  method: RequestMethod,
  body: any
): Promise<BackendResponse> {
  const auth = await import('../../backend/auth')

  if (path === '/auth/verify' && method === 'POST') {
    const verified = await auth.verify_google_token(body.token)
    return { status: 200, data: verified, headers: {} }
  } else if (path === '/auth/login' && method === 'POST') {
    const token = await auth.login(body)
    return { status: 200, data: { token }, headers: {} }
  }

  return { status: 404, data: { error: 'Not found' }, headers: {} }
}

/**
 * Handler for /worker endpoints (job queue)
 */
async function handleWorkerEndpoint(
  path: string,
  method: RequestMethod,
  body: any
): Promise<BackendResponse> {
  const jobQueue = await import('../../backend/job_queue')

  if (path === '/worker/jobs' && method === 'GET') {
    const jobs = await jobQueue.get_pending_jobs()
    return { status: 200, data: { jobs }, headers: {} }
  } else if (path === '/worker/jobs' && method === 'POST') {
    const job = await jobQueue.create_job(body)
    return { status: 201, data: job, headers: {} }
  }

  return { status: 404, data: { error: 'Not found' }, headers: {} }
}

/**
 * Handler for /sam3d endpoints
 */
async function handleSam3dEndpoint(
  path: string,
  method: RequestMethod,
  body: any
): Promise<BackendResponse> {
  const sam3d = await import('../../backend/sam3d_router')

  if (path === '/sam3d/submit-batch' && method === 'POST') {
    const result = await sam3d.submit_batch(body)
    return { status: 201, data: result, headers: {} }
  }

  return { status: 404, data: { error: 'Not found' }, headers: {} }
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
