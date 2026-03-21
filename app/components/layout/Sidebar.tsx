'use client'

import {
    PenTool, Ruler, Send, Box,
    Edit3, Move, Maximize2, RotateCw, Trash2, Tag, ChevronDown,
    Sun, Moon, Lightbulb, Sunset, Camera, Download,
    Plus, Square, AppWindow, DoorOpen, Armchair,
    Upload, Sparkles, FolderOpen, ArrowLeftRight
} from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'
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
        activeTool, setActiveTool, deleteObject,
        rooms, updateRoom, selectObject,
        mode, lightingPreset, setLightingPreset, triggerRender, isRendering, currentRunId,
        addFurniture, tutorialStep, triggerDetectRooms,
        user, setUser, setToken, token,
        projectsModalOpen, setProjectsModalOpen, // Use global state
        runStatus,
        furniture,
        updateFurniture
    } = useFloorplanStore()

    const selectedFurn = useMemo(() => furniture.find(f => f.id === selectedId), [furniture, selectedId])

    const isGenerating = runStatus === 'processing'

    // Login Hook
    // Login Hook (Replaced with Component in render)
    // const login = useGoogleLogin(...)

    const logout = () => {
        setToken(null)
        setUser(null)
        if (onLogout) onLogout()
    }
    const [realLen, setRealLen] = useState('')
    const [editMenuOpen, setEditMenuOpen] = useState(false)
    const [addMenuOpen, setAddMenuOpen] = useState(false)
    const [furnMenuOpen, setFurnMenuOpen] = useState(false) // New State
    const [importModalOpen, setImportModalOpen] = useState(false)
    const [furnAIModalOpen, setFurnAIModalOpen] = useState(false)

    const downloadWithAuth = async (url: string, filename: string) => {
        if (!token) {
            alert('You are not signed in. Please sign in and try again.')
            return
        }
        const res = await fetch(url, {
            cache: 'no-store',
            headers: {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache',
            },
        })
        if (!res.ok) {
            const txt = await res.text().catch(() => '')
            console.error('[Download] failed', res.status, txt)
            try {
                const errParse = JSON.parse(txt)
                alert(`Download failed: ${errParse.detail || txt}`)
            } catch {
                alert(`Download failed: ${res.statusText}`)
            }
            return
        }
        const blob = await res.blob()
        const objectUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = objectUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(objectUrl)
    }
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

    const canFindRooms = tutorialStep === 'rooms' || tutorialStep === 'floor_review' || tutorialStep === 'none'
    const canUseFurniture = true // Always allow FurnAI

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

    const handleAddObject = (type: string) => {
        if (type === 'wall') {
            setActiveTool('wall')
        } else if (type === 'floor') {
            setActiveTool('floor')
        } else {
            addFurniture(type, { x: 0, y: 0 })
            setActiveTool('select') // Switch to select so they can move it
        }
    }

    return (
        <>
            <div className="w-64 border-r bg-card h-[calc(100vh-3.5rem)] flex flex-col select-none overflow-y-auto custom-scrollbar">
                <div className="p-4 border-b">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tools</h3>
                    <div className="flex flex-col gap-2">
                        {/* Add Element Button */}
                        <div className="relative">
                            <button
                                onClick={() => setAddMenuOpen(!addMenuOpen)}
                                disabled={tutorialStep === 'calibration'}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all group",
                                    addMenuOpen
                                        ? "bg-primary/20 border-primary text-primary shadow-inner"
                                        : "border-border bg-secondary/20 hover:bg-secondary/50 hover:border-primary/50 text-muted-foreground",
                                    tutorialStep === 'calibration' && "opacity-30 cursor-not-allowed"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Add Element</span>
                                </div>
                                <ChevronDown className={cn("w-4 h-4 transition-transform", addMenuOpen && "rotate-180")} />
                            </button>
                        </div>

                        {/* Add Elements Submenu */}
                        <div className={cn(
                            "grid grid-cols-2 gap-2 overflow-hidden transition-all duration-300",
                            addMenuOpen ? "max-h-[200px] mt-2 opacity-100" : "max-h-0 opacity-0"
                        )}>
                            <button onClick={() => handleAddObject('floor')} className="flex flex-col items-center p-2 rounded-lg border border-border hover:bg-secondary/50 transition-all text-muted-foreground hover:text-primary">
                                <Square className="w-4 h-4 mb-1" />
                                <span className="text-[9px]">Floor</span>
                            </button>
                            <button onClick={() => handleAddObject('wall')} className="flex flex-col items-center p-2 rounded-lg border border-border hover:bg-secondary/50 transition-all text-muted-foreground hover:text-primary">
                                <PenTool className="w-4 h-4 mb-1" />
                                <span className="text-[9px]">Wall</span>
                            </button>
                            <button onClick={() => handleAddObject('window')} className="flex flex-col items-center p-2 rounded-lg border border-border hover:bg-secondary/50 transition-all text-muted-foreground hover:text-primary">
                                <AppWindow className="w-4 h-4 mb-1" />
                                <span className="text-[9px]">Window</span>
                            </button>
                            <button onClick={() => handleAddObject('door')} className="flex flex-col items-center p-2 rounded-lg border border-border hover:bg-secondary/50 transition-all text-muted-foreground hover:text-primary">
                                <DoorOpen className="w-4 h-4 mb-1" />
                                <span className="text-[9px]">Door</span>
                            </button>
                        </div>

                        {/* Find Rooms */}
                        <div className="mt-2">
                            <button
                                disabled={!canFindRooms || !currentRunId}
                                onClick={() => triggerDetectRooms()}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                                    (!canFindRooms || !currentRunId)
                                        ? "border-border bg-secondary/10 text-muted-foreground opacity-50 cursor-not-allowed"
                                        : "border-border bg-secondary/20 hover:bg-secondary/50 hover:border-primary/50 text-muted-foreground"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Box className="w-5 h-5" />
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Find Rooms</span>
                                </div>
                                {!canFindRooms
                                    ? <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">Locked</span>
                                    : <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">Run</span>
                                }
                            </button>
                        </div>

                        {/* Furniture Dropdown */}
                        <div className="relative mt-2">
                            <button
                                onClick={() => setFurnMenuOpen(!furnMenuOpen)}
                                disabled={!canUseFurniture}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all group",
                                    furnMenuOpen
                                        ? "bg-primary/20 border-primary text-primary shadow-inner"
                                        : "border-border bg-secondary/20 hover:bg-secondary/50 hover:border-primary/50 text-muted-foreground",
                                    !canUseFurniture && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Armchair className="w-5 h-5" />
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Add Furniture</span>
                                </div>
                                <ChevronDown className={cn("w-4 h-4 transition-transform", furnMenuOpen && "rotate-180")} />
                            </button>
                        </div>

                        {/* Furniture Submenu */}
                        <div className={cn(
                            "flex flex-col gap-2 overflow-hidden transition-all duration-300",
                            furnMenuOpen ? "max-h-[200px] mt-2 opacity-100" : "max-h-0 opacity-0"
                        )}>
                            {/* Option 1: Import */}
                            <button
                                onClick={() => setImportModalOpen(true)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-all text-muted-foreground hover:text-white group text-left"
                            >
                                <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
                                    <Upload className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold block text-white/90">Import 3D Model</span>
                                    <span className="text-[9px] text-white/40 block">GLB / OBJ / FBX</span>
                                </div>
                            </button>

                            {/* Option 2: Furn AI (Pro) */}
                            <button
                                onClick={() => setFurnAIModalOpen(true)}
                                disabled={!canUseFurniture || !currentRunId}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg border border-border text-left relative overflow-hidden transition-all",
                                    (!canUseFurniture || !currentRunId)
                                        ? "bg-secondary/10 text-muted-foreground/60 opacity-50 cursor-not-allowed"
                                        : "bg-secondary/20 hover:bg-secondary/50 hover:border-purple-500/40 text-muted-foreground"
                                )}
                            >
                                <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/50 transition-colors">
                                    <Sparkles className="w-4 h-4 text-purple-300" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold block text-white/90">Furn AI</span>
                                        <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1 rounded border border-purple-500/20">PRO</span>
                                    </div>
                                    <span className="text-[9px] text-white/40 block">SAM 3D Segmentation</span>
                                </div>
                            </button>
                        </div>

                        {/* Edit Button with Dropdown (Keep existing) */}
                        <div className="relative mt-2">
                            <button
                                onClick={() => setEditMenuOpen(!editMenuOpen)}
                                disabled={tutorialStep === 'calibration'}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all group",
                                    ['select', 'move', 'resize', 'rotate', 'delete', 'label', 'wall'].includes(activeTool)
                                        ? "bg-primary/20 border-primary text-primary shadow-inner"
                                        : "border-border bg-secondary/20 hover:bg-secondary/50 hover:border-primary/50 text-muted-foreground",
                                    tutorialStep === 'calibration' && "opacity-30 cursor-not-allowed"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Edit3 className="w-5 h-5" />
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Edit</span>
                                </div>
                                <ChevronDown className={cn("w-4 h-4 transition-transform", editMenuOpen && "rotate-180")} />
                            </button>
                        </div>

                        {/* Ruler Button */}
                        <button
                            onClick={() => setActiveTool(activeTool === 'ruler' ? 'none' : 'ruler')}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border transition-all group",
                                activeTool === 'ruler'
                                    ? "bg-primary/20 border-primary text-primary shadow-inner"
                                    : "border-border bg-secondary/20 hover:bg-secondary/50 hover:border-primary/50 text-muted-foreground",
                                tutorialStep === 'calibration' && "ring-2 ring-primary ring-offset-2 ring-offset-[#111] animate-pulse"
                            )}
                        >
                            <Ruler className="w-5 h-5 group-hover:text-primary transition-colors" />
                            <span className="text-[11px] font-medium uppercase tracking-wider">Ruler Tool</span>
                        </button>


                    </div>
                </div>

                {/* Edit Tools Section - Expands when Edit button is clicked */}
                <div className={cn(
                    "p-4 border-b bg-primary/5 transition-all duration-300",
                    editMenuOpen ? "opacity-100 max-h-[400px]" : "opacity-0 max-h-0 py-0 overflow-hidden border-none"
                )}>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Edit Tools</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setActiveTool('move')}
                            className={cn("flex flex-col items-center p-2 rounded-lg border transition-all", activeTool === 'move' ? "bg-primary/20 border-primary text-primary" : "border-border hover:bg-secondary/50")}
                        >
                            <Move className="w-4 h-4 mb-1" />
                            <span className="text-[9px]">Move</span>
                        </button>
                        <button
                            onClick={() => setActiveTool('resize')}
                            className={cn("flex flex-col items-center p-2 rounded-lg border transition-all", activeTool === 'resize' ? "bg-primary/20 border-primary text-primary" : "border-border hover:bg-secondary/50")}
                        >
                            <Maximize2 className="w-4 h-4 mb-1" />
                            <span className="text-[9px]">Resize</span>
                        </button>
                        <button
                            onClick={() => setActiveTool('rotate')}
                            className={cn("flex flex-col items-center p-2 rounded-lg border transition-all", activeTool === 'rotate' ? "bg-primary/20 border-primary text-primary" : "border-border hover:bg-secondary/50")}
                        >
                            <RotateCw className="w-4 h-4 mb-1" />
                            <span className="text-[9px]">Rotate</span>
                        </button>
                        <button
                            onClick={() => { if (selectedId) deleteObject(selectedId) }}
                            className="flex flex-col items-center p-2 rounded-lg border border-border hover:bg-red-500/20 text-red-400 transition-all"
                        >
                            <Trash2 className="w-4 h-4 mb-1" />
                            <span className="text-[9px]">Delete</span>
                        </button>
                        <button
                            onClick={() => setActiveTool('label')}
                            className={cn("flex flex-col items-center p-2 rounded-lg border transition-all", activeTool === 'label' ? "bg-primary/20 border-primary text-primary" : "border-border hover:bg-secondary/50")}
                        >
                            <Tag className="w-4 h-4 mb-1" />
                            <span className="text-[9px]">Label</span>
                        </button>
                        <button
                            onClick={() => setActiveTool('wall')}
                            className={cn("flex flex-col items-center p-2 rounded-lg border transition-all", activeTool === 'wall' ? "bg-primary/20 border-primary text-primary" : "border-border hover:bg-secondary/50")}
                        >
                            <PenTool className="w-4 h-4 mb-1" />
                            <span className="text-[9px]">Wall</span>
                        </button>

                        <button
                            onClick={() => {
                                if (selectedFurn && (selectedFurn.type === 'door' || selectedFurn.type === 'window')) {
                                    updateFurniture(selectedId!, { type: selectedFurn.type === 'door' ? 'window' : 'door' });
                                }
                            }}
                            disabled={!(selectedFurn && (selectedFurn.type === 'door' || selectedFurn.type === 'window'))}
                            className={cn(
                                "flex flex-col items-center p-2 rounded-lg border transition-all",
                                (selectedFurn && (selectedFurn.type === 'door' || selectedFurn.type === 'window'))
                                    ? "border-border hover:bg-secondary/50 hover:text-primary cursor-pointer text-muted-foreground"
                                    : "border-border opacity-50 cursor-not-allowed text-muted-foreground/50"
                            )}
                        >
                            <ArrowLeftRight className="w-4 h-4 mb-1" />
                            <span className="text-[9px]">Swap</span>
                        </button>

                        <button
                            onClick={() => {
                                if (selectedWall) {
                                    useFloorplanStore.getState().setJoinMode(true)
                                }
                            }}
                            disabled={!selectedWall}
                            className={cn(
                                "flex flex-col items-center p-2 rounded-lg border transition-all",
                                selectedWall
                                    ? "border-border hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-400 cursor-pointer text-muted-foreground"
                                    : "border-border opacity-50 cursor-not-allowed text-muted-foreground/50"
                            )}
                        >
                            <Box className="w-4 h-4 mb-1" />
                            <span className="text-[9px]">Join Walls</span>
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

                {/* Export Assets - Visible whenever there is a run ID */}
                {currentRunId && (
                    <div className="p-4 border-b border-border/50 bg-secondary/5">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase mb-2 block">Project Assets</span>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => downloadWithAuth(`/api/runs/${currentRunId}/svg/raw?t=${Date.now()}`, `inference_raw_${currentRunId}.svg`)}
                                className="col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-secondary/50 border border-border hover:bg-blue-950/30 hover:border-blue-500/50 hover:text-blue-400 transition-all text-[10px]"
                            >
                                <Download className="w-3 h-3" />
                                Download Raw Inference SVG
                            </button>
                            <button
                                onClick={async () => {
                                    // 1. Trigger the heavy blender worker job
                                    await useFloorplanStore.getState().triggerBlenderGeneration()

                                    // 2. Poll the store's runStatus, waiting for 'completed'
                                    let attempts = 0;
                                    const maxAttempts = 120; // 60 seconds (at 500ms) or up to a few minutes

                                    const pollInterval = setInterval(async () => {
                                        attempts++;
                                        const status = useFloorplanStore.getState().runStatus;

                                        if (status === 'completed') {
                                            clearInterval(pollInterval);
                                            // The backend created the blend file, we can download it.
                                            await downloadWithAuth(`/api/runs/${currentRunId}/download/blend?t=${Date.now()}`, 'floorplan.blend');
                                        } else if (status === 'failed' || attempts > maxAttempts) {
                                            clearInterval(pollInterval);
                                            alert("3D Generation failed or timed out.");
                                        }
                                    }, 1500); // Check every 1.5 seconds
                                }}
                                disabled={isGenerating || useFloorplanStore.getState().isGenerating3D}
                                className={cn(
                                    "col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded-md border text-[10px] transition-all",
                                    (isGenerating || useFloorplanStore.getState().isGenerating3D)
                                        ? "bg-secondary/20 border-border/30 text-muted-foreground opacity-50 cursor-not-allowed"
                                        : "bg-secondary/50 border-border hover:bg-orange-950/30 hover:border-orange-500/50 hover:text-orange-400"
                                )}
                            >
                                <Download className="w-3 h-3" />
                                {(isGenerating || useFloorplanStore.getState().isGenerating3D) ? 'Generating...' : 'Generate & Download .blend'}
                            </button>
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
