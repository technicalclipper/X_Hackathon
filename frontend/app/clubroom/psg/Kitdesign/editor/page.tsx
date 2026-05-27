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
// @ts-ignore - gif.js doesn't have TypeScript definitions
import GIF from "gif.js";
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

function TShirtModel({
  activeView,
  activeTool,
  brushColor,
  brushSize,
  onModelClick,
  onMoveElement,
  designElements,
  selectedElement,
  onElementSelect,
  frontTexture,
  backTexture,
  isDrawing,
  onDrawingChange,
  isRotationLocked,
  isRecordingGif,
  recordingProgress,
  gifRotationRef,
}: {
  activeView: "front" | "back";
  activeTool: string;
  brushColor: string;
  brushSize: number;
  onModelClick: (point: THREE.Vector3, uv: THREE.Vector2) => void;
  onMoveElement?: (uv: THREE.Vector2) => void;
  designElements: DesignElement[];
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  frontTexture: THREE.Texture | null;
  backTexture: THREE.Texture | null;
  isDrawing: boolean;
  onDrawingChange: (drawing: boolean) => void;
  isRotationLocked: boolean;
  isRecordingGif?: boolean;
  recordingProgress?: number;
  gifRotationRef?: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const tshirtMeshRef = useRef<THREE.Mesh>(null);
  const { raycaster, camera, pointer } = useThree();
  const [lastPaintPosition, setLastPaintPosition] =
    useState<THREE.Vector2 | null>(null);

  let gltf;
  try {
    gltf = useGLTF("/tshirt/source/Tshirt.glb");
  } catch (error) {
    console.warn("T-shirt model not found, using fallback");
  }

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isRecordingGif) {
        // Continuous spinning for GIF recording
        const rotationSpeed = 1.0; // Adjust speed as needed
        meshRef.current.rotation.y += delta * rotationSpeed;

        // Update the rotation reference for external tracking
        if (gifRotationRef) {
          gifRotationRef.current = meshRef.current.rotation.y;
        }
      } else if (!isRotationLocked) {
        const targetRotation = activeView === "front" ? 0 : Math.PI;
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
          meshRef.current.rotation.y,
          targetRotation,
          0.1
        );
      }
    }
  });

  const handlePointerDown = useCallback(
    (event: any) => {
      event.stopPropagation();

      if (
        activeTool === "brush" ||
        activeTool === "eraser" ||
        activeTool === "fill"
      ) {
        onDrawingChange(true);
        setLastPaintPosition(null);
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
          const uv = intersection.uv;

          if (uv) {
            if (activeTool === "move" && typeof onMoveElement === "function") {
              onMoveElement(uv);
            } else {
              onModelClick(point, uv);
            }
            setLastPaintPosition(uv);
          }
        }
      }
    },
    [
      activeTool,
      raycaster,
      camera,
      pointer,
      onModelClick,
      onDrawingChange,
      onMoveElement,
    ]
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
          const uv = intersection.uv;

          if (uv) {
            onModelClick(intersection.point, uv);
            setLastPaintPosition(uv);
          }
        }
      }
    },
    [isDrawing, activeTool, raycaster, camera, pointer, onModelClick]
  );

  const handlePointerUp = useCallback(() => {
    if (isDrawing) {
      onDrawingChange(false);
      setLastPaintPosition(null);
    }
  }, [isDrawing, onDrawingChange]);

  const renderDesignElements = () => {
    return designElements
      .filter((element) => element.visible && element.side === activeView)
      .map((element) => {
        const uvX = element.position.x;
        const uvY = element.position.y;

        let x, y, z;

        if (activeView === "front") {
          x = (uvX - 0.5) * 1.8;
          y = (0.5 - uvY) * 2.2 + 0.2;
          z = 0.06;
        } else {
          x = (0.5 - uvX) * 1.8;
          y = (0.5 - uvY) * 2.2 + 0.2;
          z = -0.06;
        }

        const position = new THREE.Vector3(x, y, z);

        switch (element.type) {
          case "text":
            return (
              <group key={element.id}>
                <Text
                  position={position}
                  fontSize={element.data.size || 0.15}
                  color={element.data.color || "#000000"}
                  anchorX="center"
                  anchorY="middle"
                  onClick={(e) => {
                    e.stopPropagation();
                    onElementSelect(element.id);
                  }}
                  maxWidth={1}
                >
                  {element.data.text || "Text"}
                </Text>
                {selectedElement === element.id && (
                  <mesh position={position}>
                    <planeGeometry args={[0.3, 0.1]} />
                    <meshBasicMaterial
                      color="#ffff00"
                      transparent
                      opacity={0.3}
                    />
                  </mesh>
                )}
              </group>
            );

          case "logo":
            return null; // Logos are now drawn directly on texture, not as 3D overlays

          default:
            return null;
        }
      });
  };

  const fallbackGeometry = useMemo(() => {
    const shape = new THREE.Shape();

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
    const tshirtScene = gltf.scene.clone();

    tshirtScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          const material = child.material.clone();
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

export default function TShirtEditor3D() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mousePosition = useMousePosition();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gifRotationRef = useRef<number>(0);

  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);

  const [frontTexture, setFrontTexture] = useState<THREE.Texture | null>(null);
  const [backTexture, setBackTexture] = useState<THREE.Texture | null>(null);

  const [activeTool, setActiveTool] = useState<string>("select");
  const [activeView, setActiveView] = useState<"front" | "back">("front");
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");
  const [designElements, setDesignElements] = useState<DesignElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRotationLocked, setIsRotationLocked] = useState(false);
  const [placedLogos, setPlacedLogos] = useState<Set<string>>(new Set());
  const [logoSize, setLogoSize] = useState(0.15);
  const [isRecordingGif, setIsRecordingGif] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  useEffect(() => {
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

  const tools: Tool[] = [
    { id: "select", name: "Select", icon: MousePointer, category: "selection" },
    { id: "move", name: "Move", icon: Move, category: "selection" },
    { id: "brush", name: "Brush", icon: Brush, category: "drawing" },
    { id: "eraser", name: "Eraser", icon: Eraser, category: "drawing" },
    { id: "fill", name: "Fill", icon: Palette, category: "drawing" },
    { id: "square", name: "Rectangle", icon: Square, category: "shapes" },
    { id: "circle", name: "Circle", icon: Circle, category: "shapes" },
    { id: "triangle", name: "Triangle", icon: Triangle, category: "shapes" },
    { id: "text", name: "Text", icon: Type, category: "text" },
  ];

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

  const paintOnTexture = useCallback(
    (uv: THREE.Vector2) => {
      const canvas =
        activeView === "front" ? frontCanvasRef.current : backCanvasRef.current;
      const texture = activeView === "front" ? frontTexture : backTexture;

      if (!canvas || !texture) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const x = uv.x * canvas.width;
      const y = uv.y * canvas.height;

      const clampedX = Math.max(0, Math.min(canvas.width - 1, x));
      const clampedY = Math.max(0, Math.min(canvas.height - 1, y));

      if (activeTool === "brush") {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = brushColor;
        ctx.beginPath();
        ctx.arc(clampedX, clampedY, brushSize * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(clampedX, clampedY, brushSize * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeTool === "fill") {
        floodFill(ctx, Math.floor(clampedX), Math.floor(clampedY), brushColor);
      }

      texture.needsUpdate = true;
    },
    [activeView, activeTool, brushColor, brushSize, frontTexture, backTexture]
  );

  const floodFill = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      startX: number,
      startY: number,
      fillColor: string
    ) => {
      const imageData = ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
      const data = imageData.data;
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.fillStyle = fillColor;
      tempCtx.fillRect(0, 0, 1, 1);
      const fillColorData = tempCtx.getImageData(0, 0, 1, 1).data;

      const startPos = (startY * width + startX) * 4;
      const targetR = data[startPos];
      const targetG = data[startPos + 1];
      const targetB = data[startPos + 2];
      const targetA = data[startPos + 3];

      if (
        targetR === fillColorData[0] &&
        targetG === fillColorData[1] &&
        targetB === fillColorData[2] &&
        targetA === fillColorData[3]
      ) {
        return;
      }

      const stack = [[startX, startY]];
      const visited = new Set<string>();

      while (stack.length > 0) {
        const [x, y] = stack.pop()!;

        if (x < 0 || x >= width || y < 0 || y >= height) continue;

        const key = `${x},${y}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const pos = (y * width + x) * 4;

        if (
          data[pos] !== targetR ||
          data[pos + 1] !== targetG ||
          data[pos + 2] !== targetB ||
          data[pos + 3] !== targetA
        ) {
          continue;
        }

        data[pos] = fillColorData[0];
        data[pos + 1] = fillColorData[1];
        data[pos + 2] = fillColorData[2];
        data[pos + 3] = fillColorData[3];

        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }

      ctx.putImageData(imageData, 0, 0);
    },
    []
  );

  const drawShapeOnTexture = useCallback(
    (uv: THREE.Vector2, shapeType: string, size: number, color: string) => {
      const canvas =
        activeView === "front" ? frontCanvasRef.current : backCanvasRef.current;
      const texture = activeView === "front" ? frontTexture : backTexture;

      if (!canvas || !texture) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const x = uv.x * canvas.width;
      const y = uv.y * canvas.height;
      const shapeSize = size * 100;

      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      switch (shapeType) {
        case "circle":
          ctx.beginPath();
          ctx.arc(x, y, shapeSize, 0, Math.PI * 2);
          ctx.fill();
          break;

        case "square":
          ctx.fillRect(
            x - shapeSize / 2,
            y - shapeSize / 2,
            shapeSize,
            shapeSize
          );
          break;

        case "triangle":
          ctx.beginPath();
          ctx.moveTo(x, y - shapeSize);
          ctx.lineTo(x - shapeSize, y + shapeSize);
          ctx.lineTo(x + shapeSize, y + shapeSize);
          ctx.closePath();
          ctx.fill();
          break;
      }

      texture.needsUpdate = true;
    },
    [activeView, frontTexture, backTexture]
  );

  const drawLogoOnTexture = useCallback(
    (uv: THREE.Vector2, logoId: string, size: number = 0.2) => {
      const canvas =
        activeView === "front" ? frontCanvasRef.current : backCanvasRef.current;
      const texture = activeView === "front" ? frontTexture : backTexture;

      if (!canvas || !texture) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Map logo IDs to their respective file paths
      const logoMap: { [key: string]: string } = {
        "psg-logo": "/logos/psg2.png",
        "nike-logo": "/logos/nike.png",
        "qatar-airways": "/logos/qatar-airways.png",
      };

      const logoPath = logoMap[logoId];
      if (!logoPath) {
        console.warn(`Logo path not found for: ${logoId}`);
        return;
      }

      // Load and draw the image
      const img = new Image();
      img.onload = () => {
        const x = uv.x * canvas.width;
        // Fix vertical flip by inverting y coordinate
        const y = (1 - uv.y) * canvas.height;
        const logoSize = size * canvas.width; // Scale relative to canvas

        // Save current context state
        ctx.save();

        // For back view, flip horizontally to match the model orientation
        if (activeView === "back") {
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
        }

        // Draw the logo centered at the click position
        ctx.drawImage(
          img,
          x - logoSize / 2,
          y - logoSize / 2,
          logoSize,
          logoSize
        );

        // Restore context state
        ctx.restore();

        texture.needsUpdate = true;

        // Track that this logo has been placed
        setPlacedLogos((prev) => new Set(prev).add(logoId));
      };

      img.onerror = () => {
        console.warn(`Failed to load logo: ${logoPath}`);
        // Draw a fallback rectangle
        const x = uv.x * canvas.width;
        const y = (1 - uv.y) * canvas.height;
        const logoSize = size * canvas.width;

        ctx.save();
        if (activeView === "back") {
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
        }

        ctx.fillStyle = "#cccccc";
        ctx.fillRect(x - logoSize / 2, y - logoSize / 2, logoSize, logoSize);

        // Add text fallback
        ctx.fillStyle = "#000000";
        ctx.font = `${logoSize / 8}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(logoId.toUpperCase(), x, y);

        ctx.restore();

        texture.needsUpdate = true;

        // Track that this logo has been placed (even as fallback)
        setPlacedLogos((prev) => new Set(prev).add(logoId));
      };

      img.src = logoPath;
    },
    [activeView, frontTexture, backTexture, setPlacedLogos]
  );

  const handleModelClick = useCallback(
    (point: THREE.Vector3, uv: THREE.Vector2) => {
      if (
        activeTool === "brush" ||
        activeTool === "eraser" ||
        activeTool === "fill"
      ) {
        paintOnTexture(uv);
        return;
      }

      if (activeTool === "select" || activeTool === "move") return;

      if (["circle", "square", "triangle"].includes(activeTool)) {
        drawShapeOnTexture(uv, activeTool, 0.15, brushColor);
        return;
      }

      // Handle logo placement on texture
      if (activeTool.includes("logo")) {
        const logoId = activeTool; // activeTool will be the logo ID
        drawLogoOnTexture(uv, logoId, logoSize);
        return;
      }

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
      }

      setDesignElements((prev) => [...prev, newElement]);
      setSelectedElement(newElement.id);
    },
    [
      activeTool,
      brushColor,
      activeView,
      paintOnTexture,
      drawShapeOnTexture,
      drawLogoOnTexture,
    ]
  );

  const moveSelectedElement = useCallback(
    (newUV: THREE.Vector2) => {
      if (!selectedElement || activeTool !== "move") return;

      setDesignElements((prev) =>
        prev.map((el) =>
          el.id === selectedElement
            ? { ...el, position: { x: newUV.x, y: newUV.y } }
            : el
        )
      );
    },
    [selectedElement, activeTool]
  );

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
    setSelectedElement(null);
  };

  const addLogoToDesign = (logo: any) => {
    // Set the active tool to the logo ID, so when user clicks on the T-shirt, it will place the logo
    setActiveTool(logo.id);
    setSelectedElement(null);
  };

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

  const deleteSelectedElement = () => {
    if (selectedElement) {
      setDesignElements((prev) =>
        prev.filter((el) => el.id !== selectedElement)
      );
      setSelectedElement(null);
    }
  };

  const toggleElementVisibility = (elementId: string) => {
    setDesignElements((prev) =>
      prev.map((el) =>
        el.id === elementId ? { ...el, visible: !el.visible } : el
      )
    );
  };

  const clearAll = () => {
    setDesignElements([]);
    setSelectedElement(null);
    setPlacedLogos(new Set()); // Clear placed logos tracking

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

  const handleExport = () => {
    // Offer user choice between server-side GIF and static images
    const choice = confirm(
      "Choose export type:\nOK = 360° GIF (server-generated)\nCancel = Static Images"
    );

    if (choice) {
      exportAsGif(); // Now uses server-side generation
    } else {
      exportStaticImages();
    }
  };

  const exportStaticImages = async () => {
    setIsRecordingGif(true);
    setRecordingProgress(0);

    try {
      const canvas = document.querySelector("canvas");
      if (!canvas) {
        throw new Error("Canvas not found");
      }

      // Create a zip-like structure with multiple images
      const images: { name: string; dataUrl: string }[] = [];

      // Capture front view
      setActiveView("front");
      setRecordingProgress(25);

      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for view to change

      try {
        const frontDataUrl = canvas.toDataURL("image/png");
        images.push({ name: "front-view.png", dataUrl: frontDataUrl });
        setRecordingProgress(50);
      } catch (error) {
        console.warn("Could not capture front view:", error);
      }

      // Capture back view
      setActiveView("back");
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for view to change

      try {
        const backDataUrl = canvas.toDataURL("image/png");
        images.push({ name: "back-view.png", dataUrl: backDataUrl });
        setRecordingProgress(75);
      } catch (error) {
        console.warn("Could not capture back view:", error);
      }

      // Download images
      images.forEach((image, index) => {
        setTimeout(() => {
          const link = document.createElement("a");
          link.href = image.dataUrl;
          link.download = `psg-kit-${image.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 100); // Stagger downloads
      });

      // Also export design data
      exportAsJson();

      setRecordingProgress(100);

      setTimeout(() => {
        setIsRecordingGif(false);
        setRecordingProgress(0);
        alert(`Exported ${images.length} images and design data successfully!`);
      }, 1000);
    } catch (error) {
      console.error("Error exporting images:", error);
      setIsRecordingGif(false);
      setRecordingProgress(0);
      alert("Error exporting images. Trying JSON export instead...");
      exportAsJson();
    }
  };

  const exportAsGif = async () => {
    if (isRecordingGif) return;

    setIsRecordingGif(true);
    setRecordingProgress(0);

    try {
      // Force front view for consistency
      setActiveView("front");
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = document.querySelector("canvas");
      if (!canvas) {
        throw new Error("Canvas not found");
      }

      console.log("Starting frame capture for server-side GIF generation...");

      // Capture frames as base64 data URLs
      const frames: string[] = [];
      const totalFrames = 40; // Reduced for better performance

      for (let i = 0; i < totalFrames; i++) {
        try {
          setRecordingProgress((i / totalFrames) * 60); // Reserve 40% for server processing

          // Capture current frame as high-quality PNG
          const dataUrl = canvas.toDataURL("image/png", 0.9);
          frames.push(dataUrl);

          console.log(`Captured frame ${i + 1}/${totalFrames}`);

          // Wait for model rotation and rendering
          await new Promise((resolve) => setTimeout(resolve, 120));
        } catch (error) {
          console.warn(`Failed to capture frame ${i + 1}:`, error);
          // Create a fallback frame
          const fallbackCanvas = document.createElement("canvas");
          fallbackCanvas.width = 400;
          fallbackCanvas.height = 300;
          const ctx = fallbackCanvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#9ca3af";
            ctx.fillRect(0, 0, 400, 300);
            ctx.fillStyle = "#9BA3AF";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Frame ${i + 1}`, 200, 150);
            frames.push(fallbackCanvas.toDataURL("image/png"));
          }
        }
      }

      if (frames.length === 0) {
        throw new Error("No frames captured");
      }

      console.log(
        `Captured ${frames.length} frames, trying server generation...`
      );
      setRecordingProgress(65);

      // Try multiple GIF generation endpoints in order of preference
      const endpoints = [
        { url: "/api/generate-gif", name: "GifEncoder (Fallback)" },
      ];

      let lastError: Error | null = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying ${endpoint.name}...`);
          setRecordingProgress(70);

          const response = await fetch(endpoint.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              frames,
              options: {
                fps: 6,
                width: 400,
                height: 300,
                quality: "high",
              },
            }),
          });

          setRecordingProgress(85);

          if (response.ok) {
            console.log(`✅ ${endpoint.name} succeeded!`);

            const blob = await response.blob();

            if (blob.size === 0) {
              throw new Error("Generated GIF is empty");
            }

            // Download the generated GIF
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `psg-kit-360-${Date.now()}.gif`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setRecordingProgress(100);

            console.log(
              `🎉 GIF generated successfully with ${endpoint.name}! Size: ${(
                blob.size /
                1024 /
                1024
              ).toFixed(2)}MB`
            );

            setTimeout(() => {
              setIsRecordingGif(false);
              setRecordingProgress(0);
              alert(
                `🎉 360° GIF exported successfully!\n\nMethod: ${
                  endpoint.name
                }\nSize: ${(blob.size / 1024 / 1024).toFixed(2)}MB\nFrames: ${
                  frames.length
                }\n\nThe GIF shows a smooth 360° rotation of your PSG kit design!`
              );
            }, 1000);

            return; // Success! Exit the function
          } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || `Server error: ${response.status}`
            );
          }
        } catch (endpointError) {
          console.warn(`❌ ${endpoint.name} failed:`, endpointError);
          lastError =
            endpointError instanceof Error
              ? endpointError
              : new Error("Unknown error");
          // Continue to next endpoint
        }
      }

      // If we get here, all endpoints failed
      throw new Error(
        `All GIF generation methods failed. Last error: ${lastError?.message}`
      );
    } catch (error) {
      console.error("Error creating GIF:", error);
      setIsRecordingGif(false);
      setRecordingProgress(0);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(
        `❌ GIF generation failed: ${errorMessage}\n\nFalling back to static images...`
      );

      // Fallback to static images
      exportStaticImages();
    }
  };

  const exportAsJson = () => {
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const allLogosPlaced = useMemo(() => {
    return requiredLogos.every((logo) => placedLogos.has(logo.id));
  }, [placedLogos, requiredLogos]);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="relative z-10 h-screen flex flex-col">
        <div className="max-w-[1800px] mx-auto w-full flex-1 flex flex-col px-4 py-4">
          <div className="mb-4 flex-shrink-0">
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-black text-white p-3">
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
                      disabled={isRecordingGif}
                      className={`font-black border-2 border-black px-4 py-2 transition-all duration-200 hover:scale-105 ${
                        isRecordingGif
                          ? "bg-gray-500 cursor-not-allowed text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      {isRecordingGif ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 inline animate-spin" />
                          Creating 360° GIF... {Math.round(recordingProgress)}%
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2 inline" />
                          Export 360° GIF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-black text-white px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border-2 border-black p-2 flex items-center justify-center">
                      <PenTool className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h1 className="text-xl font-black">
                        3D PSG KIT DESIGNER
                      </h1>
                      <p className="text-xs font-mono opacity-80">
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

          <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
            <div className="col-span-2 flex flex-col min-h-0">
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col min-h-0">
                <div className="bg-black text-white p-3 flex-shrink-0">
                  <h2 className="text-base font-black">TOOLS</h2>
                </div>
                <div
                  className="p-3 space-y-3 overflow-y-auto flex-1 min-h-0"
                  style={{ maxHeight: "calc(100vh - 300px)" }}
                >
                  <div>
                    <h3 className="font-black text-xs mb-2 text-gray-700">
                      DRAWING
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {tools
                        .filter(
                          (t) =>
                            t.category === "drawing" ||
                            t.category === "selection"
                        )
                        .map((tool) => (
                          <button
                            key={tool.id}
                            className={`border-2 border-black p-2 transition-all duration-200 hover:scale-105 flex items-center gap-2 text-left ${
                              activeTool === tool.id
                                ? "bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                : "bg-white text-black hover:bg-gray-100"
                            }`}
                            onClick={() => handleToolSelect(tool.id)}
                            title={tool.name}
                            disabled={isRecordingGif}
                          >
                            <tool.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs font-bold">
                              {tool.name}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-xs mb-2 text-gray-700">
                      SHAPES
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {tools
                        .filter((t) => t.category === "shapes")
                        .map((tool) => (
                          <button
                            key={tool.id}
                            className={`border-2 border-black p-2 transition-all duration-200 hover:scale-105 flex items-center gap-2 text-left ${
                              activeTool === tool.id
                                ? "bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                : "bg-white text-black hover:bg-gray-100"
                            }`}
                            onClick={() => handleToolSelect(tool.id)}
                            title={tool.name}
                            disabled={isRecordingGif}
                          >
                            <tool.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs font-bold">
                              {tool.name}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-xs mb-2 text-gray-700">
                      TEXT
                    </h3>
                    <button
                      className={`w-full border-2 border-black p-2 transition-all duration-200 hover:scale-105 flex items-center gap-2 text-left ${
                        activeTool === "text"
                          ? "bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                      onClick={() => handleToolSelect("text")}
                      disabled={isRecordingGif}
                    >
                      <Type className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-bold">Add Text</span>
                    </button>
                  </div>

                  {(activeTool === "brush" || activeTool === "eraser") && (
                    <div>
                      <h3 className="font-black text-xs mb-2 text-gray-700">
                        BRUSH SIZE
                      </h3>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full"
                        disabled={isRecordingGif}
                      />
                      <div className="text-center text-xs font-bold mt-1">
                        {brushSize}px
                      </div>
                    </div>
                  )}

                  {activeTool.includes("logo") && (
                    <div>
                      <h3 className="font-black text-xs mb-2 text-gray-700">
                        LOGO SIZE
                      </h3>
                      <input
                        type="range"
                        min="0.05"
                        max="0.5"
                        step="0.01"
                        value={logoSize}
                        onChange={(e) => setLogoSize(Number(e.target.value))}
                        className="w-full"
                        disabled={isRecordingGif}
                      />
                      <div className="text-center text-xs font-bold mt-1">
                        {Math.round(logoSize * 100)}%
                      </div>
                    </div>
                  )}

                  {(activeTool === "brush" ||
                    activeTool === "fill" ||
                    activeTool === "text" ||
                    ["circle", "square", "triangle"].includes(activeTool)) && (
                    <div>
                      <h3 className="font-black text-xs mb-2 text-gray-700">
                        COLOR
                      </h3>
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-full h-8 border-2 border-black rounded cursor-pointer mb-2"
                        disabled={isRecordingGif}
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
                            disabled={isRecordingGif}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-8 flex flex-col min-h-0">
              <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col min-h-0">
                <div className="bg-black text-white p-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black">3D DESIGN CANVAS</h2>
                    <div className="flex items-center gap-2">
                      <button
                        className={`border-2 border-white px-3 py-1 font-black text-sm ${
                          activeView === "front"
                            ? "bg-yellow-400 text-black"
                            : "bg-white text-black hover:bg-gray-100"
                        } transition-all duration-200 hover:scale-105`}
                        onClick={() => setActiveView("front")}
                        disabled={isRecordingGif}
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
                        disabled={isRecordingGif}
                      >
                        BACK
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-gray-400 relative min-h-0">
                  <Canvas
                    ref={canvasRef}
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    style={{
                      background: "#9ca3af",
                      width: "100%",
                      height: "100%",
                    }}
                    gl={{ preserveDrawingBuffer: true }}
                  >
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[10, 10, 5]} intensity={0.7} />
                    <spotLight position={[-10, -10, -5]} intensity={0.5} />

                    <TShirtModel
                      activeView={activeView}
                      activeTool={activeTool}
                      brushColor={brushColor}
                      brushSize={brushSize}
                      onModelClick={handleModelClick}
                      onMoveElement={moveSelectedElement}
                      designElements={designElements}
                      selectedElement={selectedElement}
                      onElementSelect={setSelectedElement}
                      frontTexture={frontTexture}
                      backTexture={backTexture}
                      isDrawing={isDrawing}
                      onDrawingChange={setIsDrawing}
                      isRotationLocked={isRotationLocked}
                      isRecordingGif={isRecordingGif}
                      recordingProgress={recordingProgress}
                      gifRotationRef={gifRotationRef}
                    />

                    <OrbitControls
                      enablePan={false}
                      enableZoom={true}
                      enableRotate={!isRotationLocked && !isRecordingGif}
                      maxPolarAngle={Math.PI / 2}
                      minPolarAngle={Math.PI / 4}
                      maxDistance={8}
                      minDistance={3}
                    />

                    <Environment preset="studio" />
                  </Canvas>

                  {/* Recording overlay */}
                  {isRecordingGif && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                      <div className="bg-white border-4 border-black p-6 text-center">
                        <div className="flex items-center gap-3 mb-4">
                          <RefreshCw className="w-6 h-6 animate-spin" />
                          <h3 className="text-xl font-black">
                            Recording 360° GIF
                          </h3>
                        </div>
                        <div className="w-64 bg-gray-200 border-2 border-black h-4 mb-2">
                          <div
                            className="bg-blue-500 h-full transition-all duration-300"
                            style={{ width: `${recordingProgress}%` }}
                          />
                        </div>
                        <p className="text-sm font-bold">
                          {Math.round(recordingProgress)}% Complete
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Please wait while we capture all frames...
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-black bg-opacity-90 text-white p-3 rounded border-2 border-white max-w-xs">
                    <h3 className="font-black text-sm mb-2">QUICK GUIDE:</h3>
                    <ul className="text-xs space-y-1">
                      <li>
                        • <strong>Brush:</strong> Paint on texture
                      </li>
                      <li>
                        • <strong>Fill:</strong> Flood fill areas
                      </li>
                      <li>
                        • <strong>Shapes:</strong> Draw on texture
                      </li>
                      <li>
                        • <strong>Text:</strong> 3D text overlays
                      </li>
                      <li>
                        • <strong>360° GIF:</strong> Auto-rotation export
                      </li>
                    </ul>
                  </div>

                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                      onClick={() => setIsRotationLocked(!isRotationLocked)}
                      className={`px-3 py-2 border-2 border-black font-black text-sm transition-all duration-200 hover:scale-105 ${
                        isRotationLocked
                          ? "bg-red-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                      disabled={isRecordingGif}
                    >
                      {isRotationLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 bg-yellow-400 text-black p-2 border-2 border-black font-black text-sm">
                    <span className="hidden sm:inline">Active Tool: </span>
                    {tools.find((t) => t.id === activeTool)?.name ||
                      (activeTool.includes("logo")
                        ? `${
                            requiredLogos.find((l) => l.id === activeTool)
                              ?.name || activeTool.toUpperCase()
                          } (Click to Place)`
                        : activeTool.toUpperCase())}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-blue-500 text-white p-2 border-2 border-black font-black text-sm">
                    <span className="hidden sm:inline">Side: </span>
                    {activeView.toUpperCase()}
                  </div>

                  {activeTool === "move" &&
                    selectedElement &&
                    !isRecordingGif && (
                      <div className="absolute bottom-28 left-3 bg-orange-500 text-white p-2 border-2 border-black font-black text-xs max-w-xs">
                        Click on T-shirt surface to move selected element
                      </div>
                    )}

                  {activeTool === "fill" && !isRecordingGif && (
                    <div className="absolute bottom-14 left-3 bg-purple-500 text-white p-2 border-2 border-black font-black text-xs">
                      Click on T-shirt to fill with color
                    </div>
                  )}

                  {activeTool.includes("logo") && !isRecordingGif && (
                    <div className="absolute bottom-14 left-3 bg-green-500 text-white p-2 border-2 border-black font-black text-xs max-w-xs">
                      Click on T-shirt to place{" "}
                      {requiredLogos.find((l) => l.id === activeTool)?.name ||
                        "logo"}
                      <br />
                      <span className="text-yellow-200">
                        Size: {Math.round(logoSize * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-2 flex flex-col space-y-4 min-h-0">
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-0 flex-1">
                <div className="bg-black text-white p-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black">ELEMENTS</h2>
                    <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded font-bold">
                      {
                        designElements.filter((el) => el.side === activeView)
                          .length
                      }
                    </span>
                  </div>
                </div>
                <div
                  className="p-3 space-y-2 overflow-y-auto flex-1 min-h-0"
                  style={{ maxHeight: "calc(100vh - 400px)" }}
                >
                  {designElements
                    .filter((el) => el.side === activeView)
                    .map((element) => (
                      <div
                        key={element.id}
                        className={`flex items-center gap-2 p-2 border-2 border-black cursor-pointer transition-all duration-200 hover:bg-gray-100 ${
                          selectedElement === element.id
                            ? "bg-yellow-400"
                            : "bg-white"
                        } ${
                          isRecordingGif ? "pointer-events-none opacity-50" : ""
                        }`}
                        onClick={() =>
                          !isRecordingGif && setSelectedElement(element.id)
                        }
                      >
                        <button
                          className="p-1 border border-black bg-white hover:bg-gray-100 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isRecordingGif)
                              toggleElementVisibility(element.id);
                          }}
                          disabled={isRecordingGif}
                        >
                          {element.visible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                        </button>
                        <span className="text-xs font-bold flex-1 truncate">
                          {element.type.toUpperCase()}{" "}
                          {element.data.text ||
                            element.data.name ||
                            element.id.slice(-4)}
                        </span>
                        {selectedElement === element.id && !isRecordingGif && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTool("move");
                            }}
                            className="p-1 border border-black bg-blue-500 text-white hover:bg-blue-600 flex-shrink-0"
                            title="Move Element"
                          >
                            <Move className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  {designElements.filter((el) => el.side === activeView)
                    .length === 0 && (
                    <div className="text-center text-gray-500 text-xs py-4">
                      No elements on {activeView} side yet. Click on the model
                      to add some!
                    </div>
                  )}
                </div>
                {selectedElement && !isRecordingGif && (
                  <div className="p-3 border-t-2 border-black flex-shrink-0">
                    <button
                      onClick={deleteSelectedElement}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-black border-2 border-black px-2 py-1 text-xs transition-all duration-200 hover:scale-105"
                    >
                      <Trash2 className="w-3 h-3 mr-1 inline" />
                      Delete Selected
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-0 flex-1">
                <div className="bg-red-600 text-white p-3 flex-shrink-0">
                  <h2 className="text-base font-black">REQUIRED LOGOS</h2>
                </div>
                <div
                  className="p-3 space-y-3 overflow-y-auto flex-1 min-h-0"
                  style={{ maxHeight: "calc(100vh - 400px)" }}
                >
                  {requiredLogos.map((logo) => {
                    const isPlaced = placedLogos.has(logo.id);

                    return (
                      <div
                        key={logo.id}
                        className={
                          isRecordingGif ? "opacity-50 pointer-events-none" : ""
                        }
                      >
                        <LogoItem
                          logo={logo}
                          onAdd={() => !isRecordingGif && addLogoToDesign(logo)}
                          isPlaced={isPlaced}
                        />
                      </div>
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

              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                <div className="bg-green-600 text-white p-3">
                  <h2 className="text-base font-black">ACTIONS</h2>
                </div>
                <div className="p-3 space-y-2">
                  <button
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-black border-2 border-black p-2 transition-all duration-200 hover:scale-105 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSave}
                    disabled={isRecordingGif}
                  >
                    <Save className="w-3 h-3 mr-1 inline" />
                    Save Draft
                  </button>
                  <button
                    className={`w-full font-black border-2 border-black p-2 transition-all duration-200 hover:scale-105 text-xs ${
                      isRecordingGif
                        ? "bg-gray-500 cursor-not-allowed text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                    onClick={handleExport}
                    disabled={isRecordingGif}
                  >
                    {isRecordingGif ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 inline animate-spin" />
                        Recording... {Math.round(recordingProgress)}%
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 mr-1 inline" />
                        Export 360° GIF
                      </>
                    )}
                  </button>
                  <button
                    className={`w-full font-black border-2 border-black p-2 transition-all duration-200 text-xs ${
                      allLogosPlaced && !isRecordingGif
                        ? "bg-purple-500 hover:bg-purple-600 text-white hover:scale-105"
                        : "bg-gray-400 text-gray-700 cursor-not-allowed"
                    }`}
                    disabled={!allLogosPlaced || isRecordingGif}
                  >
                    <Trophy className="w-3 h-3 mr-1 inline" />
                    Submit Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTextInput && !isRecordingGif && (
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

      {/* Mouse cursor indicators */}
      {!isRecordingGif && activeTool === "brush" && (
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

      {!isRecordingGif && activeTool === "eraser" && (
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

      {!isRecordingGif && activeTool === "fill" && (
        <div
          className="fixed pointer-events-none z-50 border-2 border-purple-500 rounded"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            width: "20px",
            height: "20px",
            backgroundColor: brushColor,
            opacity: 0.7,
            transform: "translate(-50%, -50%)",
            display:
              mousePosition.x === 0 && mousePosition.y === 0 ? "none" : "block",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
            F
          </div>
        </div>
      )}

      {!isRecordingGif && activeTool.includes("logo") && (
        <div
          className="fixed pointer-events-none z-50 border-2 border-green-500 rounded bg-green-100"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            width: `${Math.max(logoSize * 100, 20)}px`,
            height: `${Math.max(logoSize * 100, 20)}px`,
            opacity: 0.8,
            transform: "translate(-50%, -50%)",
            display:
              mousePosition.x === 0 && mousePosition.y === 0 ? "none" : "block",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-green-800 text-xs font-bold">
            📷
          </div>
        </div>
      )}

      {isDrawing && !isRecordingGif && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 border-2 border-black font-black text-sm z-50 animate-pulse">
          ✏️{" "}
          {activeTool === "brush"
            ? "Painting"
            : activeTool === "fill"
            ? "Filling"
            : "Erasing"}
          ...
        </div>
      )}
    </div>
  );
}
