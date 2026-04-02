'use client'

import { useEffect, useState } from 'react'
import { LayoutGrid, Box, Download, Play, Eye, EyeOff, Camera, ChevronDown, MonitorStop, Globe, Locate } from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'

export function Topbar() {
    const { mode, setMode, currentRunId, runStatus, setRunId, setRunStatus, uploadedImage, setUploadedImage, isCalibrated, isGenerating3D, syncSVGAndEnter3D, showBackground, toggleBackground, showToast, tutorialStep, setTutorialStep, lastQueuedTask, setLastQueuedTask, token, setRealisticRenderActive } = useFloorplanStore()
    const [fileToUpload, setFileToUpload] = useState<File | null>(null)
    const [workerCount, setWorkerCount] = useState(1) // Optimistic: Assume 1 worker online until proven otherwise
    const [isDragging, setIsDragging] = useState(false)
    const [cameraDropdownOpen, setCameraDropdownOpen] = useState(false)

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
                // Backend not running, set worker count to 0
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
                {/* clicking the logo returns to the templates homepage */}
                <a href="/" className="w-8 h-8 flex items-center justify-center">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </a>
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
                <div className="relative flex items-center gap-2">

                    {/* Camera Options Dropdown */}
                    <div 
                        className="relative"
                        onMouseEnter={() => setCameraDropdownOpen(true)}
                        onMouseLeave={() => setCameraDropdownOpen(false)}
                    >
                        <button className="p-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 text-zinc-400 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/5">
                            <Camera className="w-4 h-4" />
                            <ChevronDown className="w-3 h-3 opacity-70" />
                        </button>

                        {cameraDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-[#0c0d12]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex flex-col p-1.5 gap-0.5">
                                    <button 
                                        onClick={() => {
                                            setCameraDropdownOpen(false);
                                            setMode('3d');
                                            syncSVGAndEnter3D();
                                            setRealisticRenderActive(true);
                                        }}
                                        className="w-full text-left px-3 py-2.5 text-sm font-medium text-white bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg flex items-center gap-2.5 transition-all border border-blue-500/20"
                                    >
                                        <Camera className="w-4 h-4" />
                                        Realistic Render
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setCameraDropdownOpen(false);
                                            setMode('3d');
                                            
                                            useFloorplanStore.getState().showToast("Processing screenshot...", 'info')
                                            
                                            // Delay to ensure the 3D canvas has fully mounted and rendered
                                            setTimeout(() => {
                                                try {
                                                    // R3F puts the id on the wrapper div, so we find the canvas inside it
                                                    const canvas = document.querySelector('#three-canvas canvas') as HTMLCanvasElement || document.querySelector('canvas');
                                                    
                                                    if (!canvas) {
                                                        console.error("Canvas element not found");
                                                        useFloorplanStore.getState().showToast("Could not find 3D view to capture.", 'error');
                                                        return;
                                                    }

                                                    const dataUrl = canvas.toDataURL('image/png');
                                                    useFloorplanStore.getState().addRender(dataUrl);
                                                    
                                                    // Solid dark stylish popup
                                                    const toastDiv = document.createElement('div');
                                                    toastDiv.className = 'fixed top-16 right-4 z-[9999] bg-[#1a1b26] border border-gray-700/50 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-4 flex items-center justify-between gap-6 animate-in slide-in-from-top-4 fade-in duration-300';
                                                    toastDiv.innerHTML = `
                                                        <div class="flex flex-col">
                                                            <h4 class="text-sm font-semibold text-white">Screenshot saved</h4>
                                                            <p class="text-[11px] text-gray-400 mt-1">Saved to your screenshots library</p>
                                                        </div>
                                                        <button id="open-renders-btn" class="px-4 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-500 transition-colors shadow-sm">
                                                            View Screenshots
                                                        </button>
                                                    `;
                                                    document.body.appendChild(toastDiv);
                                                    
                                                    // Attach event to open Renders Modal
                                                    document.getElementById('open-renders-btn')?.addEventListener('click', () => {
                                                        useFloorplanStore.getState().setRendersModalOpen(true);
                                                        document.body.removeChild(toastDiv);
                                                    });
                                                    
                                                    // Auto remove after 5 seconds
                                                    setTimeout(() => {
                                                        if (document.body.contains(toastDiv)) {
                                                            document.body.removeChild(toastDiv);
                                                        }
                                                    }, 5000);
                                                } catch (e) {
                                                    console.error("Screenshot error:", e);
                                                    useFloorplanStore.getState().showToast("Failed to capture screenshot. Need WebGL context to be ready.", 'error');
                                                }
                                            }, 800) // Slightly longer to guarantee Mount + Paint
                                        }}
                                        className="w-full text-left px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-white/5 hover:text-zinc-300 rounded-lg flex items-center gap-2.5 transition-all"
                                    >
                                        <MonitorStop className="w-4 h-4" />
                                        Make Screenshot
                                    </button>
                                    <button 
                                        disabled
                                        className="w-full text-left px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-white/5 hover:text-zinc-300 rounded-lg flex items-center justify-between cursor-not-allowed group transition-all"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Globe className="w-4 h-4" />
                                            360° Panorama
                                        </div>
                                        <span className="text-[9px] uppercase tracking-wider font-bold bg-[#577eff]/10 text-[#577eff]/60 px-1.5 py-0.5 rounded shadow-sm">Pro</span>
                                    </button>
                                    <button 
                                        disabled
                                        className="w-full text-left px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-white/5 hover:text-zinc-300 rounded-lg flex items-center justify-between cursor-not-allowed group transition-all"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Locate className="w-4 h-4" />
                                            360° Walkthrough
                                        </div>
                                        <span className="text-[9px] uppercase tracking-wider font-bold bg-[#577eff]/10 text-[#577eff]/60 px-1.5 py-0.5 rounded shadow-sm">Pro</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

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
        </div >
    )
}
