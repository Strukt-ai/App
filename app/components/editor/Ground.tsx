'use client'

export function Ground() {
    return (
        <mesh
            name="Ground"
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.15, 0]}
            receiveShadow
        >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial
                color="#151515"
                roughness={1}
                metalness={0}
            />
        </mesh>
    )
}
