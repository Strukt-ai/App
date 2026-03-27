'use client'

import { useEffect, useState } from 'react'
import { LayoutGrid, Box, Download, Play, Eye, EyeOff, Menu } from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'
import { DebugPanel } from './DebugPanel'

export function Topbar() {
    const { mode, setMode, currentRunId, runStatus, setRunId, setRunStatus, uploadedImage, setUploadedImage, isCalibrated, isGenerating3D, syncSVGAndEnter3D, showBackground, toggleBackground, showToast, tutorialStep, setTutorialStep, lastQueuedTask, setLastQueuedTask, token, pendingFile, setPendingFile, setMobileSidebarOpen } = useFloorplanStore()
    const [fileToUpload, setFileToUpload] = useState<File | null>(pendingFile)
    const [workerCount, setWorkerCount] = useState(0) // Pessimistic: assume offline until confirmed
    const [isDragging, setIsDragging] = useState(false)

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

    // Pick up file from dashboard if set
    useEffect(() => {
        if (pendingFile && !fileToUpload) {
            setFileToUpload(pendingFile)
            setPendingFile(null)
        }
    }, [pendingFile])

    // Poll Worker Status
    useEffect(() => {
        const checkWorkers = async () => {
            try {
                const res = await fetch('/api/system/status')
                if (res.ok) {
                    const data = await res.json()
                    setWorkerCount(data.workers_online || 0)
                }
            } catch (e) {
                console.error("Worker check failed", e)
                setWorkerCount(0)
            }
        }
        checkWorkers()
        const interval = setInterval(checkWorkers, 5000)
        return () => clearInterval(interval)
    }, [])

    // Polling logic for Runs
    useEffect(() => {
        let interval: any
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
    }, [currentRunId, runStatus, setRunStatus, lastQueuedTask, setLastQueuedTask, tutorialStep, setTutorialStep])

    return (
        <div className="relative h-14 border-b bg-card flex items-center justify-between px-2 sm:px-4 select-none">
            <div className="flex items-center gap-2 shrink-0">
                <button 
                    className="md:hidden p-1.5 text-muted-foreground hover:bg-secondary rounded-md"
                    onClick={() => setMobileSidebarOpen(true)}
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-xs sm:text-sm tracking-tight leading-none">Strukt AI</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", workerCount > 0 ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground font-mono hidden sm:inline">
                            {workerCount > 0 ? `${workerCount} WORKER ONLINE` : "NO WORKER"}
                        </span>
                    </div>
                </div>
            </div>

            {/* View Controls */}
            <div className="hidden lg:block h-8 w-[1px] bg-border mx-2" />

            {/* View Controls - Centered */}
            <div className="flex-[0_1_auto] min-w-0 overflow-x-auto hide-scrollbar mx-1 px-1">
                <div className="flex bg-muted/50 p-1 rounded-lg gap-1 w-max mx-auto shrink-0">
                <button
                    onClick={toggleBackground}
                    className={cn(
                        "p-1.5 rounded-md transition-colors flex items-center gap-2 text-xs font-medium",
                        showBackground ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50"
                    )}
                    title="Toggle Background Image"
                >
                    {showBackground ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="hidden sm:inline">Ref Image</span>
                </button>

                <button
                    onClick={() => setMode('2d')}
                    className={cn(
                        "p-1.5 rounded-md transition-colors flex items-center gap-2 text-xs font-medium",
                        mode === '2d' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50"
                    )}
                >
                    <LayoutGrid className="w-4 h-4" />
                    <span>2D Editor</span>
                </button>
                <button
                    onClick={() => {
                        // Restore: Calibration Check & Generation Trigger
                        if (!isCalibrated) {
                            // Changed alert to nice toast
                            showToast("Calibration Required! Please select the Ruler Tool to calibrate.", 'error')
                            // setActiveTool('ruler') // Removed: User wants manual control
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
                        "p-1.5 rounded-md transition-colors flex items-center gap-2 text-xs font-medium",
                        mode === '3d' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50",
                        // Add visual feedback for generating state
                        isGenerating3D && "animate-pulse text-yellow-500"
                    )}
                    title="Generate 3D Model"
                >
                    <Box className="w-4 h-4" />
                    <span>3D View</span>
                </button>
                </div>
            </div>

            <div className="flex items-center gap-2 min-w-0 overflow-x-auto hide-scrollbar pl-1 [&>*]:shrink-0">

                {currentRunId && (
                    <div className="flex items-center gap-1 mr-1 sm:mr-2 border-r border-border pr-2 sm:pr-3 shrink-0 [&>*]:shrink-0">
                        <button
                            disabled={isGenerating3D}
                            onClick={async () => {
                                if (!token) return showToast("Please login to download", "error")

                                const doDownload = async () => {
                                    try {
                                        const res = await fetch(`/api/runs/${currentRunId}/download/glb`, {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        })
                                        if (!res.ok) throw new Error(await res.text())
                                        const blob = await res.blob()
                                        const url = window.URL.createObjectURL(blob)
                                        const a = document.createElement('a')
                                        a.href = url
                                        a.download = `floorplan-${currentRunId}.glb`
                                        document.body.appendChild(a)
                                        a.click()
                                        a.remove()
                                        window.URL.revokeObjectURL(url)
                                    } catch (e: any) {
                                        showToast("Failed to download GLB. Wait a moment and try again.", "error")
                                    }
                                }

                                // If not generating, trigger it AND wait.
                                if (runStatus !== 'processing') {
                                    showToast("Generating High Quality 3D Model...", "info")
                                    await useFloorplanStore.getState().triggerBlenderGeneration()
                                    let attempts = 0;
                                    const pollInterval = setInterval(async () => {
                                        attempts++;
                                        const status = useFloorplanStore.getState().runStatus;
                                        if (status === 'completed') {
                                            clearInterval(pollInterval);
                                            await doDownload();
                                        } else if (status === 'failed' || attempts > 120) {
                                            clearInterval(pollInterval);
                                            showToast("3D Generation failed or timed out.", "error");
                                        }
                                    }, 1500);
                                } else {
                                    // Already processing? Just try download assuming it might be another task, or wait? Let's just try.
                                    await doDownload()
                                }
                            }}
                            className={cn(
                                "px-2.5 py-1.5 rounded-md text-xs font-medium bg-secondary/50 hover:bg-secondary flex items-center gap-1.5 transition-colors",
                                isGenerating3D && "animate-pulse opacity-50 cursor-not-allowed text-yellow-500"
                            )}
                            title="Generate & Download 3D Model (GLB)"
                        >
                            <Download className="w-3.5 h-3.5" />
                            {isGenerating3D ? 'Wait...' : 'GLB'}
                        </button>
                        <button
                            disabled={isGenerating3D}
                            onClick={async () => {
                                if (!token) return showToast("Please login to download", "error")

                                const doDownload = async () => {
                                    try {
                                        const res = await fetch(`/api/runs/${currentRunId}/download/blend`, {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        })
                                        if (!res.ok) throw new Error(await res.text())
                                        const blob = await res.blob()
                                        const url = window.URL.createObjectURL(blob)
                                        const a = document.createElement('a')
                                        a.href = url
                                        a.download = `floorplan-${currentRunId}.blend`
                                        document.body.appendChild(a)
                                        a.click()
                                        a.remove()
                                        window.URL.revokeObjectURL(url)
                                    } catch (e: any) {
                                        showToast("Failed to download Blend. Wait a moment and try again.", "error")
                                    }
                                }

                                // If not generating, trigger it AND wait.
                                if (runStatus !== 'processing') {
                                    showToast("Generating Blender file...", "info")
                                    await useFloorplanStore.getState().triggerBlenderGeneration(['blend'])
                                    let attempts = 0;
                                    const pollInterval = setInterval(async () => {
                                        attempts++;
                                        const status = useFloorplanStore.getState().runStatus;
                                        if (status === 'completed') {
                                            clearInterval(pollInterval);
                                            await doDownload();
                                        } else if (status === 'failed' || attempts > 120) {
                                            clearInterval(pollInterval);
                                            showToast("3D Generation failed or timed out.", "error");
                                        }
                                    }, 1500);
                                } else {
                                    await doDownload()
                                }
                            }}
                            className={cn(
                                "px-2.5 py-1.5 rounded-md text-xs font-medium bg-secondary/50 hover:bg-secondary flex items-center gap-1.5 transition-colors",
                                isGenerating3D && "animate-pulse opacity-50 cursor-not-allowed text-yellow-500"
                            )}
                            title="Generate & Download Blender File"
                        >
                            <Download className="w-3.5 h-3.5" />
                            {isGenerating3D ? 'Wait...' : 'Blend'}
                        </button>
                        <button
                            disabled={isGenerating3D}
                            onClick={async () => {
                                if (!token) return showToast("Please login to download", "error")

                                const doDownload = async () => {
                                    try {
                                        const res = await fetch(`/api/runs/${currentRunId}/download/dae`, {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        })
                                        if (!res.ok) throw new Error(await res.text())
                                        const blob = await res.blob()
                                        const url = window.URL.createObjectURL(blob)
                                        const a = document.createElement('a')
                                        a.href = url
                                        a.download = `floorplan-${currentRunId}.dae`
                                        document.body.appendChild(a)
                                        a.click()
                                        a.remove()
                                        window.URL.revokeObjectURL(url)
                                    } catch (e: any) {
                                        showToast("Failed to download SketchUp file. Wait a moment and try again.", "error")
                                    }
                                }

                                if (runStatus !== 'processing') {
                                    showToast("Generating DAE for SketchUp...", "info")
                                    await useFloorplanStore.getState().triggerBlenderGeneration(['dae'])
                                    let attempts = 0;
                                    const pollInterval = setInterval(async () => {
                                        attempts++;
                                        const status = useFloorplanStore.getState().runStatus;
                                        if (status === 'completed') {
                                            clearInterval(pollInterval);
                                            await doDownload();
                                        } else if (status === 'failed' || attempts > 120) {
                                            clearInterval(pollInterval);
                                            showToast("3D Generation failed or timed out.", "error");
                                        }
                                    }, 1500);
                                } else {
                                    await doDownload()
                                }
                            }}
                            className={cn(
                                "px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-600/80 hover:bg-blue-600 text-white flex items-center gap-1.5 transition-colors",
                                isGenerating3D && "animate-pulse opacity-50 cursor-not-allowed"
                            )}
                            title="Download for SketchUp Pro (Collada .dae)"
                        >
                            <Download className="w-3.5 h-3.5" />
                            {isGenerating3D ? 'Wait...' : 'SKP'}
                        </button>
                        <button
                            disabled={isGenerating3D}
                            onClick={async () => {
                                if (!token) return showToast("Please login to download", "error")

                                const doDownload = async () => {
                                    try {
                                        const res = await fetch(`/api/runs/${currentRunId}/download/ifc`, {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        })
                                        if (!res.ok) throw new Error(await res.text())
                                        const blob = await res.blob()
                                        const url = window.URL.createObjectURL(blob)
                                        const a = document.createElement('a')
                                        a.href = url
                                        a.download = `floorplan-${currentRunId}.ifc`
                                        document.body.appendChild(a)
                                        a.click()
                                        a.remove()
                                        window.URL.revokeObjectURL(url)
                                    } catch (e: any) {
                                        showToast("Failed to download IFC. Wait a moment and try again.", "error")
                                    }
                                }

                                if (runStatus !== 'processing') {
                                    showToast("Generating IFC for Revit...", "info")
                                    await useFloorplanStore.getState().triggerBlenderGeneration(['ifc'])
                                    let attempts = 0;
                                    const pollInterval = setInterval(async () => {
                                        attempts++;
                                        const status = useFloorplanStore.getState().runStatus;
                                        if (status === 'completed') {
                                            clearInterval(pollInterval);
                                            await doDownload();
                                        } else if (status === 'failed' || attempts > 120) {
                                            clearInterval(pollInterval);
                                            showToast("3D Generation failed or timed out.", "error");
                                        }
                                    }, 1500);
                                } else {
                                    await doDownload()
                                }
                            }}
                            className={cn(
                                "px-2.5 py-1.5 rounded-md text-xs font-medium bg-orange-600/80 hover:bg-orange-600 text-white flex items-center gap-1.5 transition-colors",
                                isGenerating3D && "animate-pulse opacity-50 cursor-not-allowed"
                            )}
                            title="Download for Revit / BIM (IFC)"
                        >
                            <Download className="w-3.5 h-3.5" />
                            {isGenerating3D ? 'Wait...' : 'IFC'}
                        </button>
                        <button
                            onClick={async () => {
                                if (!token) return showToast("Please login to download", "error")
                                try {
                                    const res = await fetch(`/api/runs/${currentRunId}/svg/raw?t=${Date.now()}`, {
                                        cache: 'no-store',
                                        headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
                                    })
                                    if (!res.ok) throw new Error(await res.text())
                                    const blob = await res.blob()
                                    const url = window.URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = `inference_raw_${currentRunId}.svg`
                                    document.body.appendChild(a)
                                    a.click()
                                    a.remove()
                                    window.URL.revokeObjectURL(url)
                                } catch (e: any) {
                                    showToast("Failed to download SVG.", "error")
                                }
                            }}
                            className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-secondary/50 hover:bg-secondary flex items-center gap-1.5 transition-colors"
                            title="Download Raw Inference SVG"
                        >
                            <Download className="w-3.5 h-3.5" />
                            SVG
                        </button>
                    </div>
                )}

                <div className="relative flex items-center gap-2">
                    {/* Process Button - Only visible if file selected */}
                    {uploadedImage && (
                        <button
                            disabled={runStatus === 'processing'}
                            onClick={async () => {
                                if (!fileToUpload) return

                                // Auth Check
                                if (!token) {
                                    showToast("Please login to process floorplans", 'error')
                                    return
                                }

                                setRunStatus('processing')
                                const formData = new FormData()
                                formData.append('image', fileToUpload)

                                // Pick up project name from NewProjectDialog
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

                                    // Check Status first (before showing modals)
                                    if (res.status === 403) {
                                        showToast(`Limit Reached (5/5). Load an existing project or Delete one to create new.`, 'error')
                                        // Auto-open projects modal to let them delete
                                        useFloorplanStore.getState().setProjectsModalOpen(true)
                                        setRunStatus('idle')
                                        useFloorplanStore.getState().setShowProcessingModal(false)
                                        return
                                    }

                                    if (res.status === 429) {
                                        const errData = await res.json().catch(() => ({ detail: '' }))
                                        const detail = errData.detail || ''
                                        const isProjectLimit = detail.toLowerCase().includes('project limit')
                                        if (isProjectLimit) {
                                            showToast('Project limit reached. Delete an existing project to create a new one.', 'error')
                                            useFloorplanStore.getState().setProjectsModalOpen(true)
                                        } else {
                                            showToast(detail || 'Token limit reached. Upgrade to Pro for 3x more tokens.', 'error')
                                        }
                                        setRunStatus('idle')
                                        useFloorplanStore.getState().setShowProcessingModal(false)
                                        useFloorplanStore.getState().setShowQueueModal(false)
                                        return
                                    }

                                    const text = await res.text()
                                    if (!res.ok) throw new Error(text)

                                    const data = JSON.parse(text)
                                    if (data.ok) {
                                        setRunId(data.run_id)
                                        useFloorplanStore.getState().setRunId(data.run_id)

                                        // Show correct modal based on backend response (source of truth)
                                        if (data.status === 'QUEUED_OFFLINE') {
                                            useFloorplanStore.getState().setShowProcessingModal(false)
                                            useFloorplanStore.getState().setShowQueueModal(true)
                                            showToast("Our servers are currently busy. Your project is saved — we'll process it automatically and email you when it's ready!", 'info')
                                        } else {
                                            // Worker is online, show processing modal
                                            useFloorplanStore.getState().setShowQueueModal(false)
                                            useFloorplanStore.getState().setShowProcessingModal(true)
                                        }
                                    } else {
                                        throw new Error(data.detail)
                                    }
                                } catch (e: any) {
                                    console.error(e)
                                    setRunStatus('failed')
                                    useFloorplanStore.getState().setShowProcessingModal(false) // Fix: Close modal on error

                                    // Don't alert if we already handled 403
                                    if (!e.message?.includes("Limit")) {
                                        alert('Upload failed: ' + e.message)
                                    }
                                }
                            }}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                                "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                            )}
                        >
                            <Play className="w-4 h-4" />
                            Process Floorplan
                        </button>
                    )}

                    <label
                        className={cn(
                            "cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                            "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-transparent",
                            isDragging && "border-primary bg-primary/10 text-primary"
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
                        <Download className={cn("w-4 h-4 rotate-180", runStatus === 'processing' && "animate-spin")} />
                        {runStatus === 'processing'
                            ? '...'
                            : (uploadedImage ? 'Change Image' : 'Load')}
                    </label>
                </div>
            </div>
            <DebugPanel />
        </div >
    )
}
