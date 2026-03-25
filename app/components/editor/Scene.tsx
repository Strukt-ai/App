'use client'

import { useRef, useEffect, Suspense, useState } from 'react'
import { Box3, Vector3, Object3D, TextureLoader, ACESFilmicToneMapping, MOUSE } from 'three'
import { Canvas, useThree, useLoader } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Grid, Environment, ContactShadows, SoftShadows } from '@react-three/drei'
import { EffectComposer, SMAA, Bloom, ToneMapping, Vignette, BrightnessContrast, N8AO } from '@react-three/postprocessing'
import { ToneMappingMode, BlendFunction } from 'postprocessing'

import { useFloorplanStore } from '@/store/floorplanStore'
import { WallManager } from './WallManager'
import { FurnitureManager } from './FurnitureManager'
import { Ground } from './Ground'
import { FloorManager } from './FloorManager'
import { FurnAIAssetsManager } from './FurnAIAssetsManager'
import { ImportedModelsManager } from './ImportedModelsManager'
import { TutorialOverlay } from './TutorialOverlay'
import { ReferenceOverlay } from './ReferenceOverlay' // New Import
import { FloatingMenu } from './FloatingMenu'
import { ErrorBoundary } from './ErrorBoundary'
import { cn } from '@/lib/utils'
import { FloorplanOverlay } from './FloorplanOverlay'

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
    const imageDimensions = useFloorplanStore(s => s.imageDimensions)
    const imageWorldWidth = useFloorplanStore(s => s.imageWorldWidth)
    const imageWorldHeight = useFloorplanStore(s => s.imageWorldHeight)

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
            ; (async () => {
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

    // Match BackgroundPlane sizing so SVG overlay aligns exactly with the image
    const factor = calibrationFactor > 0 ? calibrationFactor : 0.02
    const width = imageWorldWidth != null ? imageWorldWidth : (imageDimensions?.width || vb.w) * factor
    const height = imageWorldHeight != null ? imageWorldHeight : (imageDimensions?.height || vb.h) * factor

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} renderOrder={-1}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={texture} transparent opacity={0.25} depthWrite={false} toneMapped={false} />
        </mesh>
    )
}

