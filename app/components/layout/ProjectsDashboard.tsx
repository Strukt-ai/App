'use client'

import { useEffect, useState, useRef } from 'react'
import { FolderOpen, Trash2, Clock, Loader2, Plus, LogOut, Upload, Box, X } from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'
import { ProjectThumbnail } from './ProjectThumbnail'

interface Props {
    onOpenEditor: () => void
    onClose: () => void
    onLogout: () => void
}

function formatTimestamp(iso: string): string {
    if (!iso) return ''
    const d = new Date(iso + (iso.endsWith('Z') ? '' : 'Z'))
    return d.toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

export function ProjectsDashboard({ onOpenEditor, onClose, onLogout }: Props) {
    const { token, user, setToken, setUser, currentRunId, setRunId, setRunStatus, setMode, setCalibrationFactor, setTutorialStep, setUploadedImage, setPendingFile, resetFloorplan } = useFloorplanStore()
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [creating, setCreating] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [showNewForm, setShowNewForm] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    useEffect(() => {
        if (token) fetchProjects()
    }, [token])

    const fetchProjects = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/runs', {
                headers: { 'Authorization': `Bearer ${token}` }
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
        if (!confirm("Delete this project? This cannot be undone.")) return
        setDeletingId(runId)
        try {
            const res = await fetch(`/api/runs/${runId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setProjects(prev => prev.filter(p => p.job_id !== runId))
                if (runId === currentRunId) {
                    setRunId(null)
                    setUploadedImage(null)
                }
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

        // Clear previous project state so nothing leaks between projects
        resetFloorplan()

        setRunId(runId)
        setRunStatus(project.status === 'COMPLETED' ? 'completed' : 'processing')
        setMode('2d')

        try {
            if (!token) return

            // 1. Restore calibration from run metadata
            try {
                const metaRes = await fetch(`/api/runs/${runId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (metaRes.ok) {
                    const meta = await metaRes.json().catch(() => ({} as any))
                    const rm = meta?.run_meta || {}
                    const scale = rm?.scale ?? rm?.exportScale ?? rm?.calibrationFactor
                    const parsed = typeof scale === 'number' ? scale : parseFloat(String(scale || 'NaN'))
                    if (Number.isFinite(parsed) && parsed > 0) {
                        setCalibrationFactor(parsed)
                        setTutorialStep('none')
                    }
                }
            } catch { /* ignore */ }

            // 2. Restore background image from server (await so dimensions are set before SVG import)
            try {
                const imgPath = project.image_path || ''
                const filename = imgPath.split(/[\\/]/).pop() || 'input_image.png'
                const imgRes = await fetch(`/api/runs/${runId}/assets/${filename}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (imgRes.ok) {
                    const blob = await imgRes.blob()
                    const url = URL.createObjectURL(blob)
                    await new Promise<void>((resolve) => {
                        const img = new window.Image()
                        img.onload = () => {
                            setUploadedImage(url, img.width, img.height)
                            resolve()
                        }
                        img.onerror = () => resolve()
                        img.src = url
                    })
                }
            } catch { /* ignore — project may not have an image */ }

            // 3. Restore floorplan SVG (walls, doors, windows, furniture)
            const svgRes = await fetch(`/api/runs/${runId}/svg`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (svgRes.ok) {
                const svgText = await svgRes.text()
                useFloorplanStore.getState().importFromSVG(svgText)
            }
        } catch (e) {
            console.error('[Dashboard] Failed to load project', e)
        }

        onOpenEditor()
    }

    const handleCreateNew = async () => {
        if (!selectedFile) {
            fileRef.current?.click()
            return
        }

        setCreating(true)
        try {
            // Clear old project state before creating new one
            resetFloorplan()
            setRunId(null)

            // Show image preview locally
            const reader = new FileReader()
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    const url = ev.target.result as string
                    const img = new Image()
                    img.onload = () => {
                        setUploadedImage(url, img.width, img.height)
                        setMode('2d')
                    }
                    img.src = url
                }
            }
            reader.readAsDataURL(selectedFile)

            // Store file in global state so Topbar can use it for processing
            setPendingFile(selectedFile)

            // Store project name for Topbar to pick up
            if (projectName.trim()) {
                sessionStorage.setItem('pendingProjectName', projectName.trim())
            }

            onOpenEditor()
        } catch (e) {
            console.error("Create failed", e)
        } finally {
            setCreating(false)
        }
    }

    const handleLogout = () => {
        setToken(null)
        setUser(null)
        onLogout()
    }

    return (
        <div className="fixed inset-0 z-[90] bg-[#0A0A0A] flex flex-col overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-purple-500/5 blur-[120px] rounded-full" />
                <div className="absolute top-[50%] -right-[10%] w-[40vw] h-[40vw] bg-blue-600/5 blur-[100px] rounded-full" />
            </div>

            {/* Top bar */}
            <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-white tracking-tight">Strukt AI</span>
                </div>
                <div className="flex items-center gap-4">
                    {user && (
                        <div className="flex items-center gap-3">
                            {user.picture && (
                                <img src={user.picture} alt="" className="w-7 h-7 rounded-full border border-white/10" />
                            )}
                            <span className="text-sm text-white/60">{user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </button>
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">My Projects</h1>
                            <p className="text-sm text-white/40">
                                {projects.length > 0
                                    ? `${projects.length} project${projects.length > 1 ? 's' : ''}`
                                    : 'No projects yet — create your first one'}
                            </p>
                        </div>
                    </div>

                    {/* Create New Project Card */}
                    {!showNewForm ? (
                        <button
                            onClick={() => setShowNewForm(true)}
                            className="w-full mb-8 p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/30 bg-white/[0.02] hover:bg-purple-500/5 transition-all group flex items-center gap-4"
                        >
                            <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                <Plus className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors">Create New Project</h3>
                                <p className="text-xs text-white/40">Upload a floorplan image to get started</p>
                            </div>
                        </button>
                    ) : (
                        <div className="mb-8 p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                                <Box className="w-4 h-4 text-purple-400" />
                                New Project
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Project name (optional)"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0]
                                            if (f) setSelectedFile(f)
                                        }}
                                    />
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                                            selectedFile
                                                ? "border-green-500/30 bg-green-500/10 text-green-400"
                                                : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                                        )}
                                    >
                                        <Upload className="w-4 h-4" />
                                        {selectedFile ? selectedFile.name.slice(0, 20) : 'Upload Image'}
                                    </button>
                                    <button
                                        onClick={handleCreateNew}
                                        disabled={!selectedFile || !projectName.trim() || creating}
                                        className={cn(
                                            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                            selectedFile && projectName.trim()
                                                ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                                                : "bg-white/5 text-white/30 cursor-not-allowed"
                                        )}
                                    >
                                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Create
                                    </button>
                                    <button
                                        onClick={() => { setShowNewForm(false); setSelectedFile(null); setProjectName('') }}
                                        className="px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Projects Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-white/40">
                            <Loader2 className="w-8 h-8 animate-spin mb-3" />
                            <p className="text-sm">Loading projects...</p>
                        </div>
                    ) : projects.length === 0 && !showNewForm ? (
                        <div className="flex flex-col items-center justify-center h-48 text-white/30">
                            <FolderOpen className="w-12 h-12 mb-3 opacity-50" />
                            <p className="text-sm">No projects yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {projects.map((project) => (
                                <div
                                    key={project.job_id}
                                    onClick={() => handleLoad(project)}
                                    className="group relative border border-white/5 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] hover:shadow-lg hover:shadow-purple-500/5"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video bg-black/20 flex items-center justify-center relative overflow-hidden">
                                        <ProjectThumbnail
                                            runId={project.job_id}
                                            imagePath={project.image_path}
                                            token={token}
                                            status={project.status}
                                        />
                                        <div className={cn(
                                            "absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-md z-10",
                                            project.status === 'COMPLETED' ? "bg-green-500/20 text-green-400" :
                                                project.status === 'FAILED' ? "bg-red-500/20 text-red-400" :
                                                    "bg-blue-500/20 text-blue-400"
                                        )}>
                                            {project.status}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <div className="text-sm font-medium truncate text-white/80 mb-1" title={project.name || project.job_id}>
                                            {project.name || project.job_id}
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1 text-[10px] text-white/30 min-w-0">
                                                <Clock className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{formatTimestamp(project.created_at)}</span>
                                            </div>
                                            <button
                                                onClick={(e) => handleDelete(project.job_id, e)}
                                                className="p-1.5 flex-shrink-0 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete"
                                            >
                                                {deletingId === project.job_id
                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                                                    : <Trash2 className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No token — prompt sign in */}
                    {!token && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <p className="text-white/40 text-sm mb-4">Sign in to save and manage projects</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
