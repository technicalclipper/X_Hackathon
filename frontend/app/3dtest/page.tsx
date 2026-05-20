"use client";

import { GLBViewer, RetroWindow, RetroButton } from "@/components";
import { useRetroSound } from "@/hooks/useRetroSound";

export default function Home() {
  const { playStartupSound, playClickSound } = useRetroSound();

  const handleStartupClick = () => {
    playStartupSound();
  };

  const handleButtonClick = () => {
    playClickSound();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-300 p-4 retro-grid">
      {/* Main desktop area */}
      <div className="w-full h-screen flex flex-col items-center justify-center space-y-6">
        {/* Header */}

        <div className="space-y-4">
          <GLBViewer
            url="/psg.glb"
            className="w-full h-[800px]"
            scale={1}
            position={[0, 0, 0]}
            autoRotate={false}
            // Camera controls (matching debug metric terminology)
            cameraPosition={[-0.74, 1.44, 2.81]} // Base position
            cameraRotation={[0, 0, 0]} // Camera rotation in degrees [x, y, z]
            cameraDistance={2} // Override distance from target (overrides position)
            cameraFOV={60} // Field of view in degrees
            cameraTarget={[0, 1, 1]} // Look at point
            // Lighting controls with positions
            ambientIntensity={2}
            directionalIntensity={1.5}
            directionalPosition={[10, 10, 5]} // Directional light position
            pointIntensity={1}
            pointPosition={[-5, -5, -5]} // Point light position
            // Model controls
            modelOffset={[0, 0, 1]} // Model position offset
            // Debug overlay
            showDebug={false}
            // Debug control examples - customize which metrics to show
            showCameraMetrics={true}
            showCameraPosition={true}
            showCameraRotation={true}
            showCameraDistance={true} // Shows controlled distance
            showCameraFOV={true} // Shows controlled FOV
            showCameraTarget={true}
            showLightingMetrics={true}
            showAmbientLight={true}
            showDirectionalLight={true}
            showDirectionalPosition={true} // NEW: Shows directional light position
            showPointLight={true}
            showPointPosition={true} // NEW: Shows point light position
            showModelMetrics={true}
            showModelOffset={true}
            showPerformanceMetrics={true}
            showFPS={true}
          />
        </div>
      </div>
    </div>
  );
}
