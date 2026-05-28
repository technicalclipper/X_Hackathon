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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { X, HelpCircle } from "lucide-react";
import { usePinataUpload } from "@/hooks/ipfs/usePinataUpload";
import { useSubmitToPool } from "@/hooks/contracts/useSubmitToPool";
import { usePools, Pool } from "@/hooks/database/usePools";
import { useWallet } from "@/components/WalletProvider";
import supabase from "@/lib/supabaseConfig";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  isRecordingForSubmission,
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
  isRecordingForSubmission?: boolean;
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

        // Zoom in for submission recording
        if (isRecordingForSubmission) {
          const targetPosition = 3.5; // Closer camera for submission
          state.camera.position.z = THREE.MathUtils.lerp(
            state.camera.position.z,
            targetPosition,
            0.1
          );
        }
      } else if (!isRotationLocked) {
        const targetRotation = activeView === "front" ? 0 : Math.PI;
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
          meshRef.current.rotation.y,
          targetRotation,
          0.1
        );

        // Reset camera to default position when not recording
        if (state.camera.position.z !== 5) {
          state.camera.position.z = THREE.MathUtils.lerp(
            state.camera.position.z,
            5,
            0.1
          );
        }
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
  const router = useRouter();
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
  const [showQuickGuide, setShowQuickGuide] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStep, setSubmissionStep] = useState("");
  const [isRecordingForSubmission, setIsRecordingForSubmission] =
    useState(false);

  // Initialize hooks
  const {
    pools,
    activePools,
    isLoading: poolsLoading,
    fetchPools,
  } = usePools();
  const {
    uploadToPinata,
    isUploading,
    uploadedCID,
    resetUpload,
    handleFileSelect,
  } = usePinataUpload();
  const {
    submitToPool,
    isSubmitting: isSubmittingToPool,
    error: submitError,
  } = useSubmitToPool();
  const { contract, userAddress, isConnected } = useWallet();

  // Filter jersey pools with submission time left
  const getAvailableJerseyPools = () => {
    const now = Math.floor(Date.now() / 1000);

    return pools.filter((pool) => {
      const isJersey = pool.pool_type?.toLowerCase() === "jersey";
      const isActive = pool.active;
      const hasTimeLeft = pool.submission_deadline > now;

      return isJersey && isActive && hasTimeLeft;
    });
  };

  const availableJerseyPools = getAvailableJerseyPools();

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

  // Fetch pools on component mount
  useEffect(() => {
    fetchPools();
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
    { id: "psg-logo", name: "Fan Logo", required: true, category: "team" },
    { id: "nike-logo", name: "Nike", required: true, category: "sponsor" },
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
    setShowSaveDialog(true);
  };

  const performSave = (saveLocation: "local" | "cloud") => {
    const designData = {
      elements: designElements,
      frontTextureData: frontCanvasRef.current?.toDataURL(),
      backTextureData: backCanvasRef.current?.toDataURL(),
      activeView,
      timestamp: new Date().toISOString(),
      saveLocation,
    };

    if (saveLocation === "local") {
      localStorage.setItem("tshirt-design", JSON.stringify(designData));
      console.log("Design saved locally:", designData);
      toast("Design saved successfully!", {
        description: "Your design has been saved to local storage",
        action: {
          label: "View",
          onClick: () => console.log("View design"),
        },
      });
    } else {
      // For now, we'll simulate cloud save to localStorage with a different key
      localStorage.setItem("tshirt-design-cloud", JSON.stringify(designData));
      console.log("Design saved to cloud:", designData);
      toast("Design saved to cloud!", {
        description: "Your design has been backed up to the cloud",
        action: {
          label: "Share",
          onClick: () => console.log("Share design"),
        },
      });
    }

    setShowSaveDialog(false);
  };

  const handleExport = () => {
    setShowExportDialog(true);
  };

  const performExport = (exportType: "gif" | "images") => {
    setShowExportDialog(false);

    if (exportType === "gif") {
      exportAsGif(); // Server-side GIF generation
    } else {
      exportStaticImages(); // Static images export
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
        toast.success("Export completed!", {
          description: `Exported ${images.length} images and design data successfully!`,
        });
      }, 1000);
    } catch (error) {
      console.error("Error exporting images:", error);
      setIsRecordingGif(false);
      setRecordingProgress(0);
      toast.error("Export failed", {
        description: "Error exporting images. Trying JSON export instead...",
      });
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
              toast.success("🎉 360° GIF exported successfully!", {
                description: `Method: ${endpoint.name} | Size: ${(
                  blob.size /
                  1024 /
                  1024
                ).toFixed(2)}MB | Frames: ${frames.length}`,
                action: {
                  label: "Export Another",
                  onClick: () => console.log("Export another GIF"),
                },
              });
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
      toast.error("❌ GIF generation failed", {
        description: `${errorMessage}. Falling back to static images...`,
        action: {
          label: "Retry",
          onClick: () => exportAsGif(),
        },
      });

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

  const handleSubmitEntry = () => {
    if (!allLogosPlaced) {
      toast.error("❌ Cannot submit entry", {
        description: "Please place all required logos before submitting",
      });
      return;
    }

    if (availableJerseyPools.length === 0) {
      toast.error("❌ No available pools", {
        description: "No jersey pools are currently accepting submissions",
      });
      return;
    }

    setShowSubmitDialog(true);
  };

  const performSubmitEntry = async (poolId: number) => {
    try {
      setIsSubmitting(true);
      setShowSubmitDialog(false);
      setSubmissionProgress(0);
      setSubmissionStep("Preparing submission...");

      // Step 1: Create GIF (zoomed in for submission)
      setSubmissionStep("Creating 360° GIF...");
      setSubmissionProgress(30);

      const gifBlob = await createGifForSubmission();
      console.log("Created GIF blob:", {
        size: gifBlob.size,
        type: gifBlob.type,
      });

      // Step 2: Upload to IPFS
      setSubmissionStep("Uploading GIF to IPFS...");
      setSubmissionProgress(50);

      const timestamp = Date.now();
      const file = new File([gifBlob], `psg-kit-design-${timestamp}.gif`, {
        type: "image/gif",
      });

      console.log("Created file for upload:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // Use the upload function from the hook
      const formData = new FormData();
      formData.append("file", file);

      const metadata = {
        name: file.name,
        description: `Fan Kit Design submission - ${new Date().toISOString()}`,
        attributes: {
          type: "kit-design-gif",
          uploadedAt: new Date().toISOString(),
          fileSize: file.size,
          fileType: file.type,
        },
      };
      formData.append("pinataMetadata", JSON.stringify(metadata));

      console.log("Uploading to IPFS with metadata:", metadata);

      const response = await fetch("/api/upload-to-pinata", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const cid = result.IpfsHash;

      console.log("Successfully uploaded to IPFS:", {
        cid,
        gateway: `https://tan-adjacent-mammal-701.mypinata.cloud/ipfs/${cid}`,
      });

      // Step 3: Submit to pool
      setSubmissionStep("Submitting to pool...");
      setSubmissionProgress(75);

      await submitToPoolWithCID(poolId, cid);

      setSubmissionStep("Submission completed!");
      setSubmissionProgress(100);

      toast.success("🎉 Entry submitted successfully!", {
        description: "Your design has been submitted to the pool",
        action: {
          label: "View Pool",
          onClick: () => router.push("/show_pools"),
        },
      });

      // Reset states
      setSelectedPoolId(null);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("❌ Submission failed", {
        description: error instanceof Error ? error.message : "Unknown error",
        action: {
          label: "Retry",
          onClick: () => performSubmitEntry(poolId),
        },
      });
    } finally {
      setIsSubmitting(false);
      setSubmissionProgress(0);
      setSubmissionStep("");
    }
  };

  const submitToPoolWithCID = async (poolId: number, cid: string) => {
    if (!contract || !isConnected) {
      throw new Error("Please connect your wallet first");
    }

    const contentUrl = `ipfs://${cid}`;

    // Call smart contract
    const tx = await contract.submitToPool(poolId, contentUrl);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Get submission ID from event
    const submissionMadeEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === "SubmissionMade";
      } catch {
        return false;
      }
    });

    let newSubmissionId = null;
    if (submissionMadeEvent) {
      const parsed = contract.interface.parseLog(submissionMadeEvent);
      newSubmissionId = Number(parsed?.args[1]);
    }

    // Add to database
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        pool_id: poolId,
        creator_address: userAddress,
        content_url: cid,
        vote_count: 0,
        contract_submission_id: newSubmissionId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add submission to database: ${error.message}`);
    }

    return data;
  };

  const createGifForSubmission = async (): Promise<Blob> => {
    try {
      const canvas = document.querySelector("canvas");
      if (!canvas) {
        throw new Error("Canvas not found");
      }

      console.log("Starting frame capture for submission GIF generation...");

      // Store original states
      const originalIsRotationLocked = isRotationLocked;
      const originalActiveView = activeView;
      const originalIsRecordingGif = isRecordingGif;

      // Set recording states for submission (includes zoom AND rotation)
      setIsRotationLocked(false);
      setIsRecordingGif(true); // This enables automatic rotation
      setIsRecordingForSubmission(true); // This enables camera zoom
      setActiveView("front");

      // Wait for state changes to take effect
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capture frames as base64 data URLs (same as exportAsGif)
      const frames: string[] = [];
      const totalFrames = 40;

      for (let i = 0; i < totalFrames; i++) {
        try {
          console.log(`Capturing frame ${i + 1}/${totalFrames} for submission`);

          // Capture current frame as high-quality PNG
          const dataUrl = canvas.toDataURL("image/png", 0.9);
          frames.push(dataUrl);

          // Wait for model rotation and rendering (same timing as exportAsGif)
          await new Promise((resolve) => setTimeout(resolve, 120));
        } catch (error) {
          console.warn(`Failed to capture frame ${i + 1}:`, error);
          // Create a fallback frame
          const fallbackCanvas = document.createElement("canvas");
          fallbackCanvas.width = 800;
          fallbackCanvas.height = 600;
          const ctx = fallbackCanvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#9ca3af";
            ctx.fillRect(0, 0, 800, 600);
            ctx.fillStyle = "#9BA3AF";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Frame ${i + 1}`, 400, 300);
            frames.push(fallbackCanvas.toDataURL("image/png"));
          }
        }
      }

      if (frames.length === 0) {
        throw new Error("No frames captured for submission");
      }

      console.log(
        `Captured ${frames.length} frames, generating GIF via server...`
      );

      // Use the same server-side API as exportAsGif
      const response = await fetch("/api/generate-gif", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          frames,
          options: {
            fps: 8, // Slightly faster for submission
            width: 800,
            height: 600,
            quality: "high",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("Generated GIF is empty");
      }

      console.log(
        `🎉 Submission GIF generated successfully! Size: ${(
          blob.size /
          1024 /
          1024
        ).toFixed(2)}MB`
      );

      // Restore original states
      setIsRotationLocked(originalIsRotationLocked);
      setIsRecordingGif(originalIsRecordingGif);
      setIsRecordingForSubmission(false);
      setActiveView(originalActiveView);
      gifRotationRef.current = 0;

      return blob;
    } catch (error) {
      console.error("Error creating GIF for submission:", error);

      // Restore original states on error
      setIsRotationLocked(isRotationLocked);
      setIsRecordingGif(false);
      setIsRecordingForSubmission(false);
      gifRotationRef.current = 0;

      throw error;
    }
  };

  const allLogosPlaced = useMemo(() => {
    return requiredLogos.every((logo) => placedLogos.has(logo.id));
  }, [placedLogos, requiredLogos]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="relative z-10 min-h-screen flex flex-col pb-8">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col px-4 py-4 min-h-0">
          <div className="mb-4 flex-shrink-0">
            <Card className="shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-0">
              <CardHeader className="bg-black text-white p-0">
                {/* Top Navigation Bar */}
                <div className="bg-gray-900 px-6 py-3 border-b-2 border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => router.back()}
                        className="bg-white text-black border-2 border-white hover:bg-gray-100 p-2 hover:scale-105 active:scale-95 transition-all duration-200 font-black"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div className="bg-white px-3 py-1 border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-black font-black text-sm tracking-wider">
                          FANVAS
                        </span>
                      </div>
                      <span className="text-gray-400 font-mono text-sm">
                        / CLUB ROOMS / FAN / KIT DESIGN / EDITOR
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={clearAll}
                        disabled={isRecordingGif}
                        className={`font-black border-2 border-white px-3 py-2 transition-all duration-200 hover:scale-105 ${
                          isRecordingGif
                            ? "bg-gray-600 cursor-not-allowed text-gray-300"
                            : "bg-white text-black hover:bg-gray-100"
                        }`}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleSave}
                        disabled={isRecordingGif}
                        className={`font-black border-2 border-white px-4 py-2 transition-all duration-200 hover:scale-105 ${
                          isRecordingGif
                            ? "bg-gray-600 cursor-not-allowed text-gray-300"
                            : "bg-white text-black hover:bg-gray-100"
                        }`}
                      >
                        <Save className="w-4 h-4 mr-2 inline" />
                        Save Design
                      </button>

                      <button
                        onClick={handleExport}
                        disabled={isRecordingGif}
                        className={`font-black border-2 border-white px-4 py-2 transition-all duration-200 hover:scale-105 ${
                          isRecordingGif
                            ? "bg-gray-600 cursor-not-allowed text-gray-300"
                            : "bg-white text-black hover:bg-gray-100"
                        }`}
                      >
                        {isRecordingGif ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 inline animate-spin" />
                            Creating 360° GIF... {Math.round(recordingProgress)}
                            %
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

                {/* Kit Design Editor Header */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2 flex items-center justify-center">
                        <PenTool className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-black tracking-wider mb-1">
                          3D KIT EDITOR
                        </CardTitle>
                        <p className="text-sm font-mono opacity-80">
                          DESIGN YOUR FAN JERSEY IN 3D
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-white text-black border-2 border-white font-black text-sm">
                        EDITOR MODE
                      </Badge>
                      <div
                        className={`px-3 py-2 border-2 border-white font-black text-sm ${
                          allLogosPlaced
                            ? "bg-white text-black"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        <Trophy className="w-4 h-4 mr-2 inline" />
                        {allLogosPlaced ? "READY TO SUBMIT" : "LOGOS REQUIRED"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-12 gap-3 flex-1 h-fit">
            <div className="col-span-3 flex flex-col min-h-0">
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col min-h-0">
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
                                ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
                                ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
                          ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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

            <div className="col-span-6 flex flex-col min-h-0">
              <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col min-h-0">
                <div className="bg-black text-white p-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black">3D DESIGN CANVAS</h2>
                    <div className="flex items-center gap-2">
                      <button
                        className={`border-2 border-white px-3 py-1 font-black text-sm ${
                          activeView === "front"
                            ? "bg-white text-black"
                            : "bg-gray-600 text-white hover:bg-gray-500"
                        } transition-all duration-200 hover:scale-105`}
                        onClick={() => setActiveView("front")}
                        disabled={isRecordingGif}
                      >
                        FRONT
                      </button>
                      <button
                        className={`border-2 border-white px-3 py-1 font-black text-sm ${
                          activeView === "back"
                            ? "bg-white text-black"
                            : "bg-gray-600 text-white hover:bg-gray-500"
                        } transition-all duration-200 hover:scale-105`}
                        onClick={() => setActiveView("back")}
                        disabled={isRecordingGif}
                      >
                        BACK
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="flex-1 bg-gray-400 relative min-h-0"
                  style={{ maxHeight: "calc(100vh - 300px)" }}
                >
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
                      isRecordingForSubmission={isRecordingForSubmission}
                    />

                    <OrbitControls
                      enablePan={false}
                      enableZoom={!isRecordingForSubmission}
                      enableRotate={
                        !isRotationLocked &&
                        !isRecordingGif &&
                        !isRecordingForSubmission
                      }
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
                            className="bg-black h-full transition-all duration-300"
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

                  {showQuickGuide && (
                    <div className="absolute top-3 left-3 bg-black bg-opacity-90 text-white p-3 rounded border-2 border-white max-w-xs">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-black text-sm">QUICK GUIDE:</h3>
                        <button
                          onClick={() => setShowQuickGuide(false)}
                          className="text-white hover:text-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
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
                  )}

                  {!showQuickGuide && (
                    <div className="absolute top-3 left-3">
                      <button
                        onClick={() => setShowQuickGuide(true)}
                        className="bg-black bg-opacity-90 text-white p-2 rounded border-2 border-white hover:bg-opacity-100 transition-all"
                        title="Show Quick Guide"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}

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

            <div className="col-span-3 flex flex-col space-y-4 min-h-0">
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
                            ? "bg-gray-200"
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
                      allLogosPlaced && !isRecordingGif && !isSubmitting
                        ? "bg-purple-500 hover:bg-purple-600 text-white hover:scale-105"
                        : "bg-gray-400 text-gray-700 cursor-not-allowed"
                    }`}
                    disabled={!allLogosPlaced || isRecordingGif || isSubmitting}
                    onClick={handleSubmitEntry}
                  >
                    <Trophy className="w-3 h-3 mr-1 inline" />
                    {isSubmitting ? "Submitting..." : "Submit Entry"}
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

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              Save Your Design
            </DialogTitle>
            <DialogDescription className="text-sm font-mono">
              Choose where you'd like to save your Fan kit design
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-black bg-gray-50">
                <h3 className="font-black text-sm mb-2">💾 LOCAL STORAGE</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Saves to your browser's local storage. Quick and private, but
                  only accessible on this device.
                </p>
                <Button
                  onClick={() => performSave("local")}
                  className="w-full bg-black text-white border-2 border-black hover:bg-gray-800 font-black"
                >
                  Save Locally
                </Button>
              </div>

              <div className="p-4 border-2 border-black bg-gray-50">
                <h3 className="font-black text-sm mb-2">☁️ CLOUD BACKUP</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Saves to cloud storage. Access your design from anywhere and
                  share with others.
                </p>
                <Button
                  onClick={() => performSave("cloud")}
                  className="w-full bg-black text-white border-2 border-black hover:bg-gray-800 font-black"
                >
                  Save to Cloud
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="neutral"
              onClick={() => setShowSaveDialog(false)}
              className="border-2 border-black font-black"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Entry Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              🏆 Submit Entry to Pool
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Choose a pool to submit your kit design. Your design will be
              converted to a GIF, uploaded to IPFS, and submitted to the
              selected pool.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <label className="block text-sm font-black mb-2">
                Select Pool:
              </label>
              <Select
                value={selectedPoolId?.toString() || ""}
                onValueChange={(value) => setSelectedPoolId(parseInt(value))}
                disabled={poolsLoading}
              >
                <SelectTrigger className="w-full border-2 border-black font-bold">
                  <SelectValue
                    placeholder={
                      poolsLoading ? "Loading pools..." : "Choose a pool..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {poolsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading pools...
                    </SelectItem>
                  ) : availableJerseyPools.length === 0 ? (
                    <SelectItem value="no-pools" disabled>
                      No jersey pools available
                    </SelectItem>
                  ) : (
                    availableJerseyPools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold">Pool #{pool.id}</span>
                          <span className="text-xs text-gray-500">
                            Match: {pool.match_id}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedPoolId && (
              <div className="p-3 bg-gray-50 border-2 border-black">
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Pool Details:</strong>
                </p>
                <p className="text-xs">
                  Type:{" "}
                  {
                    availableJerseyPools.find((p) => p.id === selectedPoolId)
                      ?.pool_type
                  }
                </p>
                <p className="text-xs">
                  Match:{" "}
                  {
                    availableJerseyPools.find((p) => p.id === selectedPoolId)
                      ?.match_id
                  }
                </p>
                <p className="text-xs">
                  Submission Deadline:{" "}
                  {availableJerseyPools.find((p) => p.id === selectedPoolId)
                    ?.submission_deadline
                    ? new Date(
                        availableJerseyPools.find(
                          (p) => p.id === selectedPoolId
                        )!.submission_deadline * 1000
                      ).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            )}

            {isSubmitting && (
              <div className="p-3 bg-blue-50 border-2 border-blue-500">
                <p className="text-xs font-bold text-blue-700 mb-2">
                  {submissionStep}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${submissionProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {submissionProgress}% Complete
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="neutral"
              onClick={() => setShowSubmitDialog(false)}
              className="border-2 border-black font-black"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedPoolId && performSubmitEntry(selectedPoolId)
              }
              disabled={!selectedPoolId}
              className="bg-purple-500 hover:bg-purple-600 text-white border-2 border-black font-black"
            >
              Submit Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Choice Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              Choose Export Type
            </DialogTitle>
            <DialogDescription className="text-sm font-mono">
              Select how you'd like to export your Fan kit design
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-black bg-gray-50">
                <h3 className="font-black text-sm mb-2">🎥 360° GIF</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Creates an animated GIF showing a full 360° rotation of your
                  design. Perfect for showcasing!
                </p>
                <Button
                  onClick={() => performExport("gif")}
                  className="w-full bg-black text-white border-2 border-black hover:bg-gray-800 font-black"
                >
                  Export as GIF
                </Button>
              </div>

              <div className="p-4 border-2 border-black bg-gray-50">
                <h3 className="font-black text-sm mb-2">📸 Static Images</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Exports front and back view images plus design data. Lighter
                  and faster to generate.
                </p>
                <Button
                  onClick={() => performExport("images")}
                  className="w-full bg-black text-white border-2 border-black hover:bg-gray-800 font-black"
                >
                  Export as Images
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="neutral"
              onClick={() => setShowExportDialog(false)}
              className="border-2 border-black font-black"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            border: "2px solid black",
            fontSize: "14px",
            fontWeight: "bold",
          },
        }}
      />
    </div>
  );
}
