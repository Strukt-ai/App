'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, Loader2, CheckCircle2, XCircle, Clock, RefreshCw, Box, Plus, Zap } from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'

interface GlbFile {
    name: string
    url: string
}

interface Job {
    job_id: string
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
    created_at: string
    started_at?: string
    run_id: string
    glb_files: GlbFile[]
    error?: string
}

interface S3Asset {
    job_id: string
    filename: string
    label: string
    url: string
    last_modified: string
}

function elapsed(iso?: string): string {
    if (!iso) return ''
    const s = Math.floor((Date.now() - new Date(iso + (iso.endsWith('Z') ? '' : 'Z')).getTime()) / 1000)
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    return `${Math.floor(s / 3600)}h ago`
}

function fakeProgress(job: Job): number {
    if (job.status === 'COMPLETED') return 100
    if (job.status === 'FAILED') return 100
    if (job.status === 'PENDING') return 5
    const start = job.started_at ? new Date(job.started_at + 'Z').getTime() : Date.now()
    const el = (Date.now() - start) / 1000
    return Math.min(95, Math.max(10, (el / 240) * 100))
}

function getPhaseInfo(job: Job): { phase: string; eta: string } {
    if (job.status === 'PENDING') {
        return { phase: 'Waiting for Lambda...', eta: '~4-5 min' }
    }
    const start = job.started_at ? new Date(job.started_at + 'Z').getTime() : Date.now()
    const sec = (Date.now() - start) / 1000

    if (sec < 30) return { phase: 'Lambda dispatching EC2...', eta: '~4 min left' }
    if (sec < 100) return { phase: 'EC2 booting up...', eta: `~${Math.ceil((100 - sec) / 60 + 2)}m left` }
    if (sec < 160) return { phase: 'Loading AI model...', eta: '~2 min left' }
    if (sec < 220) return { phase: 'Running 3D inference...', eta: '~1 min left' }
    return { phase: 'Uploading result...', eta: 'Almost done' }
}

/** EC2 runs every hour for 10 min. Show next window. */
function getEc2Schedule(): { label: string; isActive: boolean } {
    const now = new Date()
    const min = now.getMinutes()

    // EC2 runs at minute 0-10 of every hour (triggered by EventBridge)
    if (min < 10) {
        const remaining = 10 - min
        return { label: `EC2 active now (${remaining}m left)`, isActive: true }
    }

    const nextHour = 60 - min
    return { label: `EC2 next run in ${nextHour}m`, isActive: false }
}

function assetName(f: GlbFile): string {
    return f.name.replace(/^furn_/, '').replace(/\.glb$/, '') || f.name
}

