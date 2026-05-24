"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import {
  ArrowLeft,
  Palette,
  Square,
  Circle,
  Triangle,
  Brush,
  Eraser,
  Image as ImageIcon,
  Undo,
  Redo,
  Save,
  Download,
  Upload,
  Type,
  Layers,
  Grid,
  ZoomIn,
  ZoomOut,
  Coins,
  ChevronDown,
  PenTool,
  Trophy,
  RotateCcw,
  Eye,
  EyeOff,
  Move,
  MousePointer,
  Trash2,
  Plus,
  Settings,
  RefreshCw,
} from "lucide-react";

// Interfaces
interface Tool {
  id: string;
  name: string;
  icon: any;
  category: "drawing" | "shapes" | "text" | "selection" | "view";
}

interface DesignElement {
  id: string;
  type: "brush" | "shape" | "text" | "image" | "logo";
  position: { x: number; y: number };
  data: any;
  visible: boolean;
  locked: boolean;
  side: "front" | "back";
}

// Custom hook for mouse position
function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return mousePosition;
}

// T-Shirt Model Component with Texture Painting
function TShirtModel({
  activeView,
  activeTool,
  brushColor,
  brushSize,
  onModelClick,
  designElements,
  selectedElement,
  onElementSelect,
  frontTexture,
  backTexture,
  isDrawing,
  onDrawingChange,
}: {
  activeView: "front" | "back";
  activeTool: string;
  brushColor: string;
  brushSize: number;
  onModelClick: (point: THREE.Vector3, uv: THREE.Vector2) => void;
  designElements: DesignElement[];
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  frontTexture: THREE.Texture | null;
  backTexture: THREE.Texture | null;
  isDrawing: boolean;
  onDrawingChange: (drawing: boolean) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const tshirtMeshRef = useRef<THREE.Mesh>(null);
  const { raycaster, camera, pointer } = useThree();

  // Load T-shirt model
  let gltf;
  try {
    gltf = useGLTF("/tshirt/source/Tshirt.glb");
  } catch (error) {
    console.warn("T-shirt model not found, using fallback");
  }

  // Handle model rotation based on active view
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

  // Handle mouse interactions
  const handlePointerDown = useCallback(
    (event: any) => {
      event.stopPropagation();

      if (activeTool === "brush" || activeTool === "eraser") {
        onDrawingChange(true);
      }

      raycaster.setFromCamera(pointer, camera);

      if (meshRef.current) {
        const intersects = raycaster.intersectObjects(
          meshRef.current.children,
          true
        );

        if (intersects.length > 0) {
          const intersection = intersects[0];
          const point = intersection.point;
          const uv = intersection.uv || new THREE.Vector2(0.5, 0.5);

          onModelClick(point, uv);
        }
      }
    },
    [activeTool, raycaster, camera, pointer, onModelClick, onDrawingChange]
  );

  const handlePointerMove = useCallback(
    (event: any) => {
      if (!isDrawing || (activeTool !== "brush" && activeTool !== "eraser"))
        return;

      raycaster.setFromCamera(pointer, camera);

      if (meshRef.current) {
        const intersects = raycaster.intersectObjects(
          meshRef.current.children,
          true
        );

        if (intersects.length > 0) {
          const intersection = intersects[0];
          const point = intersection.point;
          const uv = intersection.uv || new THREE.Vector2(0.5, 0.5);

          onModelClick(point, uv);
        }
      }
    },
    [isDrawing, activeTool, raycaster, camera, pointer, onModelClick]
  );

  const handlePointerUp = useCallback(() => {
    if (isDrawing) {
      onDrawingChange(false);
    }
  }, [isDrawing, onDrawingChange]);

  // Render design elements as 3D overlays
  const renderDesignElements = () => {
    return designElements
      .filter((element) => element.visible && element.side === activeView)
      .map((element) => {
        // Convert UV coordinates to 3D position on the T-shirt surface
        const x = (element.position.x - 0.5) * 2;
        const y = (element.position.y - 0.5) * 2;
        const z = activeView === "front" ? 0.1 : -0.1;

        const position = new THREE.Vector3(x, y, z);

        switch (element.type) {
          case "text":
            return (
              <Text
                key={element.id}
                position={position}
                fontSize={element.data.size || 0.15}
                color={element.data.color || "#000000"}
                anchorX="center"
                anchorY="middle"
                onClick={() => onElementSelect(element.id)}
                maxWidth={1}
              >
                {element.data.text || "Text"}
              </Text>
            );

          case "shape":
            return (
              <mesh
                key={element.id}
                position={position}
                onClick={() => onElementSelect(element.id)}
              >
                {element.data.shape === "circle" ? (
                  <circleGeometry args={[element.data.size || 0.1]} />
                ) : element.data.shape === "square" ? (
                  <planeGeometry
                    args={[element.data.size || 0.2, element.data.size || 0.2]}
                  />
                ) : (
                  <coneGeometry
                    args={[
                      element.data.size || 0.1,
                      element.data.size || 0.2,
                      3,
                    ]}
                  />
                )}
                <meshBasicMaterial
                  color={element.data.color || "#000000"}
                  transparent={true}
                  opacity={0.8}
                />
                {selectedElement === element.id && (
                  <lineSegments>
                    <edgesGeometry
                      args={[
                        element.data.shape === "circle"
                          ? new THREE.CircleGeometry(element.data.size || 0.1)
                          : new THREE.PlaneGeometry(
                              element.data.size || 0.2,
                              element.data.size || 0.2
                            ),
                      ]}
                    />
                    <lineBasicMaterial color="#ffff00" linewidth={3} />
                  </lineSegments>
                )}
              </mesh>
            );

          case "logo":
            return (
              <mesh
                key={element.id}
                position={position}
                onClick={() => onElementSelect(element.id)}
              >
                <planeGeometry
                  args={[element.data.size || 0.15, element.data.size || 0.15]}
                />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
                <Text
                  position={[0, 0, 0.01]}
                  fontSize={0.03}
                  color="#000000"
                  anchorX="center"
                  anchorY="middle"
                >
                  {element.data.name || "LOGO"}
                </Text>
                {selectedElement === element.id && (
                  <lineSegments>
                    <edgesGeometry
                      args={[
                        new THREE.PlaneGeometry(
                          element.data.size || 0.15,
                          element.data.size || 0.15
                        ),
                      ]}
                    />
                    <lineBasicMaterial color="#ffff00" linewidth={3} />
                  </lineSegments>
                )}
              </mesh>
            );

          default:
            return null;
        }
      });
  };

  // Create T-shirt geometry if model doesn't load
  const fallbackGeometry = useMemo(() => {
    const shape = new THREE.Shape();

    // T-shirt outline
    shape.moveTo(-1, 1.5);
    shape.lineTo(-1, 0.8);
    shape.lineTo(-1.5, 0.6);
    shape.lineTo(-1.5, 0.2);
    shape.lineTo(-1, 0);
    shape.lineTo(-1, -1.5);
    shape.lineTo(1, -1.5);
    shape.lineTo(1, 0);
    shape.lineTo(1.5, 0.2);
    shape.lineTo(1.5, 0.6);
    shape.lineTo(1, 0.8);
    shape.lineTo(1, 1.5);
    shape.lineTo(0.3, 1.5);
    shape.lineTo(0.3, 1.2);
    shape.lineTo(-0.3, 1.2);
    shape.lineTo(-0.3, 1.5);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: false,
    });
  }, []);

  if (gltf && gltf.scene) {
    // Clone the scene and apply textures
    const tshirtScene = gltf.scene.clone();

    // Apply texture to the T-shirt material
    tshirtScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          const material = child.material.clone();

          // Apply the appropriate texture based on the view
          const currentTexture =
            activeView === "front" ? frontTexture : backTexture;

          if (currentTexture) {
            if (material instanceof THREE.MeshStandardMaterial) {
              material.map = currentTexture;
              material.needsUpdate = true;
            }
          }

          child.material = material;
        }
      }
    });

    return (
      <group
        ref={meshRef}
        scale={[2, 2, 2]}
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <primitive object={tshirtScene} />
        {renderDesignElements()}
      </group>
    );
  }

  // Fallback T-shirt
  return (
    <group
      ref={meshRef}
      scale={[1.5, 1.5, 1.5]}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <mesh ref={tshirtMeshRef} geometry={fallbackGeometry}>
        <meshStandardMaterial
          color="#ffffff"
          map={activeView === "front" ? frontTexture : backTexture}
        />
      </mesh>
      {renderDesignElements()}
    </group>
  );
}

