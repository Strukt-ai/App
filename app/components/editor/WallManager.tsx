'use client'

import { useFloorplanStore } from '@/store/floorplanStore'
import type { Wall } from '@/store/floorplanStore'
import { memo, useCallback, useEffect, useMemo, useState, Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { BoxGeometry, CylinderGeometry, DoubleSide, MeshStandardMaterial, RepeatWrapping, Texture } from 'three'
import { Geometry, Base, Subtraction } from '@react-three/csg'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

// Per-wall error boundary so one broken wall doesn't crash ALL walls
class WallErrorBoundary extends Component<{ children?: ReactNode, wallId: string }, { hasError: boolean }> {
    state = { hasError: false }
    static getDerivedStateFromError() { return { hasError: true } }
    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error(`[WallErrorBoundary] Wall "${this.props.wallId}" crashed:`, error, info)
    }
    render() {
        if (this.state.hasError) return null
        return this.props.children
    }
}

const _EMPTY_TEX_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO4G8m8AAAAASUVORK5CYII='

// Static Geometries to prevent memory leaks/GC thrashing during rapid updates
const wallGeometry = new BoxGeometry(1, 1, 1)
const selectionGeometry = new BoxGeometry(1.002, 1.002, 1.002)
// Rounded, disc-like handles for a cleaner look (end handles slightly larger)
const endHandleGeometry = new CylinderGeometry(0.24, 0.24, 0.16, 24)

const wireframeMaterial = new MeshStandardMaterial({
    color: 0xffffff,
    wireframe: true
})
// Canva-like handles: light, slightly glowing discs with soft material
const handleMaterial = new MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.05,
    emissive: 0x7dd3fc,
    emissiveIntensity: 0.35
})

// Helper to check if a point projects onto a line segment
function projectPointOntoLine(p: { x: number, y: number }, start: { x: number, y: number }, end: { x: number, y: number }) {
    const dx = end.x - start.x
    const dy = end.y - start.y
    const len2 = dx * dx + dy * dy
    if (len2 === 0) return 0 // Degenerate line
    const t = ((p.x - start.x) * dx + (p.y - start.y) * dy) / len2
    return t // Unclamped for better detection logic
}

