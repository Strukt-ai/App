'use client'

import { useFloorplanStore } from '@/store/floorplanStore'
import type { FurnItem } from '@/store/floorplanStore'
import { Box } from '@react-three/drei'
import { memo, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { Door3D } from './items/Door3D'
import { Window3D } from './items/Window3D'

// Static materials (same pattern as WallManager) to avoid re-allocation
const resizeHandleMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.05,
    emissive: 0x7dd3fc,
    emissiveIntensity: 0.35
})
const depthHandleMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.05,
    emissive: 0x7dd3fc,
    emissiveIntensity: 0.35
})
const selectionPlaneMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2
})
const edgeLineMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6 })

// Static handle geometries
// Static handle geometries (Canva-style rounded discs)
const widthHandleGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 24)
const depthHandleGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 24)
const uniformHandleGeo = new THREE.SphereGeometry(0.18, 16, 16)
const uniformHandleMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffcc,
    roughness: 0.2,
    metalness: 0.1,
    emissive: 0x00ffcc,
    emissiveIntensity: 0.5
})

const FurnitureItem = memo(function FurnitureItem({
    item,
    isSelected,
    mode,
    onClick,
    onPointerDown,
    onResizeDown
}: {
    item: FurnItem
    isSelected: boolean
    mode: '2d' | '3d'
    onClick: (e: any) => void
    onPointerDown: (e: any, id: string) => void
    onResizeDown: (e: any, id: string, subType: 'resize-width' | 'resize-depth' | 'resize-uniform') => void
}) {
    const isOpening = item.type === 'door' || item.type === 'window'
    const width = item.dimensions.width || 1
    // Doors/windows should be thin (wall thickness ~15cm), not the generic 1m fallback
    const depth = item.dimensions.depth || (isOpening ? 0.15 : 1)
    const height = item.dimensions.height || (item.type === 'door' ? 2.1 : item.type === 'window' ? 1.2 : 0.5)
    const yPos = mode === '2d' && isOpening ? 3.1 : (item.position.y || 0)

    // Memoize the edge geometry so it's only recreated when dimensions actually change
    const edgeGeo = useMemo(
        () => new THREE.EdgesGeometry(new THREE.BoxGeometry(width + 0.05, 0.1, depth + 0.05)),
        [width, depth]
    )

    // Memoize selection plane geometry
    const selPlaneGeo = useMemo(
        () => new THREE.PlaneGeometry(width + 0.1, depth + 0.1),
        [width, depth]
    )

    return (
        <group
            name="Item"
            userData={{ id: item.id, isFurniture: true, type: item.type }}
            position={[item.position.x, yPos, item.position.z]}
            rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
            onClick={onClick}
            onPointerDown={(e) => onPointerDown(e, item.id)}
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
                    mode={mode}
                />
            ) : (
                (mode === '3d' && item.modelUrl) ? null : (
                    <Box args={[width, height, depth]} position={[0, height / 2, 0]} castShadow>
                        <meshStandardMaterial
                            color={isSelected ? "#3b82f6" : "#a89e94"}
                            roughness={0.75}
                            metalness={0.0}
                        />
                    </Box>
                )
            )}

            {/* Selection Frame & Handles */}
            {isSelected && mode === '2d' && (
                <group position={[0, 0.02, 0]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={selPlaneGeo} material={selectionPlaneMaterial} />
                    {/* Corners/Rectangle feel */}
                    <lineSegments geometry={edgeGeo} material={edgeLineMaterial} />

                    {/* Width Resize Handles (Left/Right) */}
                    <mesh
                        position={[width / 2 + 0.2, 0, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        onPointerDown={(e) => { e.stopPropagation(); onResizeDown(e, item.id, 'resize-width') }}
                        geometry={widthHandleGeo}
                        material={resizeHandleMaterial}
                    />
                    <mesh
                        position={[-width / 2 - 0.2, 0, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        onPointerDown={(e) => { e.stopPropagation(); onResizeDown(e, item.id, 'resize-width') }}
                        geometry={widthHandleGeo}
                        material={resizeHandleMaterial}
                    />

                    {/* Depth Resize Handles (Front/Back) */}
                    <mesh
                        position={[0, 0, depth / 2 + 0.2]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        onPointerDown={(e) => { e.stopPropagation(); onResizeDown(e, item.id, 'resize-depth') }}
                        geometry={depthHandleGeo}
                        material={depthHandleMaterial}
                    />
                    <mesh
                        position={[0, 0, -depth / 2 - 0.2]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        onPointerDown={(e) => { e.stopPropagation(); onResizeDown(e, item.id, 'resize-depth') }}
                        geometry={depthHandleGeo}
                        material={depthHandleMaterial}
                    />

                    {/* Corner Uniform Scale Handles */}
                    <mesh
                        position={[width / 2 + 0.2, 0, depth / 2 + 0.2]}
                        onPointerDown={(e) => { e.stopPropagation(); onResizeDown(e, item.id, 'resize-uniform') }}
                        geometry={uniformHandleGeo}
                        material={uniformHandleMaterial}
                    />
                    <mesh
                        position={[-width / 2 - 0.2, 0, depth / 2 + 0.2]}
                        onPointerDown={(e) => { e.stopPropagation(); onResizeDown(e, item.id, 'resize-uniform') }}
                        geometry={uniformHandleGeo}
                        material={uniformHandleMaterial}
                    />
                    <mesh
                        position={[width / 2 + 0.2, 0, -depth / 2 - 0.2]}
                        onPointerDown={(e) => { e.stopPropagation(); onResizeDown(e, item.id, 'resize-uniform') }}
                        geometry={uniformHandleGeo}
                        material={uniformHandleMaterial}
                    />
                    <mesh
                        position={[-width / 2 - 0.2, 0, -depth / 2 - 0.2]}
                        onPointerDown={(e) => { e.stopPropagation(); onResizeDown(e, item.id, 'resize-uniform') }}
                        geometry={uniformHandleGeo}
                        material={uniformHandleMaterial}
                    />
                </group>
            )}
        </group>
    )
})

export function FurnitureManager() {
    // Fix: Use individual selectors (like WallManager) to prevent re-renders on every store change
    const furniture = useFloorplanStore(s => s.furniture)
    const selectedId = useFloorplanStore(s => s.selectedId)
    const selectObject = useFloorplanStore(s => s.selectObject)
    const mode = useFloorplanStore(s => s.mode)
    const startInteraction = useFloorplanStore(s => s.startInteraction)
    const activeTool = useFloorplanStore(s => s.activeTool)
    const updateFurniture = useFloorplanStore(s => s.updateFurniture)

    const handlePointerDown = useCallback((e: any, id: string) => {
        e.stopPropagation()

        if (useFloorplanStore.getState().joinMode) {
            useFloorplanStore.getState().setJoinTargetId(id)
            return
        }

        selectObject(id)
        if (mode !== '2d') return

        const item = furniture.find(f => f.id === id)
        if (!item) return

        if (activeTool === 'rotate') {
            updateFurniture(id, {
                rotation: { y: (item.rotation.y || 0) + Math.PI / 2 }
            } as any)
        } else if (activeTool === 'label') {
            const label = prompt('Enter label for this item:', item.type)
            if (label !== null) {
                console.log('Label:', label)
            }
        } else if (activeTool === 'resize') {
            if (!e.point || isNaN(e.point.x) || isNaN(e.point.z)) return
            startInteraction('resizing', id, { x: e.point.x, y: e.point.z })
        } else {
            if (!e.point || isNaN(e.point.x) || isNaN(e.point.z)) return
            startInteraction('dragging', id, { x: e.point.x, y: e.point.z })
        }
    }, [mode, activeTool, selectObject, startInteraction, updateFurniture, furniture])

    const handleResizeDown = useCallback((e: any, id: string, subType: 'resize-width' | 'resize-depth' | 'resize-uniform') => {
        if (mode !== '2d') return
        e.stopPropagation()
        selectObject(id)
        if (!e.point || isNaN(e.point.x) || isNaN(e.point.z)) return
        startInteraction('resizing', id, { x: e.point.x, y: e.point.z }, subType)
    }, [mode, selectObject, startInteraction])

    return (
        <group>
            {furniture.map((item) => (
                <FurnitureItem
                    key={item.id}
                    item={item}
                    isSelected={selectedId === item.id}
                    mode={mode}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={handlePointerDown}
                    onResizeDown={handleResizeDown}
                />
            ))}
        </group>
    )
}
