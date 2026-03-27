'use client'

import {
    Send, Box,
    Sun, Moon, Lightbulb, Sunset, Camera,
    Upload, Sparkles, FolderOpen, Tag, Trash2
} from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ImportModelModal } from './ImportModelModal' // Import Modal
import { FurnAIModal } from './FurnAIModal' // Import Furn AI Modal
// ProjectsModal import already added in previous step or handled by TS if file exists
import { ProjectsModal } from './ProjectsModal' // Ensuring import exists
import { TexturizeModal } from './TexturizeModal'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { LogOut } from 'lucide-react'

export function Sidebar({ onLogout }: { onLogout?: () => void }) {
    const {
        selectedId, walls, calibrate,
        activeTool, setActiveTool,
        rooms, updateRoom, selectObject,
        mode, lightingPreset, setLightingPreset, triggerRender, isRendering, currentRunId,
        user, setUser, setToken, token,
        projectsModalOpen, setProjectsModalOpen,
        triggerDetectRooms, tutorialStep,
        mobileSidebarOpen, setMobileSidebarOpen
    } = useFloorplanStore()


    // Login Hook
    // Login Hook (Replaced with Component in render)
    // const login = useGoogleLogin(...)

    const logout = () => {
        setToken(null)
        setUser(null)
        if (onLogout) onLogout()
    }
    const [realLen, setRealLen] = useState('')
    const [importModalOpen, setImportModalOpen] = useState(false)
    const [furnAIModalOpen, setFurnAIModalOpen] = useState(false)

    // New State
    const [texturizeOpen, setTexturizeOpen] = useState(false)
    // projectsModalOpen is now global

    // Restore User from Token on Mount
    useState(() => {
        if (token && !user) {
            try {
                const decoded: any = jwtDecode(token)
                const currentTime = Date.now() / 1000

                if (decoded.exp && decoded.exp < currentTime) {
                    console.log("Token expired, clearing session")
                    setToken(null)
                    setUser(null)
                } else {
                    setUser({
                        email: decoded.email,
                        name: decoded.name,
                        picture: decoded.picture
                    })
                }
            } catch (e) {
                console.error("Failed to restore session", e)
                setToken(null)
            }
        }
    })

    const selectedWall = walls.find(w => w.id === selectedId)
    const selectedRoom = rooms.find(r => r.id === selectedId)

    const onImportModels = async (files: File[]) => {
        if (!currentRunId || !token) return

        for (const f of files) {
            try {
                const form = new FormData()
                form.append('file', f)

                const res = await fetch(`/api/runs/${currentRunId}/imported/upload`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: form,
                })
                if (!res.ok) {
                    console.error('[ImportModelModal] upload failed', res.status, await res.text())
                    continue
                }
                const data = await res.json().catch(() => ({} as any))
                const itemId = String(data?.item_id || '')
                const rel = String(data?.rel_path || '')
                if (!itemId || !rel) continue

                useFloorplanStore.getState().addImportedFurniture({
                    id: itemId,
                    label: f.name,
                    relPath: rel,
                })
            } catch (e) {
                console.error('[ImportModelModal] upload crashed', e)
            }
        }
    }

    const canUseFurniture = true

    const onCalibrate = async () => {
        if (!selectedWall || !realLen) return
        const val = parseFloat(realLen)
        if (isNaN(val) || val <= 0) {
            alert("Please enter a valid length in millimeters")
            return
        }
        // Convert mm to meters for internal use
        calibrate(selectedWall.id, val / 1000)

        // Persist calibration/scale to backend for later Blender/3D pipeline use
        try {
            if (currentRunId) {
                const store = useFloorplanStore.getState()
                const scale = store.exportScale || store.calibrationFactor
                await fetch(`/api/runs/${currentRunId}/meta`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        scale,
                        calibration_mm: val,
                        calibration_wall_id: selectedWall.id
                    })
                })
            }
        } catch (e) {
            console.error('Failed to persist calibration meta', e)
        }

        setRealLen('')
        setActiveTool('none') // Exit tool mode after calibration
        // User requested no alert
    }


    return (
        <>
            {/* Mobile Overlay */}
            {mobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden top-14" 
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}
            
            <div className={cn(
                "w-56 border-r bg-card flex flex-col select-none overflow-y-auto custom-scrollbar z-40 transition-transform duration-300",
                "fixed top-14 bottom-0 left-0",
                mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
                "md:relative md:translate-x-0 md:top-0 md:h-[calc(100vh-3.5rem)]"
            )}>
                {/* Close Button for Mobile */}
                <div className="md:hidden flex justify-end p-2 border-b">
                    <button 
                        onClick={() => setMobileSidebarOpen(false)}
                        className="text-muted-foreground hover:text-white p-1 rounded-md hover:bg-secondary"
                    >
                        <LogOut className="w-4 h-4" /> {/* Using LogOut since X is not imported, or another icon */}
                    </button>
                </div>

                {/* AI & Furniture Section */}
                <div className="p-3 border-b">
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Furniture & AI</h3>
                    <div className="flex flex-col gap-1.5">
                        {/* Import 3D */}
                        <button
                            onClick={() => setImportModalOpen(true)}
                            className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:bg-secondary/50 transition-all text-muted-foreground hover:text-white group text-left"
                        >
                            <div className="w-7 h-7 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/50 transition-colors shrink-0">
                                <Upload className="w-3.5 h-3.5 text-blue-400" />
                            </div>
                            <div>
                                <span className="text-[10px] font-semibold block text-white/90">Import Model</span>
                                <span className="text-[8px] text-white/40 block">GLB / OBJ / FBX</span>
                            </div>
                        </button>

                        {/* Furn AI */}
                        <button
                            onClick={() => setFurnAIModalOpen(true)}
                            disabled={!canUseFurniture || !currentRunId}
                            className={cn(
                                "w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-border text-left relative overflow-hidden transition-all",
                                (!canUseFurniture || !currentRunId)
                                    ? "bg-secondary/10 text-muted-foreground/60 opacity-50 cursor-not-allowed"
                                    : "bg-secondary/20 hover:bg-secondary/50 hover:border-purple-500/40 text-muted-foreground"
                            )}
                        >
                            <div className="w-7 h-7 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20 shrink-0">
                                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-semibold text-white/90">Furn AI</span>
                                    <span className="text-[7px] bg-purple-500/20 text-purple-300 px-1 rounded border border-purple-500/20">PRO</span>
                                </div>
                                <span className="text-[8px] text-white/40 block">SAM 3D Segmentation</span>
                            </div>
                        </button>

                        {/* Find Rooms */}
                        <button
                            disabled={!currentRunId || tutorialStep === 'calibration'}
                            onClick={() => triggerDetectRooms()}
                            className={cn(
                                "w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-border text-left transition-all",
                                (!currentRunId || tutorialStep === 'calibration')
                                    ? "bg-secondary/10 text-muted-foreground/60 opacity-50 cursor-not-allowed"
                                    : "bg-secondary/20 hover:bg-secondary/50 hover:border-green-500/40 text-muted-foreground"
                            )}
                        >
                            <div className="w-7 h-7 rounded bg-green-500/10 flex items-center justify-center border border-green-500/20 shrink-0">
                                <Box className="w-3.5 h-3.5 text-green-400" />
                            </div>
                            <div>
                                <span className="text-[10px] font-semibold text-white/90">Find Rooms</span>
                                <span className="text-[8px] text-white/40 block">Auto-detect room boundaries</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Calibration Section - Only visible if Ruler Mode is Active */}
                <div className={cn(
                    "p-4 border-b bg-primary/5 transition-all duration-300",
                    activeTool === 'ruler' ? "opacity-100 max-h-[300px]" : "opacity-0 max-h-0 py-0 overflow-hidden border-none"
                )}>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Calibration Mode</h3>
                    {selectedWall ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="flex items-center gap-2 text-primary text-[11px] font-semibold">
                                <Box className="w-3 h-3" />
                                Targeting: {selectedWall.label || "Wall"}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Enter real length (mm)"
                                    value={realLen}
                                    onChange={(e) => setRealLen(e.target.value)}
                                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    autoFocus
                                />
                                <button
                                    onClick={onCalibrate}
                                    className="bg-primary text-white p-2 rounded hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">Update the real-world scale of your plan.</p>
                        </div>
                    ) : (
                        <div className="text-[11px] text-muted-foreground bg-secondary/20 p-3 rounded border border-dashed border-border text-center">
                            Select a wall on the canvas to measure it.
                        </div>
                    )}
                </div>

                {/* Room Properties - Visible when a room is selected */}
                {selectedRoom && (
                    <div className="p-4 border-b bg-yellow-500/5 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room Properties</h3>
                            <button onClick={() => selectObject(null)} className="text-muted-foreground hover:text-white">
                                <span className="sr-only">Close</span>
                                <Trash2 className="w-3 h-3 rotate-45" /> {/* Using Trash as X for now or just X icon if available */}
                            </button>
                        </div>
                        <div className="space-y-4">
                            {/* Name Input */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground uppercase font-bold">Room Name</label>
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-muted-foreground/70" />
                                    <input
                                        type="text"
                                        value={selectedRoom.name}
                                        onChange={(e) => updateRoom(selectedRoom.id, { name: e.target.value })}
                                        className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                                        placeholder="Living Room..."
                                    />
                                </div>
                            </div>
                            {/* Color Picker */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground uppercase font-bold">Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#94a3b8'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => updateRoom(selectedRoom.id, { color })}
                                            className={cn(
                                                "w-6 h-6 rounded-full border transition-all hover:scale-110",
                                                selectedRoom.color === color ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border/50"
                                            )}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3D Options Section - Only visible in 3D mode */}
                {mode === '3d' && (
                    <div className="p-4 border-b bg-blue-500/5 animate-in fade-in duration-300">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">3D View Options</h3>

                        {/* Lighting Presets */}
                        <div className="mb-3">
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase mb-2 block">Lighting Environment</span>
                            <div className="grid grid-cols-4 gap-1">
                                <button
                                    onClick={() => setLightingPreset('day')}
                                    className={cn("flex flex-col items-center p-2 rounded border transition-all", lightingPreset === 'day' ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" : "border-border hover:bg-secondary/50")}
                                >
                                    <Sun className="w-4 h-4" />
                                    <span className="text-[8px] mt-1">Day</span>
                                </button>
                                <button
                                    onClick={() => setLightingPreset('night')}
                                    className={cn("flex flex-col items-center p-2 rounded border transition-all", lightingPreset === 'night' ? "bg-blue-500/20 border-blue-500 text-blue-400" : "border-border hover:bg-secondary/50")}
                                >
                                    <Moon className="w-4 h-4" />
                                    <span className="text-[8px] mt-1">Night</span>
                                </button>
                                <button
                                    onClick={() => setLightingPreset('studio')}
                                    className={cn("flex flex-col items-center p-2 rounded border transition-all", lightingPreset === 'studio' ? "bg-white/20 border-white text-white" : "border-border hover:bg-secondary/50")}
                                >
                                    <Lightbulb className="w-4 h-4" />
                                    <span className="text-[8px] mt-1">Studio</span>
                                </button>
                                <button
                                    onClick={() => setLightingPreset('sunset')}
                                    className={cn("flex flex-col items-center p-2 rounded border transition-all", lightingPreset === 'sunset' ? "bg-orange-500/20 border-orange-500 text-orange-400" : "border-border hover:bg-secondary/50")}
                                >
                                    <Sunset className="w-4 h-4" />
                                    <span className="text-[8px] mt-1">Sunset</span>
                                </button>
                            </div>
                        </div>

                        {/* Texturize AI (New) */}
                        <div className="mb-3">
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase mb-2 block">AI Materials</span>
                            <button
                                onClick={() => {
                                    if (!selectedId || (!selectedWall && !selectedRoom)) {
                                        alert("Please select a Wall or a Floor first!")
                                        return
                                    }
                                    setTexturizeOpen(true)
                                }}
                                className="w-full flex items-center justify-between p-3 rounded-lg border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 transition-all group"
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-pink-400" />
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Texturize AI</span>
                                </div>
                                <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded border border-pink-500/30">NEW</span>
                            </button>
                        </div>

                        {/* Render Button */}
                        <div className="space-y-2 mb-3">
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase">High Quality Render</span>
                            <button
                                onClick={() => triggerRender()}
                                disabled={isRendering}
                                className={cn(
                                    "w-full py-2 px-3 rounded-md text-white text-[11px] font-semibold flex items-center justify-center gap-2 transition-all shadow-lg",
                                    isRendering
                                        ? "bg-purple-500 animate-pulse cursor-wait shadow-purple-500/40"
                                        : "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"
                                )}
                            >
                                {isRendering ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Rendering...
                                    </>
                                ) : (
                                    <>
                                        <Camera className="w-4 h-4" />
                                        Capture View
                                    </>
                                )}
                            </button>
                            <p className="text-[9px] text-muted-foreground italic text-center">
                                Takes a snapshot of the current view.
                            </p>
                        </div>

                    </div>
                )}



                <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
                    <div className="p-4 flex-1 flex flex-col justify-end">
                        {/* Projects Button (Visible when logged in) */}
                        {user && (
                            <button
                                onClick={() => setProjectsModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 p-3 mb-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all group"
                            >
                                <FolderOpen className="w-4 h-4" />
                                <span className="text-[11px] font-medium uppercase tracking-wider">My Projects</span>
                            </button>
                        )}

                        {/* User Profile / Login Section */}
                        <div className="border-t border-border pt-4 mt-2">
                            {user ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        {user.picture ? (
                                            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-border" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {user.name?.[0] || "U"}
                                            </div>
                                        )}
                                        <div className="overflow-hidden">
                                            <p className="text-[11px] font-semibold truncate text-foreground">{user.name}</p>
                                            <p className="text-[9px] text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-[10px]"
                                    >
                                        <LogOut className="w-3 h-3" />
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full flex justify-center">
                                    <GoogleLogin
                                        onSuccess={(credentialResponse) => {
                                            const token = credentialResponse.credential;
                                            if (token) {
                                                setToken(token)
                                                try {
                                                    const decoded: any = jwtDecode(token)
                                                    setUser({
                                                        email: decoded.email,
                                                        name: decoded.name,
                                                        picture: decoded.picture
                                                    })
                                                } catch (e) {
                                                    console.error("Token decode failed", e)
                                                }
                                            }
                                        }}
                                        onError={() => {
                                            console.log('Login Failed');
                                        }}
                                        useOneTap
                                        theme="outline"
                                        shape="circle"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            <ImportModelModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onImport={onImportModels}
            />
            <FurnAIModal
                isOpen={furnAIModalOpen}
                onClose={() => setFurnAIModalOpen(false)}
            />
            <ProjectsModal
                isOpen={projectsModalOpen}
                onClose={() => setProjectsModalOpen(false)}
            />

            <TexturizeModal
                isOpen={texturizeOpen}
                onClose={() => setTexturizeOpen(false)}
                targetName={selectedId || 'Selection'}
                onApply={async (file, tileWidthFt, tileHeightFt) => {
                    try {
                        if (!currentRunId) {
                            console.error('[TexturizeAI] missing currentRunId')
                            alert('No active run. Please open a project first.')
                            return
                        }
                        if (!token) {
                            console.error('[TexturizeAI] missing auth token')
                            alert('You are not signed in. Please sign in and try again.')
                            return
                        }
                        if (!selectedId) {
                            console.error('[TexturizeAI] missing selectedId')
                            alert('Select a wall or floor first, then click Texturize AI.')
                            return
                        }
                        if (!selectedWall && !selectedRoom) {
                            console.error('[TexturizeAI] selection is not a wall/room', { selectedId })
                            alert('Texturize works only on walls or floors. Please select a wall or floor outline.')
                            return
                        }

                        const targetId = selectedId
                        const tileWidthM = tileWidthFt * 0.3048
                        const tileHeightM = tileHeightFt * 0.3048

                        const textureDataUrl = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader()
                            reader.onload = () => resolve(String(reader.result || ''))
                            reader.onerror = () => reject(new Error('Failed to read texture file'))
                            reader.readAsDataURL(file)
                        })

                        // Ensure backend has the latest SVG with matching ids (walls/rooms) before applying texture.
                        try {
                            const svgBody = useFloorplanStore.getState().exportToSVG()
                            await fetch(`/api/runs/${currentRunId}/svg`, {
                                method: 'PUT',
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'image/svg+xml',
                                },
                                body: svgBody,
                            })
                        } catch (e) {
                            console.error('[TexturizeAI] failed to sync svg before apply', e)
                        }

                        const form = new FormData()
                        form.append('file', file)
                        form.append('target_id', selectedId)
                        form.append('tile_width_ft', String(tileWidthFt))
                        form.append('tile_height_ft', String(tileHeightFt))

                        console.log('[TexturizeAI] POST /texturize/apply', { runId: currentRunId, targetId: selectedId, tileWidthFt, tileHeightFt })
                        const res = await fetch(`/api/runs/${currentRunId}/texturize/apply`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${token}` },
                            body: form,
                        })
                        if (!res.ok) {
                            console.error('[TexturizeAI] apply failed', res.status, await res.text())
                            alert('Failed to apply texture')
                            return
                        }

                        // Refresh SVG into editor state
                        const svgRes = await fetch(`/api/runs/${currentRunId}/svg?t=${Date.now()}`, {
                            cache: 'no-store',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Cache-Control': 'no-cache',
                            },
                        })
                        if (svgRes.ok) {
                            const svgText = await svgRes.text()
                            useFloorplanStore.getState().importFromSVG(svgText)
                        }

                        // Apply texture to 3D preview state (importFromSVG recreates walls/rooms and will drop custom fields).
                        if (useFloorplanStore.getState().walls.some(w => w.id === targetId)) {
                            useFloorplanStore.getState().updateWall(targetId, {
                                textureDataUrl,
                                textureTileWidthM: tileWidthM,
                                textureTileHeightM: tileHeightM,
                            })
                        }
                        if (useFloorplanStore.getState().rooms.some(r => r.id === targetId)) {
                            useFloorplanStore.getState().updateRoom(targetId, {
                                textureDataUrl,
                                textureTileWidthM: tileWidthM,
                                textureTileHeightM: tileHeightM,
                            })
                        }
                    } catch (e) {
                        console.error('[TexturizeAI] crashed', e)
                        alert('Failed to apply texture')
                    }
                }}
                onApplyPbr={async (pbrFile, tileWidthFt, tileHeightFt) => {
                    try {
                        if (!currentRunId || !token || !selectedId || (!selectedWall && !selectedRoom)) {
                            alert('Select a wall or floor and sign in first.')
                            return
                        }

                        // Sync SVG first
                        try {
                            const svgBody = useFloorplanStore.getState().exportToSVG()
                            await fetch(`/api/runs/${currentRunId}/svg`, {
                                method: 'PUT',
                                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/svg+xml' },
                                body: svgBody,
                            })
                        } catch (e) {
                            console.error('[PBR] svg sync failed', e)
                        }

                        const form = new FormData()
                        form.append('target_id', selectedId)
                        form.append('surface_type', selectedWall ? 'wall' : 'floor')
                        form.append('tile_width_ft', String(tileWidthFt))
                        form.append('tile_height_ft', String(tileHeightFt))
                        form.append('albedo', pbrFile)

                        console.log('[PBR] POST /texturize/pbr', { runId: currentRunId, targetId: selectedId, surfaceType: selectedWall ? 'wall' : 'floor' })
                        const res = await fetch(`/api/runs/${currentRunId}/texturize/pbr`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${token}` },
                            body: form,
                        })
                        if (!res.ok) {
                            console.error('[PBR] upload failed', res.status, await res.text())
                            alert('Failed to upload PBR texture')
                            return
                        }

                        const result = await res.json()
                        console.log('[PBR] backend response:', result)

                        // Use backend-extracted PBR map data URLs (no client-side ZIP needed)
                        const urls = result.mapDataUrls || {}
                        // Backwards compat: old backend returns albedoDataUrl instead of mapDataUrls
                        if (!urls.basecolor && result.albedoDataUrl) {
                            urls.basecolor = result.albedoDataUrl
                        }
                        if (!urls.basecolor) {
                            console.error('[PBR] No basecolor in response:', result)
                            alert(`PBR upload failed — no albedo map returned.\n\nBackend response keys: ${Object.keys(result).join(', ')}\nMaps: ${JSON.stringify(result.maps || {})}\n\nMake sure:\n1. FILES backend is redeployed with latest code\n2. ZIP contains PNG/JPG files with "Color" in the filename`)
                            return
                        }

                        const tileWidthM = tileWidthFt * 0.3048
                        const tileHeightM = tileHeightFt * 0.3048
                        const pbrUpdate = {
                            textureDataUrl: urls.basecolor,
                            textureTileWidthM: tileWidthM,
                            textureTileHeightM: tileHeightM,
                            pbrNormalUrl: urls.normal || undefined,
                            pbrRoughnessUrl: urls.roughness || undefined,
                            pbrAoUrl: urls.ao || undefined,
                            pbrMetalnessUrl: urls.metallic || undefined,
                        }
                        if (useFloorplanStore.getState().walls.some(w => w.id === selectedId)) {
                            useFloorplanStore.getState().updateWall(selectedId, pbrUpdate)
                        }
                        if (useFloorplanStore.getState().rooms.some(r => r.id === selectedId)) {
                            useFloorplanStore.getState().updateRoom(selectedId, pbrUpdate)
                        }

                        const mapCount = Object.keys(urls).length
                        alert(`PBR applied! ${mapCount} map(s): ${Object.keys(urls).join(', ')}`)
                    } catch (e) {
                        console.error('[PBR] crashed', e)
                        alert('Failed to upload PBR texture')
                    }
                }}
            />
        </>
    )
}
