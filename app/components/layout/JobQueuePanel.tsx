'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Loader2, CheckCircle2, XCircle, Clock, RefreshCw, Box, Plus } from 'lucide-react'
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
    const s = Math.floor((Date.now() - new Date(iso + 'Z').getTime()) / 1000)
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    return `${Math.floor(s / 3600)}h ago`
}

function fakeProgress(job: Job): number {
    if (job.status === 'COMPLETED') return 100
    if (job.status === 'FAILED') return 100
    if (job.status === 'PENDING') return 5
    const start = job.started_at ? new Date(job.started_at + 'Z').getTime() : Date.now()
    const elapsed = (Date.now() - start) / 1000
    return Math.min(95, Math.max(10, (elapsed / 240) * 100))
}

/** Returns human phase label + ETA for PROCESSING jobs */
function getPhaseInfo(job: Job): { phase: string; eta: string } {
    if (job.status === 'PENDING') {
        return { phase: 'Waiting for Lambda...', eta: '~4-5 min' }
    }
    const start = job.started_at ? new Date(job.started_at + 'Z').getTime() : Date.now()
    const sec = (Date.now() - start) / 1000

    if (sec < 30)  return { phase: 'Lambda dispatching EC2...', eta: '~4 min left' }
    if (sec < 100) return { phase: 'EC2 booting up...', eta: `~${Math.ceil((100 - sec) / 60 + 2)}m left` }
    if (sec < 160) return { phase: 'Loading AI model...', eta: '~2 min left' }
    if (sec < 220) return { phase: 'Running 3D inference...', eta: '~1 min left' }
    return { phase: 'Uploading result...', eta: 'Almost done' }
}

function assetName(f: GlbFile): string {
    return f.name.replace(/^furn_/, '').replace(/\.glb$/, '') || f.name
}

export function JobQueuePanel() {
    const { token, importFurnAiModel } = useFloorplanStore()
    const [jobs, setJobs] = useState<Job[]>([])
    const [s3Assets, setS3Assets] = useState<S3Asset[]>([])
    const [loading, setLoading] = useState(false)
    const [_tick, setTick] = useState(0)
    const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set())
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const fetchJobs = async () => {
        if (!token) return
        try {
            const res = await fetch('/api/sam3d/my-jobs', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) setJobs(await res.json())
        } catch { }
    }

    const fetchAssets = async () => {
        if (!token) return
        try {
            const res = await fetch('/api/sam3d/my-assets', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) setS3Assets(await res.json())
        } catch { }
    }

    useEffect(() => {
        setLoading(true)
        Promise.all([fetchJobs(), fetchAssets()]).finally(() => setLoading(false))
    }, [token])

    useEffect(() => {
        const hasActive = jobs.some(j => j.status === 'PENDING' || j.status === 'PROCESSING')
        if (hasActive) {
            intervalRef.current = setInterval(() => {
                fetchJobs()
                setTick(t => t + 1)
            }, 8000)
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [jobs, token])

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
        if (newlyCompleted.length > 0) fetchAssets()
        prevJobsRef.current = jobs
    }, [jobs])

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

    // Build asset list: from my-jobs GLB files first, then fill from S3 scan (deduped by job_id)
    const jobAssets: { uid: string; jobId: string; name: string; url: string; createdAt: string }[] = []
    const seenJobIds = new Set<string>()

    for (const job of jobs.filter(j => j.status === 'COMPLETED' && j.glb_files.length > 0)) {
        for (const f of job.glb_files) {
            const uid = `${job.job_id}_${f.name}`
            jobAssets.push({ uid, jobId: job.job_id, name: assetName(f), url: f.url, createdAt: job.created_at })
            seenJobIds.add(job.job_id)
        }
    }

    // Fill in S3 assets not already covered by job DB
    for (const a of s3Assets) {
        if (seenJobIds.has(a.job_id)) continue
        const uid = `${a.job_id}_${a.filename}`
        jobAssets.push({ uid, jobId: a.job_id, name: a.label, url: a.url, createdAt: a.last_modified })
        seenJobIds.add(a.job_id)
    }

    return (
        <div className="border-t border-border mt-2">
            <div className="flex items-center justify-between px-4 py-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    3D Job Queue
                </h3>
                <button
                    onClick={() => { setLoading(true); Promise.all([fetchJobs(), fetchAssets()]).finally(() => setLoading(false)) }}
                    className="p-1 rounded hover:bg-secondary text-muted-foreground transition-colors"
                >
                    <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
                </button>
            </div>

            {activeJobs.length === 0 && jobAssets.length === 0 && !loading && (
                <p className="text-[10px] text-muted-foreground/50 px-4 pb-3 italic">
                    No 3D jobs yet. Segment an object and click Generate 3D.
                </p>
            )}

            <div className="px-3 pb-3 space-y-2 max-h-[420px] overflow-y-auto">

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

                {/* Failed jobs */}
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

                {/* My 3D Assets Library */}
                {jobAssets.length > 0 && (
                    <>
                        <div className="pt-2 pb-1">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
                                <Box className="w-3 h-3" /> My 3D Assets
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
                                                    'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors',
                                                    loaded
                                                        ? 'bg-green-600/20 text-green-400'
                                                        : 'bg-primary/10 hover:bg-primary/20 text-primary'
                                                )}
                                            >
                                                {loaded
                                                    ? <CheckCircle2 className="w-2.5 h-2.5" />
                                                    : <Plus className="w-2.5 h-2.5" />}
                                                {loaded ? 'Added' : 'Add to Scene'}
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