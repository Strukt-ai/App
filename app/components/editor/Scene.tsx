'use client'

import { useRef, useEffect, Suspense, useState } from 'react'
import { Box3, Vector3, Object3D, TextureLoader } from 'three'
import { Canvas, useThree, useLoader } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Grid, Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, SMAA, ToneMapping, N8AO } from '@react-three/postprocessing'
import { useFloorplanStore } from '@/store/floorplanStore'
import { WallManager } from './WallManager'
import { FurnitureManager } from './FurnitureManager'
import { Ground } from './Ground'
import { FloorManager } from './FloorManager'
import { SelectionTransform } from './SelectionTransform'
import { FurnAIAssetsManager } from './FurnAIAssetsManager'
import { ImportedModelsManager } from './ImportedModelsManager'
import { TutorialOverlay } from './TutorialOverlay'
import { ReferenceOverlay } from './ReferenceOverlay' // New Import
import { cn } from '@/lib/utils'

const _EMPTY_TEX_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO4G8m8AAAAASUVORK5CYII='

// --- Headless Drop Resolver ---
function DropResolver() {
    const pendingDrop = useFloorplanStore(s => s.pendingDrop)
    const addFurniture = useFloorplanStore(s => s.addFurniture)
    const consumeDrop = useFloorplanStore(s => s.consumeDrop)
    const { raycaster, camera, scene } = useThree()

    useEffect(() => {
        if (pendingDrop) {
            raycaster.setFromCamera({ x: pendingDrop.x, y: pendingDrop.y } as any, camera)
            const ground = scene.getObjectByName("Ground")
            if (ground) {
                const intersects = raycaster.intersectObject(ground)
                if (intersects.length > 0) {
                    const point = intersects[0].point
                    addFurniture(pendingDrop.type, { x: point.x, y: point.z })
                }
            }
            consumeDrop()
        }
    }, [pendingDrop, camera, raycaster, scene, addFurniture, consumeDrop])
    return null
}

function SvgOverlayPlane() {
    const mode = useFloorplanStore(s => s.mode)
    const currentRunId = useFloorplanStore(s => s.currentRunId)
    const token = useFloorplanStore(s => s.token)
    const calibrationFactor = useFloorplanStore(s => s.calibrationFactor)

    const [blobUrl, setBlobUrl] = useState<string | null>(null)
    const [vb, setVb] = useState<{ w: number; h: number } | null>(null)

    useEffect(() => {
        if (mode !== '3d') return
        if (!currentRunId || !token) {
            setVb(null)
            setBlobUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev)
                return null
            })
            return
        }

        let cancelled = false
        ;(async () => {
            try {
                const res = await fetch(`/api/runs/${currentRunId}/svg`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (!res.ok) throw new Error(`svg ${res.status}`)
                const svgText = await res.text()

                const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
                const svgEl = doc.querySelector('svg')
                const viewBox = (svgEl?.getAttribute('viewBox') || '').trim()
                const parts = viewBox
                    .split(/[\s,]+/)
                    .map(v => parseFloat(v))
                    .filter(n => !isNaN(n))
                if (parts.length === 4) {
                    setVb({ w: Math.max(1, parts[2]), h: Math.max(1, parts[3]) })
                } else {
                    const w = parseFloat((svgEl?.getAttribute('width') || '0').replace('px', ''))
                    const h = parseFloat((svgEl?.getAttribute('height') || '0').replace('px', ''))
                    if (w > 0 && h > 0) setVb({ w, h })
                }

                const blob = new Blob([svgText], { type: 'image/svg+xml' })
                const url = URL.createObjectURL(blob)
                if (cancelled) {
                    URL.revokeObjectURL(url)
                    return
                }
                setBlobUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev)
                    return url
                })
            } catch (e) {
                console.error('[SvgOverlayPlane] Failed to load run svg', e)
                setVb(null)
                setBlobUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev)
                    return null
                })
            }
        })()

        return () => {
            cancelled = true
        }
    }, [mode, currentRunId, token])

    const texture = useLoader(TextureLoader, blobUrl || _EMPTY_TEX_DATA_URL)

    if (mode !== '3d') return null
    if (!blobUrl || !vb) return null

    const factor = calibrationFactor > 0 ? calibrationFactor : 0.02
    const width = vb.w * factor
    const height = vb.h * factor

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0015, 0]}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={texture} transparent opacity={0.55} depthWrite={false} toneMapped={false} />
        </mesh>
    )
}

