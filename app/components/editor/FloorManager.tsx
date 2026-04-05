'use client'

import { useFloorplanStore } from '@/store/floorplanStore'
import type { Room } from '@/store/floorplanStore'
import { memo, useEffect, useMemo } from 'react'
import { Shape, ShapeGeometry, DoubleSide, RepeatWrapping, Texture, SRGBColorSpace, LinearSRGBColorSpace } from 'three'
import { Html } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

const _EMPTY_TEX_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO4G8m8AAAAASUVORK5CYII='

// Create floor shape geometry from room polygon points
function createFloorGeometry(points: { x: number; y: number }[]) {
    if (points.length < 3) return null

    const shape = new Shape()
    // The mesh is rotated -PI/2 around X, which maps shape-Y to world -Z.
    // Walls use world Z = store.y (positive), so we negate Y here to compensate.
    shape.moveTo(points[0].x, -points[0].y)
    for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, -points[i].y)
    }
    shape.closePath()

    return new ShapeGeometry(shape)
}

// Memoized room component for performance
const RoomItem = memo(function RoomItem({
    room,
    selected,
    onSelect,
    onInteraction
}: {
    room: Room,
    selected: boolean,
    onSelect: (id: string) => void,
    onInteraction: (id: string, e: any) => void
}) {
    const geometry = createFloorGeometry(room.points)
    const mode = useFloorplanStore(s => s.mode)

    const textureUrl = room.textureDataUrl
    const texture = useLoader(TextureLoader, textureUrl || _EMPTY_TEX_DATA_URL) as Texture

    // Load PBR maps (fallback to empty 1px texture if not present)
    const normalTex = useLoader(TextureLoader, room.pbrNormalUrl || _EMPTY_TEX_DATA_URL) as Texture
    const roughnessTex = useLoader(TextureLoader, room.pbrRoughnessUrl || _EMPTY_TEX_DATA_URL) as Texture
    const aoTex = useLoader(TextureLoader, room.pbrAoUrl || _EMPTY_TEX_DATA_URL) as Texture
    const metalnessTex = useLoader(TextureLoader, room.pbrMetalnessUrl || _EMPTY_TEX_DATA_URL) as Texture

    const bounds = useMemo(() => {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (const p of room.points) {
            minX = Math.min(minX, p.x)
            minY = Math.min(minY, p.y)
            maxX = Math.max(maxX, p.x)
            maxY = Math.max(maxY, p.y)
        }
        if (minX === Infinity) return { w: 0, h: 0 }
        return { w: Math.max(0.0001, maxX - minX), h: Math.max(0.0001, maxY - minY) }
    }, [room.points])

    // Configure tiling for all textures
    useEffect(() => {
        if (!textureUrl) return
        const tw = Number(room.textureTileWidthM || 0)
        const th = Number(room.textureTileHeightM || 0)
        if (!(tw > 0) || !(th > 0)) return

        const repeatX = bounds.w / tw
        const repeatY = bounds.h / th

        const textures = [texture]
        if (room.pbrNormalUrl) textures.push(normalTex)
        if (room.pbrRoughnessUrl) textures.push(roughnessTex)
        if (room.pbrAoUrl) textures.push(aoTex)
        if (room.pbrMetalnessUrl) textures.push(metalnessTex)

        // Albedo must be sRGB; PBR maps (normal/roughness/ao/metalness) must stay linear
        texture.colorSpace = SRGBColorSpace
        ;[normalTex, roughnessTex, aoTex, metalnessTex].forEach(t => {
            t.colorSpace = LinearSRGBColorSpace
        })

        textures.forEach(t => {
            t.wrapS = RepeatWrapping
            t.wrapT = RepeatWrapping
            t.repeat.set(repeatX, repeatY)
            t.anisotropy = 16
            t.needsUpdate = true
        })
    }, [textureUrl, room.textureTileWidthM, room.textureTileHeightM, bounds.w, bounds.h,
        texture, normalTex, roughnessTex, aoTex, metalnessTex,
        room.pbrNormalUrl, room.pbrRoughnessUrl, room.pbrAoUrl, room.pbrMetalnessUrl])

    if (!geometry) return null

    const hasPbr = !!(room.pbrNormalUrl || room.pbrRoughnessUrl || room.pbrAoUrl || room.pbrMetalnessUrl)

    return (
        <group>
            {/* Floor polygon - now properly bounded by walls */}
            <mesh
                name="Floor"
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, mode === '3d' ? -0.05 : 0.002, 0]}
                geometry={geometry}
                renderOrder={0}
                onClick={(e) => {
                    e.stopPropagation()
                    onSelect(room.id)
                }}
            >
                {mode === '3d' ? (
                    <meshPhysicalMaterial
                        map={textureUrl ? texture : null}
                        normalMap={hasPbr && room.pbrNormalUrl ? normalTex : null}
                        normalScale={hasPbr && room.pbrNormalUrl ? [0.8, 0.8] as any : undefined}
                        roughnessMap={hasPbr && room.pbrRoughnessUrl ? roughnessTex : null}
                        aoMap={hasPbr && room.pbrAoUrl ? aoTex : null}
                        aoMapIntensity={1.0}
                        metalnessMap={hasPbr && room.pbrMetalnessUrl ? metalnessTex : null}
                        color={selected ? '#fbbf24' : (textureUrl ? '#ffffff' : (room.color || '#ddd8d0'))}
                        roughness={hasPbr && room.pbrRoughnessUrl ? 1.0 : (textureUrl ? 0.65 : 0.75)}
                        metalness={hasPbr && room.pbrMetalnessUrl ? 1.0 : 0.0}
                        clearcoat={textureUrl ? 0.12 : 0.08}
                        clearcoatRoughness={textureUrl ? 0.5 : 0.6}
                        envMapIntensity={textureUrl ? 0.6 : 0.3}
                        bumpMap={textureUrl && !hasPbr ? texture : null}
                        bumpScale={textureUrl && !hasPbr ? 0.025 : undefined}
                        transparent
                        opacity={selected ? 0.85 : 1.0}
                        side={DoubleSide}
                        depthWrite={false}
                    />
                ) : (
                    <meshStandardMaterial
                        map={textureUrl ? texture : null}
                        color={selected ? '#fbbf24' : (textureUrl ? '#ffffff' : room.color)}
                        roughness={1.0}
                        metalness={0.0}
                        transparent
                        opacity={selected ? 0.4 : 0.15}
                        side={DoubleSide}
                        depthWrite={false}
                    />
                )}
            </mesh>

            {/* Click target for selection + dragging — sits above InteractionPlane (y=0.1) so clicks reach it */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.12, 0]}
                geometry={geometry}
                onClick={(e) => {
                    e.stopPropagation()
                    onSelect(room.id)
                }}
                onPointerDown={(e) => {
                    e.stopPropagation()
                    onInteraction(room.id, e)
                }}
            >
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Room label - Hide in 3D Mode to avoid visual clutter */}
            {room.name && mode === '2d' && (
                <Html
                    position={[room.center.x, 0.1, room.center.y]}
                    center
                    sprite
                    style={{ pointerEvents: 'none' }}
                >
                    <div style={{
                        background: selected ? 'rgba(251, 191, 36, 0.9)' : 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(4px)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        color: selected ? 'black' : 'white',
                        fontSize: '11px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        userSelect: 'none'
                    }}>
                        {room.name}
                    </div>
                </Html>
            )}
        </group>
    )
})