// --- Fit View Handler ---
function FitHandler() {
    const fitViewTrigger = useFloorplanStore(s => s.fitViewTrigger)
    const { camera, scene, controls } = useThree()
    const lastProcessedTrigger = useRef(0)

    useEffect(() => {
        // Only run when fitViewTrigger actually increments
        if (fitViewTrigger <= lastProcessedTrigger.current) return
        lastProcessedTrigger.current = fitViewTrigger

        // Small delay to ensure all meshes (doors/windows/AI models) are pushed to the scene
        const timer = setTimeout(() => {
            // Calculate bounding box of relevant objects
            const box = new Box3()
            const targets: Object3D[] = []

            scene.traverse((obj) => {
                if (obj.type === 'Mesh') {
                    // Include all relevant geometry for bounds (including background image so camera doesn't over-zoom)
                    if (obj.name === 'Wall' || obj.name === 'Floor' || obj.name === 'BackgroundPlane' || obj.parent?.name === 'Item' || obj.name.includes('door') || obj.name.includes('window')) {
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

                    const newZoom = Math.min(window.innerWidth, window.innerHeight) / (maxDim * padding)
                    cam.zoom = Math.max(newZoom, 5)
                    cam.updateProjectionMatrix()
                    ctrl.update()
                }
            } else {
                const ctrl = controls as any
                if (ctrl) {
                    ctrl.target.copy(center)
                    const dist = maxDim * padding
                    ctrl.object.position.set(center.x + dist, center.y + dist, center.z + dist)
                    ctrl.update()
                }
            }
        }, 100) // 100ms delay for geometry stability

        return () => clearTimeout(timer)
    }, [fitViewTrigger, camera, scene, controls])

    return null
}

// --- Interaction Handler ---
function InteractionLayer() {
    const mode = useFloorplanStore(s => s.mode)
    const activeTool = useFloorplanStore(s => s.activeTool)
    const interactionType = useFloorplanStore(s => s.interaction.type)
    const startInteraction = useFloorplanStore(s => s.startInteraction)
    const updateInteraction = useFloorplanStore(s => s.updateInteraction)
    const endInteraction = useFloorplanStore(s => s.endInteraction)
    const selectObject = useFloorplanStore(s => s.selectObject)

    const onPointerDown = (e: any) => {
        if (mode !== '2d') return
        if (e.button !== 0) return // Left click only

        // Guard: if another interaction is already active (e.g. wall/furniture started
        // dragging via their own onPointerDown), do NOT start a new drawing here.
        // This prevents ghost zero-length walls from being created when R3F event
        // propagation leaks through stopPropagation between sibling meshes.
        if (interactionType !== 'none') return

        if (activeTool === 'wall' || activeTool === 'ruler') {
            e.stopPropagation()
            selectObject(null)
            startInteraction('drawing', null, { x: e.point.x, y: e.point.z })
        } else if (activeTool === 'floor') {
            e.stopPropagation()
            selectObject(null)
            startInteraction('drawing_floor', null, { x: e.point.x, y: e.point.z })
        } else {
            // For select/move tools, deselect but DON'T stopPropagation —
            // let the click pass through to floor/wall meshes below
            selectObject(null)
        }
    }

    const onPointerMove = (e: any) => {
        if (mode !== '2d') return
        const shiftKey = e.shiftKey || e.nativeEvent?.shiftKey || false
        updateInteraction({ x: e.point.x, y: e.point.z }, { shiftKey })
    }

    const onPointerUp = () => {
        // Only end if there's actually an active interaction
        if (interactionType === 'none') return
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

    // Lighting presets — tuned for clean architectural rendering
    const lightingConfigs = {
        day: { env: 'city', sunIntensity: 2.2, sunColor: '#fff8f0', fillIntensity: 1.0, fillColor: '#dde6f0', ambientIntensity: 0.6 },
        night: { env: 'night', sunIntensity: 0.4, sunColor: '#99aacc', fillIntensity: 0.15, fillColor: '#445566', ambientIntensity: 0.2 },
        studio: { env: 'studio', sunIntensity: 1.8, sunColor: '#ffffff', fillIntensity: 0.9, fillColor: '#f0f0ff', ambientIntensity: 0.6 },
        sunset: { env: 'sunset', sunIntensity: 1.8, sunColor: '#ffaa55', fillIntensity: 0.5, fillColor: '#8899bb', ambientIntensity: 0.35 }
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
            {/* Clean architectural background — dark studio */}
            <color attach="background" args={['#1a1a1a']} />

            {/* Soft shadows for realistic penumbra */}
            {mode === '3d' && <SoftShadows size={25} samples={16} focus={0.5} />}

            {/* Ambient base — raised for clean, even illumination */}
            <ambientLight intensity={lighting.ambientIntensity} color="#faf8f5" />

            {/* Hemisphere Light — warm sky, neutral ground for natural fill */}
            <hemisphereLight args={['#dce4f0', '#b8a99a', 0.5]} />

            {/* HDRI Environment — apartment preset for best interior reflections */}
            <Environment preset={getEnvPreset(lightingPreset) as any} background={false} blur={0.3} environmentIntensity={0.8} />

            {/* Key Light — soft directional from upper right */}
            <directionalLight
                position={[10, 18, 8]}
                intensity={lighting.sunIntensity}
                color={lighting.sunColor}
                castShadow
                shadow-bias={-0.0001}
                shadow-normalBias={0.03}
                shadow-mapSize={[4096, 4096]}
                shadow-camera-far={60}
                shadow-camera-left={-25}
                shadow-camera-right={25}
                shadow-camera-top={25}
                shadow-camera-bottom={-25}
            />

            {/* Fill Light — soft opposite-side fill for shadow lift */}
            <directionalLight
                position={[-8, 10, 6]}
                intensity={lighting.fillIntensity}
                color={lighting.fillColor}
            />

            {/* Rim Light — subtle back edge definition */}
            <directionalLight
                position={[-2, 6, -10]}
                intensity={0.4}
                color="#d8e0ec"
            />

            {/* Bottom Fill — lifts dark underside of objects */}
            <directionalLight
                position={[0, -2, 4]}
                intensity={0.15}
                color="#f0ece6"
            />

            {/* Contact Shadows — soft grounding, subtle on light background */}
            <ContactShadows
                position={[0, 0.01, 0]}
                opacity={0.5}
                scale={50}
                blur={2.5}
                far={12}
                resolution={2048}
                color="#4a4540"
                frames={1}
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
                enableDamping={false} // Fix: Instant camera jumps for "fit view"
                maxPolarAngle={mode === '3d' ? Math.PI / 2 : 0}
                mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: null as any, RIGHT: MOUSE.PAN }}
            />

            {mode === '2d' && (
                <Grid
                    infiniteGrid
                    fadeDistance={30}
                    fadeStrength={5}
                    sectionSize={1}
                    cellColor="#333333"
                    sectionColor="#444444"
                    cellThickness={0.6}
                    sectionThickness={1.0}
                    position={[0, -0.14, 0]}
                />
            )}

            <group>
                {/* Manual walls are always visible; AI model is separate */}
                <ErrorBoundary name="FloorManager"><FloorManager /></ErrorBoundary>
                <ErrorBoundary name="WallManager"><WallManager /></ErrorBoundary>
                <ErrorBoundary name="FurnitureManager"><FurnitureManager /></ErrorBoundary>
                <FurnAIAssetsManager />
                <ImportedModelsManager />
                <Ground />
                <SvgOverlayPlane />
                {/* <Model3D /> */}
                <ErrorBoundary name="InteractionLayer"><InteractionLayer /></ErrorBoundary>
                <FitHandler />
                <ErrorBoundary name="FloatingMenu"><FloatingMenu /></ErrorBoundary>
            </group>

            {/* Post-processing — cinematic architectural look */}
            {mode === '3d' && (
                <EffectComposer multisampling={0}>
                    <SMAA />
                    {/* N8AO — fast high-quality ambient occlusion for realistic depth in corners */}
                    <N8AO
                        aoRadius={0.8}
                        intensity={2.5}
                        distanceFalloff={0.5}
                        quality="medium"
                    />
                    <Bloom
                        luminanceThreshold={1.5}
                        mipmapBlur
                        intensity={0.08}
                        radius={0.3}
                    />
                    <BrightnessContrast contrast={0.1} brightness={0.03} />
                    <Vignette
                        offset={0.3}
                        darkness={0.35}
                        blendFunction={BlendFunction.NORMAL}
                    />
                    <ToneMapping mode={ToneMappingMode.AGX} />
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
    const imageWorldWidth = useFloorplanStore(s => s.imageWorldWidth)
    const imageWorldHeight = useFloorplanStore(s => s.imageWorldHeight)

    const texture = useLoader(TextureLoader, uploadedImage || '')

    if (!uploadedImage || !showBackground || !imageDimensions) return null

    // Use SVG-derived world dimensions if available (set by importFromSVG, scaled by calibrate).
    // Fall back to pixel × calibrationFactor for cases where user draws manually without SVG import.
    const factor = calibrationFactor > 0 ? calibrationFactor : 0.02
    const width = imageWorldWidth != null ? imageWorldWidth : imageDimensions.width * factor
    const height = imageWorldHeight != null ? imageWorldHeight : imageDimensions.height * factor

    return (
        <mesh
            name="BackgroundPlane"
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]} // On top of Ground
            receiveShadow
            renderOrder={1} // Render before walls but after ground
        >
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={0.6} // Increased opacity from 0.3 to be more visible
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
    const uploadedImage = useFloorplanStore(s => s.uploadedImage) // For Reference View
    const wrapperRef = useRef<HTMLDivElement>(null)
    // Local UI State hook

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

            // Delete selected object
            if ((e.key === 'Delete' || e.key === 'Backspace')) {
                const store = useFloorplanStore.getState()
                if (store.selectedId) {
                    store.deleteObject(store.selectedId)
                }
            }
            // Ctrl+Z - Undo
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault()
                useFloorplanStore.getState().undo()
            }
            // Ctrl+Y - Redo
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault()
                useFloorplanStore.getState().redo()
            }
            // Ctrl+C - Copy
            if (e.ctrlKey && e.key === 'c') {
                const store = useFloorplanStore.getState()
                if (store.selectedId) {
                    e.preventDefault()
                    store.copyObject()
                }
            }
            // Ctrl+V - Paste
            if (e.ctrlKey && e.key === 'v') {
                e.preventDefault()
                useFloorplanStore.getState().pasteObject()
            }
            // R - Rotate 90 degrees
            if (e.key.toLowerCase() === 'r') {
                const store = useFloorplanStore.getState()
                if (store.selectedId) {
                    e.preventDefault()
                    const furn = store.furniture.find(f => f.id === store.selectedId)
                    if (furn) {
                        store.updateFurniture(store.selectedId, { rotation: { ...furn.rotation, y: furn.rotation.y + Math.PI / 2 } })
                    }
                }
            }
            // J - Corner Snap / Join
            if (e.key.toLowerCase() === 'j' && !e.repeat) { // Prevent repeat triggering
                const store = useFloorplanStore.getState()
                if (store.selectedId && store.walls.some(w => w.id === store.selectedId)) {
                    e.preventDefault()
                    store.setJoinMode(true)
                }
            }

            // Enter - Confirm Join
            if (e.key === 'Enter') {
                const store = useFloorplanStore.getState()
                if (store.joinMode) {
                    e.preventDefault()
                    store.applyJoin()
                }
            }

            // Escape - Cancel or Deselect
            if (e.key === 'Escape') {
                const store = useFloorplanStore.getState()
                if (store.joinMode) {
                    e.preventDefault()
                    store.setJoinMode(false)
                } else if (store.selectedId) {
                    e.preventDefault()
                    store.selectObject(null)
                }
            }
        }

        const handleKeyUp = () => {
            // Releasing J no longer auto-applies, user must press Enter to confirm
            // Kept for future potential hooks
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, []) // Empty dependencies strictly prevents event handlers tearing mid-keystroke

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
                activeTool === 'wall' ? "cursor-crosshair" : (activeTool === 'ruler' ? "cursor-default" : "cursor-default")
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
            <DebugOverlay />
            <Canvas
                shadows
                gl={{
                    antialias: false, // Fix: Disabled to prevent black flickers when using EffectComposer
                    toneMapping: ACESFilmicToneMapping,
                    toneMappingExposure: 1.0,
                }}
                className="w-full h-full"
            >
                <Suspense fallback={null}>
                    <SceneContent />
                    {uploadedImage && <BackgroundPlane />}
                    <FloorplanOverlay />
                </Suspense>
            </Canvas>

            {/* Reference View (Draggable/Resizable) */}
            <ReferenceOverlay />

            <TutorialOverlay />
        </div>
    )
}

