'use client'

import { useFloorplanStore } from '@/store/floorplanStore'
import { Box } from '@react-three/drei'
import * as THREE from 'three'
import { Door3D } from './items/Door3D'
import { Window3D } from './items/Window3D'

export function FurnitureManager() {
    const { furniture, selectedId, selectObject, mode, startInteraction, activeTool, updateFurniture } = useFloorplanStore()

    const handlePointerDown = (e: any, id: string) => {
        if (mode !== '2d') return
        e.stopPropagation()
        selectObject(id)

        const item = furniture.find(f => f.id === id)
        if (!item) return

        if (activeTool === 'rotate') {
            // Rotate 90 degrees - OR maybe just let Gizmo handle it?
            // User requested "Handles", so Gizmo is key. But clicking might still be useful as a quick 90deg turn.
            updateFurniture(id, {
                rotation: { y: (item.rotation.y || 0) + Math.PI / 2 }
            } as any)
        } else if (activeTool === 'label') {
            // Add label (store in type temporarily)
            const label = prompt('Enter label for this item:', item.type)
            if (label !== null) {
                // We'd need an updateFurniture method, for now just log
                console.log('Label:', label)
            }
        } else if (activeTool === 'resize') {
            // Start resizing interaction
            startInteraction('resizing', id, { x: e.point.x, y: e.point.z })
        } else {
            // Default: move/drag
            startInteraction('dragging', id, { x: e.point.x, y: e.point.z })
        }
    }

    const handleResizeDown = (e: any, id: string, subType: 'resize-width' | 'resize-depth') => {
        if (mode !== '2d') return
        e.stopPropagation()
        // Force selection just in case
        selectObject(id)
        startInteraction('resizing', id, { x: e.point.x, y: e.point.z }, subType)
    }

    return (
        <group>
            {furniture.map((item) => {
                const isSelected = selectedId === item.id
                const width = item.dimensions.width || 1
                const depth = item.dimensions.depth || 1
                const height = item.dimensions.height || 0.5

                // In 2D (top-down) mode, walls have tall height and their top faces can occlude
                // doors/windows (which are slightly shorter). Render openings above wall tops
                // so they remain visible and clickable.
                const isOpening = item.type === 'door' || item.type === 'window'
                const yPos = mode === '2d' && isOpening ? 3.1 : (item.position.y || 0)

                return (
                    <group
                        name="Item"
                        userData={{ id: item.id, isFurniture: true, type: item.type }}
                        key={item.id}
                        position={[item.position.x, yPos, item.position.z]}
                        rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
                        onPointerDown={(e) => handlePointerDown(e, item.id)}
                    >
                        {item.type === 'door' ? (
                            <Door3D
                                width={width}
                                height={height}
                                depth={depth}
                                isSelected={isSelected}
                            />
                        ) : item.type === 'window' ? (
                            <Window3D
                                width={width}
                                height={height}
                                depth={depth}
                                isSelected={isSelected}
                            />
                        ) : (
                            (mode === '3d' && item.modelUrl) ? null : (
                                <Box args={[width, height, depth]} position={[0, height / 2, 0]} castShadow>
                                    <meshStandardMaterial
                                        color={isSelected ? "#3b82f6" : "#4a5568"}
                                        roughness={0.7}
                                        metalness={0.1}
                                    />
                                </Box>
                            )
                        )}

                        {/* Selection Frame & Handles */}
                        {isSelected && mode === '2d' && (
                            <group position={[0, 0.02, 0]}>
                                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                                    <planeGeometry args={[width + 0.1, depth + 0.1]} />
                                    <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
                                </mesh>
                                {/* Corners/Rectangle feel */}
                                <lineSegments>
                                    <edgesGeometry args={[new THREE.BoxGeometry(width + 0.05, 0.1, depth + 0.05)]} />
                                    <lineBasicMaterial color="#3b82f6" />
                                </lineSegments>

                                {/* Width Resize Handles (Left/Right) */}
                                <mesh
                                    position={[width / 2 + 0.2, height / 2, 0]}
                                    onClick={(e) => handleResizeDown(e, item.id, 'resize-width')}
                                >
                                    <boxGeometry args={[0.2, 0.2, 0.2]} />
                                    <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
                                </mesh>
                                <mesh
                                    position={[-width / 2 - 0.2, height / 2, 0]}
                                    onClick={(e) => handleResizeDown(e, item.id, 'resize-width')}
                                >
                                    <boxGeometry args={[0.2, 0.2, 0.2]} />
                                    <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
                                </mesh>

                                {/* Depth Resize Handles (Front/Back) - Optional, maybe only for generic items? 
                                    Doors/Windows usually have fixed depth or wall-dependent depth. 
                                    But keeping it flexible for now.
                                */}
                                <mesh
                                    position={[0, height / 2, depth / 2 + 0.2]}
                                    onClick={(e) => handleResizeDown(e, item.id, 'resize-depth')}
                                >
                                    <boxGeometry args={[0.15, 0.15, 0.15]} />
                                    <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
                                </mesh>
                                <mesh
                                    position={[0, height / 2, -depth / 2 - 0.2]}
                                    onClick={(e) => handleResizeDown(e, item.id, 'resize-depth')}
                                >
                                    <boxGeometry args={[0.15, 0.15, 0.15]} />
                                    <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
                                </mesh>
                            </group>
                        )}
                    </group>
                )
            })}
        </group>
    )
}
