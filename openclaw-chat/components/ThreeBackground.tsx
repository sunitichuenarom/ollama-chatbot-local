"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ============================================
// Particle System Component (ภายใน Canvas)
// ============================================

const PARTICLE_COUNT = 1500;

function ParticleField() {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  // Generate particle positions and properties
  const { positions, colors, sizes, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Random positions in a sphere
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 15;

      // Cyberpunk gradient colors: purple → cyan → pink
      const t = Math.random();
      if (t < 0.33) {
        // Purple: rgb(139, 92, 246)
        colors[i3] = 0.545;
        colors[i3 + 1] = 0.361;
        colors[i3 + 2] = 0.965;
      } else if (t < 0.66) {
        // Cyan: rgb(34, 211, 238)
        colors[i3] = 0.133;
        colors[i3 + 1] = 0.827;
        colors[i3 + 2] = 0.933;
      } else {
        // Pink: rgb(244, 114, 182)
        colors[i3] = 0.957;
        colors[i3 + 1] = 0.447;
        colors[i3 + 2] = 0.714;
      }

      sizes[i] = Math.random() * 3 + 0.5;

      // Slow drift velocities
      velocities[i3] = (Math.random() - 0.5) * 0.005;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.005;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.003;
    }

    return { positions, colors, sizes, velocities };
  }, []);

  // Mouse interaction handler
  const handlePointerMove = useCallback(
    (e: MouseEvent) => {
      mouseRef.current.x =
        ((e.clientX / window.innerWidth) * 2 - 1) * viewport.width * 0.5;
      mouseRef.current.y =
        (-(e.clientY / window.innerHeight) * 2 + 1) * viewport.height * 0.5;
    },
    [viewport]
  );

  // Register/unregister mouse listener properly
  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [handlePointerMove]);

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current) return;

    const pos = meshRef.current.geometry.attributes.position
      .array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Base drift movement
      pos[i3] += velocities[i3];
      pos[i3 + 1] += velocities[i3 + 1];
      pos[i3 + 2] += velocities[i3 + 2];

      // Gentle sine wave
      pos[i3 + 1] += Math.sin(time * 0.3 + i * 0.01) * 0.002;

      // Mouse repulsion effect
      const dx = pos[i3] - mouseRef.current.x;
      const dy = pos[i3 + 1] - mouseRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 3 && dist > 0) {
        const force = (3 - dist) * 0.01;
        pos[i3] += (dx / dist) * force;
        pos[i3 + 1] += (dy / dist) * force;
      }

      // Wrap around boundaries
      if (pos[i3] > 10) pos[i3] = -10;
      if (pos[i3] < -10) pos[i3] = 10;
      if (pos[i3 + 1] > 10) pos[i3 + 1] = -10;
      if (pos[i3 + 1] < -10) pos[i3 + 1] = 10;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.rotation.z = time * 0.02;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ============================================
// Nebula Glow — Ambient background glow
// ============================================

function NebulaGlow() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.01;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <sphereGeometry args={[8, 32, 32]} />
      <meshBasicMaterial
        color="#6d28d9"
        transparent
        opacity={0.15}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ============================================
// Main Exported Component
// ============================================

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1628 100%)" }}
      >
        <ambientLight intensity={0.2} />
        <ParticleField />
        <NebulaGlow />
      </Canvas>
    </div>
  );
}