const WallItem = memo(function WallItem({
    wall,
    isSelected,
    is2D,
    furniture, // Passed from Manager
    onPointerDown,
    onWheel,
    isPreview = false
}: {
    wall: Wall,
    isSelected: boolean,
    is2D: boolean,
    furniture: any[],
    onPointerDown?: (e: any, id: string, type: 'body' | 'start' | 'end') => void
    onWheel?: (e: any, id: string) => void
    isPreview?: boolean
}) {
    // Track CSG failure so we can fall back to simple box
    const [csgFailed, setCsgFailed] = useState(false)

    // Dynamic scale for handles (Calibration fixes huge handles)
    const calibrationFactor = useFloorplanStore(s => s.calibrationFactor)
    const handleScale = Math.max(0.1, Math.min(1.0, calibrationFactor * 10))

    // Calculate geometry basics
    const dx = wall.end.x - wall.start.x
    const dy = wall.end.y - wall.start.y
    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)
    const centerX = (wall.start.x + wall.end.x) / 2
    const centerY = (wall.start.y + wall.end.y) / 2

    // Log wall geometry in 3D mode for debugging
    useEffect(() => {
        if (!is2D) {
            console.log(`[WallItem 3D] id=${wall.id} len=${length.toFixed(3)} center=(${centerX.toFixed(2)},${centerY.toFixed(2)}) angle=${(angle * 180 / Math.PI).toFixed(1)}° thickness=${wall.thickness} height=${wall.height} openings=${0}`)
        }
    }, [is2D, wall.id, length, centerX, centerY, angle, wall.thickness, wall.height])

    const textureUrl = wall.textureDataUrl
    const texture = useLoader(TextureLoader, textureUrl || _EMPTY_TEX_DATA_URL) as Texture
    const wallLen = useMemo(() => Math.max(0.0001, length), [length])
    const wallH = useMemo(() => Math.max(0.0001, wall.height || 2.5), [wall.height])

    useEffect(() => {
        if (!textureUrl) return
        const tw = Number(wall.textureTileWidthM || 0)
        const th = Number(wall.textureTileHeightM || 0)
        if (!(tw > 0) || !(th > 0)) return

        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        // Map U along wall length, V along wall height
        texture.repeat.set(wallLen / tw, wallH / th)
        texture.needsUpdate = true
    }, [textureUrl, wall.textureTileWidthM, wall.textureTileHeightM, wallLen, wallH, texture])

    // Detect openings (Windows/Doors) that intersect this wall
    // 1. Filter furniture that is strictly ON the wall or very close.
    // 2. Sort them by position along the wall.
    // 3. Generate wall segments around them.

    // Using simple distance threshold to associate window with wall
    const openings = furniture.filter(f => {
        if (f.type !== 'window' && f.type !== 'door') return false

        // Check distance to wall line
        // Line equation: Ax + By + C = 0
        // A = -dy, B = dx, C = dy*start.x - dx*start.y
        const A = -dy
        const B = dx
        const C = dy * wall.start.x - dx * wall.start.y
        const dist = Math.abs(A * f.position.x + B * f.position.z + C) / Math.sqrt(A * A + B * B)

        // Also check if it projects ONTO the segment (t between 0 and 1)
        const t = projectPointOntoLine({ x: f.position.x, y: f.position.z }, wall.start, wall.end)

        // Threshold: 0.5m dist. t check relaxed to -0.1 to 1.1 to catch corner windows.
        return dist < 0.5 && t > -0.1 && t < 1.1
    }).map(f => {
        // Calculate 't' (0 to 1) position along the wall
        const t = projectPointOntoLine({ x: f.position.x, y: f.position.z }, wall.start, wall.end)

        // Calculate width in 't' units
        // f.dimensions.width is in meters. wall length is in meters.
        // widthT = (width / length)
        const widthT = f.dimensions.width / length
        // Default height logic if missing/zero to prevents solid walls
        const height = f.dimensions.height || (f.type === 'door' ? 2.1 : 1.2)
        const yBottom = f.position.y || 0

        return {
            id: f.id,
            tCenter: t,
            tStart: Math.max(0, t - widthT / 2),
            tEnd: Math.min(1, t + widthT / 2),
            yBottom: yBottom,
            height: height,
            type: f.type
        }
    }).sort((a, b) => a.tStart - b.tStart)

    // Create wall material with DoubleSide GUARANTEED at Three.js object level
    const wallMaterial = useMemo(() => {
        if (isPreview) {
            return new MeshStandardMaterial({
                color: 0x9ca3af,
                transparent: true,
                opacity: 0.4,
                side: DoubleSide,
                depthWrite: false
            })
        }
        const mat = new MeshStandardMaterial({
            color: isSelected ? 0x3b82f6 : (wall.color || 0xd4d4d4),
            roughness: isSelected ? 0.6 : 1.0,
            metalness: isSelected ? 0.1 : 0.0,
            emissive: isSelected ? 0x1a365d : 0x000000,
            emissiveIntensity: isSelected ? 0.2 : 0,
            side: DoubleSide,
            depthTest: true,
            depthWrite: true,
            // Prevent z-fighting where angled walls meet or overlap
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1,
        })
        if (textureUrl) {
            mat.map = texture
            mat.color.set(isSelected ? 0x3b82f6 : 0xffffff)
            mat.roughness = 0.98
            mat.metalness = 0.0
        }
        return mat
    }, [isSelected, isPreview, textureUrl, wall.color, texture])


    // Simple block renderer (used for 2D, no-openings, or CSG fallback)
    const renderSimpleBlock = () => (
        <group>
            <mesh
                name={isPreview ? "WallPreview" : "Wall"}
                position={[centerX, wall.height / 2, centerY]}
                rotation={[0, -angle, 0]}
                scale={[Math.max(length, 0.01), wall.height, wall.thickness]}
                onPointerDown={onPointerDown ? (e) => onPointerDown(e, wall.id, 'body') : undefined}
                onClick={(e) => {
                    if (!isPreview) e.stopPropagation()
                }}
                onWheel={onWheel ? (e) => onWheel(e, wall.id) : undefined}
                geometry={wallGeometry}
                material={wallMaterial}
                castShadow={!isPreview}
                receiveShadow={!isPreview}
                renderOrder={isPreview ? 1 : 10}
                frustumCulled={false}
            >
                {isSelected && !isPreview && (
                    <mesh geometry={selectionGeometry} material={wireframeMaterial} />
                )}
            </mesh>
            {/* Handles */}
            {is2D && isSelected && !isPreview && onPointerDown && (
                <>
                    <mesh position={[wall.start.x, 2.7, wall.start.y]} rotation={[-Math.PI / 2, 0, 0]} scale={[handleScale, handleScale, handleScale]} onPointerDown={(e) => onPointerDown(e, wall.id, 'start')} onClick={(e) => e.stopPropagation()} geometry={endHandleGeometry} material={handleMaterial} />
                    <mesh position={[wall.end.x, 2.7, wall.end.y]} rotation={[-Math.PI / 2, 0, 0]} scale={[handleScale, handleScale, handleScale]} onPointerDown={(e) => onPointerDown(e, wall.id, 'end')} onClick={(e) => e.stopPropagation()} geometry={endHandleGeometry} material={handleMaterial} />
                </>
            )}
        </group>
    )

    // If 2D mode, no openings, or CSG previously failed → simple block
    if (is2D || openings.length === 0 || csgFailed) {
        return renderSimpleBlock()
    }

    // 3D MODE WITH CUTOUTS
    // Uses Constructive Solid Geometry (CSG) for perfect boolean holes 
    // This allows single unified UV maps across the wall and prevents Z-fighting
    // Wrapped in try-catch: if CSG fails, we fall back to simple block automatically
    try {
        return (
            <group>
                <mesh
                    name={isPreview ? "WallPreview" : "Wall"}
                    position={[centerX, wall.height / 2, centerY]}
                    rotation={[0, -angle, 0]}
                    onPointerDown={onPointerDown ? (e) => onPointerDown(e, wall.id, 'body') : undefined}
                    onClick={(e) => {
                        if (!isPreview) e.stopPropagation()
                    }}
                    onWheel={onWheel ? (e) => onWheel(e, wall.id) : undefined}
                    castShadow={!isPreview}
                    receiveShadow={!isPreview}
                    renderOrder={isPreview ? 1 : 10}
                    frustumCulled={false}
                >
                    <Geometry useGroups>
                        <Base scale={[Math.max(length, 0.01), wall.height, wall.thickness]} geometry={wallGeometry} material={wallMaterial} />
                        {openings.map((op) => {
                            const opLen = (op.tEnd - op.tStart) * length
                            const opCenterT = (op.tStart + op.tEnd) / 2
                            const localX = (opCenterT - 0.5) * length
                            const localY = (op.yBottom + op.height / 2) - (wall.height / 2)

                            return (
                                <Subtraction key={`cut-${op.id}`} position={[localX, localY, 0]} scale={[opLen, op.height, wall.thickness + 0.2]} geometry={wallGeometry} material={wallMaterial} />
                            )
                        })}
                    </Geometry>

                    <primitive object={wallMaterial} attach="material" />
                </mesh>

                {/* End Handles (mostly active in 2D or edge cases where they trigger) */}
                {is2D && isSelected && !isPreview && onPointerDown && (
                    <>
                        <mesh position={[wall.start.x, 2.7, wall.start.y]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={(e) => onPointerDown(e, wall.id, 'start')} onClick={(e) => e.stopPropagation()} geometry={endHandleGeometry} material={handleMaterial} />
                        <mesh position={[wall.end.x, 2.7, wall.end.y]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={(e) => onPointerDown(e, wall.id, 'end')} onClick={(e) => e.stopPropagation()} geometry={endHandleGeometry} material={handleMaterial} />
                    </>
                )}
            </group>
        )
    } catch (e) {
        console.error(`[WallItem] CSG crashed for wall ${wall.id}, falling back to simple block:`, e)
        setCsgFailed(true)
        return renderSimpleBlock()
    }

})

export function WallManager() {
    const walls = useFloorplanStore(s => s.walls)
    const furniture = useFloorplanStore(s => s.furniture) // Fetch furniture
    const selectedId = useFloorplanStore(s => s.selectedId)
    const selectObject = useFloorplanStore(s => s.selectObject)
    const mode = useFloorplanStore(s => s.mode)
    const activeTool = useFloorplanStore(s => s.activeTool)
    const startInteraction = useFloorplanStore(s => s.startInteraction)
    const updateWall = useFloorplanStore(s => s.updateWall)
    const joinPreviewWalls = useFloorplanStore(s => s.joinPreviewWalls)

    useEffect(() => {
        console.log(`[DEBUG WallManager] mode=${mode} Rendering ${walls.length} walls`)
        if (mode === '3d') {
            walls.forEach(w => {
                const dx = w.end.x - w.start.x
                const dy = w.end.y - w.start.y
                const len = Math.sqrt(dx * dx + dy * dy)
                console.log(`  [Wall] ${w.id}: start=(${w.start.x.toFixed(2)},${w.start.y.toFixed(2)}) end=(${w.end.x.toFixed(2)},${w.end.y.toFixed(2)}) len=${len.toFixed(3)} h=${w.height} t=${w.thickness.toFixed(3)}`)
            })
        }
    }, [walls.length, mode])

    const handlePointerDown = useCallback((e: any, id: string, type: 'body' | 'start' | 'end') => {
        e.stopPropagation()

        if (useFloorplanStore.getState().joinMode) {
            let clickedPoint = undefined;
            if (e.point && !isNaN(e.point.x) && !isNaN(e.point.z)) {
                clickedPoint = { x: e.point.x, y: e.point.z };
            }
            useFloorplanStore.getState().setJoinTargetId(id, clickedPoint)
            return
        }

        if (e.button !== 0) return

        selectObject(id)
        if (mode !== '2d') return

        // Handle based on active tool
        // NaN guard: prevent corrupt positions from propagating into the store
        if (!e.point || isNaN(e.point.x) || isNaN(e.point.z)) return

        if (activeTool === 'resize' || type !== 'body') {
            // Resize tool or clicking on handles
            startInteraction('resizing', id, { x: e.point.x, y: e.point.z }, type === 'body' ? 'end' : type as any)
        } else if (activeTool === 'rotate') {
            // User prefers move instead of rotate; treat rotate tool like move/drag
            startInteraction('dragging', id, { x: e.point.x, y: e.point.z })
        } else if (activeTool === 'label') {
            // Just select; label editing happens in the floating menu UI
            selectObject(id)
        } else {
            // Default: move/drag
            startInteraction('dragging', id, { x: e.point.x, y: e.point.z })
        }
    }, [mode, activeTool, selectObject, startInteraction])

    const handleWheel = useCallback((e: any, id: string) => {
        if (mode !== '2d' || activeTool !== 'resize') return
        e.stopPropagation()
        e.preventDefault()
        // const wall = walls.find(w => w.id === id) // Removed to avoid dependency on walls list inside callback heavily
        // Actually we need the wall object. But since we are memoizing, it is better to pass update function logic.
        // Let's rely on finding it in the store actions or parent.
        // For now, finding in 'walls' is fine if walls updates trigger re-render anyway.
        const wall = walls.find(w => w.id === id)
        if (!wall) return
        const delta = -e.deltaY * 0.0015 // scroll up to decrease, down to increase
        const next = Math.min(2, Math.max(0.05, wall.thickness + delta))
        if (next !== wall.thickness) {
            updateWall(id, { thickness: next })
        }
    }, [mode, activeTool, walls, updateWall])

    return (
        <group>
            {walls.map((wall) => (
                <WallErrorBoundary key={`eb-${wall.id}`} wallId={wall.id}>
                    <WallItem
                        key={wall.id}
                        wall={wall}
                        isSelected={selectedId === wall.id}
                        is2D={mode === '2d'}
                        furniture={furniture}
                        onPointerDown={handlePointerDown}
                        onWheel={handleWheel}
                    />
                </WallErrorBoundary>
            ))}
            {joinPreviewWalls && joinPreviewWalls.map((wall, idx) => (
                <WallErrorBoundary key={`eb-preview-${wall.id}-${idx}`} wallId={`preview-${wall.id}`}>
                    <WallItem
                        key={`preview-${wall.id}-${idx}`}
                        wall={wall}
                        isSelected={false}
                        is2D={mode === '2d'}
                        furniture={[]}
                        isPreview={true}
                    />
                </WallErrorBoundary>
            ))}
        </group>
    )
}
