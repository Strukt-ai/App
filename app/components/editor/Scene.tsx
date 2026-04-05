'use client'

import { useRef, useEffect, Suspense, useState, useMemo } from 'react'
import { Box3, Vector3, Object3D, TextureLoader, ACESFilmicToneMapping, MOUSE } from 'three'
import { Canvas, useThree, useLoader, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Grid, ContactShadows, SoftShadows, Sky, PointerLockControls } from '@react-three/drei'
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
import { CalibrationPanel } from './CalibrationPanel'
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

function FPVController() {
    const mode = useFloorplanStore(s => s.mode)
    const cameraMode = useFloorplanStore(s => s.cameraMode)
    const walls = useFloorplanStore(s => s.walls)
    const rooms = useFloorplanStore(s => s.rooms)
    const { camera, gl } = useThree()
    const controlsRef = useRef<any>(null)
    const moveStateRef = useRef({ forward: false, backward: false, left: false, right: false })
    const [, setLocked] = useState(false)

    const startPosition = useMemo(() => {
        const points = [
            ...walls.flatMap((wall) => [wall.start, wall.end]),
            ...rooms.flatMap((room) => room.points),
        ]
        if (points.length === 0) return new Vector3(0, 1.65, 4)
        const xs = points.map((p) => p.x)
        const ys = points.map((p) => p.y)
        const centerX = (Math.min(...xs) + Math.max(...xs)) / 2
        const centerZ = (Math.min(...ys) + Math.max(...ys)) / 2
        const depth = Math.max(3, (Math.max(...ys) - Math.min(...ys)) / 2)
        return new Vector3(centerX, 1.65, centerZ + depth)
    }, [walls, rooms])

    useEffect(() => {
        if (mode !== '3d' || cameraMode !== 'fpv') {
            if (document.pointerLockElement) document.exitPointerLock()
            setLocked(false)
            return
        }

        camera.position.copy(startPosition)
        camera.lookAt(startPosition.x, 1.65, startPosition.z - 2)

        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase()
            if (key === 'w') moveStateRef.current.forward = true
            if (key === 's') moveStateRef.current.backward = true
            if (key === 'a') moveStateRef.current.left = true
            if (key === 'd') moveStateRef.current.right = true
        }
        const handleKeyUp = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase()
            if (key === 'w') moveStateRef.current.forward = false
            if (key === 's') moveStateRef.current.backward = false
            if (key === 'a') moveStateRef.current.left = false
            if (key === 'd') moveStateRef.current.right = false
        }
        const onLockChange = () => setLocked(!!document.pointerLockElement)

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        document.addEventListener('pointerlockchange', onLockChange)
        return () => {
            moveStateRef.current = { forward: false, backward: false, left: false, right: false }
            if (document.pointerLockElement) document.exitPointerLock()
            setLocked(false)
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            document.removeEventListener('pointerlockchange', onLockChange)
        }
    }, [camera, cameraMode, mode, startPosition])

    // Lock mouse on canvas click when in FPV mode
    useEffect(() => {
        if (mode !== '3d' || cameraMode !== 'fpv') return
        const canvas = gl.domElement
        const onClick = () => {
            if (!document.pointerLockElement) canvas.requestPointerLock()
        }
        canvas.addEventListener('click', onClick)
        return () => canvas.removeEventListener('click', onClick)
    }, [gl, mode, cameraMode])

    useFrame((_, delta) => {
        if (mode !== '3d' || cameraMode !== 'fpv') return

        const direction = new Vector3()
        camera.getWorldDirection(direction)
        direction.y = 0
        direction.normalize()

        const right = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize()
        const movement = new Vector3()

        if (moveStateRef.current.forward) movement.add(direction)
        if (moveStateRef.current.backward) movement.sub(direction)
        if (moveStateRef.current.left) movement.sub(right)
        if (moveStateRef.current.right) movement.add(right)

        if (movement.lengthSq() === 0) return

        movement.normalize().multiplyScalar(3.2 * delta)
        const nextPosition = camera.position.clone().add(movement)
        nextPosition.y = 1.65

        const controls = controlsRef.current
        const object = controls?.getObject?.()
        if (object) object.position.copy(nextPosition)
        camera.position.copy(nextPosition)
    })

    if (mode !== '3d' || cameraMode !== 'fpv') return null
    // No selector — PointerLockControls handles mouse look; click handler above triggers lock
    return <PointerLockControls ref={controlsRef} />
}

