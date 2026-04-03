'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LayoutGrid, Box, Download, Play, Eye, EyeOff, Menu, SlidersHorizontal, ImagePlus, Camera, Save, Clock3, CheckCircle2, AlertCircle, Layers3, Plus, Trash2 } from 'lucide-react'
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
        cameraMode,
        setMode,
        setCameraMode,
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
        setGlbPreviewSource,
        showToast,
        tutorialStep,
        setTutorialStep,
        lastQueuedTask,
        setLastQueuedTask,
        token,
        pendingFile,
        setPendingFile,
        levels,
        activeLevelId,
        addLevel,
        removeLevel,
        setActiveLevel,
        workersOnline,
        setWorkersOnline,
        deferredTasks,
        flushDeferredTasks,
        saveLocalDraft,
        restoreLocalDraft,
        localDraftStatus,
        lastLocalSaveAt,
        walls,
        rooms,
        furniture,
        labels,
        mobileSidebarOpen,
        mobileRightSidebarOpen,
        setMobileSidebarOpen,
        setMobileRightSidebarOpen,
        setActiveTool,
        setShowProcessingModal,
        setShowQueueModal,
        setProjectsModalOpen
    } = useFloorplanStore()
    const [fileToUpload, setFileToUpload] = useState<File | null>(pendingFile)
    const [isDragging, setIsDragging] = useState(false)
    const autosaveTimerRef = useRef<number | null>(null)
    const flushInFlightRef = useRef(false)
    const draftRestoredRef = useRef(false)

    const requireCalibration = () => {
        if (!isCalibrated) {
            showToast('Calibrate first! Select the Ruler tool (C), click a wall, enter its real length.', 'error')
            setTutorialStep('calibration')
            setActiveTool('ruler')
            return true
        }
        return false
    }

    const workerOnline = workersOnline > 0
    const queuedTaskCount = deferredTasks.length
    const currentLevel = levels.find((level) => level.id === activeLevelId) || levels[0] || null
    const autosaveMeta = useMemo(() => {
        if (localDraftStatus === 'saving') {
            return {
                icon: Clock3,
                text: 'Saving locally',
                className: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-50',
            }
        }
        if (localDraftStatus === 'saved') {
            const timeLabel = lastLocalSaveAt
                ? new Date(lastLocalSaveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'just now'
            return {
                icon: CheckCircle2,
                text: `Saved ${timeLabel}`,
                className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-50',
            }
        }
        if (localDraftStatus === 'restored') {
            return {
                icon: Save,
                text: 'Draft restored',
                className: 'border-sky-400/20 bg-sky-400/10 text-sky-50',
            }
        }
        if (localDraftStatus === 'error') {
            return {
                icon: AlertCircle,
                text: 'Local save failed',
                className: 'border-rose-400/20 bg-rose-400/10 text-rose-50',
            }
        }
        return {
            icon: Save,
            text: 'Auto-saves every 1 min',
            className: 'border-white/10 bg-white/[0.04] text-slate-200',
        }
    }, [lastLocalSaveAt, localDraftStatus])

    const requestLive3D = async (nextCameraMode: 'orbit' | 'fpv') => {
        if (requireCalibration()) return
        if (isGenerating3D) {
            showToast('3D generation is already in progress...', 'info')
            return
        }

        setGlbPreviewSource('none')
        setCameraMode(nextCameraMode)
        setMode('3d')
        await syncSVGAndEnter3D()
    }

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
                const img = new window.Image()
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

    const downloadFile = async (path: string, filename: string) => {
        const res = await fetch(path, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })

        if (!res.ok) {
            throw new Error(await res.text())
        }

        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
    }

    const waitForRunCompletion = async () => {
        await new Promise<void>((resolve, reject) => {
            let attempts = 0
            const pollInterval = window.setInterval(() => {
                attempts += 1
                const status = useFloorplanStore.getState().runStatus
                if (status === 'completed') {
                    clearInterval(pollInterval)
                    resolve()
                } else if (status === 'failed' || attempts > 120) {
                    clearInterval(pollInterval)
                    reject(new Error('3D generation failed or timed out.'))
                }
            }, 1500)
        })
    }

    const ensureGeneratedAsset = async (formats: string[] | undefined, message: string) => {
        if (runStatus === 'processing') return

        showToast(message, 'info')
        await useFloorplanStore.getState().triggerBlenderGeneration(formats)

        if (useFloorplanStore.getState().runStatus !== 'processing') {
            throw new Error('3D generation did not start.')
        }

        await waitForRunCompletion()
    }

    const handleGeneratedDownload = async ({
        path,
        filename,
        formats,
        generatingMessage,
        failureMessage,
        analyticsAction,
    }: {
        path: string
        filename: string
        formats?: string[]
        generatingMessage: string
        failureMessage: string
        analyticsAction?: string
    }) => {
        if (!currentRunId || !token) {
            showToast('Please login to download', 'error')
            return
        }
        if (requireCalibration()) return

        if (analyticsAction) {
            useFloorplanStore.getState().logAnalyticsEvent(analyticsAction)
        }

        try {
            await ensureGeneratedAsset(formats, generatingMessage)
            await downloadFile(path, filename)
        } catch (e) {
            console.error(e)
            showToast(failureMessage, 'error')
        }
    }

    const handleRawSvgDownload = async () => {
        if (!currentRunId || !token) {
            showToast('Please login to download', 'error')
            return
        }

        try {
            await downloadFile(`/api/runs/${currentRunId}/svg/raw?t=${Date.now()}`, `inference_raw_${currentRunId}.svg`)
        } catch (e) {
            console.error(e)
            showToast('Failed to download SVG.', 'error')
        }
    }

    useEffect(() => {
        if (draftRestoredRef.current) return
        draftRestoredRef.current = true
        restoreLocalDraft()
    }, [restoreLocalDraft])

    // Poll Worker Status
    useEffect(() => {
        const checkWorkers = async () => {
            try {
                const res = await fetch('/api/system/status')
                if (res.ok) {
                    const data = await res.json()
                    setWorkersOnline(data.workers_online || 0)
                }
            } catch {
                // Backend not running, set worker count to 0
                setWorkersOnline(0)
            }
        }
        checkWorkers()
        const interval = setInterval(checkWorkers, 5000)
        return () => clearInterval(interval)
    }, [setWorkersOnline, token])

    useEffect(() => {
        if (autosaveTimerRef.current) {
            window.clearTimeout(autosaveTimerRef.current)
        }

        autosaveTimerRef.current = window.setTimeout(() => {
            saveLocalDraft()
        }, 60_000)

        return () => {
            if (autosaveTimerRef.current) {
                window.clearTimeout(autosaveTimerRef.current)
                autosaveTimerRef.current = null
            }
        }
    }, [
        activeLevelId,
        cameraMode,
        currentRunId,
        levels,
        mode,
        runStatus,
        saveLocalDraft,
        uploadedImage,
        walls,
        rooms,
        furniture,
        labels,
    ])

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                saveLocalDraft()
            }
        }
        const handleBeforeUnload = () => {
            saveLocalDraft()
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [saveLocalDraft])

    useEffect(() => {
        if (!workerOnline || queuedTaskCount === 0 || runStatus === 'processing' || flushInFlightRef.current) {
            return
        }

        flushInFlightRef.current = true
        flushDeferredTasks().finally(() => {
            flushInFlightRef.current = false
        })
    }, [flushDeferredTasks, queuedTaskCount, runStatus, workerOnline])

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
                            } else if (lastQueuedTask === 'gen_3d') {
                                setMode('3d')
                                setGlbPreviewSource('generated')
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
    }, [currentRunId, runStatus, setGlbPreviewSource, setMode, setRunStatus, lastQueuedTask, setLastQueuedTask, token, tutorialStep, setTutorialStep])

    const hasUploadedImage = Boolean(uploadedImage)
    const AutosaveIcon = autosaveMeta.icon

    return (
        <div className="overflow-x-hidden border-b border-white/10 bg-slate-950/80 px-3 py-3 backdrop-blur-xl select-none supports-[backdrop-filter]:bg-slate-950/72 lg:px-5">
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
                            <span className="truncate text-sm font-semibold tracking-tight text-white">Strukt AI</span>
                            <span className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium",
                                autosaveMeta.className
                            )}>
                                <AutosaveIcon className="h-3.5 w-3.5" />
                                {autosaveMeta.text}
                            </span>
                            {queuedTaskCount > 0 && (
                                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[11px] font-medium text-amber-50">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {queuedTaskCount} queued until workers are back
                                </span>
                            )}
                            {!workerOnline && (
                                <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5 text-[11px] font-medium text-rose-50">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Workers offline
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="order-3 flex w-full justify-center lg:order-2 lg:w-auto">
                    <div className="inline-flex flex-wrap items-center gap-1 rounded-[20px] border border-white/10 bg-white/[0.04] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <div className="mr-1 inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-slate-950/65 px-2 py-1">
                            <Layers3 className="h-4 w-4 text-slate-300" />
                            <select
                                value={activeLevelId}
                                onChange={(event) => setActiveLevel(event.target.value)}
                                className="min-w-[120px] bg-transparent text-xs font-medium text-slate-100 outline-none"
                                aria-label="Active floor"
                            >
                                {levels.map((level) => (
                                    <option key={level.id} value={level.id} className="bg-slate-950 text-slate-100">
                                        {level.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => addLevel()}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
                                title="Add floor"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                disabled={levels.length <= 1}
                                onClick={() => {
                                    if (!currentLevel || levels.length <= 1) return
                                    const confirmed = window.confirm(`Remove ${currentLevel.name}? This deletes only that floor from the editor.`)
                                    if (!confirmed) return
                                    removeLevel(currentLevel.id)
                                }}
                                className={cn(
                                    "inline-flex h-7 w-7 items-center justify-center rounded-xl transition",
                                    levels.length <= 1
                                        ? "cursor-not-allowed text-slate-600"
                                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                                )}
                                title="Remove floor"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
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
                            onClick={() => {
                                setCameraMode('orbit')
                                setMode('2d')
                            }}
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
                            onClick={() => { void requestLive3D('orbit') }}
                            className={cn(
                                "flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium transition",
                                mode === '3d' && cameraMode === 'orbit'
                                    ? "bg-emerald-500/14 text-emerald-50 ring-1 ring-emerald-400/20"
                                    : "text-slate-400 hover:bg-white/7 hover:text-white",
                                isGenerating3D && "animate-pulse"
                            )}
                            title="Generate 3D Model"
                        >
                            <Box className="h-4 w-4" />
                            <span>3D View</span>
                        </button>

                        <button
                            onClick={() => { void requestLive3D('fpv') }}
                            className={cn(
                                "flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium transition",
                                mode === '3d' && cameraMode === 'fpv'
                                    ? "bg-amber-500/14 text-amber-50 ring-1 ring-amber-400/20"
                                    : "text-slate-400 hover:bg-white/7 hover:text-white"
                            )}
                            title="First person view"
                        >
                            <Camera className="h-4 w-4" />
                            <span>FPV</span>
                        </button>
                    </div>
                </div>

                <div className="order-2 flex w-full flex-wrap items-center justify-end gap-2 lg:order-3 lg:w-auto">
                    {currentRunId && (
                        <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                            <button
                                type="button"
                                disabled={isGenerating3D}
                                onClick={() => handleGeneratedDownload({
                                    path: `/api/runs/${currentRunId}/download/glb`,
                                    filename: `floorplan-${currentRunId}.glb`,
                                    generatingMessage: 'Generating high quality 3D model...',
                                    failureMessage: 'Failed to download GLB. Wait a moment and try again.',
                                    analyticsAction: 'download_3d',
                                })}
                                className={cn(
                                    "rounded-xl px-3 py-2 text-xs font-semibold transition",
                                    "bg-white/[0.05] text-white hover:bg-white/[0.1]",
                                    isGenerating3D && "cursor-not-allowed opacity-60"
                                )}
                                title="Generate and download GLB"
                            >
                                GLB
                            </button>
                            <button
                                type="button"
                                disabled={isGenerating3D}
                                onClick={() => handleGeneratedDownload({
                                    path: `/api/runs/${currentRunId}/download/blend`,
                                    filename: `floorplan-${currentRunId}.blend`,
                                    formats: ['blend'],
                                    generatingMessage: 'Generating Blender file...',
                                    failureMessage: 'Failed to download Blend. Wait a moment and try again.',
                                })}
                                className={cn(
                                    "rounded-xl px-3 py-2 text-xs font-semibold transition",
                                    "bg-white/[0.05] text-white hover:bg-white/[0.1]",
                                    isGenerating3D && "cursor-not-allowed opacity-60"
                                )}
                                title="Generate and download Blend"
                            >
                                BLEND
                            </button>
                            <button
                                type="button"
                                disabled={isGenerating3D}
                                onClick={() => handleGeneratedDownload({
                                    path: `/api/runs/${currentRunId}/download/dae`,
                                    filename: `floorplan-${currentRunId}.dae`,
                                    formats: ['dae'],
                                    generatingMessage: 'Generating DAE for SketchUp...',
                                    failureMessage: 'Failed to download SketchUp file. Wait a moment and try again.',
                                })}
                                className={cn(
                                    "rounded-xl px-3 py-2 text-xs font-semibold transition",
                                    "bg-sky-500/15 text-sky-50 hover:bg-sky-500/24",
                                    isGenerating3D && "cursor-not-allowed opacity-60"
                                )}
                                title="Generate and download DAE"
                            >
                                SKP
                            </button>
                            <button
                                type="button"
                                disabled={isGenerating3D}
                                onClick={() => handleGeneratedDownload({
                                    path: `/api/runs/${currentRunId}/download/ifc`,
                                    filename: `floorplan-${currentRunId}.ifc`,
                                    formats: ['ifc'],
                                    generatingMessage: 'Generating IFC for Revit...',
                                    failureMessage: 'Failed to download IFC. Wait a moment and try again.',
                                })}
                                className={cn(
                                    "rounded-xl px-3 py-2 text-xs font-semibold transition",
                                    "bg-amber-500/15 text-amber-50 hover:bg-amber-500/24",
                                    isGenerating3D && "cursor-not-allowed opacity-60"
                                )}
                                title="Generate and download IFC"
                            >
                                IFC
                            </button>
                            <button
                                type="button"
                                onClick={handleRawSvgDownload}
                                className="rounded-xl bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
                                title="Download raw SVG"
                            >
                                SVG
                            </button>
                        </div>
                    )}

                    {hasUploadedImage && (
                        <button
                            disabled={runStatus === 'processing'}
                            onClick={async () => {
                                if (!token) {
                                    showToast("Please login to process floorplans", 'error')
                                    return
                                }

                                setProjectsModalOpen(false)
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
                                    if (!res.ok) {
                                        console.error('API Error:', res.status, text)
                                        showToast(`Server error (${res.status}): ${text || 'Unknown error'}`, 'error')
                                        setRunStatus('idle')
                                        setShowProcessingModal(false)
                                        return
                                    }

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
                                    : workerOnline
                                        ? "border-emerald-400/25 bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-[0_16px_35px_rgba(22,163,74,0.28)] hover:brightness-110"
                                        : "border-amber-400/30 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_16px_35px_rgba(245,158,11,0.28)] hover:brightness-110"
                            )}
                        >
                            <Play className="h-4 w-4" />
                            {runStatus === 'processing' ? 'Processing...' : workerOnline ? 'Process Floorplan' : 'Save & Queue Floorplan'}
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
