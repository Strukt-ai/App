'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'

// --- Types ---

export interface Vector2 {
    x: number
    y: number
}

export type Wall = {
    id: string
    start: Vector2
    end: Vector2
    thickness: number
    height: number
    label?: string
    color?: string // Added
    textureDataUrl?: string
    textureTileWidthM?: number
    textureTileHeightM?: number
    // PBR map data URLs (extracted from ZIP for browser 3D preview)
    pbrNormalUrl?: string
    pbrRoughnessUrl?: string
    pbrAoUrl?: string
    pbrMetalnessUrl?: string
}

export type FurnItem = {
    id: string
    type: string
    position: { x: number; y: number; z: number }
    rotation: { x: number; y: number; z: number }
    dimensions: { width: number; height: number; depth: number }
    modelUrl?: string
    furnAiId?: string // Link strictly to manifest AI items
    label?: string
    color?: string // Added
}

export type Room = {
    id: string
    name: string
    points: Vector2[] // Polygon vertices
    color: string
    center: Vector2 // For label positioning
    textureDataUrl?: string
    textureTileWidthM?: number
    textureTileHeightM?: number
    // PBR map data URLs (extracted from ZIP for browser 3D preview)
    pbrNormalUrl?: string
    pbrRoughnessUrl?: string
    pbrAoUrl?: string
    pbrMetalnessUrl?: string
}

export type TextLabel = {
    id: string
    text: string
    position: Vector2
}

export interface FloorplanState {
    mode: '2d' | '3d'
    activeTool: 'select' | 'move' | 'resize' | 'rotate' | 'delete' | 'label' | 'wall' | 'ruler' | 'furniture' | 'floor' | 'none'
    lightingPreset: 'day' | 'night' | 'studio' | 'sunset'
    drawing: boolean
    activeWallId: string | null
    walls: Wall[]
    furniture: FurnItem[]
    rooms: Room[]
    labels: TextLabel[]
    pendingDrop: { type: string; x: number; y: number } | null // x,y are NDC [-1, 1]

    currentRunId: string | null
    runStatus: 'idle' | 'processing' | 'completed' | 'failed'
    selectedId: string | null

    // Calibration & 3D Workflow
    uploadedImage: string | null
    imageDimensions: { width: number; height: number } | null
    imageWorldWidth?: number
    imageWorldHeight?: number
    calibrationFactor: number // Meters per Pixel
    isCalibrated: boolean
    isGenerating3D: boolean
    isRendering: boolean
    showBackground: boolean // New state for background visibility
    showProcessingModal: boolean // New state for popup
    showQueueModal: boolean
    projectsModalOpen: boolean // Global state for Projects Modal
    mobileSidebarOpen: boolean
    mobileRightSidebarOpen: boolean
    tutorialStep: 'none' | 'calibration' | 'correction' | 'rooms' | 'floor_review'
    lastQueuedTask: 'none' | 'detect_rooms' | 'gen_3d'
    renders: string[]
    fitViewTrigger: number
    exportScale: number // Ratio to send to backend for 3D generation
    pendingFile: File | null
    setPendingFile: (file: File | null) => void

    interaction: {
        type: 'none' | 'drawing' | 'dragging' | 'resizing' | 'pending_draw' | 'drawing_floor'
        targetId: string | null
        subType?: 'start' | 'end' | 'thickness' | 'resize-width' | 'resize-depth' | 'resize-uniform'
        lastPoint: Vector2 | null
    }

    // UI Feedback
    toast: { message: string; type: 'error' | 'info' | 'success' } | null

    // Auth
    token: string | null
    user: { email: string; name: string; picture: string } | null
    setToken: (token: string | null) => void
    setUser: (user: any) => void

    // Actions
    setMode: (mode: '2d' | '3d') => void
    setActiveTool: (tool: FloorplanState['activeTool']) => void
    setLightingPreset: (preset: FloorplanState['lightingPreset']) => void
    setUploadedImage: (url: string | null, width?: number, height?: number) => void
    setCalibrationFactor: (factor: number) => void
    setRunId: (runId: string | null) => void
    setRunStatus: (status: 'idle' | 'processing' | 'completed' | 'failed') => void
    setShowProcessingModal: (show: boolean) => void
    setShowQueueModal: (show: boolean) => void
    setProjectsModalOpen: (show: boolean) => void
    setMobileSidebarOpen: (show: boolean) => void
    setMobileRightSidebarOpen: (show: boolean) => void
    setTutorialStep: (step: 'none' | 'calibration' | 'correction' | 'rooms' | 'floor_review') => void
    completeTutorial: () => void
    setLastQueuedTask: (task: 'none' | 'detect_rooms' | 'gen_3d') => void
    triggerDetectRooms: () => Promise<void>
    generateFloors: () => Promise<void>
    selectObject: (id: string | null) => void
    deleteObject: (id: string) => void

    // Unified Interaction Actions
    startInteraction: (type: 'drawing' | 'dragging' | 'resizing' | 'drawing_floor', targetId: string | null, point: Vector2, subType?: 'start' | 'end' | 'thickness' | 'resize-width' | 'resize-depth' | 'resize-uniform') => void
    updateInteraction: (point: Vector2, options?: { shiftKey: boolean }) => void
    endInteraction: () => void

    calibrate: (wallId: string, realLength: number) => void
    syncSVGAndEnter3D: () => Promise<void>
    triggerBlenderGeneration: (formats?: string[]) => Promise<void>
    triggerRender: () => Promise<void>
    toggleBackground: () => void

    updateFurniture: (id: string, updates: Partial<FurnItem>) => void
    updateLabel: (id: string, label: string) => void
    updateWall: (id: string, updates: Partial<Wall>) => void
    updateRoom: (id: string, updates: Partial<Room>) => void

    addFurniture: (type: string, position: Vector2) => void
    addImportedFurniture: (payload: { id: string; label?: string; relPath: string }) => void
    importFurnAiModel: (payload: { id: string, type: string, position: Vector2, modelUrl: string, furnAiId: string, label: string }) => void
    updateFurniturePosition: (id: string, position: { x?: number; y?: number; z?: number }) => void
    resetFloorplan: () => void
    importFromSVG: (svgText: string) => void
    exportToSVG: () => string
    handleDrop: (type: string, x: number, y: number) => void
    // Undo/Redo/Clipboard
    undo: () => void
    redo: () => void
    copyObject: () => void
    pasteObject: () => void
    saveHistory: () => void
    consumeDrop: () => void
    addRender: (url: string) => void
    showToast: (message: string, type?: 'error' | 'info' | 'success') => void
    cornerSnapMode: boolean
    setCornerSnapMode: (active: boolean) => void
    snapCorners: { wallId: string; type: 'start' | 'end' }[]
    addSnapCorner: (corner: { wallId: string; type: 'start' | 'end' }) => void

    // Join Mode Interactions
    joinMode: boolean
    joinSourceId: string | null
    joinTargetId: string | null
    joinPreviewWalls: Wall[] | null

    setJoinMode: (active: boolean) => void
    setJoinTargetId: (id: string | null, point?: { x: number, y: number }) => void
    applyJoin: () => void
}

// --- Store ---

