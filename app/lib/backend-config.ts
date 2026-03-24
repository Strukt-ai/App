/**
 * Backend Configuration
 * Controls whether to use direct function calls or HTTP proxy
 */

export const BACKEND_CONFIG = {
  // Use direct function calls instead of HTTP proxy
  // Set to true in production for integrated deployment
  DIRECT_CALL: process.env.BACKEND_DIRECT_CALL === 'true',

  // Fallback to HTTP if direct call fails
  FALLBACK_TO_HTTP: process.env.BACKEND_FALLBACK !== 'false',

  // HTTP backend URL (for proxy/fallback)
  HTTP_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000',

  // Path to Python backend folder
  BACKEND_PATH: process.env.BACKEND_PATH || './backend',

  // Enable Python subprocess execution
  ENABLE_PYTHON_SUBPROCESS: process.env.ENABLE_PYTHON_SUBPROCESS === 'true',

  // Python executable path
  PYTHON_EXECUTABLE: process.env.PYTHON_EXECUTABLE || 'python3',
}

export function isDirectCallEnabled(): boolean {
  return BACKEND_CONFIG.DIRECT_CALL && typeof window === 'undefined'
}

export function getBackendUrl(): string {
  if (isDirectCallEnabled()) {
    return 'direct://'
  }
  return BACKEND_CONFIG.HTTP_URL
}
