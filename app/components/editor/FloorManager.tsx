'use client'

import { useFloorplanStore } from '@/store/floorplanStore'
import type { Room } from '@/store/floorplanStore'
import { memo, useEffect, useMemo } from 'react'
import { Shape, ShapeGeometry, DoubleSide, RepeatWrapping, Texture } from 'three'
import { Html } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

const _EMPTY_TEX_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO4G8m8AAAAASUVORK5CYII='

// Create floor shape geometry from room polygon points
function createFloorGeometry(points: { x: number; y: number }[]) {
    if (points.length < 3) return null

    const shape = new Shape()
    // Positive Y aligns with Wall Z-axis (+Y in store -> +Z in world after -90deg rotation)
    shape.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, points[i].y)
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

    useEffect(() => {
        if (!textureUrl) return
        const tw = Number(room.textureTileWidthM || 0)
        const th = Number(room.textureTileHeightM || 0)
        if (!(tw > 0) || !(th > 0)) return

        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.repeat.set(bounds.w / tw, bounds.h / th)
        texture.needsUpdate = true
    }, [textureUrl, room.textureTileWidthM, room.textureTileHeightM, bounds.w, bounds.h, texture])

    if (!geometry) return null

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
                        color={selected ? '#fbbf24' : (textureUrl ? '#ffffff' : (room.color || '#ddd8d0'))}
                        roughness={0.7}
                        metalness={0.0}
                        clearcoat={0.15}
                        clearcoatRoughness={0.4}
                        envMapIntensity={0.3}
                        transparent
                        opacity={selected ? 0.7 : 0.65}
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

            {/* Invisible Hit Plane for Dragging */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.003, 0]}
                geometry={geometry}
                visible={false}
                onPointerDown={(e) => {
                    e.stopPropagation()
                    onInteraction(room.id, e)
                }}
            >
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
