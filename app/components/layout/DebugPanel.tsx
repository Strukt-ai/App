'use client'

import { useState, useEffect, useRef } from 'react'
import { Terminal, X, RefreshCw, Power, Lock, Unlock } from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'

interface EC2Status {
    state?: string
    gpu?: string
    vram_gb?: number
    idle_timeout_sec?: number
    last_activity?: number
}

interface DebugData {
    ec2_ip?: string
    ec2_state?: string
    ec2_status?: EC2Status
    recent_logs?: { timestamp: string; message: string }[]
    body?: string
    statusCode?: number
}

function idleCountdown(status?: EC2Status): string {
    if (!status?.last_activity || !status?.idle_timeout_sec) return '—'
    const elapsed = Date.now() / 1000 - status.last_activity
    const remaining = Math.max(0, status.idle_timeout_sec - elapsed)
    const m = Math.floor(remaining / 60)
    const s = Math.floor(remaining % 60)
    return `${m}m ${s}s`
}

export function DebugPanel() {
    const { token } = useFloorplanStore()
    const [open, setOpen] = useState(false)
    const [password, setPassword] = useState(() => {
        if (typeof window !== 'undefined') return sessionStorage.getItem('ec2_debug_pw') || ''
        return ''
    })
    const [unlocked, setUnlocked] = useState(false)
    const [data, setData] = useState<DebugData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [countdown, setCountdown] = useState('')
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const fetchStatus = async (pw: string) => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/debug/ec2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({ password: pw }),
            })
            if (res.status === 403) {
                setError('Wrong password')
                setUnlocked(false)
                return
            }
            const json = await res.json()
            // Lambda wraps response body as a string when called via API Gateway
            let parsed = json
            try {
                parsed = typeof json.body === 'string' ? JSON.parse(json.body) : json
            } catch { /* malformed body — use raw json */ }
            setData(parsed)
            setUnlocked(true)
            sessionStorage.setItem('ec2_debug_pw', pw)
        } catch (e: any) {
            setError(e.message || 'Failed')
        } finally {
            setLoading(false)
        }
    }

    // Auto-refresh every 10s when open and unlocked
    useEffect(() => {
        if (open && unlocked && password) {
            intervalRef.current = setInterval(() => fetchStatus(password), 10000)
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [open, unlocked, password])

    // Countdown ticker
    useEffect(() => {
        const t = setInterval(() => {
            setCountdown(idleCountdown(data?.ec2_status))
        }, 1000)
        return () => clearInterval(t)
    }, [data])

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                title="EC2 Debug Panel"
                className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
                <Terminal className="w-4 h-4" />
            </button>
        )
    }

    const state = data?.ec2_state || data?.ec2_status?.state || '—'
    const ip = data?.ec2_ip || '—'
    const gpu = data?.ec2_status?.gpu || '—'
    const vram = data?.ec2_status?.vram_gb
    const stateColor = state === 'running' ? 'text-green-400' : state === 'idle' ? 'text-yellow-400' : 'text-red-400'

    return (
        <div className="fixed top-12 right-0 w-[420px] h-[calc(100vh-48px)] bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-mono font-semibold text-zinc-100">EC2 Debug</span>
                </div>
                <div className="flex items-center gap-2">
                    {unlocked && (
                        <button
                            onClick={() => fetchStatus(password)}
                            disabled={loading}
                            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                    <button onClick={() => setOpen(false)} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Auth */}
            {!unlocked && (
                <div className="p-4 border-b border-zinc-800">
                    <p className="text-xs text-zinc-400 mb-2">Enter debug password to unlock</p>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchStatus(password)}
                            placeholder="debug password"
                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 font-mono outline-none focus:border-green-500"
                        />
                        <button
                            onClick={() => fetchStatus(password)}
                            disabled={loading || !password}
                            className="px-3 py-1.5 rounded bg-green-700 hover:bg-green-600 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <Unlock className="w-3.5 h-3.5" />
                            Unlock
                        </button>
                    </div>
                    {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
                </div>
            )}

            {unlocked && data && (
                <>
                    {/* Status cards */}
                    <div className="p-4 grid grid-cols-2 gap-3 border-b border-zinc-800">
                        <div className="bg-zinc-900 rounded-lg p-3">
                            <p className="text-xs text-zinc-500 mb-1">EC2 State</p>
                            <p className={`text-sm font-mono font-semibold ${stateColor}`}>{state}</p>
                        </div>
                        <div className="bg-zinc-900 rounded-lg p-3">
                            <p className="text-xs text-zinc-500 mb-1">IP Address</p>
                            <p className="text-sm font-mono text-zinc-100">{ip}</p>
                        </div>
                        <div className="bg-zinc-900 rounded-lg p-3">
                            <p className="text-xs text-zinc-500 mb-1">GPU</p>
                            <p className="text-sm font-mono text-zinc-100">{gpu}{vram ? ` (${vram}GB)` : ''}</p>
                        </div>
                        <div className="bg-zinc-900 rounded-lg p-3">
                            <p className="text-xs text-zinc-500 mb-1">Auto-stop in</p>
                            <p className="text-sm font-mono text-zinc-100">{countdown}</p>
                        </div>
                    </div>

                    {/* Wake button */}
                    <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
                        <button
                            onClick={() => fetchStatus(password)}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 rounded bg-green-800 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                            <Power className="w-3.5 h-3.5" />
                            {loading ? 'Waking...' : 'Wake EC2 + Refresh'}
                        </button>
                        <span className="text-xs text-zinc-500">Auto-refresh every 10s</span>
                    </div>

                    {/* Logs */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <p className="text-xs text-zinc-500 px-4 pt-3 pb-1">Recent CloudWatch Logs</p>
                        <div className="flex-1 overflow-y-auto px-4 pb-4 font-mono text-xs space-y-1">
                            {!data.recent_logs?.length && (
                                <p className="text-zinc-600 italic">No logs yet</p>
                            )}
                            {data.recent_logs?.map((log, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-zinc-600 shrink-0">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                    <span className="text-zinc-300 break-all">{log.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
