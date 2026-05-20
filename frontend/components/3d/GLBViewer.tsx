"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface GLBModelProps {
  url: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoRotate?: boolean;
}

function GLBModel({
  url,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoRotate = false,
  modelOffset = [0, 0, 0],
}: GLBModelProps & { modelOffset?: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);

  useFrame((state) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const clonedScene = scene.clone();

  // Apply model offset
  const finalPosition: [number, number, number] = [
    position[0] + modelOffset[0],
    position[1] + modelOffset[1],
    position[2] + modelOffset[2],
  ];

  return (
    <group
      ref={meshRef}
      position={finalPosition}
      rotation={rotation}
      scale={scale}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

function FallbackModel({
  scale,
  position,
  rotation,
}: Omit<GLBModelProps, "url">) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#FF0040" wireframe />
      </mesh>
    </group>
  );
}

// Camera controller component (inside Canvas)
function CameraController({
  rotation,
  onUpdate,
}: {
  rotation?: [number, number, number];
  onUpdate: (data: any) => void;
}) {
  const { camera } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());

  // Apply camera rotation override if provided
  useEffect(() => {
    if (rotation) {
      camera.rotation.set(
        (rotation[0] * Math.PI) / 180, // Convert degrees to radians
        (rotation[1] * Math.PI) / 180,
        (rotation[2] * Math.PI) / 180
      );
    }
  }, [rotation, camera]);

  useFrame(() => {
    const pos = camera.position;
    const rot = camera.rotation;

    // Calculate FPS
    frameCount.current++;
    const now = Date.now();
    let fps = 0;
    if (now - lastTime.current >= 1000) {
      fps = (frameCount.current * 1000) / (now - lastTime.current);
      frameCount.current = 0;
      lastTime.current = now;
    }

    onUpdate({
      cameraPosition: [
        Math.round(pos.x * 100) / 100,
        Math.round(pos.y * 100) / 100,
        Math.round(pos.z * 100) / 100,
      ],
      cameraRotation: [
        Math.round(((rot.x * 180) / Math.PI) * 100) / 100,
        Math.round(((rot.y * 180) / Math.PI) * 100) / 100,
        Math.round(((rot.z * 180) / Math.PI) * 100) / 100,
      ],
      fov: "fov" in camera ? (camera as THREE.PerspectiveCamera).fov : 0,
      fps: fps > 0 ? Math.round(fps) : undefined,
    });
  });

  return null;
}

