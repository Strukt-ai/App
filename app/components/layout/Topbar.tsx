'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LayoutGrid, Box, Download, Play, Eye, EyeOff, Menu, SlidersHorizontal, ImagePlus } from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'

const FALLBACK_IMAGE_NAME = 'floorplan.png'
const MIME_EXTENSION_MAP: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
}

const inferImageFilename = (source: string, mimeType: string) => {
    const fallbackExt = MIME_EXTENSION_MAP[mimeType] || 'png'
    const fallbackName = FALLBACK_IMAGE_NAME.replace(/\.png$/, `.${fallbackExt}`)

    if (source.startsWith('data:') || source.startsWith('blob:')) {
        return fallbackName
    }

    try {
        const url = new URL(source, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
        const rawName = url.pathname.split('/').pop() || ''
        if (!rawName || rawName.includes(',') || rawName.includes(';')) return fallbackName
        if (/\.[a-z0-9]+$/i.test(rawName)) return rawName
        return `${rawName}.${fallbackExt}`
    } catch {
        return fallbackName
    }
}

export function Topbar() {
    const {
        mode,
        setMode,
        currentRunId,
        runStatus,
        setRunId,
        setRunStatus,
        uploadedImage,
        setUploadedImage,
        isCalibrated,
        isGenerating3D,
        syncSVGAndEnter3D,
        showBackground,
        toggleBackground,
        showToast,
        tutorialStep,
        setTutorialStep,
        lastQueuedTask,
        setLastQueuedTask,
        token,
        pendingFile,
        setPendingFile,
        mobileSidebarOpen,
        mobileRightSidebarOpen,
        setMobileSidebarOpen,
        setMobileRightSidebarOpen,
        setShowProcessingModal,
        setShowQueueModal,
        setProjectsModalOpen
    } = useFloorplanStore()
    const [fileToUpload, setFileToUpload] = useState<File | null>(pendingFile)
    const [workerCount, setWorkerCount] = useState(0) // Pessimistic: assume offline until confirmed
    const [isDragging, setIsDragging] = useState(false)

    // Pick up file from dashboard if set
    useEffect(() => {
        if (pendingFile && !fileToUpload) {
            setFileToUpload(pendingFile)
            setPendingFile(null)
        }
    }, [fileToUpload, pendingFile, setPendingFile])

    // Helper to process file (from input or drop)
    const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/tiff']

    const handleFile_Local = (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            showToast('Image too large (max 50MB)', 'error')
            return
        }
        if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(png|jpe?g|webp|bmp|tiff?)$/i)) {
            showToast('Unsupported image format', 'error')
            return
        }
        setFileToUpload(file)

        // Local Preview
        const reader = new FileReader()
        reader.onload = (ev) => {
            if (ev.target?.result) {
                const url = ev.target.result as string
                const img = new Image()
                img.onload = () => {
                    setUploadedImage(url, img.width, img.height)
                    setMode('2d')
                    // setActiveTool('ruler') // Removed: User wants to manually select ruler
                }
                img.src = url
            }
        }
        reader.readAsDataURL(file)
        setRunStatus('idle')
    }

    const resolveUploadFile = async () => {
        if (fileToUpload) return fileToUpload
        if (!uploadedImage) return null

        const res = await fetch(uploadedImage)
        if (!res.ok) {
            throw new Error(`Failed to load image source (${res.status})`)
        }

        const blob = await res.blob()
        const mimeType = blob.type || 'image/png'
        const file = new File([blob], inferImageFilename(uploadedImage, mimeType), { type: mimeType })
        setFileToUpload(file)
        return file
    }

    // Poll Worker Status
    useEffect(() => {
        const checkWorkers = async () => {
            try {
                const res = await fetch('/api/system/status')
                if (res.ok) {
                    const data = await res.json()
                    setWorkerCount(data.workers_online || 0)
                }
            } catch {
                // Backend not running, set worker count to 0
                setWorkerCount(0)
            }
        }
        checkWorkers()
        const interval = setInterval(checkWorkers, 5000)
        return () => clearInterval(interval)
    }, [token])

    // Polling logic for Runs
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined
        console.log("[Topbar] Polling Effect:", { currentRunId, runStatus })
        if (currentRunId && runStatus === 'processing') {
            console.log("[Topbar] Starting Polling for:", currentRunId)
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/runs/${currentRunId}/status`, {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                    })
                    console.log("[Topbar] Poll Status Res:", res.status)
                    if (res.ok) {
                        const data = await res.json()
                        if (data.status === 'COMPLETED') {
                            // Fetch and Import SVG
                            // Fetch and Import SVG
                            const svgRes = await fetch(`/api/runs/${currentRunId}/svg`, {
                                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                            })
                            if (svgRes.ok) {
                                const svgText = await svgRes.text()
                                useFloorplanStore.getState().importFromSVG(svgText)
                            } else {
                                console.error('[DEBUG] Failed to fetch SVG:', svgRes.status)
                            }

                            // Tutorial progression
                            if (lastQueuedTask === 'detect_rooms') {
                                // Detect rooms returns a new SVG with room labels/geometry.
                                setTutorialStep('floor_review')
                                setLastQueuedTask('none')
                            } else {
                                // Initial prediction job: if not calibrated, start tutorial.
                                if (tutorialStep === 'none' && !useFloorplanStore.getState().isCalibrated) {
                                    setTutorialStep('calibration')
                                }
                            }

                            setRunStatus('completed')
                            useFloorplanStore.getState().setShowProcessingModal(false)
                            useFloorplanStore.getState().setShowQueueModal(false) // Ensure Queue modal is closed too
                            clearInterval(interval)
                        } else if (data.status === 'FAILED') {
                            setRunStatus('failed')
                            clearInterval(interval)
                        }
                    }
                } catch (e) {
                    console.error("Polling error:", e)
                }
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [currentRunId, runStatus, setRunStatus, lastQueuedTask, setLastQueuedTask, token, tutorialStep, setTutorialStep])

    const hasUploadedImage = Boolean(uploadedImage)
    const workerOnline = workerCount > 0

    return (
        <div className="border-b border-white/10 bg-slate-950/80 px-3 py-3 backdrop-blur-xl select-none supports-[backdrop-filter]:bg-slate-950/72 lg:px-5">
            <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 xl:hidden"
                        aria-label="Toggle tools panel"
                    >
                        <Menu className="h-4 w-4" />
                    </button>

                    <Link href="/" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <Image src="/logo.png" alt="Logo" width={24} height={24} className="h-6 w-6 object-contain" />
                    </Link>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-semibold tracking-tight text-white">Strukt AI Workspace</span>
                            <span className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
                                workerOnline
                                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                                    : "border-rose-400/20 bg-rose-400/10 text-rose-100"
                            )}>
                                <span className={cn("h-2 w-2 rounded-full", workerOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-400")} />
                                {workerOnline ? `${workerCount} Worker Online` : 'No Worker'}
                            </span>
                        </div>
                        <p className="mt-1 hidden text-xs text-slate-400 md:block">
                            Keep the canvas centered. Tools stay on the rails, and the mode switch stays in focus.
                        </p>
                    </div>
                </div>

                <div className="order-3 flex w-full justify-center lg:order-2 lg:w-auto">
                    <div className="inline-flex flex-wrap items-center gap-1 rounded-[20px] border border-white/10 bg-white/[0.04] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <button
                            onClick={toggleBackground}
                            className={cn(
                                "flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium transition",
                                showBackground
                                    ? "bg-slate-900 text-white shadow-[0_10px_30px_rgba(2,6,23,0.35)]"
                                    : "text-slate-400 hover:bg-white/7 hover:text-white"
                            )}
                            title="Toggle Background Image"
                        >
                            {showBackground ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            <span className="hidden sm:inline">Reference</span>
                        </button>

                        <button
                            onClick={() => setMode('2d')}
                            className={cn(
                                "flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium transition",
                                mode === '2d'
                                    ? "bg-cyan-500/14 text-cyan-50 ring-1 ring-cyan-400/20"
                                    : "text-slate-400 hover:bg-white/7 hover:text-white"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            <span>2D Editor</span>
                        </button>

                        <button
                            onClick={() => {
                                if (!isCalibrated) {
                                    showToast("Calibration Required! Please select the Ruler Tool to calibrate.", 'error')
                                    return
                                }
                                if (isGenerating3D) {
                                    showToast("3D Generation is already in progress...", 'info')
                                    return
                                }
                                setMode('3d')
                                syncSVGAndEnter3D()
                            }}
                            className={cn(
                                "flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium transition",
                                mode === '3d'
                                    ? "bg-emerald-500/14 text-emerald-50 ring-1 ring-emerald-400/20"
                                    : "text-slate-400 hover:bg-white/7 hover:text-white",
                                isGenerating3D && "animate-pulse"
                            )}
                            title="Generate 3D Model"
                        >
                            <Box className="h-4 w-4" />
                            <span>3D View</span>
                        </button>
                    </div>
                </div>

                <div className="order-2 flex w-full flex-wrap items-center justify-end gap-2 lg:order-3 lg:w-auto">
                    {hasUploadedImage && (
                        <button
                            disabled={runStatus === 'processing'}
                            onClick={async () => {
                                if (!token) {
                                    showToast("Please login to process floorplans", 'error')
                                    return
                                }

                                setRunStatus('processing')
                                let imageFile: File | null = null

                                try {
                                    imageFile = await resolveUploadFile()
                                } catch (e) {
                                    console.error('Failed to prepare floorplan image for upload:', e)
                                }

                                if (!imageFile) {
                                    showToast('Unable to prepare the floorplan image. Re-select it and try again.', 'error')
                                    setRunStatus('idle')
                                    return
                                }

                                const formData = new FormData()
                                formData.append('image', imageFile)

                                const pendingName = sessionStorage.getItem('pendingProjectName') || ''
                                if (pendingName) {
                                    formData.append('name', pendingName)
                                    sessionStorage.removeItem('pendingProjectName')
                                }

                                try {
                                    const res = await fetch('/api/runs', {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: formData
                                    })

                                    if (res.status === 403) {
                                        showToast(`Limit Reached (5/5). Load an existing project or Delete one to create new.`, 'error')
                                        setProjectsModalOpen(true)
                                        setRunStatus('idle')
                                        setShowProcessingModal(false)
                                        return
                                    }

                                    if (res.status === 429) {
                                        const errData = await res.json().catch(() => ({ detail: '' }))
                                        const detail = errData.detail || ''
                                        const isProjectLimit = detail.toLowerCase().includes('project limit')
                                        if (isProjectLimit) {
                                            showToast('Project limit reached. Delete an existing project to create a new one.', 'error')
                                            setProjectsModalOpen(true)
                                        } else {
                                            showToast(detail || 'Token limit reached. Upgrade to Pro for 3x more tokens.', 'error')
                                        }
                                        setRunStatus('idle')
                                        setShowProcessingModal(false)
                                        setShowQueueModal(false)
                                        return
                                    }

                                    const text = await res.text()
                                    if (!res.ok) throw new Error(text)

                                    const data = JSON.parse(text)
                                    if (data.ok) {
                                        setRunId(data.run_id)

                                        if (data.status === 'QUEUED_OFFLINE') {
                                            setShowProcessingModal(false)
                                            setShowQueueModal(true)
                                            showToast("Our servers are currently busy. Your project is saved — we'll process it automatically and email you when it's ready!", 'info')
                                        } else {
                                            setShowQueueModal(false)
                                            setShowProcessingModal(true)
                                        }
                                    } else {
                                        throw new Error(data.detail)
                                    }
                                } catch (error) {
                                    console.error(error)
                                    setRunStatus('failed')
                                    setShowProcessingModal(false)

                                    const message = error instanceof Error ? error.message : String(error)
                                    if (!message.includes("Limit")) {
                                        alert('Upload failed: ' + message)
                                    }
                                }
                            }}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition",
                                runStatus === 'processing'
                                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                                    : "border-emerald-400/25 bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-[0_16px_35px_rgba(22,163,74,0.28)] hover:brightness-110"
                            )}
                        >
                            <Play className="h-4 w-4" />
                            {runStatus === 'processing' ? 'Processing...' : 'Process Floorplan'}
                        </button>
                    )}

                    <label
                        className={cn(
                            "inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all",
                            hasUploadedImage
                                ? "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.09]"
                                : "border-cyan-400/20 bg-cyan-400/10 text-cyan-50 hover:bg-cyan-400/16",
                            isDragging && "border-cyan-300 bg-cyan-400/18 text-white shadow-[0_0_0_1px_rgba(125,211,252,0.35)]"
                        )}
                        onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragging(true)
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault()
                            setIsDragging(false)
                        }}
                        onDrop={(e) => {
                            e.preventDefault()
                            setIsDragging(false)
                            if (runStatus === 'processing') return
                            const file = e.dataTransfer.files?.[0]
                            if (file) handleFile_Local(file)
                        }}
                    >
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            disabled={runStatus === 'processing'}
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFile_Local(file)
                            }}
                        />
                        {hasUploadedImage ? (
                            <Download className={cn("h-4 w-4 rotate-180", runStatus === 'processing' && "animate-spin")} />
                        ) : (
                            <ImagePlus className="h-4 w-4" />
                        )}
                        {runStatus === 'processing'
                            ? 'Processing...'
                            : (hasUploadedImage ? 'Change Image' : 'Select Floorplan')}
                    </label>

                    <button
                        type="button"
                        onClick={() => setMobileRightSidebarOpen(!mobileRightSidebarOpen)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 xl:hidden"
                        aria-label="Toggle inspector panel"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
