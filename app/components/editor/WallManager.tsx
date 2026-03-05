'use client'

import { useFloorplanStore } from '@/store/floorplanStore'
import type { Wall } from '@/store/floorplanStore'
import { memo, useCallback, startTransition, useEffect, useMemo } from 'react'
import { BoxGeometry, CylinderGeometry, MeshStandardMaterial, RepeatWrapping, Texture } from 'three'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

const _EMPTY_TEX_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO4G8m8AAAAASUVORK5CYII='

// Static Geometries to prevent memory leaks/GC thrashing during rapid updates
const wallGeometry = new BoxGeometry(1, 1, 1)
const selectionGeometry = new BoxGeometry(1.002, 1.002, 1.002)
// Rounded, disc-like handles for a cleaner look (end handles slightly larger)
const endHandleGeometry = new CylinderGeometry(0.24, 0.24, 0.16, 24)
const sideHandleGeometry = new CylinderGeometry(0.2, 0.2, 0.14, 20)

// Static Materials - Using StandardMaterial for realistic lighting
// Walls respond to scene lighting for proper 3D appearance
const regularMaterial = new MeshStandardMaterial({
    color: 0xf2f2f0,
    roughness: 0.98,
    metalness: 0.0
})
const selectedMaterial = new MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.6,
    metalness: 0.1,
    emissive: 0x1a365d,
    emissiveIntensity: 0.2
})
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
const sideHandleMaterial = new MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.3,
    metalness: 0.08,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.25
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
    onSideHandleDown
}: {
    wall: Wall,
    isSelected: boolean,
    is2D: boolean,
    furniture: any[],
    onPointerDown: (e: any, id: string, type: 'body' | 'start' | 'end') => void
    onWheel: (e: any, id: string) => void
    onSideHandleDown: (e: any, id: string) => void
}) {
    // Calculate geometry basics
    const dx = wall.end.x - wall.start.x
    const dy = wall.end.y - wall.start.y
    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)
    const centerX = (wall.start.x + wall.end.x) / 2
    const centerY = (wall.start.y + wall.end.y) / 2

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


    // DEBUG: If NO openings or 2D mode, render simple block
    if (is2D || openings.length === 0) {
        return (
            <group>
                <mesh
                    name="Wall"
                    position={[centerX, wall.height / 2, centerY]}
                    rotation={[0, -angle, 0]}
                    scale={[Math.max(length, 0.01), wall.height, wall.thickness]}
                    onPointerDown={(e) => onPointerDown(e, wall.id, 'body')}
                    onWheel={(e) => onWheel(e, wall.id)}
                    geometry={wallGeometry}
                    castShadow
                    receiveShadow
                >
                    {textureUrl ? (
                        <meshStandardMaterial
                            map={texture}
                            color={isSelected ? 0x3b82f6 : 0xffffff}
                            roughness={0.98}
                            metalness={0.0}
                        />
                    ) : (
                        <meshStandardMaterial
                            color={isSelected ? 0x3b82f6 : (wall.color || 0xffffff)}
                            roughness={isSelected ? 0.6 : 1.0}
                            metalness={isSelected ? 0.1 : 0.0}
                            emissive={isSelected ? 0x1a365d : 0x000000}
                            emissiveIntensity={isSelected ? 0.2 : 0}
                        />
                    )}
                    {isSelected && (
                        <mesh geometry={selectionGeometry} material={wireframeMaterial} />
                    )}
                </mesh>
                {/* Handles omitted for brevity in replacement, assumed consistent with is2D logic */}
                {is2D && isSelected && (
                    <>
                        <mesh position={[wall.start.x, 2.7, wall.start.y]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={(e) => onPointerDown(e, wall.id, 'start')} geometry={endHandleGeometry} material={handleMaterial} />
                        <mesh position={[wall.end.x, 2.7, wall.end.y]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={(e) => onPointerDown(e, wall.id, 'end')} geometry={endHandleGeometry} material={handleMaterial} />
                    </>
                )}
            </group>
        )
    }

    // 3D MODE WITH CUTOUTS
    // console.log(`[WallManager] Rendering Multi-Segment Wall ${wall.id} with ${openings.length} openings`)
    // We construct segments.
    // Start at t=0. Iterate openings.
    // 1. Solid segment from currentT to opening.tStart
    // 2. Header segment (above opening) from opening.tStart to opening.tEnd
    // 3. Sill segment (below opening) from opening.tStart to opening.tEnd
    // 4. Update currentT = opening.tEnd
    // 5. Final solid segment from currentT to 1.0

    const segments = []

    // 1. Calculate Unified Holes (Boolean Union of all openings)
    // Sort by start time (already sorted above)
    const unifiedHoles: { start: number, end: number }[] = []
    if (openings.length > 0) {
        let currentHole = { start: openings[0].tStart, end: openings[0].tEnd }

        for (let i = 1; i < openings.length; i++) {
            const op = openings[i]
            if (op.tStart < currentHole.end) {
                // Overlap: Merge
                currentHole.end = Math.max(currentHole.end, op.tEnd)
            } else {
                // No overlap: Push current, start new
                unifiedHoles.push(currentHole)
                currentHole = { start: op.tStart, end: op.tEnd }
            }
        }
        unifiedHoles.push(currentHole)
    }

    // 2. Invert Holes to find Solid Wall Segments
    // solidIntervals = [0, 1] - unifiedHoles
    let currentT = 0
    unifiedHoles.forEach(hole => {
        // Solid wall before this hole
        if (hole.start > currentT) {
            const segStart = currentT
            const segEnd = hole.start
            const segLen = (segEnd - segStart) * length

            if (segLen > 0.01) {
                const segCenterT = (segStart + segEnd) / 2
                const lx = wall.start.x + dx * segCenterT
                const ly = wall.start.y + dy * segCenterT

                // console.log(`[WallManager] SOLID: ${segStart.toFixed(3)} -> ${segEnd.toFixed(3)} (T)`)

                segments.push(
                    <mesh
                        key={`solid-${segStart.toFixed(3)}-${hole.end.toFixed(3)}-${Math.random().toString(36).substr(2, 5)}`}
                        position={[lx, wall.height / 2, ly]}
                        rotation={[0, -angle, 0]}
                        scale={[segLen, wall.height, wall.thickness]}
                        geometry={wallGeometry}
                        material={isSelected ? selectedMaterial : regularMaterial}
                        castShadow receiveShadow
                        onPointerDown={(e) => onPointerDown(e, wall.id, 'body')}
                    />
                )
            }
        }
        currentT = Math.max(currentT, hole.end)
    })

    // Final Solid Segment (after last hole)
    if (currentT < 1) {
        const segLen = (1 - currentT) * length
        if (segLen > 0.01) {
            const segCenterT = (currentT + 1) / 2
            const lx = wall.start.x + dx * segCenterT
            const ly = wall.start.y + dy * segCenterT

            segments.push(
                <mesh
                    key={`solid-end-${currentT.toFixed(3)}-${Math.random().toString(36).substr(2, 5)}`}
                    position={[lx, wall.height / 2, ly]}
                    rotation={[0, -angle, 0]}
                    scale={[segLen, wall.height, wall.thickness]}
                    geometry={wallGeometry}
                    material={isSelected ? selectedMaterial : regularMaterial}
                    castShadow receiveShadow
                    onPointerDown={(e) => onPointerDown(e, wall.id, 'body')}
                />
            )
        }
    }

    // 3. Render Headers and Sills for ALL openings (independent of solids)
    openings.forEach(op => {
        const opLen = (op.tEnd - op.tStart) * length
        const opCenterT = (op.tStart + op.tEnd) / 2
        const lx = wall.start.x + dx * opCenterT
        const ly = wall.start.y + dy * opCenterT

        // Header (Above opening)
        const headerH = wall.height - (op.yBottom + op.height)
        if (headerH > 0.01) {
            segments.push(
                <mesh
                    key={`header-${op.id}`}
                    position={[lx, (op.yBottom + op.height) + headerH / 2, ly]}
                    rotation={[0, -angle, 0]}
                    scale={[opLen, headerH, wall.thickness]}
                    geometry={wallGeometry}
                    material={isSelected ? selectedMaterial : regularMaterial}
                    castShadow receiveShadow
                    onPointerDown={(e) => onPointerDown(e, wall.id, 'body')}
                />
            )
        }

        // Sill (Below opening)
        const sillH = op.yBottom
        if (sillH > 0.01) {
            segments.push(
                <mesh
                    key={`sill-${op.id}`}
                    position={[lx, sillH / 2, ly]}
                    rotation={[0, -angle, 0]}
                    scale={[opLen, sillH, wall.thickness]}
                    geometry={wallGeometry}
                    material={isSelected ? selectedMaterial : regularMaterial}
                    castShadow receiveShadow
                    onPointerDown={(e) => onPointerDown(e, wall.id, 'body')}
                />
            )
        }
    })

    return (
        <group>
            {segments}
        </group>
    )

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

    const handlePointerDown = useCallback((e: any, id: string, type: 'body' | 'start' | 'end') => {
        if (mode !== '2d') return
        if (e.button !== 0) return
        e.stopPropagation()

        // Use startTransition to prevent blocking UI (circle cursor)
        startTransition(() => {
            selectObject(id)

            // Handle based on active tool
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
        })
    }, [mode, activeTool, selectObject, startInteraction, walls, updateWall])

    const handleSideHandleDown = useCallback((e: any, id: string) => {
        if (mode !== '2d') return
        if (e.button !== 0) return
        e.stopPropagation()
        selectObject(id)
        startInteraction('resizing', id, { x: e.point.x, y: e.point.z }, 'thickness')
    }, [mode, selectObject, startInteraction])

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
                <WallItem
                    key={wall.id}
                    wall={wall}
                    isSelected={selectedId === wall.id}
                    is2D={mode === '2d'}
                    furniture={furniture} // Pass the full list; filtered inside
                    onPointerDown={handlePointerDown}
                    onWheel={handleWheel}
                    onSideHandleDown={handleSideHandleDown}
                />
            ))}
        </group>
    )
}