// Debug metrics component (outside Canvas)
function DebugMetrics({
  ambientIntensity,
  directionalIntensity,
  directionalPosition,
  pointIntensity,
  pointPosition,
  modelOffset,
  cameraTarget,
  cameraDistance,
  cameraFOV,
  metrics,
  // Debug display controls
  showCameraMetrics = true,
  showCameraPosition = true,
  showCameraRotation = true,
  showCameraDistance = true,
  showCameraFOV = true,
  showCameraTarget = true,
  showLightingMetrics = true,
  showAmbientLight = true,
  showDirectionalLight = true,
  showDirectionalPosition = true,
  showPointLight = true,
  showPointPosition = true,
  showModelMetrics = true,
  showModelOffset = true,
  showPerformanceMetrics = true,
  showFPS = true,
}: {
  ambientIntensity: number;
  directionalIntensity: number;
  directionalPosition: [number, number, number];
  pointIntensity: number;
  pointPosition: [number, number, number];
  modelOffset: [number, number, number];
  cameraTarget: [number, number, number];
  cameraDistance?: number;
  cameraFOV: number;
  metrics: {
    cameraPosition: [number, number, number];
    cameraRotation: [number, number, number];
    fov: number;
    fps: number;
  };
  // Debug display control props
  showCameraMetrics?: boolean;
  showCameraPosition?: boolean;
  showCameraRotation?: boolean;
  showCameraDistance?: boolean;
  showCameraFOV?: boolean;
  showCameraTarget?: boolean;
  showLightingMetrics?: boolean;
  showAmbientLight?: boolean;
  showDirectionalLight?: boolean;
  showDirectionalPosition?: boolean;
  showPointLight?: boolean;
  showPointPosition?: boolean;
  showModelMetrics?: boolean;
  showModelOffset?: boolean;
  showPerformanceMetrics?: boolean;
  showFPS?: boolean;
}) {
  const distanceToTarget = React.useMemo(() => {
    const pos = new THREE.Vector3(...metrics.cameraPosition);
    const target = new THREE.Vector3(...cameraTarget);
    return Math.round(pos.distanceTo(target) * 100) / 100;
  }, [metrics.cameraPosition, cameraTarget]);

  // Don't render if no sections are enabled
  if (
    !showCameraMetrics &&
    !showLightingMetrics &&
    !showModelMetrics &&
    !showPerformanceMetrics
  ) {
    return null;
  }

  return (
    <div className="absolute top-2 left-2 bg-black bg-opacity-90 text-green-400 text-xs font-mono p-3 rounded max-w-xs z-50 pointer-events-none">
      <div className="text-yellow-400 font-bold mb-2">📊 DEBUG METRICS</div>

      <div className="space-y-1">
        {/* Camera Section */}
        {showCameraMetrics && (
          <>
            <div className="text-cyan-400 font-bold">🎥 CAMERA</div>
            {showCameraPosition && (
              <div>Position: [{metrics.cameraPosition.join(", ")}]</div>
            )}
            {showCameraRotation && (
              <div>Rotation: [{metrics.cameraRotation.join("°, ")}°]</div>
            )}
            {showCameraDistance && (
              <div>
                Distance:{" "}
                {cameraDistance !== undefined
                  ? cameraDistance
                  : distanceToTarget}
              </div>
            )}
            {showCameraFOV && <div>FOV: {cameraFOV}°</div>}
            {showCameraTarget && <div>Target: [{cameraTarget.join(", ")}]</div>}
          </>
        )}

        {/* Lighting Section */}
        {showLightingMetrics && (
          <>
            <div className="text-orange-400 font-bold mt-2">💡 LIGHTING</div>
            {showAmbientLight && <div>Ambient: {ambientIntensity}</div>}
            {showDirectionalLight && (
              <div>Directional: {directionalIntensity}</div>
            )}
            {showDirectionalPosition && (
              <div>Dir. Pos: [{directionalPosition.join(", ")}]</div>
            )}
            {showPointLight && <div>Point: {pointIntensity}</div>}
            {showPointPosition && (
              <div>Point Pos: [{pointPosition.join(", ")}]</div>
            )}
          </>
        )}

        {/* Model Section */}
        {showModelMetrics && (
          <>
            <div className="text-purple-400 font-bold mt-2">🎯 MODEL</div>
            {showModelOffset && <div>Offset: [{modelOffset.join(", ")}]</div>}
          </>
        )}

        {/* Performance Section */}
        {showPerformanceMetrics && (
          <>
            <div className="text-red-400 font-bold mt-2">⚡ PERFORMANCE</div>
            {showFPS && <div>FPS: {metrics.fps}</div>}
          </>
        )}
      </div>
    </div>
  );
}

interface GLBViewerProps {
  url: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoRotate?: boolean;
  className?: string;
  // Camera controls (matching debug metric terminology)
  cameraPosition?: [number, number, number];
  cameraRotation?: [number, number, number]; // NEW: Direct camera rotation control
  cameraDistance?: number; // NEW: Direct distance control (overrides position if set)
  cameraFOV?: number; // NEW: Field of view control
  cameraTarget?: [number, number, number];
  // Lighting controls
  ambientIntensity?: number;
  directionalIntensity?: number;
  directionalPosition?: [number, number, number]; // NEW: Directional light position
  pointIntensity?: number;
  pointPosition?: [number, number, number]; // NEW: Point light position
  // Model controls
  modelOffset?: [number, number, number];
  // Debug controls
  showDebug?: boolean;
  // Debug display controls - Section level
  showCameraMetrics?: boolean;
  showLightingMetrics?: boolean;
  showModelMetrics?: boolean;
  showPerformanceMetrics?: boolean;
  // Debug display controls - Individual metrics
  showCameraPosition?: boolean;
  showCameraRotation?: boolean;
  showCameraDistance?: boolean;
  showCameraFOV?: boolean;
  showCameraTarget?: boolean;
  showAmbientLight?: boolean;
  showDirectionalLight?: boolean;
  showDirectionalPosition?: boolean;
  showPointLight?: boolean;
  showPointPosition?: boolean;
  showModelOffset?: boolean;
  showFPS?: boolean;
}

