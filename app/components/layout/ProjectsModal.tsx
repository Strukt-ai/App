'use client'

import { useEffect, useState } from 'react'
import { X, FolderOpen, Trash2, Calendar, Loader2 } from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'
import { ProjectThumbnail } from './ProjectThumbnail'

interface ProjectsModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ProjectsModal({ isOpen, onClose }: ProjectsModalProps) {
    const { token, currentRunId, setRunId, setRunStatus, setMode, setCalibrationFactor, setTutorialStep } = useFloorplanStore()
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && token) {
            fetchProjects()
        }
    }, [isOpen, token])

    const fetchProjects = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/runs', {
                headers: { 'Authorization': `Bearer ${token} ` }
            })
            if (res.ok) {
                const data = await res.json()
                setProjects(data)
            }
        } catch (e) {
            console.error("Failed to fetch projects", e)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (runId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return

        setDeletingId(runId)
        try {
            const res = await fetch(`/ api / runs / ${runId} `, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token} ` }
            })
            if (res.ok) {
                setProjects(prev => prev.filter(p => p.job_id !== runId))
                if (runId === currentRunId) {
                    setRunId(null)
                    useFloorplanStore.getState().setUploadedImage(null) // clear to prevent clicking on ghost
                }
            } else {
                alert("Failed to delete project")
            }
        } catch (e) {
            console.error("Delete failed", e)
        } finally {
            setDeletingId(null)
        }
    }

    const handleLoad = async (project: any) => {
        const runId = project.job_id
        if (!runId) return

        setRunId(runId)
        setRunStatus(project.status === 'COMPLETED' ? 'completed' : 'processing')
        setMode('2d') // Switch to editor view
        onClose()

        // CRITICAL: When reopening an existing project, we must fetch/import its SVG.
        // Otherwise the editor shows a blank state even though the run has a saved SVG.
        try {
            if (!token) return

            // Restore per-run calibration/scale from run_meta.json (if present)
            try {
                const metaRes = await fetch(`/ api / runs / ${runId} `, {
                    headers: { 'Authorization': `Bearer ${token} ` }
                })
                if (metaRes.ok) {
                    const meta = await metaRes.json().catch(() => ({} as any))
                    const rm = meta?.run_meta || {}

                    // Prefer explicit scale fields saved by calibration flow
                    const scale = rm?.scale ?? rm?.exportScale ?? rm?.calibrationFactor
                    const parsed = typeof scale === 'number' ? scale : parseFloat(String(scale || 'NaN'))
                    if (Number.isFinite(parsed) && parsed > 0) {
                        setCalibrationFactor(parsed)
                        setTutorialStep('none')
                    }
                }
            } catch {
                // ignore, we'll fall back to whatever is in store
            }

            const svgRes = await fetch(`/ api / runs / ${runId}/svg`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (svgRes.ok) {
                const svgText = await svgRes.text()
                useFloorplanStore.getState().importFromSVG(svgText)
            } else {
                console.error('[ProjectsModal] Failed to fetch SVG:', svgRes.status, await svgRes.text())
            }
        } catch (e) {
            console.error('[ProjectsModal] Failed to load project SVG', e)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden">
            <div className="w-[95vw] max-w-4xl bg-card border border-border rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-secondary/5">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">My Projects</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-background/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p>Loading projects...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <FolderOpen className="w-12 h-12 mb-2 opacity-50" />
                            <p>No projects found.</p>
                            <p className="text-sm opacity-70">Upload a floorplan to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {projects.map((project) => (
                                <div
                                    key={project.job_id}
                                    onClick={() => handleLoad(project)}
                                    className="group relative border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all cursor-pointer bg-card hover:shadow-md flex flex-col"
                                >
                                    {/* Thumbnail Placeholder or Image */}
                                    <div className="aspect-video bg-secondary/20 flex items-center justify-center relative overflow-hidden border-b border-border/50">
                                        <ProjectThumbnail
                                            runId={project.job_id}
                                            imagePath={project.image_path}
                                            token={token}
                                            status={project.status}
                                        />

                                        {/* Status Badge */}
                                        <div className={cn(
                                            "absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md z-10",
                                            project.status === 'COMPLETED' ? "bg-green-500/20 text-green-500" :
                                                project.status === 'FAILED' ? "bg-red-500/20 text-red-500" :
                                                    "bg-blue-500/20 text-blue-500"
                                        )}>
                                            {project.status}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <div className="text-sm font-semibold truncate mb-1 text-foreground" title={project.job_id}>
                                            {project.job_id}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                            </div>

                                            {/* Delete Action - Always Visible */}
                                            <button
                                                onClick={(e) => handleDelete(project.job_id, e)}
                                                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                                title="Delete Project"
                                            >
                                                {deletingId === project.job_id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
