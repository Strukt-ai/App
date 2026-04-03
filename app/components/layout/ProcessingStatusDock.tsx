'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, CheckCircle2, Loader2 } from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'
import { JobQueuePanel } from './JobQueuePanel'

type SamJob = {
    job_id: string
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
}

const getRunPhaseLabel = (task: ReturnType<typeof useFloorplanStore.getState>['lastQueuedTask']) => {
    switch (task) {
        case 'detect_rooms':
            return 'Finding rooms'
        case 'detect_walls':
            return 'Tracing walls'
        case 'detect_doors':
            return 'Detecting doors'
        case 'detect_windows':
            return 'Detecting windows'
        case 'detect_furniture':
            return 'Extracting furniture'
        case 'gen_3d':
            return 'Generating 3D'
        default:
            return 'Processing floorplan'
    }
}

export function ProcessingStatusDock() {
    const token = useFloorplanStore(s => s.token)
    const currentRunId = useFloorplanStore(s => s.currentRunId)
    const runStatus = useFloorplanStore(s => s.runStatus)
    const lastQueuedTask = useFloorplanStore(s => s.lastQueuedTask)

    const [open, setOpen] = useState(false)
    const [jobs, setJobs] = useState<SamJob[]>([])
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!token) {
            return
        }

        let active = true

        const fetchJobs = async () => {
            try {
                const response = await fetch('/api/sam3d/my-jobs', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (!response.ok) return
                const data = await response.json() as SamJob[]
                if (active) {
                    setJobs(Array.isArray(data) ? data : [])
                }
            } catch {
                if (active) {
                    setJobs([])
                }
            }
        }

        fetchJobs()

        const interval = window.setInterval(() => {
            fetchJobs()
        }, 8000)

        return () => {
            active = false
            window.clearInterval(interval)
        }
    }, [token])

    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false)
            }
        }

        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
    }, [])

    const activeSamJobs = useMemo(
        () => token ? jobs.filter((job) => job.status === 'PENDING' || job.status === 'PROCESSING') : [],
        [jobs, token]
    )

    const showBusyState = runStatus === 'processing' || activeSamJobs.length > 0
    const primaryLabel = runStatus === 'processing'
        ? getRunPhaseLabel(lastQueuedTask)
        : activeSamJobs.length > 0
            ? `${activeSamJobs.length} asset ${activeSamJobs.length === 1 ? 'job' : 'jobs'}`
            : 'Assets'
    const secondaryLabel = runStatus === 'processing'
        ? (currentRunId ? `Run ${currentRunId.slice(0, 8)}` : 'Editor pipeline')
        : activeSamJobs.length > 0
            ? 'Furn AI still running'
            : 'Open downloads and generated assets'

    if (!token && runStatus !== 'processing') return null

    return (
        <div ref={containerRef} className="absolute right-5 top-5 z-40 flex flex-col items-end gap-3">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    "inline-flex items-center gap-3 rounded-[22px] border px-4 py-3 text-left shadow-[0_20px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl transition",
                    showBusyState
                        ? "border-cyan-400/20 bg-slate-950/84 text-cyan-50"
                        : "border-white/10 bg-slate-950/76 text-slate-100 hover:bg-slate-950/88"
                )}
            >
                <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-2xl border",
                    showBusyState
                        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                        : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                )}>
                    {showBusyState
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : open
                            ? <Box className="h-4 w-4" />
                            : <CheckCircle2 className="h-4 w-4" />}
                </div>

                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300/80">
                        {showBusyState ? 'Processing' : 'Assets Ready'}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-white">{primaryLabel}</p>
                    <p className="truncate text-[11px] text-slate-400">{secondaryLabel}</p>
                </div>
            </button>

            {open && token && (
                <div className="max-h-[70vh] overflow-hidden">
                    <JobQueuePanel variant="popover" />
                </div>
            )}
        </div>
    )
}