export const useFloorplanStore = create<FloorplanState>()(
    immer((set): FloorplanState => ({
        mode: '2d', // Start in 2D to allow immediate editing
        activeTool: 'wall', // Default to drawing walls
        lightingPreset: 'day', // Default lighting
        drawing: false,
        activeWallId: null as string | null,
        walls: [] as Wall[],
        furniture: [] as FurnItem[],
        rooms: [] as Room[],
        labels: [] as TextLabel[],
        pendingDrop: null as FloorplanState['pendingDrop'],
        currentRunId: null as string | null,
        runStatus: 'idle',
        selectedId: null as string | null,
        uploadedImage: null,
        imageDimensions: null,
        calibrationFactor: 0.01, // Default 1px = 1cm
        isCalibrated: false,
        isGenerating3D: false,
        isRendering: false,
        showBackground: true, // Default visible
        showProcessingModal: false, // Default
        showQueueModal: false, // Default
        projectsModalOpen: false, // Global state for Projects Modal
        mobileSidebarOpen: false,
        mobileRightSidebarOpen: false,
        renders: [],
        interaction: {
            type: 'none',
            targetId: null,
            lastPoint: null
        },
        fitViewTrigger: 0,
        exportScale: 1,
        pendingFile: null,
        setPendingFile: (file) => set({ pendingFile: file } as any),
        toast: null,
        cornerSnapMode: false,
        snapCorners: [],

        joinMode: false,
        joinSourceId: null,
        joinTargetId: null,
        joinPreviewWalls: null,

        token: (typeof window !== 'undefined' ? localStorage.getItem('google_token') : null) || null,
        user: null,

        setToken: (token) => set((state) => {
            state.token = token
            if (typeof window !== 'undefined') {
                if (token) localStorage.setItem('google_token', token)
                else localStorage.removeItem('google_token')
            }
        }),
        setUser: (user) => set((state) => { state.user = user }),

        setMode: (mode) => set((state) => { state.mode = mode }),
        setActiveTool: (tool) => set((state) => { state.activeTool = tool }),
        setLightingPreset: (preset) => set((state) => { state.lightingPreset = preset }),
        setUploadedImage: (url, width, height) => set((state) => {
            state.uploadedImage = url
            if (width && height) state.imageDimensions = { width, height }
        }),
        setCalibrationFactor: (factor) => set((state) => {
            state.calibrationFactor = factor
            state.isCalibrated = true
        }),
        setRunId: (runId) => set((state) => { state.currentRunId = runId }),
        setRunStatus: (status) => set((state) => { state.runStatus = status }),
        setShowProcessingModal: (show) => set((state) => { state.showProcessingModal = show }),
        setShowQueueModal: (show) => set((state) => { state.showQueueModal = show }),
        setProjectsModalOpen: (show) => set((state) => { state.projectsModalOpen = show }),
        setMobileSidebarOpen: (show) => set((state) => { state.mobileSidebarOpen = show }),
        setMobileRightSidebarOpen: (show) => set((state) => { state.mobileRightSidebarOpen = show }),

        // Tutorial State
        tutorialStep: 'none',
        lastQueuedTask: 'none',
        setTutorialStep: (step) => set((state) => { state.tutorialStep = step }),
        completeTutorial: () => set((state) => { state.tutorialStep = 'none' }),
        setLastQueuedTask: (task) => set((state) => { state.lastQueuedTask = task }),

        triggerDetectRooms: async () => {
            const state = useFloorplanStore.getState()
            if (!state.currentRunId) return
            if (!state.isCalibrated) return

            set((s) => {
                s.lastQueuedTask = 'detect_rooms'
                s.runStatus = 'processing'
            })

            state.setShowProcessingModal(true)

            const headers: Record<string, string> = {}
            if (state.token) headers['Authorization'] = `Bearer ${state.token}`

            // 1) Upload the latest edited SVG from the 2D editor (source of truth)
            try {
                const svgText = state.exportToSVG()
                const putHeaders: Record<string, string> = {
                    ...headers,
                    'Content-Type': 'image/svg+xml'
                }
                const putRes = await fetch(`/api/runs/${state.currentRunId}/svg`, {
                    method: 'PUT',
                    headers: putHeaders,
                    body: svgText
                })
                if (!putRes.ok) {
                    throw new Error(await putRes.text())
                }
            } catch (e) {
                set((s) => {
                    s.runStatus = 'failed'
                    s.lastQueuedTask = 'none'
                })
                state.setShowProcessingModal(false)
                throw e
            }

            const res = await fetch(`/api/runs/${state.currentRunId}/detect-rooms`, {
                method: 'POST',
                headers
            })
            if (!res.ok) {
                const errText = await res.text()
                set((s) => {
                    s.runStatus = 'failed'
                    s.lastQueuedTask = 'none'
                })
                state.setShowProcessingModal(false)
                if (res.status === 429) {
                    try {
                        const errData = JSON.parse(errText)
                        state.showToast(errData.detail || 'Token limit reached. Upgrade to Pro.', 'error')
                    } catch {
                        state.showToast('Token limit reached. Upgrade to Pro for more.', 'error')
                    }
                    return
                }
                throw new Error(errText)
            }
        },


        selectObject: (id) => set((state) => { state.selectedId = id }),

        deleteObject: (id) => set((state) => {
            state.walls = state.walls.filter((w: Wall) => w.id !== id)
            state.furniture = state.furniture.filter((f: FurnItem) => f.id !== id)
            if (state.selectedId === id) state.selectedId = null
            // Save history for undo
            const snapshot = {
                walls: JSON.parse(JSON.stringify(state.walls)),
                furniture: JSON.parse(JSON.stringify(state.furniture)),
                rooms: JSON.parse(JSON.stringify(state.rooms))
            }
            const history = (state as any).history || []
            const idx = (state as any).historyIndex ?? history.length - 1
            const newHistory = [...history.slice(0, idx + 1), snapshot].slice(-20)
            ;(state as any).history = newHistory
            ;(state as any).historyIndex = newHistory.length - 1
        }),

        startInteraction: (type, targetId, point, subType) => set((state) => {
            state.interaction = { type, targetId, subType, lastPoint: point }

            if (type === 'drawing') {
                const id = uuidv4()
                const snap = 0.1
                const safeX = isNaN(point.x) ? 0 : Math.min(Math.max(point.x, -50), 50)
                const safeY = isNaN(point.y) ? 0 : Math.min(Math.max(point.y, -50), 50)
                let sp = { x: Math.round(safeX / snap) * snap, y: Math.round(safeY / snap) * snap }

                // Snap start point to existing wall endpoints
                const ENDPOINT_SNAP = 0.25
                for (const other of state.walls) {
                    for (const ep of [other.start, other.end]) {
                        if (Math.abs(sp.x - ep.x) < ENDPOINT_SNAP && Math.abs(sp.y - ep.y) < ENDPOINT_SNAP) {
                            sp = { x: ep.x, y: ep.y }
                            break
                        }
                    }
                }

                state.walls.push({
                    id,
                    start: sp,
                    end: sp,
                    thickness: 0.15,
                    height: 2.5
                })
                state.interaction.targetId = id
            } else if (type === 'drawing_floor') {
                const id = uuidv4()
                const snap = 0.1
                const safeX = isNaN(point.x) ? 0 : Math.min(Math.max(point.x, -50), 50)
                const safeY = isNaN(point.y) ? 0 : Math.min(Math.max(point.y, -50), 50)
                const sp = { x: Math.round(safeX / snap) * snap, y: Math.round(safeY / snap) * snap }

                // Create a degenerate rectangle (all points at start)
                state.rooms.push({
                    id,
                    name: 'New Room',
                    color: '#fbbf24', // Default amber
                    points: [
                        { ...sp }, { ...sp }, { ...sp }, { ...sp }
                    ],
                    center: { ...sp }
                })
                state.interaction.targetId = id
            }
        }),

        updateInteraction: (point, options) => set((state) => {
            const { type, targetId, subType, lastPoint } = state.interaction
            if (type === 'none' || !lastPoint) return

            const snap = 0.1
            const safeX = isNaN(point.x) ? 0 : Math.min(Math.max(point.x, -50), 50)
            const safeY = isNaN(point.y) ? 0 : Math.min(Math.max(point.y, -50), 50)
            let sp = { x: Math.round(safeX / snap) * snap, y: Math.round(safeY / snap) * snap }
            const lp = { x: Math.round(lastPoint.x / snap) * snap, y: Math.round(lastPoint.y / snap) * snap }

            const delta = { x: sp.x - lp.x, y: sp.y - lp.y }

            if (type === 'drawing' && targetId) {
                const wall = state.walls.find(w => w.id === targetId)
                if (wall) {
                    wall.end = sp

                    // Snap to existing wall endpoints (magnetic connect)
                    const ENDPOINT_SNAP = 0.25 // meters — snap to nearby wall corners
                    let snappedToEndpoint = false
                    for (const other of state.walls) {
                        if (other.id === wall.id) continue
                        for (const ep of [other.start, other.end]) {
                            const edx = Math.abs(wall.end.x - ep.x)
                            const edy = Math.abs(wall.end.y - ep.y)
                            if (edx < ENDPOINT_SNAP && edy < ENDPOINT_SNAP) {
                                wall.end = { x: ep.x, y: ep.y }
                                snappedToEndpoint = true
                                break
                            }
                        }
                        if (snappedToEndpoint) break
                    }

                    // Auto-straighten to 90 degrees (orthogonal snapping) — skip if snapped to endpoint
                    if (!snappedToEndpoint) {
                        const dx = Math.abs(wall.end.x - wall.start.x)
                        const dy = Math.abs(wall.end.y - wall.start.y)
                        const SNAP_TOLERANCE = 0.5 // meters

                        if (options?.shiftKey) {
                            if (dx > dy) wall.end.y = wall.start.y
                            else wall.end.x = wall.start.x
                        } else {
                            // Soft snap
                            if (dy < SNAP_TOLERANCE && dx > dy) {
                                wall.end.y = wall.start.y // Snap horizontal
                            } else if (dx < SNAP_TOLERANCE && dy > dx) {
                                wall.end.x = wall.start.x // Snap vertical
                            }
                        }
                    }
                }
            } else if (type === 'drawing_floor' && targetId) {
                const room = state.rooms.find(r => r.id === targetId)
                if (room) {
                    // Update P2 (Top-Right) and P3 (Bottom-Left) based on Start (P0) and Current Mouse (P2's X, P3's Y)
                    // Actually, let's treat sp as the diagonal opposite corner
                    // P0 = Start (Fixed)
                    // P1 = { x: sp.x, y: lp.y } -> No, we need origin. 
                    // To do this correctly without extra state, we assume P0 is the anchor.
                    // But P0 changes if we just update points.
                    // We need to know which point is the anchor. 
                    // For simplicity: Point 0 is always the anchor established in startInteraction.
                    // But here we don't have P0 stored separately? 
                    // Actually, P0 in the array IS the anchor if we only update indices 1, 2, 3.

                    const p0 = room.points[0]
                    const p2 = sp

                    // P1 = { x: p2.x, y: p0.y }
                    // P2 = p2
                    // P3 = { x: p0.x, y: p2.y }

                    // Room Points order: P0 -> P1 -> P2 -> P3 (Clockwise or CCW)
                    room.points[1] = { x: p2.x, y: p0.y }
                    room.points[2] = { ...p2 }
                    room.points[3] = { x: p0.x, y: p2.y }

                    // Update Center
                    room.center.x = (p0.x + p2.x) / 2
                    room.center.y = (p0.y + p2.y) / 2
                }
            } else if (type === 'dragging' && targetId) {
                const wall = state.walls.find(w => w.id === targetId)
                const furn = state.furniture.find(f => f.id === targetId)
                if (wall && (delta.x !== 0 || delta.y !== 0)) {
                    wall.start.x += delta.x; wall.start.y += delta.y
                    wall.end.x += delta.x; wall.end.y += delta.y
                } else if (furn && (delta.x !== 0 || delta.y !== 0)) {
                    furn.position.x += delta.x
                    furn.position.z += delta.y

                    // --- LEGO SNAPPING FOR DOORS & WINDOWS ---
                    if ((furn.type === 'door' || furn.type === 'window') && !options?.shiftKey) {
                        let bestWall = null;
                        let minDist = 0.3; // Snap threshold: 0.3 meters (reduced to allow easier detaching)
                        let snapX = furn.position.x;
                        let snapZ = furn.position.z;
                        let snapAngle = furn.rotation.y;

                        for (const w of state.walls) {
                            const dx = w.end.x - w.start.x;
                            const dy = w.end.y - w.start.y;
                            const lengthSquared = dx * dx + dy * dy;

                            if (lengthSquared === 0) continue;

                            // Project point onto line segment
                            let t = ((furn.position.x - w.start.x) * dx + (furn.position.z - w.start.y) * dy) / lengthSquared;
                            t = Math.max(0, Math.min(1, t)); // Clamp to segment bounds

                            const cx = w.start.x + t * dx;
                            const cy = w.start.y + t * dy;

                            const distSquared = (furn.position.x - cx) ** 2 + (furn.position.z - cy) ** 2;
                            const dist = Math.sqrt(distSquared);

                            if (dist < minDist) {
                                minDist = dist;
                                bestWall = w;
                                snapX = cx;
                                snapZ = cy;
                                snapAngle = Math.atan2(dy, dx);
                            }
                        }

                        if (bestWall) {
                            // Magnetic Snap!
                            furn.position.x = snapX;
                            furn.position.z = snapZ;
                            // Match WallManager's rotation mapping (negative angle around Y)
                            furn.rotation.y = -snapAngle;

                            // Dynamically fit thickness to wall depth
                            furn.dimensions.depth = bestWall.thickness;
                        } else {
                            // If it detaches, reset depth to a standard so it doesn't look like a huge block
                            if (furn.dimensions.depth !== 0.15) {
                                furn.dimensions.depth = 0.15;
                                furn.rotation.y = 0; // Reset rotation so they lay flat when unattached
                            }
                        }
                    }
                } else {
                    const room = state.rooms.find(r => r.id === targetId)
                    if (room && (delta.x !== 0 || delta.y !== 0)) {
                        // Move all points
                        room.points.forEach(p => {
                            p.x += delta.x
                            p.y += delta.y
                        })
                        // Move center
                        room.center.x += delta.x
                        room.center.y += delta.y
                    }
                }
            } else if (type === 'resizing' && targetId) {
                const wall = state.walls.find(w => w.id === targetId)
                const room = state.rooms.find(r => r.id === targetId)
                const furn = state.furniture.find(f => f.id === targetId)

                if (room && lastPoint) {
                    // Simple uniform scale based on distance from center
                    const dx = point.x - room.center.x
                    const dy = point.y - room.center.y
                    const distCurrent = Math.sqrt(dx * dx + dy * dy)

                    const ldx = lastPoint.x - room.center.x
                    const ldy = lastPoint.y - room.center.y
                    const distLast = Math.max(0.1, Math.sqrt(ldx * ldx + ldy * ldy)) // Avoid div by zero

                    const scale = distCurrent / distLast

                    // Apply scale to all points relative to center
                    if (Math.abs(scale - 1) > 0.001) {
                        room.points.forEach(p => {
                            p.x = room.center.x + (p.x - room.center.x) * scale
                            p.y = room.center.y + (p.y - room.center.y) * scale
                        })
                    }
                }
                else if (wall && subType) {
                    if (subType === 'start') {
                        wall.start = sp
                        // Straighten Logic: Orthogonal Snapping
                        const dx = Math.abs(wall.start.x - wall.end.x)
                        const dy = Math.abs(wall.start.y - wall.end.y)
                        const SNAP_TOLERANCE = 0.5

                        if (options?.shiftKey) {
                            if (dx > dy) wall.start.y = wall.end.y // Snap to horizontal
                            else wall.start.x = wall.end.x // Snap to vertical
                        } else {
                            if (dy < SNAP_TOLERANCE && dx > dy) wall.start.y = wall.end.y
                            else if (dx < SNAP_TOLERANCE && dy > dx) wall.start.x = wall.end.x
                        }
                    } else if (subType === 'end') {
                        wall.end = sp
                        // Straighten Logic: Orthogonal Snapping
                        const dx = Math.abs(wall.end.x - wall.start.x)
                        const dy = Math.abs(wall.end.y - wall.start.y)
                        const SNAP_TOLERANCE = 0.5

                        if (options?.shiftKey) {
                            if (dx > dy) wall.end.y = wall.start.y
                            else wall.end.x = wall.start.x
                        } else {
                            if (dy < SNAP_TOLERANCE && dx > dy) wall.end.y = wall.start.y
                            else if (dx < SNAP_TOLERANCE && dy > dx) wall.end.x = wall.start.x
                        }
                    } else if (subType === 'thickness') {
                        const dx = wall.end.x - wall.start.x
                        const dy = wall.end.y - wall.start.y
                        const len = Math.max(Math.sqrt(dx * dx + dy * dy), 0.0001)
                        const nx = -dy / len
                        const ny = dx / len
                        const moveX = sp.x - lp.x
                        const moveY = sp.y - lp.y
                        const delta = moveX * nx + moveY * ny
                        const next = Math.min(2, Math.max(0.05, wall.thickness + delta * 2))
                        wall.thickness = next
                    }
                } else if (furn && subType) {
                    // Handle furniture resizing
                    const dx = point.x - furn.position.x
                    const dy = point.y - furn.position.z

                    // Rotate point into local space
                    const cos = Math.cos(-furn.rotation.y)
                    const sin = Math.sin(-furn.rotation.y)
                    const localX = dx * cos - dy * sin
                    const localZ = dx * sin + dy * cos

                    if (subType === 'resize-uniform' || options?.shiftKey) {
                        // Uniform scale: scale both width and depth proportionally
                        const dist = Math.sqrt(localX * localX + localZ * localZ)
                        const oldDiag = Math.sqrt(
                            (furn.dimensions.width / 2) ** 2 + (furn.dimensions.depth / 2) ** 2
                        ) || 0.5
                        const ratio = dist / oldDiag
                        furn.dimensions.width = Math.max(0.2, furn.dimensions.width * ratio)
                        furn.dimensions.depth = Math.max(0.2, furn.dimensions.depth * ratio)
                        furn.dimensions.height = Math.max(0.2, furn.dimensions.height * ratio)
                    } else if (subType === 'resize-width') {
                        furn.dimensions.width = Math.max(0.2, Math.abs(localX) * 2)
                    } else if (subType === 'resize-depth') {
                        furn.dimensions.depth = Math.max(0.2, Math.abs(localZ) * 2)
                    }
                }
            }

            if (delta.x !== 0 || delta.y !== 0 || type === 'drawing' || type === 'resizing' || type === 'drawing_floor') {
                state.interaction.lastPoint = point
            }
        }),

        endInteraction: () => set((state) => {
            const hadMeaningfulAction = state.interaction.type !== 'none'
            // Clean up degenerate (zero-length) walls from accidental clicks
            if (state.interaction.type === 'drawing' && state.interaction.targetId) {
                const wall = state.walls.find(w => w.id === state.interaction.targetId)
                if (wall) {
                    const dx = wall.end.x - wall.start.x
                    const dy = wall.end.y - wall.start.y
                    const len = Math.sqrt(dx * dx + dy * dy)
                    if (len < 0.05) {
                        // Remove zero-length wall
                        state.walls = state.walls.filter(w => w.id !== state.interaction.targetId)
                    }
                }
            }
            state.interaction = { type: 'none', targetId: null, lastPoint: null }
            // Save history after every meaningful interaction for undo/redo
            if (hadMeaningfulAction) {
                const snapshot = {
                    walls: JSON.parse(JSON.stringify(state.walls)),
                    furniture: JSON.parse(JSON.stringify(state.furniture)),
                    rooms: JSON.parse(JSON.stringify(state.rooms))
                }
                const history = (state as any).history || []
                const idx = (state as any).historyIndex ?? history.length - 1
                const newHistory = [...history.slice(0, idx + 1), snapshot].slice(-20)
                ;(state as any).history = newHistory
                ;(state as any).historyIndex = newHistory.length - 1
            }
        }),

        setCornerSnapMode: (active) => set((state) => {
            state.cornerSnapMode = active
            if (!active) state.snapCorners = []
        }),

        addSnapCorner: (corner) => set((state) => {
            if (state.snapCorners.find(c => c.wallId === corner.wallId)) return;
            state.snapCorners.push(corner);

            if (state.snapCorners.length === 2) {
                const c1 = state.snapCorners[0];
                const c2 = state.snapCorners[1];
                const w1 = state.walls.find(w => w.id === c1.wallId);
                const w2 = state.walls.find(w => w.id === c2.wallId);

                if (w1 && w2) {
                    const x1 = w1.start.x, y1 = w1.start.y, x2 = w1.end.x, y2 = w1.end.y;
                    const x3 = w2.start.x, y3 = w2.start.y, x4 = w2.end.x, y4 = w2.end.y;
                    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

                    if (Math.abs(denom) > 0.0001) {
                        const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
                        const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

                        if (c1.type === 'start') { w1.start.x = px; w1.start.y = py; }
                        else { w1.end.x = px; w1.end.y = py; }

                        if (c2.type === 'start') { w2.start.x = px; w2.start.y = py; }
                        else { w2.end.x = px; w2.end.y = py; }
                    }
                }

                state.snapCorners = [];
                state.cornerSnapMode = false;
            }
        }),

        setJoinMode: (active) => set((state) => {
            if (active) {
                // Only activate if a wall is selected
                if (state.selectedId && state.walls.some(w => w.id === state.selectedId)) {
                    state.joinMode = true
                    state.joinSourceId = state.selectedId
                    state.joinTargetId = null
                    state.joinPreviewWalls = null
                    state.toast = { message: "Join Mode Active: Click target wall", type: "info" }
                } else {
                    state.toast = { message: "Select a wall first before holding J", type: "info" }
                }
            } else {
                if (state.joinMode && !state.joinTargetId) {
                    state.toast = { message: "Join Mode Cancelled", type: "info" }
                }
                state.joinMode = false
                state.joinSourceId = null
                state.joinTargetId = null
                state.joinPreviewWalls = null
            }
        }),

        setJoinTargetId: (id) => set((state) => {
            if (!state.joinMode || !state.joinSourceId || id === state.joinSourceId) return
            state.joinTargetId = id

            const w1 = state.walls.find(w => w.id === state.joinSourceId)
            const targetWall = state.walls.find(w => w.id === id)
            const targetFurniture = state.furniture.find(f => f.id === id)

            if (!w1 || (!targetWall && !targetFurniture)) {
                state.toast = { message: "Join target not found", type: "error" }
                return
            }

            state.toast = { message: "Calculating Smart Join...", type: "info" }

            const x1 = w1.start.x, y1 = w1.start.y, x2 = w1.end.x, y2 = w1.end.y;
            let px: number, py: number;

            // -- OBJECT SNAP LOGIC (DOOR/WINDOW) --
            if (targetFurniture) {
                // Snap to center of the furniture
                px = targetFurniture.position.x;
                py = targetFurniture.position.z;

                // Move strictly the closer endpoint of the active wall
                const dStart = Math.hypot(x1 - px, y1 - py);
                const dEnd = Math.hypot(x2 - px, y2 - py);

                const pW1 = { ...w1 };
                if (dStart < dEnd) pW1.start = { x: px, y: py };
                else pW1.end = { x: px, y: py };

                state.joinPreviewWalls = [pW1];
                state.toast = { message: `Preview ready: Joining to ${targetFurniture.type}. Press ENTER to connect!`, type: "info" }
                return;
            }

            // -- WALL TO WALL SNAP LOGIC --
            const w2 = targetWall!;
            const x3 = w2.start.x, y3 = w2.start.y, x4 = w2.end.x, y4 = w2.end.y;

            // Calculate mathematical line intersection of infinite lines
            const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

            if (Math.abs(denom) < 0.0001) {
                // Walls are exactly parallel. Project W1's closer endpoint cleanly perpendicular onto W2's line.
                const pointDists = [
                    { type: 'start', p: w1.start, d: Math.min(Math.hypot(x1 - x3, y1 - y3), Math.hypot(x1 - x4, y1 - y4)) },
                    { type: 'end', p: w1.end, d: Math.min(Math.hypot(x2 - x3, y2 - y3), Math.hypot(x2 - x4, y2 - y4)) }
                ].sort((a, b) => a.d - b.d);

                const w1p = pointDists[0].p;
                const w1Type = pointDists[0].type;

                const w2Dx = x4 - x3;
                const w2Dy = y4 - y3;
                const w2LenSq = w2Dx * w2Dx + w2Dy * w2Dy;
                let t = 0;
                if (w2LenSq > 0.0001) {
                    t = ((w1p.x - x3) * w2Dx + (w1p.y - y3) * w2Dy) / w2LenSq;
                }
                px = x3 + t * w2Dx;
                py = y3 + t * w2Dy;

                const pW1 = { ...w1 };
                if (w1Type === 'start') pW1.start = { x: px, y: py };
                else pW1.end = { x: px, y: py };

                state.joinPreviewWalls = [pW1];
                state.toast = { message: "Preview ready: Parallel Projection. Press ENTER to connect!", type: "info" }
                return;
            }

            // Standard mathematical intersection (guarantees NO rotation)
            px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
            py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

            // Check if intersection point lies on the physical segment of W2 (T-Junction check)
            const w2Dx = x4 - x3;
            const w2Dy = y4 - y3;
            const w2LenSq = w2Dx * w2Dx + w2Dy * w2Dy;

            let t = -1;
            if (w2LenSq > 0.0001) {
                t = ((px - x3) * w2Dx + (py - y3) * w2Dy) / w2LenSq;
            }

            // Determine which endpoint of W1 to stretch
            const w1MoveDist = [
                { type: 'start', d: Math.hypot(x1 - px, y1 - py) },
                { type: 'end', d: Math.hypot(x2 - px, y2 - py) }
            ].sort((a, b) => a.d - b.d)[0];

            const pW1 = { ...w1 };
            if (w1MoveDist.type === 'start') pW1.start = { x: px, y: py };
            else pW1.end = { x: px, y: py };

            if (t >= -0.05 && t <= 1.05) {
                // T-Junction: Intersection hits the middle of W2.
                // Apply ONLY to W1. W2 remains perfectly untouched.
                state.joinPreviewWalls = [pW1];
                state.toast = { message: "Preview ready: T-Junction Join. Press ENTER to connect!", type: "info" }
            } else {
                // L-Corner: Intersection is out in empty space.
                // Stretch both W1 and W2 mathematically to meet at the virtual corner.
                const w2MoveDist = [
                    { type: 'start', d: Math.hypot(x3 - px, y3 - py) },
                    { type: 'end', d: Math.hypot(x4 - px, y4 - py) }
                ].sort((a, b) => a.d - b.d)[0];

                const pW2 = { ...w2 };
                if (w2MoveDist.type === 'start') pW2.start = { x: px, y: py };
                else pW2.end = { x: px, y: py };

                state.joinPreviewWalls = [pW1, pW2];
                state.toast = { message: "Preview ready: L-Corner Join. Press ENTER to connect!", type: "info" }
            }
        }),

        applyJoin: () => set((state) => {
            if (state.joinMode && state.joinPreviewWalls && state.joinPreviewWalls.length > 0 && state.joinTargetId) {
                // Dynamically apply properties of all modified walls in the preview
                state.joinPreviewWalls.forEach(previewWall => {
                    const idx = state.walls.findIndex(w => w.id === previewWall.id);
                    if (idx > -1) {
                        state.walls[idx].start = { ...previewWall.start };
                        state.walls[idx].end = { ...previewWall.end };
                    }
                });

                state.toast = { message: "Object joined successfully!", type: "success" }

            } else if (state.joinMode && state.joinTargetId) {
                state.toast = { message: "Failed to apply join. No preview generated.", type: "error" }
            }

            // Reset everything
            state.joinMode = false
            state.joinSourceId = null
            state.joinTargetId = null
            state.joinPreviewWalls = null
        }),

        calibrate: (wallId, realLength) => set((state) => {
            const wall = state.walls.find(w => w.id === wallId)
            if (!wall) return

            const dx = wall.end.x - wall.start.x
            const dy = wall.end.y - wall.start.y
            const currentLen = Math.sqrt(dx * dx + dy * dy)

            if (currentLen > 0) {
                const prevMetersPerPixel = state.calibrationFactor
                const ratio = realLength / currentLen

                // Rescale EVERYTHING proportionately to maintain the exact visual aspect ratio
                state.walls.forEach(w => {
                    w.start.x *= ratio; w.start.y *= ratio
                    w.end.x *= ratio; w.end.y *= ratio

                    // Scale thickness proportionately with the plan
                    w.thickness = (Number(w.thickness) > 0 ? Number(w.thickness) : 0.15) * ratio
                    // Do not clamp thickness here so we don't accidentally get 'fat' handles on tiny floorplans
                    w.height = 2.5 // Standard wall height
                })

                state.furniture.forEach(f => {
                    // Position scales linearly in the X/Z plane
                    f.position.x *= ratio
                    f.position.z *= ratio

                    // Scale footprint dimensions perfectly
                    f.dimensions.width *= ratio
                    f.dimensions.depth *= ratio

                    // --- RE-STANDARDIZE DIMENSIONS AFTER SCALING ---
                    // If a door/window was previously standard, or if the new scaled size
                    // falls within a "Standard" range, snap it back to standard metrics.
                    // This prevents "Wide Doors" after calibration.
                    if (f.type === 'door') {
                        if (f.dimensions.width > 0.54 && f.dimensions.width < 1.26) {
                            f.dimensions.width = 0.9;
                        }
                        f.dimensions.height = 2.1
                    } else if (f.type === 'window') {
                        if (f.dimensions.width > 0.72 && f.dimensions.width < 1.68) {
                            f.dimensions.width = 1.2;
                        }
                        f.dimensions.height = 1.2
                        f.position.y = 1.0 // Window sill height
                    } else {
                        // For fully generic 3D objects, scale the height too
                        f.position.y *= ratio
                        f.dimensions.height *= ratio
                    }
                })

                state.rooms.forEach(r => {
                    r.points.forEach(p => { p.x *= ratio; p.y *= ratio })
                    r.center.x *= ratio
                    r.center.y *= ratio
                })

                state.labels.forEach(l => {
                    l.position.x *= ratio
                    l.position.y *= ratio
                })

                // Keep calibrationFactor as meters-per-pixel so background image and SVG remain in sync.
                // Since we scaled geometry by `ratio`, meters-per-pixel scales by the same ratio.
                let metersPerPixel = (prevMetersPerPixel > 0 ? prevMetersPerPixel : 0.01) * ratio
                // Guard against broken calibration values (0/NaN/Infinity) which can blow up SVG scaling.
                if (!isFinite(metersPerPixel) || metersPerPixel <= 0) metersPerPixel = 0.01
                metersPerPixel = Math.min(Math.max(metersPerPixel, 1e-5), 0.5)
                state.calibrationFactor = metersPerPixel
                state.exportScale = metersPerPixel // Backend expects meters-per-pixel
                state.isCalibrated = true


                // Trigger auto-fit to fix "Microscope" view
                state.fitViewTrigger = (state.fitViewTrigger || 0) + 1

                // Advance tutorial
                if (state.tutorialStep === 'calibration') {
                    state.tutorialStep = 'correction'
                }
            }
        }),

        importFurnAiModel: (payload) => {
            set((state) => {
                // Calculate a reasonable size relative to the floorplan
                // Default 2m x 2m works for most furniture at typical calibrations
                const targetSize = 2

                // Place at center of existing walls if no position provided
                let cx = payload.position.x
                let cz = payload.position.y
                if (cx === 0 && cz === 0 && state.walls.length > 0) {
                    const allX = state.walls.flatMap(w => [w.start.x, w.end.x])
                    const allY = state.walls.flatMap(w => [w.start.y, w.end.y])
                    cx = (Math.min(...allX) + Math.max(...allX)) / 2
                    cz = (Math.min(...allY) + Math.max(...allY)) / 2
                }

                state.furniture.push({
                    id: payload.id,
                    type: payload.type || 'imported',
                    furnAiId: payload.furnAiId,
                    position: { x: cx, y: 0, z: cz },
                    rotation: { x: 0, y: 0, z: 0 },
                    dimensions: { width: targetSize, height: targetSize, depth: targetSize },
                    modelUrl: payload.modelUrl,
                    label: payload.label
                })
                state.saveHistory()
            })
        },

        updateLabel: (id, label) => {
            set((state) => {
                const wall = state.walls.find(w => w.id === id)
                if (wall) wall.label = label
                const item = state.furniture.find(f => f.id === id)
                if (item) item.label = label
            })
        },

        syncSVGAndEnter3D: async () => {
            const state = useFloorplanStore.getState()
            if (!state.currentRunId || !state.isCalibrated) return

            try {
                // Export current state to SVG to ensure backend has latest edits
                const currentSVG = state.exportToSVG()

                // PUT SVG to backend (syncs state but does NOT run Blender)
                const headers: Record<string, string> = { 'Content-Type': 'image/svg+xml' }
                if (state.token) headers['Authorization'] = `Bearer ${state.token}`

                await fetch(`/api/runs/${state.currentRunId}/svg`, {
                    method: 'PUT',
                    headers,
                    body: currentSVG
                })

                // Persist calibration/scale
                await fetch(`/api/runs/${state.currentRunId}/meta`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(state.token ? { 'Authorization': `Bearer ${state.token}` } : {})
                    },
                    body: JSON.stringify({
                        scale: state.exportScale || state.calibrationFactor
                    })
                })
            } catch (e) {
                console.error("SVG Sync Error:", e)
            }
        },

        triggerBlenderGeneration: async (formats?: string[]) => {
            const state = useFloorplanStore.getState()
            if (!state.currentRunId || !state.isCalibrated) return

            set((s) => { s.isGenerating3D = true })

            try {
                // Ensure SVG is synced first before generating
                await state.syncSVGAndEnter3D()

                const headers: Record<string, string> = { 'Content-Type': 'application/json' }
                if (state.token) headers['Authorization'] = `Bearer ${state.token}`

                // Only generate requested formats (default: GLB only for web preview)
                const res = await fetch(`/api/runs/${state.currentRunId}/generate-3d`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        scale: state.exportScale || state.calibrationFactor,
                        formats: formats || ['glb']
                    })
                })

                if (res.ok) {
                    state.setRunStatus('processing')
                    state.setLastQueuedTask('gen_3d')
                } else {
                    const errText = await res.text()
                    if (res.status === 429) {
                        try {
                            const errData = JSON.parse(errText)
                            state.showToast(errData.detail || 'Token limit reached. Upgrade to Pro.', 'error')
                        } catch {
                            state.showToast('Token limit reached. Upgrade to Pro for more.', 'error')
                        }
                    } else {
                        console.error("Blender Gen Trigger Failed:", errText)
                        state.showToast('3D generation failed. Please try again.', 'error')
                    }
                }
            } catch (e) {
                console.error("Blender Gen Trigger Error:", e)
            } finally {
                set((s) => { s.isGenerating3D = false })
            }
        },
        toggleBackground: () => {
            set((state) => {
                state.showBackground = !state.showBackground
            })
        },
        triggerRender: async () => {
            const state = useFloorplanStore.getState()
            if (!state.currentRunId || state.isRendering) return

            set((s) => { s.isRendering = true; s.renders = [] })

            try {
                // Trigger render on server - it will stream images back
                const headers: Record<string, string> = { 'Content-Type': 'application/json' }
                if (state.token) headers['Authorization'] = `Bearer ${state.token}`

                const res = await fetch(`/api/runs/${state.currentRunId}/render`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ lighting: state.lightingPreset })
                })

                if (res.ok) {
                    // Poll for renders or use EventSource for streaming
                    const data = await res.json()
                    if (data.renders) {
                        for (const url of data.renders) {
                            state.addRender(url)
                            await new Promise(r => setTimeout(r, 500)) // Delay between reveals
                        }
                    }
                }
            } catch (e) {
                console.error("Render Error:", e)
            } finally {
                set((s) => { s.isRendering = false })
            }
        },

        addRender: (url) => set((state) => {
            state.renders.push(url)
        }),

        addFurniture: (type, position) => set((state) => {
            state.furniture.push({
                id: uuidv4(),
                type,
                position: { x: position.x, y: type === 'window' ? 1.0 : 0, z: position.y },
                rotation: { x: 0, y: 0, z: 0 },
                dimensions: type === 'door'
                    ? { width: 0.9, height: 2.1, depth: 0.15 }
                    : type === 'window'
                        ? { width: 1.2, height: 1.2, depth: 0.15 } // Standard window size
                        : { width: 1, height: 1, depth: 1 },
            })
        }),

        addImportedFurniture: ({ id, label, relPath }) => set((state) => {
            const existing = state.furniture.find(f => f.id === id)
            if (existing) {
                existing.type = existing.type || 'imported'
                existing.modelUrl = relPath
                if (label) existing.label = label
                return
            }

            state.furniture.push({
                id,
                type: 'imported',
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                dimensions: { width: 1, height: 1, depth: 1 },
                modelUrl: relPath,
                label,
            })
            state.selectedId = id
        }),

        updateWall: (id, updates) => set((state) => {
            const wall = state.walls.find(w => w.id === id)
            if (wall) {
                Object.assign(wall, updates)
            }
        }),

        updateFurniturePosition: (id, position) => set((state) => {
            const item = state.furniture.find((f: FurnItem) => f.id === id)
            if (!item) return
            if (typeof position.x === 'number') item.position.x = position.x
            if (typeof position.y === 'number') item.position.y = position.y
            if (typeof position.z === 'number') item.position.z = position.z
        }),

        updateFurniture: (id, updates) => set((state) => {
            const item = state.furniture.find((f: FurnItem) => f.id === id)
            if (item) {
                // If position/rotation/dimensions are passed partially, we need to merge them carefully
                if (updates.position) Object.assign(item.position, updates.position)
                if (updates.rotation) Object.assign(item.rotation, updates.rotation)
                if (updates.dimensions) Object.assign(item.dimensions, updates.dimensions)

                // For other top-level keys
                const { position, rotation, dimensions, ...rest } = updates
                Object.assign(item, rest)
            }
        }),


        updateRoom: (id, updates) => set((state) => {
            const room = state.rooms.find(r => r.id === id)
            if (room) {
                Object.assign(room, updates)
            }
        }),

        resetFloorplan: () => set((state) => {
            state.walls = []
            state.furniture = []
            state.rooms = []
            state.labels = []
            state.uploadedImage = null
            state.imageDimensions = { width: 0, height: 0 }
            state.calibrationFactor = 0.01 // Default 1px = 1cm
            state.isCalibrated = false
            state.selectedId = null
            state.currentRunId = null
            state.runStatus = 'idle'
            state.tutorialStep = 'none'
            ;(state as any).history = []
            ;(state as any).historyIndex = -1
        }),

        importFromSVG: (svgText) => set((state) => {
            console.log('[DEBUG importFromSVG] SVG length:', svgText.length, 'starts with:', svgText.substring(0, 200))
            console.log('[DEBUG importFromSVG] has rooms-geometry?', svgText.includes('rooms-geometry'), 'polygon count in text:', (svgText.match(/<polygon/g) || []).length)
            const parser = new DOMParser()
            const doc = parser.parseFromString(svgText, "image/svg+xml")

            const walls: Wall[] = []
            const furniture: FurnItem[] = []
            const labels: TextLabel[] = []

            let pxToM = Number(state.calibrationFactor)
            if (!isFinite(pxToM) || pxToM <= 0) pxToM = 0.01
            pxToM = Math.min(Math.max(pxToM, 1e-5), 0.5)

            // 1. Get raw bounds to center it
            let offsetX = 0
            let offsetY = 0
            // Prefer viewBox centering (authoritative pixel coordinate frame that matches the reference image).
            // Using rect bounds can introduce bias (e.g., walls don't fill the full image height).
            const svgEl = doc.querySelector('svg')
            const vb = svgEl?.getAttribute('viewBox')
            let usedViewBox = false
            if (vb) {
                const parts = vb.split(/[\s,]+/).map(p => parseFloat(p)).filter(n => !isNaN(n))
                if (parts.length === 4) {
                    const [x, y, w, h] = parts
                    offsetX = x + w / 2
                    offsetY = y + h / 2
                    usedViewBox = true
                }
            }

            if (!usedViewBox) {
                const allRects = Array.from(doc.querySelectorAll('rect'))
                if (allRects.length > 0) {
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
                    allRects.forEach(r => {
                        const x = parseFloat(r.getAttribute('x') || '0')
                        const y = parseFloat(r.getAttribute('y') || '0')
                        const w = parseFloat(r.getAttribute('width') || '0')
                        const h = parseFloat(r.getAttribute('height') || '0')
                        minX = Math.min(minX, x); minY = Math.min(minY, y)
                        maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, y + h)
                    })

                    offsetX = (minX + maxX) / 2
                    offsetY = (minY + maxY) / 2
                }
            }

            // 2. Parse Walls
            const wallGroup = doc.getElementById('wall')
            if (wallGroup) {
                wallGroup.querySelectorAll('rect').forEach(r => {
                    const x = (parseFloat(r.getAttribute('x') || '0') - offsetX) * pxToM
                    const y = (parseFloat(r.getAttribute('y') || '0') - offsetY) * pxToM
                    const w = parseFloat(r.getAttribute('width') || '0') * pxToM
                    const h = parseFloat(r.getAttribute('height') || '0') * pxToM

                    // Skip degenerate rects that produce zero-length walls
                    if (w < 1e-4 && h < 1e-4) return

                    // We represent vertical/horizontal walls as start/end vectors.
                    // Use the SMALLER dimension as thickness (the thin side of the rect).
                    if (w > h) {
                        const id = r.getAttribute('id') || uuidv4()
                        const existing = state.walls.find(w => w.id === id)
                        // Horizontal wall - width is length, height is thickness
                        const thickness = Math.max(0.05, Math.min(h, 2.0)) || 0.15
                        walls.push({
                            id,
                            start: { x, y: y + h / 2 },
                            end: { x: x + w, y: y + h / 2 },
                            thickness,
                            height: 2.5,
                            ...(existing ? {
                                textureDataUrl: existing.textureDataUrl,
                                textureTileWidthM: existing.textureTileWidthM,
                                textureTileHeightM: existing.textureTileHeightM,
                            } : {})
                        })
                    } else {
                        const id = r.getAttribute('id') || uuidv4()
                        const existing = state.walls.find(w => w.id === id)
                        // Vertical wall - height is length, width is thickness
                        const thickness = Math.max(0.05, Math.min(w, 2.0)) || 0.15
                        walls.push({
                            id,
                            start: { x: x + w / 2, y },
                            end: { x: x + w / 2, y: y + h },
                            thickness,
                            height: 2.5,
                            ...(existing ? {
                                textureDataUrl: existing.textureDataUrl,
                                textureTileWidthM: existing.textureTileWidthM,
                                textureTileHeightM: existing.textureTileHeightM,
                            } : {})
                        })
                    }
                })
                const svgWallCount = wallGroup.querySelectorAll('rect').length
                console.log(`[DEBUG importFromSVG] Wall rects in SVG: ${svgWallCount}, Parsed walls: ${walls.length}`)
            }

            // 3b. Parse imported model placemarks (written by backend upload)
            const importedGroup = doc.getElementById('imported-models')
            if (importedGroup) {
                // NEW FORMAT: direct <rect> elements with data-rel-path
                importedGroup.querySelectorAll('rect').forEach(r => {
                    const relPath = r.getAttribute('data-rel-path') || ''
                    const name = r.getAttribute('data-name') || ''
                    if (!relPath) return

                    const x = parseFloat(r.getAttribute('x') || 'NaN')
                    const y = parseFloat(r.getAttribute('y') || 'NaN')
                    const w = parseFloat(r.getAttribute('width') || '0') * pxToM
                    const h = parseFloat(r.getAttribute('height') || '0') * pxToM
                    if (isNaN(x) || isNaN(y)) return

                    const cx = x + parseFloat(r.getAttribute('width') || '0') / 2
                    const cy = y + parseFloat(r.getAttribute('height') || '0') / 2

                    const rawId = (r.getAttribute('id') || '').replace(/^imported_/, '')
                    const id = rawId || uuidv4()

                    const savedRotation = r.getAttribute('data-rotation')
                    let rotY = 0
                    if (savedRotation !== null) {
                        rotY = parseFloat(savedRotation)
                        if (!isFinite(rotY)) rotY = 0
                    }

                    furniture.push({
                        id,
                        type: 'imported',
                        position: { x: (cx - offsetX) * pxToM, y: 0, z: (cy - offsetY) * pxToM },
                        rotation: { x: 0, y: rotY, z: 0 },
                        dimensions: { width: Math.max(w, 0.5), height: 1.5, depth: Math.max(h, 0.5) },
                        modelUrl: relPath,
                        label: name,
                    })
                })

                // LEGACY FORMAT: <g> wrappers with <circle> center points
                importedGroup.querySelectorAll('g').forEach(g => {
                    const importId = g.getAttribute('data-import-id') || g.getAttribute('id') || ''
                    const relPath = g.getAttribute('data-rel-path') || ''
                    const name = g.getAttribute('data-name') || ''

                    // Prefer circle center
                    let cx: number | null = null
                    let cy: number | null = null
                    const circle = g.querySelector('circle')
                    if (circle) {
                        const cxs = circle.getAttribute('cx')
                        const cys = circle.getAttribute('cy')
                        const cxf = parseFloat(cxs || 'NaN')
                        const cyf = parseFloat(cys || 'NaN')
                        if (!isNaN(cxf) && !isNaN(cyf)) {
                            cx = cxf
                            cy = cyf
                        }
                    }

                    // Fallback to text x/y
                    if (cx === null || cy === null) {
                        const text = g.querySelector('text')
                        if (text) {
                            const tx = parseFloat(text.getAttribute('x') || 'NaN')
                            const ty = parseFloat(text.getAttribute('y') || 'NaN')
                            if (!isNaN(tx) && !isNaN(ty)) {
                                cx = tx
                                cy = ty
                            }
                        }
                    }

                    if (cx === null || cy === null) return

                    const id = String(importId).replace(/^imported_/, '') || uuidv4()
                    // Skip if already parsed from rect format above
                    if (furniture.some(f => f.id === id)) return

                    furniture.push({
                        id,
                        type: 'imported',
                        position: { x: (cx - offsetX) * pxToM, y: 0, z: (cy - offsetY) * pxToM },
                        rotation: { x: 0, y: 0, z: 0 },
                        dimensions: { width: 1, height: 1, depth: 1 },
                        modelUrl: relPath,
                        label: name,
                    })
                })
            }

            // 3. Parse Doors/Windows as simple furniture placeholders for now
            const openings = ['door', 'window']
            openings.forEach(type => {
                const group = doc.getElementById(type)
                if (group) {
                    group.querySelectorAll('rect').forEach(r => {
                        const x = (parseFloat(r.getAttribute('x') || '0') - offsetX) * pxToM
                        const y = (parseFloat(r.getAttribute('y') || '0') - offsetY) * pxToM
                        let w = parseFloat(r.getAttribute('width') || '0') * pxToM
                        const hOriginal = parseFloat(r.getAttribute('height') || '0') * pxToM
                        let h = hOriginal

                        // Check for preserved rotation attribute (written by exportToSVG)
                        const savedRotation = r.getAttribute('data-rotation')
                        let objRotationY: number

                        if (savedRotation !== null) {
                            // Rotation was explicitly saved — use it directly
                            objRotationY = parseFloat(savedRotation)
                            if (!isFinite(objRotationY)) objRotationY = 0
                        } else {
                            // Infer from rect dimensions (initial import from backend SVG)
                            objRotationY = (w > h) ? 0 : Math.PI / 2
                        }

                        const isHorizontal = Math.abs(objRotationY) < 0.1

                        // --- STANDARDIZE DIMENSIONS (matches Blender backend) ---
                        let openingWidth = isHorizontal ? w : h;
                        let thickness = 0.15; // Standardize door/window depth to match standard wall thickness

                        if (type === 'door') {
                            if (openingWidth > 0.54 && openingWidth < 1.26) {
                                openingWidth = 0.9;
                            }
                        } else if (type === 'window') {
                            if (openingWidth > 0.72 && openingWidth < 1.68) {
                                openingWidth = 1.2;
                            }
                        }

                        furniture.push({
                            id: r.getAttribute('id') || uuidv4(),
                            type: type as any,
                            position: { x: x + w / 2, y: type === 'window' ? 1.0 : 0, z: y + hOriginal / 2 },
                            rotation: { x: 0, y: objRotationY, z: 0 },
                            dimensions: { width: openingWidth, height: type === 'window' ? 1.2 : 2.1, depth: thickness }
                        })
                    })
                }
            })

            // 4. Parse Room Polygons
            const rooms: { id: string; name: string; points: { x: number; y: number }[]; color: string; center: { x: number; y: number } }[] = []
            const roomColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']
            let colorIndex = 0

            const parseTransform = (transform: string | null | undefined) => {
                const t = (transform || '').trim()
                if (!t) return { tx: 0, ty: 0 }

                // translate(x [y])
                const mTranslate = t.match(/translate\(\s*([+-]?[\d.]+)(?:[\s,]+([+-]?[\d.]+))?\s*\)/i)
                if (mTranslate) {
                    const tx = parseFloat(mTranslate[1])
                    const ty = parseFloat(mTranslate[2] ?? '0')
                    return { tx: isNaN(tx) ? 0 : tx, ty: isNaN(ty) ? 0 : ty }
                }

                // matrix(a b c d e f) => translation is (e, f)
                const mMatrix = t.match(/matrix\(\s*([+-]?[\d.]+)[\s,]+([+-]?[\d.]+)[\s,]+([+-]?[\d.]+)[\s,]+([+-]?[\d.]+)[\s,]+([+-]?[\d.]+)[\s,]+([+-]?[\d.]+)\s*\)/i)
                if (mMatrix) {
                    const tx = parseFloat(mMatrix[5])
                    const ty = parseFloat(mMatrix[6])
                    return { tx: isNaN(tx) ? 0 : tx, ty: isNaN(ty) ? 0 : ty }
                }

                return { tx: 0, ty: 0 }
            }

            const getSvgXY = (el: Element) => {
                const xAttr = el.getAttribute('x')
                const yAttr = el.getAttribute('y')
                let x = parseFloat(xAttr || '0')
                let y = parseFloat(yAttr || '0')

                // If x/y are missing or 0, many OCR pipelines use transform instead
                const tr = parseTransform(el.getAttribute('transform'))
                const hasExplicitXY = xAttr !== null || yAttr !== null
                if (!hasExplicitXY) {
                    x = tr.tx
                    y = tr.ty
                } else {
                    x += tr.tx
                    y += tr.ty
                }
                return { x, y }
            }

            const parsePointsAttr = (pointsAttr: string) => {
                const pts: { x: number; y: number }[] = []
                const parts = (pointsAttr || '').trim().split(/[\s]+/).filter(Boolean)
                for (const part of parts) {
                    const xy = part.split(',')
                    if (xy.length < 2) continue
                    const px = parseFloat(xy[0])
                    const py = parseFloat(xy[1])
                    if (!isNaN(px) && !isNaN(py)) pts.push({ x: px, y: py })
                }
                return pts
            }

            const addRoomFromSvgPolygon = (polyEl: Element) => {
                const pointsAttr = polyEl.getAttribute('points') || ''
                const rawPts = parsePointsAttr(pointsAttr)
                if (rawPts.length < 3) return

                // Apply simple translation transforms from the polygon itself and its immediate parent (common for grouped rooms)
                const selfTr = parseTransform(polyEl.getAttribute('transform'))
                const parentTr = parseTransform((polyEl.parentElement as any)?.getAttribute?.('transform'))
                const tx = selfTr.tx + parentTr.tx
                const ty = selfTr.ty + parentTr.ty

                const pts = rawPts.map(p => ({
                    x: ((p.x + tx) - offsetX) * pxToM,
                    y: ((p.y + ty) - offsetY) * pxToM,
                }))
                const xs = pts.map(p => p.x)
                const ys = pts.map(p => p.y)
                const minX = Math.min(...xs)
                const maxX = Math.max(...xs)
                const minY = Math.min(...ys)
                const maxY = Math.max(...ys)

                const id = polyEl.getAttribute('id') || uuidv4()
                const name = polyEl.getAttribute('data-name') || polyEl.getAttribute('data-label') || polyEl.getAttribute('id') || `Room ${rooms.length + 1}`
                const existing = state.rooms.find(r => r.id === id)
                rooms.push({
                    id,
                    name,
                    points: pts,
                    color: roomColors[colorIndex % roomColors.length],
                    center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
                    ...(existing ? {
                        textureDataUrl: existing.textureDataUrl,
                        textureTileWidthM: existing.textureTileWidthM,
                        textureTileHeightM: existing.textureTileHeightM,
                    } : {})
                })
                colorIndex++
            }

            // Try different group names for rooms
            const roomGroupNames = ['room', 'rooms', 'floor', 'floors', 'space', 'spaces']
            let roomGroup: Element | null = null
            for (const name of roomGroupNames) {
                roomGroup = doc.getElementById(name)
                if (roomGroup) break
            }

            // Prefer backend geometric rooms if present
            const roomsGeomGroup = doc.getElementById('rooms-geometry')
            const geomPolygons = roomsGeomGroup ? roomsGeomGroup.querySelectorAll('polygon') : null
            console.log('[DEBUG importFromSVG] rooms-geometry group:', roomsGeomGroup ? `found (${geomPolygons?.length} polygons)` : 'NOT FOUND')
            if (roomsGeomGroup && geomPolygons) {
                geomPolygons.forEach(p => addRoomFromSvgPolygon(p))
            }
            console.log('[DEBUG importFromSVG] After geom parse:', rooms.length, 'rooms')

            const hasBackendGeomRooms = rooms.length > 0

            if (roomGroup && !hasBackendGeomRooms) {
                // Look for rect elements as room bounds
                roomGroup.querySelectorAll('rect').forEach(r => {
                    const x = (parseFloat(r.getAttribute('x') || '0') - offsetX) * pxToM
                    const y = (parseFloat(r.getAttribute('y') || '0') - offsetY) * pxToM
                    const w = parseFloat(r.getAttribute('width') || '0') * pxToM
                    const h = parseFloat(r.getAttribute('height') || '0') * pxToM

                    const label = r.getAttribute('data-label') || r.getAttribute('id') || `Room ${rooms.length + 1}`
                    const id = r.getAttribute('id') || uuidv4()
                    const existing = state.rooms.find(r => r.id === id)

                    rooms.push({
                        id,
                        name: label,
                        points: [
                            { x, y },
                            { x: x + w, y },
                            { x: x + w, y: y + h },
                            { x, y: y + h }
                        ],
                        color: roomColors[colorIndex % roomColors.length],
                        center: { x: x + w / 2, y: y + h / 2 },
                        ...(existing ? {
                            textureDataUrl: existing.textureDataUrl,
                            textureTileWidthM: existing.textureTileWidthM,
                            textureTileHeightM: existing.textureTileHeightM,
                        } : {})
                    })
                    colorIndex++
                })

                // Also accept polygon rooms if present (legacy pipeline)
                roomGroup.querySelectorAll('polygon').forEach(p => addRoomFromSvgPolygon(p))
            }

            // Also look for text elements as room labels
            // If room polygons exist, try to assign OCR text as room names via proximity.
            // Otherwise, push to standalone labels array.
            doc.querySelectorAll('text').forEach(textEl => {
                const textContent = textEl.textContent?.trim() || ''
                // Skip dimension numbers (just digits/decimal)
                if (!textContent || textContent.match(/^[\d.]+\s*(m|cm|ft|'|")?$/)) return

                const { x: rawX, y: rawY } = getSvgXY(textEl)
                const textX = (rawX - offsetX) * pxToM
                const textY = (rawY - offsetY) * pxToM

                // Check if this looks like a room name (has letters)
                if (textContent.match(/[a-zA-Z]/)) {
                    // If we have room polygons, try to match this label to the nearest room
                    // and update its name (rooms from geometry often have generic names)
                    let matched = false
                    if (rooms.length > 0) {
                        let bestRoom: typeof rooms[0] | null = null
                        let bestDist = Infinity
                        for (const r of rooms) {
                            const dx = r.center.x - textX
                            const dy = r.center.y - textY
                            const dist = Math.sqrt(dx * dx + dy * dy)
                            if (dist < bestDist) {
                                bestDist = dist
                                bestRoom = r
                            }
                        }
                        // Match if label is within 3m of room center
                        if (bestRoom && bestDist < 3.0) {
                            // Only override generic names (Room 1, geo_room_0, etc.)
                            if (!bestRoom.name || bestRoom.name.startsWith('Room ') || bestRoom.name.startsWith('geo_room')) {
                                bestRoom.name = textContent
                            }
                            matched = true
                        }
                    }

                    // Only add standalone label if it wasn't matched to a room
                    // (matched labels are already displayed as room.name)
                    if (!matched) {
                        labels.push({
                            id: uuidv4(),
                            text: textContent,
                            position: { x: textX, y: textY }
                        })
                    }
                }
            })

            const polygonArea = (pts: { x: number; y: number }[]) => {
                if (pts.length < 3) return 0
                let a = 0
                for (let i = 0; i < pts.length; i++) {
                    const j = (i + 1) % pts.length
                    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y
                }
                return a / 2
            }

            const roomAreaAbs = (r: { points: { x: number; y: number }[] }) => Math.abs(polygonArea(r.points))

            const minRoomArea = 0.5
            let filteredRooms = rooms.filter(r => roomAreaAbs(r) >= minRoomArea)

            filteredRooms.sort((a, b) => roomAreaAbs(b) - roomAreaAbs(a))
            const deduped: typeof filteredRooms = []
            const centerEps = 0.35
            const areaRatioEps = 0.12
            for (const r of filteredRooms) {
                const a = roomAreaAbs(r)
                const isDup = deduped.some(d => {
                    const dx = d.center.x - r.center.x
                    const dy = d.center.y - r.center.y
                    const dist2 = dx * dx + dy * dy
                    if (dist2 > centerEps * centerEps) return false
                    const da = roomAreaAbs(d)
                    const ratio = Math.abs(da - a) / Math.max(da, a, 1e-6)
                    return ratio < areaRatioEps
                })
                if (!isDup) deduped.push(r)
            }

            for (let i = 0; i < deduped.length; i++) {
                if (!deduped[i].name || deduped[i].name.startsWith('Room ')) {
                    deduped[i].name = `Room ${i + 1}`
                }
            }

            rooms.length = 0
            rooms.push(...deduped)

            console.log('[DEBUG importFromSVG] Parsed:', { walls: walls.length, furniture: furniture.length, rooms: rooms.length })

            // Create a single master floor — only when no per-room polygons exist
            if (walls.length > 0 && !hasBackendGeomRooms) {
                let floorMinX = Infinity, floorMinY = Infinity
                let floorMaxX = -Infinity, floorMaxY = -Infinity

                // Include wall endpoints + half-thickness so the floor covers the full wall body
                walls.forEach(w => {
                    const halfT = (w.thickness || 0.15) / 2
                    floorMinX = Math.min(floorMinX, w.start.x - halfT, w.end.x - halfT)
                    floorMaxX = Math.max(floorMaxX, w.start.x + halfT, w.end.x + halfT)
                    floorMinY = Math.min(floorMinY, w.start.y - halfT, w.end.y - halfT)
                    floorMaxY = Math.max(floorMaxY, w.start.y + halfT, w.end.y + halfT)
                })

                // Also include furniture positions so the floor covers everything
                furniture.forEach(f => {
                    if (f.position) {
                        floorMinX = Math.min(floorMinX, f.position.x - 0.5)
                        floorMaxX = Math.max(floorMaxX, f.position.x + 0.5)
                        floorMinY = Math.min(floorMinY, f.position.z - 0.5)
                        floorMaxY = Math.max(floorMaxY, f.position.z + 0.5)
                    }
                })

                // Check if any existing room already covers most of the plan (avoid duplicates)
                const planArea = (floorMaxX - floorMinX) * (floorMaxY - floorMinY)
                const hasLargeFloor = rooms.some(r => roomAreaAbs(r) > planArea * 0.5)

                if (!hasLargeFloor && planArea > 0) {
                    // Guaranteed min 0.5m padding + 10% proportional padding
                    const planW = floorMaxX - floorMinX
                    const planH = floorMaxY - floorMinY
                    const padX = Math.max(0.5, planW * 0.1)
                    const padY = Math.max(0.5, planH * 0.1)
                    rooms.push({
                        id: uuidv4(),
                        name: 'Floor',
                        points: [
                            { x: floorMinX - padX, y: floorMinY - padY },
                            { x: floorMaxX + padX, y: floorMinY - padY },
                            { x: floorMaxX + padX, y: floorMaxY + padY },
                            { x: floorMinX - padX, y: floorMaxY + padY }
                        ],
                        color: '#E8E8E8',
                        center: { x: (floorMinX + floorMaxX) / 2, y: (floorMinY + floorMaxY) / 2 }
                    })
                    console.log('[DEBUG importFromSVG] Added master floor covering all walls + furniture')
                }
            }

            // Auto-fit camera only on FIRST import (not on every poll re-import)
            if (state.walls.length === 0 && walls.length > 0) {
                state.fitViewTrigger = (state.fitViewTrigger || 0) + 1
            }

            state.walls = walls

            // Auto-snap doors/windows to nearest wall after import
            const SNAP_THRESHOLD = 0.5 // meters
            for (const furn of furniture) {
                if (furn.type !== 'door' && furn.type !== 'window') continue
                let bestDist = SNAP_THRESHOLD
                let bestPoint: { x: number; z: number } | null = null
                let bestAngle = 0
                let bestThickness = 0.15
                for (const wall of walls) {
                    const wx = wall.end.x - wall.start.x
                    const wy = wall.end.y - wall.start.y
                    const lenSq = wx * wx + wy * wy
                    if (lenSq < 0.001) continue
                    let t = ((furn.position.x - wall.start.x) * wx + (furn.position.z - wall.start.y) * wy) / lenSq
                    t = Math.max(0, Math.min(1, t))
                    const cx = wall.start.x + t * wx
                    const cz = wall.start.y + t * wy
                    const dx = furn.position.x - cx
                    const dz = furn.position.z - cz
                    const dist = Math.sqrt(dx * dx + dz * dz)
                    if (dist < bestDist) {
                        bestDist = dist
                        bestPoint = { x: cx, z: cz }
                        bestAngle = Math.atan2(wy, wx)
                        bestThickness = wall.thickness || 0.15
                    }
                }
                if (bestPoint) {
                    furn.position.x = bestPoint.x
                    furn.position.z = bestPoint.z
                    furn.rotation.y = bestAngle
                    furn.dimensions.depth = bestThickness
                }
            }

            state.furniture = furniture
            state.labels = labels
            // Prevent "random" floor/room disappearance:
            if (rooms.length > 0 || state.rooms.length === 0) {
                state.rooms = rooms
            }

            // Save history for undo after import
            const snapshot = {
                walls: JSON.parse(JSON.stringify(state.walls)),
                furniture: JSON.parse(JSON.stringify(state.furniture)),
                rooms: JSON.parse(JSON.stringify(state.rooms))
            }
            const hist = (state as any).history || []
            const hidx = (state as any).historyIndex ?? hist.length - 1
            const newHist = [...hist.slice(0, hidx + 1), snapshot].slice(-20)
            ;(state as any).history = newHist
            ;(state as any).historyIndex = newHist.length - 1

            // Start Tutorial Flow if not calibrated.
            // IMPORTANT: Don't force tutorial steps when loading an existing project SVG.
            // New-run tutorial progression is handled by Topbar polling and explicit actions.
            if (!state.isCalibrated && state.tutorialStep === 'none' && walls.length === 0 && rooms.length === 0) {
                state.tutorialStep = 'calibration'
                state.activeTool = 'none'
            }
        }),

        exportToSVG: () => {
            const state = useFloorplanStore.getState()
            const { walls, furniture, calibrationFactor } = state
            // Inverse calibration: Metrics stored in meters. SVG usually in pixels or relative units.
            // importFromSVG used: val_m = (val_px - offset) * pxToM
            // So: val_px = (val_m / pxToM) + offset
            // We'll normalize offset to 0 for simplicity, or keep existing bounds?
            // Safer to just export everything relative to 0,0 or finding bounds.

            // 1. Find Bounds (include wall thickness so rects don't clip the viewBox)
            let minX = Infinity, minY = Infinity
            walls.forEach(w => {
                const halfT = (w.thickness || 0.15) / 2
                minX = Math.min(minX, w.start.x - halfT, w.end.x - halfT)
                minY = Math.min(minY, w.start.y - halfT, w.end.y - halfT)
            })
            furniture.forEach(f => {
                minX = Math.min(minX, f.position.x - f.dimensions.width / 2)
                minY = Math.min(minY, f.position.z - f.dimensions.depth / 2)
            })
            state.rooms.forEach(r => {
                r.points.forEach(p => {
                    minX = Math.min(minX, p.x)
                    minY = Math.min(minY, p.y)
                })
            })
            // If empty, default 0
            if (minX === Infinity) { minX = 0; minY = 0 }

            const padding = 50 // px padding
            let mpp = Number(calibrationFactor)
            if (!isFinite(mpp) || mpp <= 0) mpp = 0.01
            mpp = Math.min(Math.max(mpp, 1e-5), 0.5)
            const pxPerMeter = 1 / mpp

            // Collect all textures from walls and rooms to build <defs>
            const patternDefs = new Set<string>()

            // Calculate SVG Dimensions (include wall thickness)
            let maxX = -Infinity, maxY = -Infinity
            walls.forEach(w => {
                const halfT = (w.thickness || 0.15) / 2
                maxX = Math.max(maxX, w.start.x + halfT, w.end.x + halfT)
                maxY = Math.max(maxY, w.start.y + halfT, w.end.y + halfT)
                // Collect wall textures
                if (w.textureDataUrl && w.textureTileWidthM && w.textureTileHeightM) {
                    const tw = w.textureTileWidthM * pxPerMeter
                    const th = w.textureTileHeightM * pxPerMeter
                    patternDefs.add(
                        `<pattern id="tex_${w.id}" patternUnits="userSpaceOnUse" x="0" y="0" width="${tw}" height="${th}"><image href="${w.textureDataUrl}" x="0" y="0" width="${tw}" height="${th}" preserveAspectRatio="none" /></pattern>`
                    )
                }
            })
            furniture.forEach(f => {
                maxX = Math.max(maxX, f.position.x + f.dimensions.width / 2)
                maxY = Math.max(maxY, f.position.z + f.dimensions.depth / 2)
            })
            state.rooms.forEach(r => {
                r.points.forEach(p => {
                    maxX = Math.max(maxX, p.x)
                    maxY = Math.max(maxY, p.y)
                })
                // Collect room textures
                if (r.textureDataUrl && r.textureTileWidthM && r.textureTileHeightM) {
                    const tw = r.textureTileWidthM * pxPerMeter
                    const th = r.textureTileHeightM * pxPerMeter
                    patternDefs.add(
                        `<pattern id="tex_${r.id}" patternUnits="userSpaceOnUse" x="0" y="0" width="${tw}" height="${th}"><image href="${r.textureDataUrl}" x="0" y="0" width="${tw}" height="${th}" preserveAspectRatio="none" /></pattern>`
                    )
                }
            })
            if (maxX === -Infinity) { maxX = 10; maxY = 10 }

            let width: number, height: number;
            let toPxX: (val: number) => number;
            let toPxY: (val: number) => number;

            if (state.imageDimensions) {
                width = state.imageDimensions.width;
                height = state.imageDimensions.height;
                const centerX = width / 2;
                const centerY = height / 2;
                toPxX = (val: number) => (val * pxPerMeter) + centerX;
                toPxY = (val: number) => (val * pxPerMeter) + centerY;
            } else {
                width = (maxX - minX) * pxPerMeter + padding * 2;
                height = (maxY - minY) * pxPerMeter + padding * 2;
                toPxX = (val: number) => (val - minX) * pxPerMeter + padding;
                toPxY = (val: number) => (val - minY) * pxPerMeter + padding;
            }

            let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`

            // Insert collected definitions
            if (patternDefs.size > 0) {
                svg += `  <defs>\n`
                patternDefs.forEach(def => {
                    svg += `    ${def}\n`
                })
                svg += `  </defs>\n`
            }

            // A. Base/Background (Optional, backend adds it usually, but let's be clean)
            // Backend master.py adds base. We only need the items.
            // Actually, master.py expects walls/doors/windows to generate base.
            // We should just output the groups.

            // B. Walls
            svg += `  <g id="wall">\n`
            walls.forEach(w => {
                // Determine Rect from Line
                // Horizontal vs Vertical
                const dx = w.end.x - w.start.x
                const dy = w.end.y - w.start.y
                let rx, ry, rw, rh

                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal
                    rx = Math.min(w.start.x, w.end.x)
                    ry = w.start.y - w.thickness / 2
                    rw = Math.abs(dx)
                    rh = w.thickness
                } else {
                    // Vertical
                    rx = w.start.x - w.thickness / 2
                    ry = Math.min(w.start.y, w.end.y)
                    rw = w.thickness
                    rh = Math.abs(dy)
                }

                // Check for texture fill
                const fillStyle = w.textureDataUrl ? `url(#tex_${w.id})` : "#222222"

                svg += `    <rect id="${w.id}" x="${toPxX(rx)}" y="${toPxY(ry)}" width="${rw * pxPerMeter}" height="${rh * pxPerMeter}" fill="${fillStyle}" />\n`
            })
            svg += `  </g>\n`

            // C. Doors / Windows — preserve rotation by swapping width/depth for rotated items
            const exportOpening = (d: FurnItem) => {
                const isRotated = Math.abs(d.rotation.y) > 0.1 // ~6 degrees threshold
                // For rotated (vertical) openings: swap width/depth in SVG so the rect matches the 2D layout
                const svgW = isRotated ? d.dimensions.depth : d.dimensions.width
                const svgH = isRotated ? d.dimensions.width : d.dimensions.depth
                const rx = d.position.x - svgW / 2
                const rz = d.position.z - svgH / 2
                const rotAttr = ` data-rotation="${d.rotation.y.toFixed(4)}"`
                return { rx, rz, svgW, svgH, rotAttr }
            }

            const doors = furniture.filter(f => f.type === 'door')
            if (doors.length > 0) {
                svg += `  <g id="door">\n`
                doors.forEach(d => {
                    const { rx, rz, svgW, svgH, rotAttr } = exportOpening(d)
                    svg += `    <rect id="${d.id}" x="${toPxX(rx)}" y="${toPxY(rz)}" width="${svgW * pxPerMeter}" height="${svgH * pxPerMeter}" fill="#8B4513"${rotAttr} />\n`
                })
                svg += `  </g>\n`
            }

            const windows = furniture.filter(f => f.type === 'window')
            if (windows.length > 0) {
                svg += `  <g id="window">\n`
                windows.forEach(d => {
                    const { rx, rz, svgW, svgH, rotAttr } = exportOpening(d)
                    svg += `    <rect id="${d.id}" x="${toPxX(rx)}" y="${toPxY(rz)}" width="${svgW * pxPerMeter}" height="${svgH * pxPerMeter}" fill="#0000FF"${rotAttr} />\n`
                })
                svg += `  </g>\n`
            }

            // D. Imported model placemarks (for mapping in backend/Blender)
            const imported = furniture.filter(f => f.type === 'imported' && f.modelUrl)
            if (imported.length > 0) {
                svg += `  <g id="imported-models" opacity="0.95">\n`
                imported.forEach(it => {
                    const isRotated = Math.abs(it.rotation.y) > 0.1
                    const svgW = isRotated ? it.dimensions.depth : it.dimensions.width
                    const svgH = isRotated ? it.dimensions.width : it.dimensions.depth
                    const rx = it.position.x - svgW / 2
                    const rz = it.position.z - svgH / 2
                    const rotAttr = ` data-rotation="${it.rotation.y.toFixed(4)}"`
                    const safeRel = String(it.modelUrl || '').replace(/"/g, '')
                    const safeName = String(it.label || '').replace(/"/g, '')
                    
                    svg += `    <rect id="imported_${it.id}" x="${toPxX(rx)}" y="${toPxY(rz)}" width="${svgW * pxPerMeter}" height="${svgH * pxPerMeter}" fill="#00ffff" data-rel-path="${safeRel}" data-name="${safeName}"${rotAttr} />\n`
                })
                svg += `  </g>\n`
            }

            // E. Rooms (export so backend can target floors by id for texturize)
            if (state.rooms.length > 0) {
                svg += `  <g id="rooms-geometry" opacity="0.35">\n`
                state.rooms.forEach(r => {
                    const pts = r.points
                        .map(p => `${toPxX(p.x)},${toPxY(p.y)}`)
                        .join(' ')
                    const safeName = String(r.name || '').replace(/"/g, '')
                    svg += `    <polygon id="${r.id}" points="${pts}" fill="${r.color || '#e2e8f0'}" stroke="none" data-name="${safeName}" />\n`
                })
                svg += `  </g>\n`
            }

            svg += `</svg>`
            return svg
        },

        generateFloors: async () => {
            set((state) => {
                // simple base floor generation: bounding box + padding
                if (state.walls.length === 0) return

                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
                state.walls.forEach(w => {
                    minX = Math.min(minX, w.start.x, w.end.x)
                    minY = Math.min(minY, w.start.y, w.end.y)
                    maxX = Math.max(maxX, w.start.x, w.end.x)
                    maxY = Math.max(maxY, w.start.y, w.end.y)
                })

                // Add 20% padding
                const width = maxX - minX
                const height = maxY - minY
                const padX = width * 0.2
                const padY = height * 0.2

                // Define a single large rectangular room
                const baseRoom: Room = {
                    id: uuidv4(),
                    name: 'Base Floor',
                    points: [
                        { x: minX - padX, y: minY - padY },
                        { x: maxX + padX, y: minY - padY },
                        { x: maxX + padX, y: maxY + padY },
                        { x: minX - padX, y: maxY + padY }
                    ],
                    color: '#e2e8f0', // Neutral floor color
                    center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
                }

                state.rooms = [baseRoom]
                console.log("Generated Base Floor:", baseRoom)

                if (state.tutorialStep === 'correction') {
                    state.tutorialStep = 'floor_review'
                }
            })
        },

        handleDrop: (type: string, x: number, y: number) => set((state) => {
            state.pendingDrop = { type, x, y }
        }),

        // Undo/Redo/Clipboard implementations
        saveHistory: () => set((state) => {
            // For simplicity, we only store last 20 states
            const snapshot = {
                walls: JSON.parse(JSON.stringify(state.walls)),
                furniture: JSON.parse(JSON.stringify(state.furniture)),
                rooms: JSON.parse(JSON.stringify(state.rooms))
            }
            // Truncate future history if we're in the middle of undo stack
            const newHistory = [...(state as any).history?.slice(0, (state as any).historyIndex + 1) || [], snapshot].slice(-20)
                ; (state as any).history = newHistory
                ; (state as any).historyIndex = newHistory.length - 1
        }),

        undo: () => set((state) => {
            const history = (state as any).history || []
            const idx = (state as any).historyIndex ?? history.length - 1
            if (idx > 0) {
                const prev = history[idx - 1]
                state.walls = JSON.parse(JSON.stringify(prev.walls))
                state.furniture = JSON.parse(JSON.stringify(prev.furniture))
                state.rooms = JSON.parse(JSON.stringify(prev.rooms))
                    ; (state as any).historyIndex = idx - 1
            }
        }),

        redo: () => set((state) => {
            const history = (state as any).history || []
            const idx = (state as any).historyIndex ?? history.length - 1
            if (idx < history.length - 1) {
                const next = history[idx + 1]
                state.walls = JSON.parse(JSON.stringify(next.walls))
                state.furniture = JSON.parse(JSON.stringify(next.furniture))
                state.rooms = JSON.parse(JSON.stringify(next.rooms))
                    ; (state as any).historyIndex = idx + 1
            }
        }),

        copyObject: () => set((state) => {
            if (!state.selectedId) return
            const wall = state.walls.find(w => w.id === state.selectedId)
            if (wall) {
                ; (state as any).clipboard = { type: 'wall', data: JSON.parse(JSON.stringify(wall)) }
                return
            }
            const furn = state.furniture.find(f => f.id === state.selectedId)
            if (furn) {
                ; (state as any).clipboard = { type: 'furniture', data: JSON.parse(JSON.stringify(furn)) }
            }
        }),

        pasteObject: () => set((state) => {
            const clipboard = (state as any).clipboard
            if (!clipboard) return
            if (clipboard.type === 'wall') {
                const newWall = { ...clipboard.data, id: uuidv4() }
                newWall.start = { x: newWall.start.x + 0.5, y: newWall.start.y + 0.5 }
                newWall.end = { x: newWall.end.x + 0.5, y: newWall.end.y + 0.5 }
                state.walls.push(newWall)
                state.selectedId = newWall.id
            } else if (clipboard.type === 'furniture') {
                const newFurn = { ...clipboard.data, id: uuidv4() }
                newFurn.position = { ...newFurn.position, x: newFurn.position.x + 0.5, z: newFurn.position.z + 0.5 }
                state.furniture.push(newFurn)
                state.selectedId = newFurn.id
            }
        }),

        consumeDrop: () => set((state) => {
            state.pendingDrop = null
        }),

        showToast: (message: string, type: 'error' | 'info' | 'success' = 'info') => {
            set((state) => {
                state.toast = { message, type }
            })
            // Auto dismiss
            setTimeout(() => {
                set((state) => {
                    if (state.toast?.message === message) {
                        state.toast = null
                    }
                })
            }, 3000)
        }

    }))
)
