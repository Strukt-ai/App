'use client'

import { useEffect, useState } from 'react'
import { LayoutGrid, Box, Download, Play, Eye, EyeOff } from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'
import { DebugPanel } from './DebugPanel'

export function Topbar() {
    const { mode, setMode, currentRunId, runStatus, setRunId, setRunStatus, uploadedImage, setUploadedImage, isCalibrated, isGenerating3D, syncSVGAndEnter3D, showBackground, toggleBackground, showToast, tutorialStep, setTutorialStep, lastQueuedTask, setLastQueuedTask, token } = useFloorplanStore()
    const [fileToUpload, setFileToUpload] = useState<File | null>(null)
    const [workerCount, setWorkerCount] = useState(1) // Optimistic: Assume 1 worker online until proven otherwise
    const [isDragging, setIsDragging] = useState(false)

    // Helper to process file (from input or drop)
    const handleFile_Local = (file: File) => {
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
        <div className="relative h-14 border-b bg-card flex items-center justify-between px-4 select-none">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight leading-none">Strukt AI</span>
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className={cn("w-2 h-2 rounded-full", workerCount > 0 ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                        <span className="text-[10px] text-muted-foreground font-mono">
                            {workerCount > 0 ? `${workerCount} WORKER ONLINE` : "NO WORKER"}
                        </span>
                    </div>
                </div>
            </div>

            {/* View Controls */}
            <div className="h-8 w-[1px] bg-border mx-2" />

            {/* View Controls - Centered */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex bg-muted/50 p-1 rounded-lg gap-1">
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

            <div className="flex items-center gap-2">

                {currentRunId && (
                    <div className="flex items-center gap-1 mr-2 border-r border-border pr-3">
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

                                try {
                                    const res = await fetch('/api/runs', {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: formData
                                    })

                                    // Trigger Popup based on Worker Status
                                    if (workerCount > 0) {
                                        useFloorplanStore.getState().setShowProcessingModal(true)
                                    } else {
                                        useFloorplanStore.getState().setShowQueueModal(true)
                                    }

                                    // Check Status
                                    if (res.status === 403) {
                                        showToast(`Limit Reached (5/5). Load an existing project or Delete one to create new.`, 'error')
                                        // Auto-open projects modal to let them delete
                                        useFloorplanStore.getState().setProjectsModalOpen(true)
                                        setRunStatus('idle')
                                        useFloorplanStore.getState().setShowProcessingModal(false)
                                        return
                                    }

                                    const text = await res.text()
                                    if (!res.ok) throw new Error(text)

                                    const data = JSON.parse(text)
                                    if (data.ok) {
                                        setRunId(data.run_id)
                                        useFloorplanStore.getState().setRunId(data.run_id)

                                        // If Server says it's Offline Queue, switch modals
                                        if (data.status === 'QUEUED_OFFLINE') {
                                            useFloorplanStore.getState().setShowProcessingModal(false)
                                            useFloorplanStore.getState().setShowQueueModal(true)
                                            showToast("Job saved to Offline Queue (No Workers Online)", 'info')
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
                            ? 'Processing...'
                            : (uploadedImage ? 'Change Image' : 'Select Floorplan')}
                    </label>
                </div>
            </div>
            <DebugPanel />
        </div >
    )
}