// --- Fit View Handler ---
function FitHandler() {
    const fitViewTrigger = useFloorplanStore(s => s.fitViewTrigger)
    const { camera, scene, controls } = useThree()

    useEffect(() => {
        if (fitViewTrigger > 0) {
            console.log('[DEBUG] Auto-fitting view to bounds...')

            // Calculate bounding box of relevant objects
            const box = new Box3()
            const targets: Object3D[] = []

            scene.traverse((obj) => {
                // Filter what to include in bounds
                if (obj.type === 'Mesh') {
                    // Strict filtering to avoid Environment/Skybox/Helpers
                    // We only want explicitly named parts of the house
                    if (obj.name === 'Wall' || obj.name === 'Floor' || obj.parent?.name === 'Item') {
                        targets.push(obj)
                    }
                }
            })

            if (targets.length === 0) return

            box.setFromObject(targets[0])
            targets.forEach(t => box.expandByObject(t))

            if (box.isEmpty()) return

            const center = new Vector3()
            box.getCenter(center)

            const size = new Vector3()
            box.getSize(size)

            const maxDim = Math.max(size.x, size.z)
            const padding = 1.2

            // Move camera to center top
            if (camera.type === 'OrthographicCamera') {
                const cam = camera as any

                const ctrl = controls as any
                if (ctrl) {
                    ctrl.target.set(center.x, 0, center.z)
                    ctrl.object.position.set(center.x, 10, center.z)

                    // Adjust Zoom: Approximate calculation to fit maxDim
                    // Zoom = CanvasDimension / WorldDimension
                    // Use min dimension of canvas to ensure full fit
                    const newZoom = Math.min(window.innerWidth, window.innerHeight) / (maxDim * padding)
                    cam.zoom = Math.max(newZoom, 5) // Min zoom clamp
                    cam.updateProjectionMatrix()
                    ctrl.update()
                }
            } else {
                // Perspective
                const ctrl = controls as any
                if (ctrl) {
                    ctrl.target.copy(center)
                    const dist = maxDim * padding
                    ctrl.object.position.set(center.x + dist, center.y + dist, center.z + dist)
                    ctrl.update()
                }
            }
        }
    }, [fitViewTrigger, camera, scene, controls])

    return null
}

// --- Interaction Handler ---
function InteractionLayer() {
    const mode = useFloorplanStore(s => s.mode)
    const activeTool = useFloorplanStore(s => s.activeTool)
    const startInteraction = useFloorplanStore(s => s.startInteraction)
    const updateInteraction = useFloorplanStore(s => s.updateInteraction)
    const endInteraction = useFloorplanStore(s => s.endInteraction)
    const selectObject = useFloorplanStore(s => s.selectObject)

    const onPointerDown = (e: any) => {
        console.log('[DEBUG] onPointerDown', { mode, activeTool, button: e.button, point: e.point })
        if (mode !== '2d') return
        if (e.button !== 0) return // Left click only
        e.stopPropagation()

        // CRITICAL FIX: Only draw if tool is strictly 'wall' or 'ruler' or 'floor'
        if (activeTool === 'wall' || activeTool === 'ruler') {
            console.log('[DEBUG] Starting interaction - drawing')
            selectObject(null)
            startInteraction('drawing', null, { x: e.point.x, y: e.point.z })
        } else if (activeTool === 'floor') {
            console.log('[DEBUG] Starting interaction - drawing floor')
            selectObject(null)
            startInteraction('drawing_floor', null, { x: e.point.x, y: e.point.z })
        } else {
            console.log('[DEBUG] Tool not active, just deselecting')
            selectObject(null)
        }
    }

    const onPointerMove = (e: any) => {
        if (mode !== '2d') return
        // Pass boolean for shiftKey if available in nativeEvent, or from the synthetic event if possible.
        // R3F events wrap native events. e.shiftKey might be available directly on some versions, or e.nativeEvent.shiftKey
        const shiftKey = e.shiftKey || e.nativeEvent?.shiftKey || false
        updateInteraction({ x: e.point.x, y: e.point.z }, { shiftKey })
    }

    const onPointerUp = () => {
        console.log('[DEBUG] onPointerUp - ending interaction')
        endInteraction()
    }

    return (
        <mesh
            name="InteractionPlane"
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.1, 0]}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
        >
            <planeGeometry args={[500, 500]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
    )
}

