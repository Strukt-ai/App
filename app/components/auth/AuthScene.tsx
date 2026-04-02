'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  ContactShadows,
  Float,
  MeshTransmissionMaterial,
  Lightformer,
  Text3D,
  Center,
  RoundedBox
} from '@react-three/drei';
import * as THREE from 'three';

// Procedurally generated 3D Floor Plan & Furniture
function RoomLayout() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating and subtle rotation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Glossy Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Glass Walls (Floor Plan) */}
      <group position={[0, 1.5, -2]}>
        {/* Central Hub */}
        <RoundedBox args={[8, 3, 0.2]} position={[0, 0, -3]} radius={0.05} smoothness={4}>
          <MeshTransmissionMaterial
            backside
            thickness={2}
            roughness={0}
            transmission={1}
            ior={1.5}
            chromaticAberration={0.05}
            anisotropy={0.1}
            color="#b6a0ff"
          />
        </RoundedBox>
        <RoundedBox args={[0.2, 3, 6]} position={[-4, 0, 0]} radius={0.05} smoothness={4}>
          <MeshTransmissionMaterial thickness={2} roughness={0.1} transmission={1} ior={1.5} color="#00e3fd" />
        </RoundedBox>
        <RoundedBox args={[0.2, 3, 6]} position={[4, 0, 0]} radius={0.05} smoothness={4}>
          <MeshTransmissionMaterial thickness={2} roughness={0.1} transmission={1} ior={1.5} color="#ff6c95" />
        </RoundedBox>

        {/* Abstract Desks */}
        <RoundedBox args={[2, 0.1, 1]} position={[-2, -0.5, -1]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color="#1c2028" metalness={0.6} roughness={0.2} />
        </RoundedBox>
        <RoundedBox args={[2, 0.1, 1]} position={[2, -0.5, -1]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color="#1c2028" metalness={0.6} roughness={0.2} />
        </RoundedBox>

        {/* Floating Abstract "Chairs" */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[-2, -0.8, -0.2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.4, 32]} />
            <meshStandardMaterial color="#b6a0ff" roughness={0.4} metalness={0.2} />
          </mesh>
        </Float>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
          <mesh position={[2, -0.8, -0.2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.4, 32]} />
            <meshStandardMaterial color="#00e3fd" roughness={0.4} metalness={0.2} />
          </mesh>
        </Float>
      </group>
    </group>
  );
}

function FloatingLogo() {
  const logoRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (logoRef.current) {
      const t = state.clock.getElapsedTime();
      logoRef.current.position.y = Math.sin(t) * 0.2 + 2;
      logoRef.current.rotation.y = Math.sin(t / 2) * 0.3;
      logoRef.current.rotation.z = Math.sin(t / 3) * 0.1;
    }
  });

  return (
    <group ref={logoRef} position={[0, 2, -2]}>
      {/* Abstract structural logo piece */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1, 0.3, 16, 100]} />
        <MeshTransmissionMaterial
          backside
          thickness={1}
          roughness={0}
          transmission={1}
          ior={1.2}
          chromaticAberration={1}
          anisotropy={0.3}
          color="#ff4081"
        />
      </mesh>
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.1, 16, 100]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function MovingLights() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (lightRef.current) {
      const t = state.clock.getElapsedTime();
      lightRef.current.position.x = Math.sin(t * 0.5) * 5;
      lightRef.current.position.z = Math.cos(t * 0.5) * 5;
    }
  });

  return (
    <group>
      <pointLight ref={lightRef} color="#b6a0ff" intensity={15} distance={10} position={[0, 3, 0]} />
      <pointLight color="#00e3fd" intensity={10} distance={15} position={[-5, 2, -5]} />
      <pointLight color="#ff6c95" intensity={10} distance={15} position={[5, 2, -5]} />
      <spotLight color="#ffffff" intensity={5} position={[0, 10, 0]} angle={0.5} penumbra={1} castShadow />
    </group>
  );
}

export default function AuthScene() {
  return (
    <div className="absolute inset-0 z-0 bg-[#0b0e14]">
      <Canvas shadows camera={{ position: [0, 2, 8], fov: 45 }}>
        <fog attach="fog" args={['#0b0e14', 5, 20]} />
        
        {/* Lights & Environment */}
        <MovingLights />
        <Environment preset="city" environmentIntensity={0.5}>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <Lightformer intensity={5} color="white" position={[0, 5, -9]} rotation={[0, Math.PI / 2, 0]} scale={[10, 10, 1]} />
            <Lightformer intensity={2} color="#b6a0ff" position={[-5, 5, -9]} rotation={[0, Math.PI / 2, 0]} scale={[10, 10, 1]} />
          </group>
        </Environment>

        <Suspense fallback={null}>
          <RoomLayout />
          <FloatingLogo />
          <ContactShadows position={[0, -0.99, 0]} scale={20} blur={2} far={10} opacity={0.5} color="#000" />
        </Suspense>

        {/* Orbit control alternative: smooth mouse tracking */}
        <Rig />
      </Canvas>
    </div>
  );
}

function Rig() {
  const target = new THREE.Vector3();
  useFrame((state) => {
    target.set(
      (state.pointer.x * state.viewport.width) / 10,
      (state.pointer.y * state.viewport.height) / 10 + 2,
      8
    );
    state.camera.position.lerp(target, 0.05);
    state.camera.lookAt(0, 1, 0);
  });
  return null;
}
