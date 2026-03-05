/**
 * Backend Configuration
 * Controls whether to use direct function calls or HTTP proxy
 */

export const BACKEND_CONFIG = {
  // Always use HTTP proxy; backend now lives externally
  DIRECT_CALL: false,

  // HTTP backend URL (for proxy) - must be provided explicitly
  HTTP_URL: process.env.NEXT_PUBLIC_BACKEND_URL || '',
}

export function isDirectCallEnabled(): boolean {
  // Direct calls are disabled when backend is external
  return false
}

export function getBackendUrl(): string {
  const url = BACKEND_CONFIG.HTTP_URL
  if (!url) {
    throw new Error('BACKEND_URL is not configured. Set NEXT_PUBLIC_BACKEND_URL in your environment.')
  }
  return url
}