// ─── FPV HTML overlay (outside Canvas) ───────────────────────────────────────
function FPVOverlay() {
    const mode = useFloorplanStore(s => s.mode)
    const cameraMode = useFloorplanStore(s => s.cameraMode)
    const [locked, setLocked] = useState(false)

    useEffect(() => {
        const onChange = () => setLocked(!!document.pointerLockElement)
        document.addEventListener('pointerlockchange', onChange)
        return () => document.removeEventListener('pointerlockchange', onChange)
    }, [])

    if (mode !== '3d' || cameraMode !== 'fpv') return null

    return (
        <>
            {/* Click-to-lock prompt */}
            {!locked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <div className="flex flex-col items-center gap-3 bg-black/60 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/10 shadow-2xl">
                        <div className="w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white/70" />
                        </div>
                        <p className="text-white text-sm font-semibold tracking-wide">Click to look around</p>
                        <div className="flex items-center gap-3 text-[11px] text-white/50">
                            <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">W A S D</kbd> Move</span>
                            <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> Release</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Crosshair when locked */}
            {locked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <div className="relative w-6 h-6">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white/60 -translate-y-1/2" />
                        <div className="absolute left-1/2 top-0 h-full w-px bg-white/60 -translate-x-1/2" />
                        <div className="absolute inset-[9px] rounded-full border border-white/40" />
                    </div>
                </div>
            )}

            {/* Controls hint (locked) */}
            {locked && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-40 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 text-[11px] text-white/50 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/8">
                        <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">W A S D</kbd> Walk</span>
                        <span className="text-white/20">·</span>
                        <span>Mouse — Look</span>
                        <span className="text-white/20">·</span>
                        <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> Release</span>
                    </div>
                </div>
            )}
        </>
    )
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
    const cameraMode = useFloorplanStore(s => s.cameraMode)
    const lightingPreset = useFloorplanStore(s => s.lightingPreset)

    // Lighting presets — tuned for clean architectural rendering
    const lightingConfigs = {
        day:    { sunIntensity: 2.8, sunColor: '#fff5e6', fillIntensity: 0.8, fillColor: '#e8f0ff', ambientIntensity: 0.5, fogColor: '#e8edf5', fogNear: 100, fogFar: 300, skyTurbidity: 2, skyRayleigh: 0.4, sunPos: [10, 20, 8]  as [number, number, number] },
        night:  { sunIntensity: 0.5, sunColor: '#99aacc', fillIntensity: 0.12, fillColor: '#334455', ambientIntensity: 0.18, fogColor: '#0f1520', fogNear: 60,  fogFar: 180, skyTurbidity: 20, skyRayleigh: 0.05, sunPos: [-5, -1, -5] as [number, number, number] },
        studio: { sunIntensity: 2.2, sunColor: '#ffffff', fillIntensity: 1.0, fillColor: '#f0f4ff', ambientIntensity: 0.55, fogColor: '#e0e4f0', fogNear: 120, fogFar: 350, skyTurbidity: 1, skyRayleigh: 0.2,  sunPos: [5, 15, 10]  as [number, number, number] },
        sunset: { sunIntensity: 2.2, sunColor: '#ff9944', fillIntensity: 0.45, fillColor: '#7788bb', ambientIntensity: 0.3,  fogColor: '#d4a870', fogNear: 80,  fogFar: 250, skyTurbidity: 3, skyRayleigh: 2.0,  sunPos: [15, 3, 8]   as [number, number, number] },
    }
    const lighting = lightingConfigs[lightingPreset]



    return (
        <>
            {/* Background: sky in 3D, dark in 2D */}
            {mode === '3d' ? (
                <>
                    <Sky
                        sunPosition={lighting.sunPos}
                        turbidity={lighting.skyTurbidity}
                        rayleigh={lighting.skyRayleigh}
                        mieCoefficient={0.005}
                        mieDirectionalG={0.8}
                    />
                    <fog attach="fog" args={[lighting.fogColor, lighting.fogNear, lighting.fogFar]} />
                </>
            ) : (
                <color attach="background" args={['#1a1a1a']} />
            )}

            {/* Soft shadows for realistic penumbra */}
            {mode === '3d' && <SoftShadows size={25} samples={16} focus={0.5} />}

            {/* Ambient base — raised for clean, even illumination */}
            <ambientLight intensity={lighting.ambientIntensity} color="#faf8f5" />

            {/* Hemisphere Light — warm sky, neutral ground for natural fill */}
            <hemisphereLight args={['#ffffff', '#c8b89a', 0.6]} />

            {/* HDRI Environment disabled — preset loading from CDN is unreliable; Sky + hemisphere lights are sufficient */}

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
                <PerspectiveCamera makeDefault position={[5, 12, 12]} fov={cameraMode === 'fpv' ? 75 : 50} />
            ) : (
                <OrthographicCamera makeDefault position={[0, 10, 0]} zoom={40} />
            )}

            {cameraMode === 'fpv' && mode === '3d' ? (
                <FPVController />
            ) : (
                <OrbitControls
                    makeDefault
                    enableRotate={mode === '3d'}
                    enableZoom={true}
                    enablePan={true}
                    enableDamping={false}
                    maxPolarAngle={mode === '3d' ? Math.PI / 2 : 0}
                    mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: null as any, RIGHT: MOUSE.PAN }}
                />
            )}

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
                        aoRadius={0.6}
                        intensity={1.2}
                        distanceFalloff={0.3}
                        quality="medium"
                    />
                    <Bloom
                        luminanceThreshold={1.2}
                        mipmapBlur
                        intensity={0.05}
                        radius={0.2}
                    />
                    <BrightnessContrast contrast={0.15} brightness={0.0} />
                    <Vignette
                        offset={0.4}
                        darkness={0.25}
                        blendFunction={BlendFunction.NORMAL}
                    />
                    <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
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
                opacity={1.0}
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
                // Prevent text selection / drag on the canvas itself,
                // but allow all native interactions on HTML overlays (toolbar buttons, inputs, labels).
                const target = e.target as HTMLElement
                if (target.tagName === 'CANVAS') {
                    e.preventDefault()
                }
            }}
        >
            {/* <DebugOverlay /> */}
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

            <TutorialOverlay />
            <CalibrationPanel />
            <FPVOverlay />
        </div>
    )
}