export function JobQueuePanel({ variant = 'panel' }: { variant?: 'panel' | 'popover' }) {
    const { token, importFurnAiModel } = useFloorplanStore()
    const [jobs, setJobs] = useState<Job[]>([])
    const [s3Assets, setS3Assets] = useState<S3Asset[]>([])
    const [loading, setLoading] = useState(false)
    const [, setTick] = useState(0)
    const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set())
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const fetchJobs = useCallback(async () => {
        if (!token) return
        try {
            const res = await fetch('/api/sam3d/my-jobs', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) setJobs(await res.json())
        } catch { }
    }, [token])

    const fetchAssets = useCallback(async () => {
        if (!token) return
        try {
            const res = await fetch('/api/sam3d/my-assets', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) setS3Assets(await res.json())
        } catch { }
    }, [token])

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            await Promise.all([fetchJobs(), fetchAssets()])
            setLoading(false)
        }

        void load()
    }, [fetchAssets, fetchJobs])

    useEffect(() => {
        const hasActive = jobs.some(j => j.status === 'PENDING' || j.status === 'PROCESSING')
        if (hasActive) {
            intervalRef.current = setInterval(() => {
                fetchJobs()
                setTick(t => t + 1)
            }, 8000)
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [fetchJobs, jobs])

    // Tick for live ETA countdown
    useEffect(() => {
        const t = setInterval(() => setTick(n => n + 1), 3000)
        return () => clearInterval(t)
    }, [])

    // When a job completes, refresh S3 assets
    const prevJobsRef = useRef<Job[]>([])
    useEffect(() => {
        const newlyCompleted = jobs.filter(j =>
            j.status === 'COMPLETED' &&
            prevJobsRef.current.some(p => p.job_id === j.job_id && p.status !== 'COMPLETED')
        )
        if (newlyCompleted.length > 0) {
            window.setTimeout(() => {
                void fetchAssets()
            }, 0)
        }
        prevJobsRef.current = jobs
    }, [fetchAssets, jobs])

    const handleLoadIntoScene = (jobId: string, name: string, url: string, uid: string) => {
        importFurnAiModel({
            id: `furn_ai_${jobId.substring(0, 8)}`,
            furnAiId: uid,
            type: 'furniture',
            modelUrl: url,
            position: { x: 0, y: 0 },
            label: name,
        })
        setLoadedIds(prev => new Set(prev).add(uid))
    }

    if (!token) return null

    const activeJobs = jobs.filter(j => j.status === 'PENDING' || j.status === 'PROCESSING')
    const failedJobs = jobs.filter(j => j.status === 'FAILED')

    // Only show assets that have actual downloadable GLB URLs (from S3)
    const jobAssets: { uid: string; jobId: string; name: string; url: string; createdAt: string }[] = []
    const seenJobIds = new Set<string>()

    // From S3 scan — these are guaranteed to exist
    for (const a of s3Assets) {
        const uid = `${a.job_id}_${a.filename}`
        jobAssets.push({ uid, jobId: a.job_id, name: a.label, url: a.url, createdAt: a.last_modified })
        seenJobIds.add(a.job_id)
    }

    // From job DB — only if they have actual GLB files AND aren't already covered by S3
    for (const job of jobs.filter(j => j.status === 'COMPLETED' && j.glb_files.length > 0)) {
        if (seenJobIds.has(job.job_id)) continue
        for (const f of job.glb_files) {
            const uid = `${job.job_id}_${f.name}`
            jobAssets.push({ uid, jobId: job.job_id, name: assetName(f), url: f.url, createdAt: job.created_at })
        }
        seenJobIds.add(job.job_id)
    }

    const ec2 = getEc2Schedule()
    const isPopover = variant === 'popover'

    return (
        <div className={cn(
            isPopover
                ? "w-[360px] max-w-[min(92vw,360px)] rounded-[24px] border border-white/10 bg-slate-950/90 p-3 shadow-[0_25px_70px_rgba(2,6,23,0.55)] backdrop-blur-xl"
                : "mt-2 border-t border-border"
        )}>
            <div className={cn(
                "flex items-center justify-between",
                isPopover ? "px-1 pb-2" : "px-4 py-2"
            )}>
                {!isPopover && (
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        3D Job Queue
                    </h3>
                )}
                {isPopover && (
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-cyan-400" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Processing</p>
                    </div>
                )}
                <button
                    onClick={() => { setLoading(true); Promise.all([fetchJobs(), fetchAssets()]).finally(() => setLoading(false)) }}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary"
                >
                    <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
                </button>
            </div>

            {/* EC2 Schedule Banner */}
            <div className={cn(
                "mb-2 flex items-center gap-2 rounded-md px-3 py-1.5 text-[10px] font-medium",
                ec2.isActive
                    ? "bg-green-500/10 border border-green-500/20 text-green-400"
                    : "bg-secondary/40 border border-border/50 text-muted-foreground",
                isPopover ? "mx-0" : "mx-3"
            )}>
                <Zap className={cn("w-3 h-3", ec2.isActive && "text-green-400")} />
                {ec2.label}
            </div>

            {activeJobs.length === 0 && jobAssets.length === 0 && failedJobs.length === 0 && !loading && (
                <p className="text-[10px] text-muted-foreground/50 px-4 pb-3 italic">
                    No 3D jobs yet. Segment an object and click Generate 3D.
                </p>
            )}

            <div className={cn(
                "space-y-2 overflow-y-auto",
                isPopover ? "max-h-[420px] px-0 pb-0" : "max-h-[420px] px-3 pb-3"
            )}>

                {/* Active jobs */}
                {activeJobs.map(job => {
                    const { phase, eta } = getPhaseInfo(job)
                    const pct = fakeProgress(job)
                    return (
                        <div key={job.job_id} className="bg-secondary/40 rounded-lg p-3 border border-border/50">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                    {job.status === 'PENDING'
                                        ? <Clock className="w-3 h-3 text-yellow-400" />
                                        : <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
                                    <span className="text-[11px] font-semibold text-foreground">
                                        {job.status === 'PENDING' ? 'Queued' : 'Generating...'}
                                    </span>
                                </div>
                                <span className="text-[10px] font-medium text-blue-400">{eta}</span>
                            </div>
                            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all duration-[3000ms] ease-linear',
                                        job.status === 'PENDING' ? 'bg-yellow-500' : 'bg-blue-500'
                                    )}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 font-mono truncate">
                                {phase}
                            </p>
                        </div>
                    )
                })}

                {/* Failed jobs — max 3, auto-dismiss */}
                {failedJobs.slice(0, 3).map(job => (
                    <div key={job.job_id} className="rounded-lg p-3 border bg-red-500/5 border-red-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <XCircle className="w-3 h-3 text-red-400" />
                                <span className="text-[11px] font-semibold text-foreground">Failed</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{elapsed(job.created_at)}</span>
                        </div>
                        {job.error && <p className="text-[10px] text-red-400/70 mt-1 truncate">{job.error}</p>}
                    </div>
                ))}

                {/* My 3D Assets — only items with actual GLBs available */}
                {jobAssets.length > 0 && (
                    <>
                        <div className="pt-2 pb-1">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
                                <Box className="w-3 h-3" /> My 3D Assets ({jobAssets.length})
                            </p>
                        </div>
                        {jobAssets.map(asset => {
                            const loaded = loadedIds.has(asset.uid)
                            return (
                                <div key={asset.uid} className="rounded-lg border border-border/50 bg-secondary/20 overflow-hidden">
                                    <div className="flex items-center gap-2 p-2.5">
                                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Box className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium text-foreground truncate capitalize">
                                                {asset.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">{elapsed(asset.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => handleLoadIntoScene(asset.jobId, asset.name, asset.url, asset.uid)}
                                                className={cn(
                                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
                                                    loaded
                                                        ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                                                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                                )}
                                            >
                                                {loaded
                                                    ? <CheckCircle2 className="w-3.5 h-3.5" />
                                                    : <Plus className="w-3.5 h-3.5" />}
                                                {loaded ? 'Added' : 'Add to Floorplan'}
                                            </button>
                                            <a
                                                href={asset.url}
                                                download={asset.name + '.glb'}
                                                className="p-1 rounded hover:bg-secondary text-muted-foreground transition-colors"
                                                title="Download GLB"
                                            >
                                                <Download className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </>
                )}
            </div>
        </div>
    )
}