const LabelItem = memo(function LabelItem({ label }: { label: { id: string, text: string, position: { x: number, y: number } } }) {
    // Show labels in both 2D and 3D so users can see exactly what OCR found

    return (
        <Html
            position={[label.position.x, 0.1, label.position.y]}
            center
            sprite
            style={{ pointerEvents: 'none' }}
        >
            <div style={{
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: '6px',
                color: 'white',
                fontSize: '11px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                userSelect: 'none'
            }}>
                {label.text}
            </div>
        </Html>
    )
})

export function FloorManager() {
    const rooms = useFloorplanStore(s => s.rooms)
    const labels = useFloorplanStore(s => s.labels)
    const selectedId = useFloorplanStore(s => s.selectedId)
    const activeTool = useFloorplanStore(s => s.activeTool)
    const selectObject = useFloorplanStore(s => s.selectObject)
    const startInteraction = useFloorplanStore(s => s.startInteraction)

    // Debug: log rooms (throttled/conditional logging better in prod, but keeping per established pattern)
    // console.log('[DEBUG FloorManager] Rooms count:', rooms.length)

    const handleInteraction = (id: string, e: any) => {
        if (activeTool === 'move') {
            startInteraction('dragging', id, e.point)
        } else if (activeTool === 'resize') {
            startInteraction('resizing', id, e.point)
        }
    }

    // Only show in 2D mode for now - Wait, USER WANTS IT IN 3D TO!
    // if (mode !== '2d') return null

    return (
        <group>
            {rooms.map(room => (
                <RoomItem
                    key={room.id}
                    room={room}
                    selected={room.id === selectedId}
                    onSelect={selectObject}
                    onInteraction={handleInteraction}
                />
            ))}
            {labels.map(label => (
                <LabelItem
                    key={label.id}
                    label={label}
                />
            ))}
        </group>
    )
}