// Logo component for required logos
function LogoItem({
  logo,
  onAdd,
  isPlaced,
}: {
  logo: any;
  onAdd: () => void;
  isPlaced: boolean;
}) {
  return (
    <div
      className={`border-2 border-black p-3 ${
        isPlaced ? "bg-green-100" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-8 h-8 border border-black rounded flex items-center justify-center ${
            isPlaced ? "bg-green-400" : "bg-gray-300"
          }`}
        >
          {isPlaced ? (
            <span className="text-xs font-bold">✓</span>
          ) : (
            <span className="text-xs font-bold">{logo.name.charAt(0)}</span>
          )}
        </div>
        <span className="text-xs font-bold">{logo.name}</span>
      </div>
      <button
        onClick={onAdd}
        disabled={isPlaced}
        className={`w-full px-2 py-1 text-xs font-bold border-2 border-black transition-all duration-200 hover:scale-105 ${
          isPlaced
            ? "bg-green-400 text-black cursor-not-allowed"
            : "bg-white hover:bg-gray-100 text-black"
        }`}
      >
        {isPlaced ? "Added ✓" : "Add to Design"}
      </button>
    </div>
  );
}

// Main 3D T-Shirt Editor Component
export default function TShirtEditor3D() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mousePosition = useMousePosition();

  // Canvas refs for texture painting
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);

  // Texture states
  const [frontTexture, setFrontTexture] = useState<THREE.Texture | null>(null);
  const [backTexture, setBackTexture] = useState<THREE.Texture | null>(null);

  // State management
  const [activeTool, setActiveTool] = useState<string>("select");
  const [activeView, setActiveView] = useState<"front" | "back">("front");
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");
  const [designElements, setDesignElements] = useState<DesignElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize canvases and textures
  useEffect(() => {
    // Create front canvas
    const frontCanvas = document.createElement("canvas");
    frontCanvas.width = 1024;
    frontCanvas.height = 1024;
    frontCanvasRef.current = frontCanvas;

    const frontCtx = frontCanvas.getContext("2d");
    if (frontCtx) {
      frontCtx.fillStyle = "#ffffff";
      frontCtx.fillRect(0, 0, frontCanvas.width, frontCanvas.height);
    }

    const frontTex = new THREE.CanvasTexture(frontCanvas);
    frontTex.flipY = false;
    setFrontTexture(frontTex);

    // Create back canvas
    const backCanvas = document.createElement("canvas");
    backCanvas.width = 1024;
    backCanvas.height = 1024;
    backCanvasRef.current = backCanvas;

    const backCtx = backCanvas.getContext("2d");
    if (backCtx) {
      backCtx.fillStyle = "#ffffff";
      backCtx.fillRect(0, 0, backCanvas.width, backCanvas.height);
    }

    const backTex = new THREE.CanvasTexture(backCanvas);
    backTex.flipY = false;
    setBackTexture(backTex);
  }, []);

  // Available tools
  const tools: Tool[] = [
    { id: "select", name: "Select", icon: MousePointer, category: "selection" },
    { id: "move", name: "Move", icon: Move, category: "selection" },
    { id: "brush", name: "Brush", icon: Brush, category: "drawing" },
    { id: "eraser", name: "Eraser", icon: Eraser, category: "drawing" },
    { id: "square", name: "Rectangle", icon: Square, category: "shapes" },
    { id: "circle", name: "Circle", icon: Circle, category: "shapes" },
    { id: "triangle", name: "Triangle", icon: Triangle, category: "shapes" },
    { id: "text", name: "Text", icon: Type, category: "text" },
  ];

  // Required logos for PSG kit
  const requiredLogos = [
    { id: "psg-logo", name: "PSG Logo", required: true, category: "team" },
    { id: "nike-logo", name: "Nike", required: true, category: "sponsor" },
    {
      id: "qatar-airways",
      name: "Qatar Airways",
      required: true,
      category: "sponsor",
    },
  ];

  // Color palette
  const colorPalette = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#800000",
    "#008000",
    "#000080",
    "#808000",
    "#800080",
    "#008080",
    "#c0c0c0",
    "#808080",
  ];

  // Paint on texture
  const paintOnTexture = useCallback(
    (uv: THREE.Vector2) => {
      const canvas =
        activeView === "front" ? frontCanvasRef.current : backCanvasRef.current;
      const texture = activeView === "front" ? frontTexture : backTexture;

      if (!canvas || !texture) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Convert UV coordinates to canvas coordinates
      const x = uv.x * canvas.width;
      const y = (1 - uv.y) * canvas.height; // Flip Y coordinate

      ctx.globalCompositeOperation =
        activeTool === "eraser" ? "destination-out" : "source-over";

      if (activeTool === "brush") {
        ctx.fillStyle = brushColor;
        ctx.beginPath();
        ctx.arc(x, y, brushSize * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeTool === "eraser") {
        ctx.beginPath();
        ctx.arc(x, y, brushSize * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      texture.needsUpdate = true;
    },
    [activeView, activeTool, brushColor, brushSize, frontTexture, backTexture]
  );

  // Handle model clicks
  const handleModelClick = useCallback(
    (point: THREE.Vector3, uv: THREE.Vector2) => {
      if (activeTool === "brush" || activeTool === "eraser") {
        paintOnTexture(uv);
        return;
      }

      if (activeTool === "select" || activeTool === "move") return;

      const newElement: DesignElement = {
        id: `element-${Date.now()}`,
        type: activeTool as any,
        position: { x: uv.x, y: uv.y },
        data: {},
        visible: true,
        locked: false,
        side: activeView,
      };

      switch (activeTool) {
        case "text":
          newElement.data = {
            text: "New Text",
            color: brushColor,
            size: 0.15,
          };
          setShowTextInput(true);
          break;

        case "circle":
        case "square":
        case "triangle":
          newElement.type = "shape";
          newElement.data = {
            shape: activeTool,
            color: brushColor,
            size: 0.15,
          };
          break;
      }

      setDesignElements((prev) => [...prev, newElement]);
      setSelectedElement(newElement.id);
    },
    [activeTool, brushColor, activeView, paintOnTexture]
  );

  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
    setSelectedElement(null);
  };

  // Add logo to design
  const addLogoToDesign = (logo: any) => {
    const newElement: DesignElement = {
      id: `logo-${logo.id}-${Date.now()}`,
      type: "logo",
      position: { x: 0.5, y: 0.3 },
      data: {
        logoId: logo.id,
        name: logo.name,
        size: 0.2,
      },
      visible: true,
      locked: false,
      side: activeView,
    };

    setDesignElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  // Handle text input
  const handleTextSubmit = () => {
    if (textInput.trim() && designElements.length > 0) {
      const lastElement = designElements[designElements.length - 1];
      if (lastElement.type === "text") {
        setDesignElements((prev) =>
          prev.map((element, index) =>
            index === prev.length - 1
              ? { ...element, data: { ...element.data, text: textInput } }
              : element
          )
        );
      }
    }
    setTextInput("");
    setShowTextInput(false);
  };

  // Delete selected element
  const deleteSelectedElement = () => {
    if (selectedElement) {
      setDesignElements((prev) =>
        prev.filter((el) => el.id !== selectedElement)
      );
      setSelectedElement(null);
    }
  };

  // Toggle element visibility
  const toggleElementVisibility = (elementId: string) => {
    setDesignElements((prev) =>
      prev.map((el) =>
        el.id === elementId ? { ...el, visible: !el.visible } : el
      )
    );
  };

  // Clear all
  const clearAll = () => {
    setDesignElements([]);
    setSelectedElement(null);

    // Clear canvases
    if (frontCanvasRef.current) {
      const ctx = frontCanvasRef.current.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          0,
          0,
          frontCanvasRef.current.width,
          frontCanvasRef.current.height
        );
        if (frontTexture) frontTexture.needsUpdate = true;
      }
    }

    if (backCanvasRef.current) {
      const ctx = backCanvasRef.current.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          0,
          0,
          backCanvasRef.current.width,
          backCanvasRef.current.height
        );
        if (backTexture) backTexture.needsUpdate = true;
      }
    }
  };

  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;

        const newElement: DesignElement = {
          id: `image-${Date.now()}`,
          type: "image",
          position: { x: 0.5, y: 0.5 },
          data: {
            url: imageUrl,
            size: 0.3,
          },
          visible: true,
          locked: false,
          side: activeView,
        };

        setDesignElements((prev) => [...prev, newElement]);
        setSelectedElement(newElement.id);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save design
  const handleSave = () => {
    const designData = {
      elements: designElements,
      frontTextureData: frontCanvasRef.current?.toDataURL(),
      backTextureData: backCanvasRef.current?.toDataURL(),
      activeView,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("tshirt-design", JSON.stringify(designData));
    console.log("Design saved:", designData);
    alert("Design saved successfully!");
  };

  // Export design
  const handleExport = () => {
    const designData = {
      elements: designElements,
      frontTextureData: frontCanvasRef.current?.toDataURL(),
      backTextureData: backCanvasRef.current?.toDataURL(),
      metadata: {
        tool: "Fanvas 3D Editor",
        version: "1.0",
        timestamp: new Date().toISOString(),
      },
    };

    const dataStr = JSON.stringify(designData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `psg-kit-design-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // Check if all required logos are placed
  const allLogosPlaced = useMemo(() => {
    const placedLogos = designElements
      .filter((el) => el.type === "logo")
      .map((el) => el.data.logoId);
    return requiredLogos.every((logo) => placedLogos.includes(logo.id));
  }, [designElements, requiredLogos]);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-black text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="bg-white text-black border-2 border-black p-2 hover:bg-gray-100 transition-all duration-200 hover:scale-105">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="bg-white px-3 py-1 border-2 border-black">
                      <span className="text-black font-black text-sm">
                        3D FANVAS
                      </span>
                    </div>
                    <span className="text-gray-400 font-mono text-sm">
                      / CLUB ROOMS / PSG / KIT DESIGN / 3D EDITOR
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={clearAll}
                      className="bg-red-500 hover:bg-red-600 text-white font-black border-2 border-black px-3 py-2 transition-all duration-200 hover:scale-105"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleSave}
                      className="bg-green-500 hover:bg-green-600 text-white font-black border-2 border-black px-4 py-2 transition-all duration-200 hover:scale-105"
                    >
                      <Save className="w-4 h-4 mr-2 inline" />
                      Save Design
                    </button>

                    <button
                      onClick={handleExport}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-black border-2 border-black px-4 py-2 transition-all duration-200 hover:scale-105"
                    >
                      <Download className="w-4 h-4 mr-2 inline" />
                      Export
                    </button>

                    <div className="bg-yellow-400 text-black px-3 py-2 border-2 border-black font-black text-sm">
                      <Coins className="w-4 h-4 mr-2 inline" />
                      125 TOKENS
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border-2 border-black p-2 flex items-center justify-center">
                      <PenTool className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black">
                        3D PSG KIT DESIGNER
                      </h1>
                      <p className="text-sm font-mono opacity-80">
                        PAINT DIRECTLY ON THE 3D MODEL
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`px-3 py-2 border-2 border-white font-black text-sm ${
                        allLogosPlaced
                          ? "bg-green-400 text-black"
                          : "bg-red-400 text-white"
                      }`}
                    >
                      <Trophy className="w-4 h-4 mr-2 inline" />
                      {allLogosPlaced ? "READY TO SUBMIT" : "LOGOS REQUIRED"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Editor Interface */}
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            {/* Left Toolbar */}
            <div className="col-span-2">
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-full">
                <div className="bg-black text-white p-4">
                  <h2 className="text-lg font-black">TOOLS</h2>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)]">
                  {/* Drawing Tools */}
                  <div>
                    <h3 className="font-black text-sm mb-2 text-gray-700">
                      DRAWING
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {tools
                        .filter(
                          (t) =>
                            t.category === "drawing" ||
                            t.category === "selection"
                        )
                        .map((tool) => (
                          <button
                            key={tool.id}
                            className={`border-2 border-black p-2 transition-all duration-200 hover:scale-105 ${
                              activeTool === tool.id
                                ? "bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                : "bg-white text-black hover:bg-gray-100"
                            }`}
                            onClick={() => handleToolSelect(tool.id)}
                            title={tool.name}
                          >
                            <tool.icon className="w-4 h-4" />
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Shape Tools */}
                  <div>
                    <h3 className="font-black text-sm mb-2 text-gray-700">
                      SHAPES
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {tools
                        .filter((t) => t.category === "shapes")
                        .map((tool) => (
                          <button
                            key={tool.id}
                            className={`border-2 border-black p-2 transition-all duration-200 hover:scale-105 ${
                              activeTool === tool.id
                                ? "bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                : "bg-white text-black hover:bg-gray-100"
                            }`}
                            onClick={() => handleToolSelect(tool.id)}
                            title={tool.name}
                          >
                            <tool.icon className="w-4 h-4" />
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Text Tool */}
                  <div>
                    <h3 className="font-black text-sm mb-2 text-gray-700">
                      TEXT
                    </h3>
                    <button
                      className={`w-full border-2 border-black p-2 transition-all duration-200 hover:scale-105 ${
                        activeTool === "text"
                          ? "bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                      onClick={() => handleToolSelect("text")}
                    >
                      <Type className="w-4 h-4 mr-2 inline" />
                      Add Text
                    </button>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <h3 className="font-black text-sm mb-2 text-gray-700">
                      IMAGES
                    </h3>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-black p-2 bg-white hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                    >
                      <ImageIcon className="w-4 h-4 mr-2 inline" />
                      Upload Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Brush Settings */}
                  {(activeTool === "brush" || activeTool === "eraser") && (
                    <div>
                      <h3 className="font-black text-sm mb-2 text-gray-700">
                        BRUSH SIZE
                      </h3>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-sm font-bold mt-1">
                        {brushSize}px
                      </div>
                    </div>
                  )}

                  {/* Color Picker */}
                  {(activeTool === "brush" ||
                    activeTool === "text" ||
                    ["circle", "square", "triangle"].includes(activeTool)) && (
                    <div>
                      <h3 className="font-black text-sm mb-2 text-gray-700">
                        COLOR
                      </h3>
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-full h-8 border-2 border-black rounded cursor-pointer mb-2"
                      />
                      <div className="grid grid-cols-4 gap-1">
                        {colorPalette.map((color) => (
                          <button
                            key={color}
                            onClick={() => setBrushColor(color)}
                            className={`w-6 h-6 border-2 border-black rounded hover:scale-110 transition-transform ${
                              brushColor === color
                                ? "ring-2 ring-yellow-400"
                                : ""
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main 3D Canvas */}
            <div className="col-span-8">
              <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] h-full">
                <div className="bg-black text-white p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black">3D DESIGN CANVAS</h2>
                    <div className="flex items-center gap-2">
                      <button
                        className={`border-2 border-white px-3 py-1 font-black text-sm ${
                          activeView === "front"
                            ? "bg-yellow-400 text-black"
                            : "bg-white text-black hover:bg-gray-100"
                        } transition-all duration-200 hover:scale-105`}
                        onClick={() => setActiveView("front")}
                      >
                        FRONT
                      </button>
                      <button
                        className={`border-2 border-white px-3 py-1 font-black text-sm ${
                          activeView === "back"
                            ? "bg-yellow-400 text-black"
                            : "bg-white text-black hover:bg-gray-100"
                        } transition-all duration-200 hover:scale-105`}
                        onClick={() => setActiveView("back")}
                      >
                        BACK
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-[calc(100%-80px)] bg-gray-400 relative">
                  <Canvas
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    style={{ background: "#9ca3af" }}
                  >
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <spotLight position={[-10, -10, -5]} intensity={0.5} />

                    <TShirtModel
                      activeView={activeView}
                      activeTool={activeTool}
                      brushColor={brushColor}
                      brushSize={brushSize}
                      onModelClick={handleModelClick}
                      designElements={designElements}
                      selectedElement={selectedElement}
                      onElementSelect={setSelectedElement}
                      frontTexture={frontTexture}
                      backTexture={backTexture}
                      isDrawing={isDrawing}
                      onDrawingChange={setIsDrawing}
                    />

                    <OrbitControls
                      enablePan={false}
                      enableZoom={true}
                      maxPolarAngle={Math.PI / 2}
                      minPolarAngle={Math.PI / 4}
                      maxDistance={8}
                      minDistance={3}
                    />

                    <Environment preset="studio" />
                  </Canvas>

                  {/* Instructions Overlay */}
                  <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded border-2 border-white">
                    <h3 className="font-black text-sm mb-2">INSTRUCTIONS:</h3>
                    <ul className="text-xs space-y-1">
                      <li>• Select brush/eraser to paint on texture</li>
                      <li>• Click on T-shirt to add shapes/text</li>
                      <li>• Use mouse to rotate the 3D model</li>
                      <li>• Switch between front/back views</li>
                      <li>• Add all required logos before submitting</li>
                    </ul>
                  </div>

                  {/* Active Tool Indicator */}
                  <div className="absolute bottom-4 left-4 bg-yellow-400 text-black p-2 border-2 border-black font-black text-sm">
                    Active Tool:{" "}
                    {tools.find((t) => t.id === activeTool)?.name ||
                      activeTool.toUpperCase()}
                  </div>

                  {/* Side Indicator */}
                  <div className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 border-2 border-black font-black text-sm">
                    Current Side: {activeView.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="col-span-2 space-y-6">
              {/* Design Elements Panel */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-black text-white p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black">ELEMENTS</h2>
                    <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded font-bold">
                      {
                        designElements.filter((el) => el.side === activeView)
                          .length
                      }
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                  {designElements
                    .filter((el) => el.side === activeView)
                    .map((element) => (
                      <div
                        key={element.id}
                        className={`flex items-center gap-2 p-2 border-2 border-black cursor-pointer transition-all duration-200 hover:bg-gray-100 ${
                          selectedElement === element.id
                            ? "bg-yellow-400"
                            : "bg-white"
                        }`}
                        onClick={() => setSelectedElement(element.id)}
                      >
                        <button
                          className="p-1 border border-black bg-white hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleElementVisibility(element.id);
                          }}
                        >
                          {element.visible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                        </button>
                        <span className="text-xs font-bold flex-1">
                          {element.type.toUpperCase()}{" "}
                          {element.data.text ||
                            element.data.name ||
                            element.id.slice(-4)}
                        </span>
                      </div>
                    ))}
                  {designElements.filter((el) => el.side === activeView)
                    .length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-4">
                      No elements on {activeView} side yet. Click on the model
                      to add some!
                    </div>
                  )}
                </div>
                {selectedElement && (
                  <div className="p-4 border-t-2 border-black">
                    <button
                      onClick={deleteSelectedElement}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-black border-2 border-black px-2 py-1 text-sm transition-all duration-200 hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4 mr-1 inline" />
                      Delete Selected
                    </button>
                  </div>
                )}
              </div>

              {/* Required Logos */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-red-600 text-white p-4">
                  <h2 className="text-lg font-black">REQUIRED LOGOS</h2>
                </div>
                <div className="p-4 space-y-3">
                  {requiredLogos.map((logo) => {
                    const isPlaced = designElements.some(
                      (el) => el.type === "logo" && el.data.logoId === logo.id
                    );

                    return (
                      <LogoItem
                        key={logo.id}
                        logo={logo}
                        onAdd={() => addLogoToDesign(logo)}
                        isPlaced={isPlaced}
                      />
                    );
                  })}
                  <div
                    className={`text-xs font-bold mt-3 p-2 border ${
                      allLogosPlaced
                        ? "bg-green-100 border-green-400 text-green-800"
                        : "bg-yellow-100 border-yellow-400 text-yellow-800"
                    }`}
                  >
                    {allLogosPlaced
                      ? "✅ All logos placed!"
                      : "⚠️ All logos must be placed to submit design"}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-green-600 text-white p-4">
                  <h2 className="text-lg font-black">ACTIONS</h2>
                </div>
                <div className="p-4 space-y-3">
                  <button
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-black border-2 border-black p-2 transition-all duration-200 hover:scale-105"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2 inline" />
                    Save Draft
                  </button>
                  <button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black border-2 border-black p-2 transition-all duration-200 hover:scale-105"
                    onClick={handleExport}
                  >
                    <Download className="w-4 h-4 mr-2 inline" />
                    Export Design
                  </button>
                  <button
                    className={`w-full font-black border-2 border-black p-2 transition-all duration-200 ${
                      allLogosPlaced
                        ? "bg-purple-500 hover:bg-purple-600 text-white hover:scale-105"
                        : "bg-gray-400 text-gray-700 cursor-not-allowed"
                    }`}
                    disabled={!allLogosPlaced}
                  >
                    <Trophy className="w-4 h-4 mr-2 inline" />
                    Submit Entry
                  </button>
                </div>
              </div>

              {/* Stats Panel */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-gray-800 text-white p-4">
                  <h2 className="text-lg font-black">STATS</h2>
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold">Total Elements:</span>
                    <span>{designElements.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Front Elements:</span>
                    <span>
                      {
                        designElements.filter((el) => el.side === "front")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Back Elements:</span>
                    <span>
                      {designElements.filter((el) => el.side === "back").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Logos Placed:</span>
                    <span>
                      {designElements.filter((el) => el.type === "logo").length}
                      /{requiredLogos.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Current Side:</span>
                    <span className="uppercase font-bold">{activeView}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text Input Modal */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <h3 className="text-lg font-black mb-4">ADD TEXT</h3>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter your text..."
              className="w-full p-2 border-2 border-black mb-4 font-bold"
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && handleTextSubmit()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleTextSubmit}
                className="bg-green-500 hover:bg-green-600 text-white font-black border-2 border-black px-4 py-2 transition-all duration-200 hover:scale-105"
              >
                Add Text
              </button>
              <button
                onClick={() => {
                  setShowTextInput(false);
                  setTextInput("");
                  if (designElements.length > 0) {
                    const lastElement =
                      designElements[designElements.length - 1];
                    if (lastElement.type === "text" && !lastElement.data.text) {
                      setDesignElements((prev) => prev.slice(0, -1));
                    }
                  }
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-black border-2 border-black px-4 py-2 transition-all duration-200 hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brush Preview Cursor */}
      {activeTool === "brush" && (
        <div
          className="fixed pointer-events-none z-50 border-2 border-black rounded-full"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            width: `${Math.max(brushSize * 2, 10)}px`,
            height: `${Math.max(brushSize * 2, 10)}px`,
            backgroundColor: brushColor,
            opacity: 0.5,
            transform: "translate(-50%, -50%)",
            display:
              mousePosition.x === 0 && mousePosition.y === 0 ? "none" : "block",
          }}
        />
      )}

      {/* Eraser Preview Cursor */}
      {activeTool === "eraser" && (
        <div
          className="fixed pointer-events-none z-50 border-2 border-red-500 rounded-full bg-white"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            width: `${Math.max(brushSize * 2, 10)}px`,
            height: `${Math.max(brushSize * 2, 10)}px`,
            opacity: 0.7,
            transform: "translate(-50%, -50%)",
            display:
              mousePosition.x === 0 && mousePosition.y === 0 ? "none" : "block",
          }}
        />
      )}

      {/* Drawing Indicator */}
      {isDrawing && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 border-2 border-black font-black text-sm z-50 animate-pulse">
          ✏️ {activeTool === "brush" ? "Painting" : "Erasing"}...
        </div>
      )}
    </div>
  );
}
