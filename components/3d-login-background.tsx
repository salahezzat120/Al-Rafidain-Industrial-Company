"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float, Text3D, MeshDistortMaterial } from "@react-three/drei"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

function AnimatedTruck({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 2
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[1.5, 0.8, 0.6]} />
        <MeshDistortMaterial color="#3b82f6" distort={0.3} speed={2} roughness={0.1} />
      </mesh>
    </Float>
  )
}

function AnimatedPackage({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <MeshDistortMaterial color="#f59e0b" distort={0.2} speed={1.5} roughness={0.2} />
    </mesh>
  )
}

function FloatingOrbs() {
  const orbsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (orbsRef.current) {
      orbsRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <group ref={orbsRef}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.3} floatIntensity={0.8}>
          <mesh
            position={[Math.cos((i / 8) * Math.PI * 2) * 6, Math.sin(i * 0.5) * 2, Math.sin((i / 8) * Math.PI * 2) * 6]}
          >
            <sphereGeometry args={[0.3, 16, 16]} />
            <MeshDistortMaterial
              color={i % 2 === 0 ? "#8b5cf6" : "#06b6d4"}
              distort={0.4}
              speed={2 + i * 0.1}
              roughness={0}
              metalness={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

export function ThreeDLoginBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />

        <AnimatedTruck position={[-4, 2, 0]} />
        <AnimatedTruck position={[4, -1, -2]} />

        <AnimatedPackage position={[-2, -2, 1]} />
        <AnimatedPackage position={[3, 1, -1]} />
        <AnimatedPackage position={[0, 3, 2]} />

        <FloatingOrbs />

        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
          <Text3D font="/fonts/Inter_Bold.json" size={0.8} height={0.1} position={[-3, -4, 0]}>
            DELIVERY
            <MeshDistortMaterial
              color="#ffffff"
              distort={0.1}
              speed={1}
              roughness={0}
              metalness={0.5}
              transparent
              opacity={0.8}
            />
          </Text3D>
        </Float>

        <Environment preset="city" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}
