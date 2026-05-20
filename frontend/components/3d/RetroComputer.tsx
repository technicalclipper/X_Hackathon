"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Box, Cylinder, Plane } from "@react-three/drei";
import * as THREE from "three";

interface RetroComputerProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  animate?: boolean;
}

export default function RetroComputer({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  animate = true,
}: RetroComputerProps) {
  const computerRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (animate && computerRef.current) {
      computerRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }

    if (screenRef.current && !Array.isArray(screenRef.current.material)) {
      // Subtle screen flicker effect
      const flicker = Math.sin(state.clock.elapsedTime * 20) * 0.1 + 0.9;
      (screenRef.current.material as THREE.MeshBasicMaterial).opacity = flicker;
    }
  });

  return (
    <group
      ref={computerRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* Computer Base/Body */}
      <Box args={[2, 1.5, 1.5]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#F2F2F2" />
      </Box>

      {/* Screen */}
      <Box args={[1.6, 1.2, 0.1]} position={[0, 0.3, 0.8]}>
        <meshStandardMaterial color="#2C2C2C" />
      </Box>

      {/* Screen Display */}
      <Plane args={[1.4, 1]} position={[0, 0.3, 0.86]} ref={screenRef}>
        <meshBasicMaterial color="#00FF41" transparent opacity={0.9} />
      </Plane>

      {/* Keyboard */}
      <Box args={[1.8, 0.1, 0.6]} position={[0, -1, 0.5]}>
        <meshStandardMaterial color="#C0C0C0" />
      </Box>

      {/* Keyboard Keys (simplified) */}
      {Array.from({ length: 20 }, (_, i) => (
        <Box
          key={i}
          args={[0.06, 0.02, 0.06]}
          position={[
            -0.7 + (i % 10) * 0.14,
            -0.94,
            0.4 + Math.floor(i / 10) * 0.1,
          ]}
        >
          <meshStandardMaterial color="#E5E5E5" />
        </Box>
      ))}

      {/* Mouse */}
      <Cylinder
        args={[0.08, 0.08, 0.04, 16]}
        position={[1.2, -0.98, 0.3]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial color="#C0C0C0" />
      </Cylinder>

      {/* Stand/Neck */}
      <Cylinder args={[0.1, 0.15, 0.8, 8]} position={[0, -0.1, 0.2]}>
        <meshStandardMaterial color="#F2F2F2" />
      </Cylinder>

      {/* Floppy Disk Slot */}
      <Box args={[0.2, 0.02, 0.1]} position={[0.6, -0.3, 0.76]}>
        <meshStandardMaterial color="#1A1A1A" />
      </Box>

      {/* Power LED */}
      <Cylinder args={[0.02, 0.02, 0.01, 8]} position={[-0.6, -0.2, 0.76]}>
        <meshBasicMaterial color="#FF0040" />
      </Cylinder>

      {/* Screen Reflection */}
      <Plane
        args={[1.4, 1]}
        position={[0, 0.3, 0.87]}
        rotation={[0, 0, Math.PI]}
      >
        <meshBasicMaterial
          color="white"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </Plane>
    </group>
  );
}