// --- Scene Content Component ---
function SceneContent() {
    const mode = useFloorplanStore(s => s.mode)
    const lightingPreset = useFloorplanStore(s => s.lightingPreset)

    // Lighting presets configuration - Mapped to Environment presets + directional tweaks
    const lightingConfigs = {
        day: { env: 'city', sunIntensity: 2, sunColor: '#fff8e7' },
        night: { env: 'night', sunIntensity: 0.1, sunColor: '#aabbff' },
        studio: { env: 'studio', sunIntensity: 1, sunColor: '#ffffff' },
        sunset: { env: 'sunset', sunIntensity: 1.5, sunColor: '#ff9944' }
    }
    const lighting = lightingConfigs[lightingPreset]

    // Determine Environment Preset (drei types: apartment, city, park, lobby, etc.)
    // We map our custom names to closest available Drei presets
    const getEnvPreset = (name: string) => {
        switch (name) {
            case 'day': return 'apartment'
            case 'night': return 'city' // Night is tricky, city might be safest dark-ish or just low intensity
            case 'studio': return 'studio'
            case 'sunset': return 'sunset'
            default: return 'apartment'
        }
    }

    return (
        <>
            {/* Solid Background for studio feel - Lightened to Dark Grey */}
            <color attach="background" args={['#252525']} />

            {/* Ambient Light to ensure everything is visible */}
            <ambientLight intensity={0.7} color="#ffffff" />

            {/* HDRI Environment for realistic reflections and ambient light */}
            <Environment preset={getEnvPreset(lightingPreset) as any} background={false} blur={0.8} />

            {/* Main Directional Light (Sun) */}
            <directionalLight
                position={[5, 10, 5]}
                intensity={lighting.sunIntensity}
                color={lighting.sunColor}
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[2048, 2048]}
            />

            {/* Contact Shadows for grounding objects - Tuned for soft studio look */}
            <ContactShadows
                position={[0, 0.01, 0]}
                opacity={0.7}
                scale={50}
                blur={2.5}
                far={10}
                resolution={1024}
                color="#000000"
                frames={Infinity}
            />

            {mode === '3d' ? (
                <PerspectiveCamera makeDefault position={[5, 12, 12]} fov={50} />
            ) : (
                <OrthographicCamera makeDefault position={[0, 10, 0]} zoom={40} />
            )}

            <OrbitControls
                makeDefault
                enableRotate={mode === '3d'}
                enableZoom={true}
                enablePan={true}
                maxPolarAngle={mode === '3d' ? Math.PI / 2 : 0}
            />

            {mode === '2d' && (
                <Grid
                    infiniteGrid
                    fadeDistance={30}
                    fadeStrength={5}
                    sectionSize={1}
                    cellColor="#353535"
                    sectionColor="#454545"
                    position={[0, 0.02, 0]}
                />
            )}

            <group>
                {/* Manual walls are always visible; AI model is separate */}
                <FloorManager />
                <WallManager />
                <FurnitureManager />
                <FurnAIAssetsManager />
                <ImportedModelsManager />
                <Ground />
                <SvgOverlayPlane />
                {/* <Model3D /> */}
                <InteractionLayer />
                <SelectionTransform />
                <FitHandler />
                {/* <FloatingMenu /> temporarily disabled for testing */}
            </group>

            {mode === '3d' && (
                <EffectComposer multisampling={0}>
                    <SMAA />
                    <SMAA />
                    <N8AO
                        halfRes
                        color="black"
                        aoRadius={0.5}
                        intensity={1.5}
                        aoSamples={6}
                        denoiseSamples={4}
                    />
                    <Bloom
                        luminanceThreshold={1}
                        mipmapBlur
                        intensity={0.8}
                        radius={0.6}
                    />
                    <ToneMapping />
                </EffectComposer>
            )}

            <DropResolver />
        </>
    )
}

