"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";

interface TShirtViewerProps {
  frontTexture?: string;
  backTexture?: string;
  activeView: "front" | "back";
  onViewChange?: (view: "front" | "back") => void;
}

function TShirtModel({
  frontTexture,
  backTexture,
  activeView,
}: {
  frontTexture?: string;
  backTexture?: string;
  activeView: "front" | "back";
}) {
  const meshRef = useRef<THREE.Group>(null);

  try {
    const { scene } = useGLTF("/tshirt/source/Tshirt.glb");

    // Rotate the model based on active view
    useFrame(() => {
      if (meshRef.current) {
        const targetRotation = activeView === "front" ? 0 : Math.PI;
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
          meshRef.current.rotation.y,
          targetRotation,
          0.1
        );
      }
    });

    return (
      <group ref={meshRef} scale={[1.5, 1.5, 1.5]} position={[0, 0, 0]}>
        <primitive object={scene.clone()} />
      </group>
    );
  } catch (error) {
    // Fallback to a simple box if model fails to load
    return (
      <mesh>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color="#4F46E5" />
      </mesh>
    );
  }
}

export default function TShirtViewer({
  frontTexture,
  backTexture,
  activeView,
  onViewChange,
}: TShirtViewerProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{
          background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <spotLight position={[-10, -10, -5]} intensity={0.5} />

        <TShirtModel
          frontTexture={frontTexture}
          backTexture={backTexture}
          activeView={activeView}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />

        <Environment preset="studio" />
      </Canvas>

      {/* View Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <button
          onClick={() => onViewChange?.("front")}
          className={`px-4 py-2 font-black text-sm border-2 border-black transition-all duration-200 hover:scale-105 ${
            activeView === "front"
              ? "bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          FRONT
        </button>
        <button
          onClick={() => onViewChange?.("back")}
          className={`px-4 py-2 font-black text-sm border-2 border-black transition-all duration-200 hover:scale-105 ${
            activeView === "back"
              ? "bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          BACK
        </button>
      </div>
    </div>
  );
}
