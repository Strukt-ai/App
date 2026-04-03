"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, Clock, Grid3X3,
  Layout, Building2, Home, Layers,
  FolderOpen, Trash2, Loader2, Pencil, Check, X,
  AlertTriangle, CheckCircle2, Cog, WifiOff, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFloorplanStore } from '@/store/floorplanStore'
import { ProjectThumbnail } from './layout/ProjectThumbnail'

interface Template {
  id: string
  title: string
  description: string
  category: string
  color: string
}

function formatTimestamp(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso + (iso.endsWith('Z') ? '' : 'Z'))
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusConfig(status: string) {
  switch (status) {
    case 'COMPLETED': return { icon: CheckCircle2, color: 'text-green-400 bg-green-500/15', label: 'Ready' }
    case 'FAILED': return { icon: AlertTriangle, color: 'text-red-400 bg-red-500/15', label: 'Failed' }
    case 'PROCESSING': return { icon: Cog, color: 'text-blue-400 bg-blue-500/15', label: 'Processing' }
    case 'QUEUED_OFFLINE': return { icon: WifiOff, color: 'text-amber-400 bg-amber-500/15', label: 'Queued' }
    case 'PENDING': return { icon: Clock, color: 'text-blue-400 bg-blue-500/15', label: 'Pending' }
    default: return { icon: Clock, color: 'text-white/40 bg-white/10', label: status }
  }
}

// ── New Project Dialog ──
function NewProjectDialog({ isOpen, onClose, onConfirm }: {
  isOpen: boolean
  onClose: () => void
  onConfirm: (name: string) => void
}) {
  const [name, setName] = useState('')

  useEffect(() => { if (isOpen) setName('') }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1e1e28] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-white mb-1">New Project</h2>
        <p className="text-sm text-white/50 mb-4">Give your design a name</p>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onConfirm(name.trim()) }}
          placeholder="e.g. Living Room Layout"
          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-purple-500 transition-colors mb-4"
        />
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onConfirm(name.trim())}
            disabled={!name.trim()}
            className="px-5 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  )
}