// --- Background Image Plane ---
function BackgroundPlane() {
    const uploadedImage = useFloorplanStore(s => s.uploadedImage)
    const showBackground = useFloorplanStore(s => s.showBackground)
    const imageDimensions = useFloorplanStore(s => s.imageDimensions)
    const calibrationFactor = useFloorplanStore(s => s.calibrationFactor)

    const texture = useLoader(TextureLoader, uploadedImage || '')

    if (!uploadedImage || !showBackground || !imageDimensions) return null

    // Calculate world dimensions based on pixels * meters/pixel
    // Default factor is usually 0.05 or similar if not calibrated
    const factor = calibrationFactor > 0 ? calibrationFactor : 0.02 // Fallback scale
    const width = imageDimensions.width * factor
    const height = imageDimensions.height * factor

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.05, 0]} // Slightly below ground
            receiveShadow
        >
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={0.3} // FAINT as requested
                depthWrite={false}
                toneMapped={false}
            />
        </mesh>
    )
}

// --- Main Component ---
export function Scene() {
    const activeTool = useFloorplanStore(s => s.activeTool)
    const handleDrop = useFloorplanStore(s => s.handleDrop)
    const selectedId = useFloorplanStore(s => s.selectedId)
    const deleteObject = useFloorplanStore(s => s.deleteObject)
    const uploadedImage = useFloorplanStore(s => s.uploadedImage) // For Reference View
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Get undo/redo/copy/paste functions
    const undo = useFloorplanStore(s => s.undo)
    const redo = useFloorplanStore(s => s.redo)
    const copyObject = useFloorplanStore(s => s.copyObject)
    const pasteObject = useFloorplanStore(s => s.pasteObject)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

            // Delete selected object
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                deleteObject(selectedId)
            }
            // Ctrl+Z - Undo
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault()
                undo()
            }
            // Ctrl+Y - Redo
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault()
                redo()
            }
            // Ctrl+C - Copy
            if (e.ctrlKey && e.key === 'c' && selectedId) {
                e.preventDefault()
                copyObject()
            }
            // Ctrl+V - Paste
            if (e.ctrlKey && e.key === 'v') {
                e.preventDefault()
                pasteObject()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedId, deleteObject, undo, redo, copyObject, pasteObject])

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const type = e.dataTransfer.getData('furniture_type')
        if (!type || !wrapperRef.current) return

        const rect = wrapperRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

        handleDrop(type, x, y)
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    return (
        <div
            ref={wrapperRef}
            className={cn(
                "flex-1 h-full bg-[#1a1a1a] relative overflow-hidden select-none",
                activeTool === 'wall' ? "cursor-crosshair" : (activeTool === 'ruler' ? "cursor-help" : "cursor-default")
            )}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onMouseDownCapture={(e) => {
                // NUCLEAR FIX: Prevent browser text selection / drag behavior
                // Allow interactions with Input elements (like FloatingMenu)
                if (e.target instanceof HTMLElement && e.target.tagName !== 'INPUT') {
                    e.preventDefault()
                }
            }}
        >
            <Canvas shadows className="w-full h-full">
                <Suspense fallback={null}>
                    <SceneContent />
                    {uploadedImage && <BackgroundPlane />}
                </Suspense>
            </Canvas>

            {/* Reference View (Draggable/Resizable) */}
            <ReferenceOverlay />

            <TutorialOverlay />
        </div>
    )
}