export default function GLBViewer({
  url,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoRotate = false,
  className = "w-full h-96",
  // Camera controls (matching debug metric terminology)
  cameraPosition = [0, 0, 5],
  cameraRotation, // NEW: Optional camera rotation override
  cameraDistance, // NEW: Optional distance override
  cameraFOV = 50, // NEW: Field of view control
  cameraTarget = [0, 0, 0],
  // Lighting controls
  ambientIntensity = 0.4,
  directionalIntensity = 1,
  directionalPosition = [10, 10, 5], // NEW: Directional light position
  pointIntensity = 0.3,
  pointPosition = [-10, -10, -10], // NEW: Point light position
  // Model controls
  modelOffset = [0, 0, 0],
  // Debug defaults
  showDebug = false,
  // Debug display controls - Section level
  showCameraMetrics = true,
  showLightingMetrics = true,
  showModelMetrics = true,
  showPerformanceMetrics = true,
  // Debug display controls - Individual metrics
  showCameraPosition = true,
  showCameraRotation = true,
  showCameraDistance = true,
  showCameraFOV = true,
  showCameraTarget = true,
  showAmbientLight = true,
  showDirectionalLight = true,
  showDirectionalPosition = true,
  showPointLight = true,
  showPointPosition = true,
  showModelOffset = true,
  showFPS = true,
}: GLBViewerProps) {
  const [isClient, setIsClient] = useState(false);
  const [debugMetrics, setDebugMetrics] = useState({
    cameraPosition: [0, 0, 0] as [number, number, number],
    cameraRotation: [0, 0, 0] as [number, number, number],
    fov: 0,
    fps: 0,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate final camera position (distance override takes precedence)
  const finalCameraPosition = React.useMemo(() => {
    if (cameraDistance !== undefined) {
      // Calculate position based on distance and target
      const direction = new THREE.Vector3(
        cameraPosition[0] - cameraTarget[0],
        cameraPosition[1] - cameraTarget[1],
        cameraPosition[2] - cameraTarget[2]
      ).normalize();

      const newPosition = new THREE.Vector3(...cameraTarget).add(
        direction.multiplyScalar(cameraDistance)
      );

      return [newPosition.x, newPosition.y, newPosition.z] as [
        number,
        number,
        number
      ];
    }
    return cameraPosition;
  }, [cameraPosition, cameraTarget, cameraDistance]);

  if (!isClient) {
    return <div className={className} />;
  }

  return (
    <div className={className}>
      <Canvas
        camera={{
          position: finalCameraPosition,
          fov: cameraFOV,
          near: 0.1,
          far: 1000,
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={ambientIntensity} />
          <directionalLight
            position={directionalPosition}
            intensity={directionalIntensity}
          />
          <pointLight position={pointPosition} intensity={pointIntensity} />

          <Suspense
            fallback={
              <FallbackModel
                scale={scale}
                position={position}
                rotation={rotation}
              />
            }
          >
            <GLBModel
              url={url}
              scale={scale}
              position={position}
              rotation={rotation}
              autoRotate={autoRotate}
              modelOffset={modelOffset}
            />
          </Suspense>

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={0.5}
            maxDistance={50}
            target={cameraTarget}
          />

          {/* Camera tracker inside Canvas */}
          {showDebug && (
            <CameraController
              rotation={cameraRotation}
              onUpdate={(data) => {
                setDebugMetrics((prev) => ({ ...prev, ...data }));
              }}
            />
          )}
        </Suspense>
      </Canvas>

      {/* Debug metrics outside Canvas as DOM overlay */}
      {showDebug && (
        <DebugMetrics
          ambientIntensity={ambientIntensity}
          directionalIntensity={directionalIntensity}
          directionalPosition={directionalPosition}
          pointIntensity={pointIntensity}
          pointPosition={pointPosition}
          modelOffset={modelOffset}
          cameraTarget={cameraTarget}
          cameraDistance={cameraDistance}
          cameraFOV={cameraFOV}
          metrics={debugMetrics}
          // Debug display controls
          showCameraMetrics={showCameraMetrics}
          showCameraPosition={showCameraPosition}
          showCameraRotation={showCameraRotation}
          showCameraDistance={showCameraDistance}
          showCameraFOV={showCameraFOV}
          showCameraTarget={showCameraTarget}
          showLightingMetrics={showLightingMetrics}
          showAmbientLight={showAmbientLight}
          showDirectionalLight={showDirectionalLight}
          showDirectionalPosition={showDirectionalPosition}
          showPointLight={showPointLight}
          showPointPosition={showPointPosition}
          showModelMetrics={showModelMetrics}
          showModelOffset={showModelOffset}
          showPerformanceMetrics={showPerformanceMetrics}
          showFPS={showFPS}
        />
      )}
    </div>
  );
}

GLBViewer.preload = (url: string) => {
  if (typeof window !== "undefined") {
    useGLTF.preload(url);
  }
};