const DebugOverlay = () => {
    const s = useFloorplanStore()
    return (
        <div className="absolute top-2 left-2 z-[9999] pointer-events-none text-[10px] bg-black/80 text-green-400 p-2 rounded shadow-lg font-mono flex flex-col gap-1 w-[250px] opacity-80 backdrop-blur-sm">
            <div className="text-white border-b border-white/20 pb-1 mb-1">DEBUG PANEL</div>
            <div>Calib: {s.calibrationFactor.toExponential(2)}</div>
            <div>Ratio: {(s.calibrationFactor / 0.01).toFixed(2)}x</div>
            <div>ImgPx: {s.imageDimensions ? `${s.imageDimensions.width}x${s.imageDimensions.height}` : 'null'}</div>
            <div>ImgWorld: {s.imageWorldWidth != null ? `${s.imageWorldWidth.toFixed(1)} x ${s.imageWorldHeight?.toFixed(1)}` : 'null'}</div>
            <div>Walls: {s.walls.length}</div>
            {s.walls[0] && <div>W0 Len: {Math.sqrt((s.walls[0].end.x - s.walls[0].start.x) ** 2 + (s.walls[0].end.y - s.walls[0].start.y) ** 2).toFixed(2)}</div>}
            {s.walls[0] && <div>W0 Pos: {s.walls[0].start.x.toFixed(1)}, {s.walls[0].start.y.toFixed(1)}</div>}
        </div>
    )
}