export function TemplateGrid() {
  const router = useRouter()
  const { token } = useFloorplanStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [projects, setProjects] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const templates: Template[] = [
    { id: 'blank', title: 'Blank Canvas', description: 'Start from scratch', category: 'Blank', color: 'from-gray-500 to-gray-600' },
    { id: 'modern', title: 'Modern Living', description: 'Contemporary open floor plan', category: 'Residential', color: 'from-blue-500 to-blue-600' },
    { id: 'contemporary', title: 'Contemporary Home', description: 'Clean lines and natural light', category: 'Residential', color: 'from-emerald-500 to-emerald-600' },
    { id: 'minimalist', title: 'Minimalist Studio', description: 'Simple, functional space', category: 'Residential', color: 'from-zinc-500 to-zinc-600' },
    { id: 'loft', title: 'Urban Loft', description: 'Industrial chic style', category: 'Residential', color: 'from-amber-500 to-orange-600' },
    { id: 'traditional', title: 'Traditional House', description: 'Classic home layout', category: 'Residential', color: 'from-rose-500 to-pink-600' },
    { id: 'office', title: 'Office Layout', description: 'Professional workspace', category: 'Commercial', color: 'from-indigo-500 to-indigo-600' },
    { id: 'retail', title: 'Retail Store', description: 'Shop floor plan', category: 'Commercial', color: 'from-violet-500 to-purple-600' },
    { id: 'restaurant', title: 'Restaurant', description: 'Dining layout', category: 'Commercial', color: 'from-cyan-500 to-teal-600' },
    { id: 'hotel', title: 'Hotel Room', description: 'Hospitality layout', category: 'Specialty', color: 'from-slate-500 to-slate-600' },
    { id: 'apartment', title: 'Apartment Complex', description: 'Multi-unit building', category: 'Specialty', color: 'from-teal-500 to-emerald-600' },
    { id: 'warehouse', title: 'Warehouse', description: 'Industrial space', category: 'Specialty', color: 'from-neutral-500 to-stone-600' },
  ]

  const categories = ['All', 'Blank', 'Residential', 'Commercial', 'Specialty']

  const filteredTemplates = templates.filter(t => {
    if (selectedCategory !== 'All' && t.category !== selectedCategory) return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  })

  const fetchProjects = useCallback(async () => {
    if (!token) return
    setLoadingProjects(true)
    try {
      const res = await fetch('/api/runs', { headers: { 'Authorization': `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setProjects(data.filter((p: any) => p.task_type === 'segmentation' || !p.task_type))
      }
    } catch (e) {
      console.error("Failed to fetch projects", e)
    } finally {
      setLoadingProjects(false)
    }
  }, [token])

  useEffect(() => { if (token) fetchProjects() }, [token, fetchProjects])

  const MAX_PROJECTS = 5

  const handleNewProject = (name: string) => {
    if (loadingProjects) return // Block while projects are loading
    if (projects.length >= MAX_PROJECTS) {
      alert(`You can have up to ${MAX_PROJECTS} projects. Please delete an existing project first.`)
      return
    }
    setShowNewDialog(false)
    // Store name in sessionStorage so RightSidebar can pick it up when uploading
    sessionStorage.setItem('pendingProjectName', name)
    router.push('/?template=blank')
  }

  const openTemplate = (templateId: string) => {
    if (templateId !== 'blank') {
      router.push(`/?template=${templateId}`)
      return
    }
    // Blank canvas = new project, enforce limit
    if (loadingProjects) return
    if (projects.length >= MAX_PROJECTS) {
      alert(`You can have up to ${MAX_PROJECTS} projects. Please delete an existing project first.`)
      return
    }
    router.push(`/?template=${templateId}`)
  }

  const handleLoadProject = (project: any) => {
    const store = useFloorplanStore.getState()
    // Reset previous project state before loading new one
    store.resetFloorplan()
    store.setRunId(project.job_id)
    store.setRunStatus(project.status === 'COMPLETED' ? 'completed' : project.status === 'FAILED' ? 'failed' : 'processing')
    store.setMode('2d')
    router.push(`/?template=blank`)

    // Load project data in background
    setTimeout(async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` }

        // 1. Restore calibration from run meta FIRST (needed before SVG import)
        const metaRes = await fetch(`/api/runs/${project.job_id}`, { headers })
        if (metaRes.ok) {
          const meta = await metaRes.json()
          const rm = meta?.run_meta || {}
          const scale = rm?.scale ?? rm?.exportScale ?? rm?.calibrationFactor
          const parsed = typeof scale === 'number' ? scale : parseFloat(String(scale || 'NaN'))
          if (Number.isFinite(parsed) && parsed > 0) {
            useFloorplanStore.getState().setCalibrationFactor(parsed)
            useFloorplanStore.getState().setTutorialStep('none')
          }
          // else: keep default 0.01 (1px = 1cm) — correct for backend-generated SVGs
        }

        // 2. Restore background image from server (await so dimensions are set before SVG import)
        try {
          const imgRes = await fetch(`/api/runs/${project.job_id}/download/input_image.png`, { headers })
          if (imgRes.ok) {
            const blob = await imgRes.blob()
            const url = URL.createObjectURL(blob)
            await new Promise<void>((resolve) => {
              const img = new window.Image()
              img.onload = () => {
                useFloorplanStore.getState().setUploadedImage(url, img.naturalWidth, img.naturalHeight)
                resolve()
              }
              img.onerror = () => resolve()
              img.src = url
            })
          }
        } catch (e) {
          console.warn('[TemplateGrid] Could not restore background image', e)
        }

        // 3. Load SVG (walls, rooms, furniture placements) — after calibration + image are set
        const svgRes = await fetch(`/api/runs/${project.job_id}/svg`, { headers })
        if (svgRes.ok) {
          const svgText = await svgRes.text()
          useFloorplanStore.getState().importFromSVG(svgText)
        }
      } catch (e) {
        console.error('[TemplateGrid] Failed to load project', e)
      }
    }, 200)
  }

  const handleDelete = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Delete this project? This cannot be undone.")) return
    setDeletingId(jobId)
    try {
      const res = await fetch(`/api/runs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) setProjects(prev => prev.filter(p => p.job_id !== jobId))
    } catch (e) {
      console.error("Delete failed", e)
    } finally {
      setDeletingId(null)
    }
  }

  const handleRename = async (jobId: string) => {
    const trimmed = editName.trim()
    if (!trimmed) { setEditingId(null); return }
    try {
      await fetch(`/api/runs/${jobId}/name`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed })
      })
      setProjects(prev => prev.map(p => p.job_id === jobId ? { ...p, name: trimmed } : p))
    } catch (e) {
      console.error("Rename failed", e)
    }
    setEditingId(null)
  }

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (p.name || '').toLowerCase().includes(q) || (p.job_id || '').toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f14]/95 backdrop-blur-sm border-b border-white/8">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Strukt AI</span>
          </div>

          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search projects and templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (loadingProjects) return
              if (projects.length >= MAX_PROJECTS) {
                alert(`You can have up to ${MAX_PROJECTS} projects. Please delete an existing project first.`)
                return
              }
              setShowNewDialog(true)
            }}
            disabled={loadingProjects}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-opacity",
              loadingProjects
                ? "bg-white/10 text-white/40 cursor-wait"
                : projects.length >= MAX_PROJECTS
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 shadow-purple-500/20"
            )}
          >
            {loadingProjects ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {loadingProjects ? 'Loading...' : projects.length >= MAX_PROJECTS ? `${MAX_PROJECTS}/${MAX_PROJECTS} Projects` : 'New Project'}
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* ── Your Projects Section ── */}
        {(loadingProjects || filteredProjects.length > 0) && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold">Your Projects</h2>
                {projects.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/8 text-xs text-white/50 font-medium">
                    {projects.length}
                  </span>
                )}
              </div>
            </div>

            {loadingProjects ? (
              <div className="flex items-center gap-3 py-12 justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-white/30" />
                <span className="text-sm text-white/40">Loading projects...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {filteredProjects.map((project) => {
                  const st = statusConfig(project.status)
                  const StatusIcon = st.icon
                  const displayName = project.name || project.job_id?.slice(0, 12) || 'Untitled'

                  return (
                    <div
                      key={project.job_id}
                      onClick={() => handleLoadProject(project)}
                      className="group cursor-pointer relative"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-[#1a1a24] border border-white/8 group-hover:border-purple-500/40 transition-all duration-200 shadow-lg shadow-black/20">
                        <ProjectThumbnail
                          runId={project.job_id}
                          imagePath={project.image_path}
                          token={token}
                          status={project.status}
                        />
                        {/* Status Badge */}
                        <div className={cn(
                          "absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide backdrop-blur-md border border-white/5",
                          st.color
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {st.label}
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                          <span className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-medium shadow-xl">
                            {project.status === 'COMPLETED' ? 'Continue Editing' : 'View Project'}
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDelete(project.job_id, e)}
                          className="absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-black/60 text-white/50 hover:text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                          title="Delete"
                        >
                          {deletingId === project.job_id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Project Info */}
                      <div>
                        {editingId === project.job_id ? (
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <input
                              autoFocus
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleRename(project.job_id); if (e.key === 'Escape') setEditingId(null) }}
                              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-purple-500"
                            />
                            <button onClick={() => handleRename(project.job_id)} className="p-1 hover:bg-white/10 rounded"><Check className="w-4 h-4 text-green-400" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1 hover:bg-white/10 rounded"><X className="w-4 h-4 text-white/40" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 group/name">
                            <h3 className="font-medium text-white/90 group-hover:text-purple-400 transition-colors truncate flex-1 text-sm" title={displayName}>
                              {displayName}
                            </h3>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingId(project.job_id); setEditName(displayName) }}
                              className="p-1 rounded hover:bg-white/10 opacity-0 group-hover/name:opacity-100 transition-opacity flex-shrink-0"
                              title="Rename"
                            >
                              <Pencil className="w-3 h-3 text-white/30" />
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-white/30 mt-0.5">{formatTimestamp(project.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Templates Section ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <Grid3X3 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold">Templates</h2>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategory === cat
                    ? "bg-white text-black"
                    : "bg-white/8 text-white/60 hover:bg-white/15 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => openTemplate(template.id)}
                className="group cursor-pointer"
              >
                <div className={cn(
                  "relative aspect-[4/3] rounded-xl overflow-hidden mb-3 shadow-lg shadow-black/20",
                  "bg-gradient-to-br",
                  template.color
                )}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {template.category === 'Residential' && <Home className="w-12 h-12 text-white/20" />}
                    {template.category === 'Commercial' && <Building2 className="w-12 h-12 text-white/20" />}
                    {template.category === 'Specialty' && <Layers className="w-12 h-12 text-white/20" />}
                    {template.category === 'Blank' && <Layout className="w-12 h-12 text-white/20" />}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 bg-white text-black rounded-xl text-sm font-medium">
                      Use Template
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-white/90 group-hover:text-purple-400 transition-colors text-sm">
                    {template.title}
                  </h3>
                  <p className="text-xs text-white/40">{template.description}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-white/15 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/50">No templates found</h3>
              <p className="text-white/30 text-sm">Try a different search term</p>
            </div>
          )}
        </section>
      </main>

      {/* New Project Dialog */}
      <NewProjectDialog
        isOpen={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        onConfirm={handleNewProject}
      />
    </div>
  )
}
