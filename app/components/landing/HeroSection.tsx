"use client"

import { useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function MorphRoomScene() {
  const groupRef = useRef<THREE.Group>(null)
  const planRef = useRef<THREE.Group>(null)
  const roomRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.12
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.06
    }

    if (planRef.current && roomRef.current) {
      const blend = (Math.sin(t * 0.75) + 1) / 2
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t
      planRef.current.position.x = lerp(-1.7, -0.9, blend)
      roomRef.current.position.x = lerp(1.7, 0.95, blend)
      roomRef.current.scale.y = lerp(0.82, 1.08, blend)
    }
  })

  const particleData = useMemo(
    () =>
      [...Array(70)].map(() => ({
        x: (Math.random() - 0.5) * 7,
        y: (Math.random() - 0.5) * 3,
        z: (Math.random() - 0.5) * 4,
      })),
    []
  )

  return (
    <group ref={groupRef}>
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9.5, 5]} />
        <meshStandardMaterial color="#111215" roughness={0.9} metalness={0.15} />
      </mesh>

      <group ref={planRef}>
        <mesh position={[0, -0.87, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 2.4]} />
          <meshStandardMaterial color="#17181d" />
        </mesh>

        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(2.4, 2.4)]} />
          <lineBasicMaterial color="#6a7083" />
        </lineSegments>

        <mesh position={[0, -0.86, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.44, 0.48, 48]} />
          <meshBasicMaterial color="#f8c96b" />
        </mesh>

        <mesh position={[0.58, -0.86, -0.38]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.72, 0.04, 0.5]} />
          <meshStandardMaterial color="#2f3441" />
        </mesh>
      </group>

      <group ref={roomRef}>
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[1.9, 1.7, 1.9]} />
          <meshStandardMaterial color="#f0f1f4" roughness={0.82} metalness={0.05} />
        </mesh>

        <mesh position={[0, -0.82, 0]}>
          <boxGeometry args={[1.88, 0.06, 1.88]} />
          <meshStandardMaterial color="#8e6c4a" roughness={0.68} />
        </mesh>

        <mesh position={[0.44, -0.45, 0.5]}>
          <boxGeometry args={[0.5, 0.36, 0.24]} />
          <meshStandardMaterial color="#b0b6bf" roughness={0.7} />
        </mesh>

        <mesh position={[0.03, -0.36, 0.07]}>
          <boxGeometry args={[0.58, 0.24, 0.35]} />
          <meshStandardMaterial color="#7f8fa8" roughness={0.63} />
        </mesh>

        <mesh position={[-0.57, 0.04, -0.15]}>
          <boxGeometry args={[0.3, 1.2, 0.03]} />
          <meshStandardMaterial color="#ced4de" roughness={0.12} metalness={0.3} />
        </mesh>
      </group>

      <mesh position={[0, -0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.78, 0.01, 8, 50]} />
        <meshBasicMaterial color="#f7bd53" transparent opacity={0.42} />
      </mesh>

      {particleData.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.018, 10, 10]} />
          <meshBasicMaterial color="#f8cf84" transparent opacity={0.44} />
        </mesh>
      ))}
    </group>
  )
}

export function HeroSection({ onOpenVideo }: { onOpenVideo: () => void }) {
  const router = useRouter()

  return (
    <section className="relative min-h-screen pt-28 md:pt-32 pb-16 md:pb-20 overflow-hidden" aria-label="Hero">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,194,80,0.18),transparent_34%),radial-gradient(circle_at_8%_80%,rgba(91,115,255,0.2),transparent_34%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.22] landing-grid-bg pointer-events-none" />

      <div className="container mx-auto px-5 md:px-10 grid lg:grid-cols-[1.04fr_1fr] gap-12 items-center relative z-10">
        <article>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#ffc661]/35 bg-[#ffc661]/10 px-3.5 py-1 text-xs uppercase tracking-[0.2em] text-[#ffd886]">
            AI-native Spatial Pipeline
          </p>

          <h1 className="mt-6 text-4xl md:text-6xl leading-[1.05] font-heading font-bold text-white max-w-3xl">
            Convert Floor Plans to Editable 3D Spaces in Seconds.
          </h1>

          <p className="mt-5 text-zinc-300 text-base md:text-lg max-w-2xl leading-relaxed">
            The AI-native platform bridging customer taste and designer speed. No manual rebuilding.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/home')}
              className="px-7 py-3.5 rounded-lg bg-[#ffc247] text-black font-semibold shadow-[0_0_28px_rgba(255,194,71,0.45)] landing-pulse-button transition-transform hover:scale-[1.02]"
            >
              Start Building - Free
            </button>
            <button
              onClick={onOpenVideo}
              className="px-6 py-3.5 rounded-lg border border-white/25 text-white bg-white/4 hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Play size={16} className="fill-white" />
              Watch AI in Action
            </button>
          </div>
        </article>

        <article className="relative">
          <div className="relative h-95 md:h-130 rounded-3xl border border-white/10 bg-[linear-gradient(155deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] backdrop-blur-sm overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
            <Canvas>
              <ambientLight intensity={0.62} />
              <directionalLight position={[3, 5, 2]} intensity={1.1} />
              <pointLight position={[-3, 1, -1]} intensity={0.7} color="#86a0ff" />
              <MorphRoomScene />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.36} />
            </Canvas>

            <div className="absolute left-4 top-4 rounded-lg border border-white/15 bg-black/45 px-3 py-1.5 text-xs text-zinc-200">
              2D Plan {"->"} 3D Isometric Room
            </div>

            <div className="absolute right-4 top-4 w-40 h-24 rounded-lg border border-white/15 bg-black/45 p-3">
              <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">Spatial Engine</div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: "20%" }}
                  animate={{ width: ["20%", "75%", "42%", "92%"] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="h-full bg-[#ffc661]"
                />
              </div>
              <div className="mt-2 text-[11px] text-zinc-200">Extruding walls...</div>
            </div>

            <motion.div
              className="absolute left-5 bottom-5 w-65 md:w-72.5 rounded-2xl border border-white/20 bg-[rgba(18,18,22,0.58)] backdrop-blur-xl p-3.5"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="text-[11px] text-zinc-400">AI Chat</div>
              <div className="mt-1.5 text-sm text-zinc-100 landing-typing">
                Change the flooring to oak and extend the living room
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#ffd083]">
                <span className="h-2 w-2 rounded-full bg-[#ffc661] animate-pulse" />
                Regenerating 3D Space...
              </div>
            </motion.div>
          </div>
        </article>
      </div>
    </section>
  )
}
