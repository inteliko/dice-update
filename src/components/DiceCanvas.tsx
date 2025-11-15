
import { useRef, useEffect, useState } from "react";
import { drawDiceFace } from "@/utils/diceDrawing";
import { MosaicSettings } from "./MosaicControls";
import { useIsMobile } from "@/hooks/use-mobile";

interface DiceCanvasProps {
  diceGrid: number[][];
  settings: MosaicSettings;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  zoomLevel?: number;
  // Optional per-tile overrides for manual editing
  editedGrid?: Array<Array<{
    face?: number;
    color?: string;
    pipColor?: string;
  }>>;
  // Optional callback when a tile is clicked in the canvas: (row, col)
  onTileClick?: (r: number, c: number) => void;
}

const DiceCanvas = ({ diceGrid, settings, onCanvasReady, zoomLevel = 1, editedGrid, onTileClick }: DiceCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [originalCellSize, setOriginalCellSize] = useState(0);
  const [forceRender, setForceRender] = useState(0);
  const resolutionRef = useRef<number>(1);
  const logicalCellSizeRef = useRef<number>(0);
  const rowsRef = useRef<number>(0);
  const colsRef = useRef<number>(0);

  // Listen for zoom/device pixel ratio changes
  useEffect(() => {
    const handleZoom = () => {
      setForceRender(prev => prev + 1);
    };
    
    window.addEventListener('resize', handleZoom);
    window.addEventListener('orientationchange', handleZoom);
    
    return () => {
      window.removeEventListener('resize', handleZoom);
      window.removeEventListener('orientationchange', handleZoom);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !diceGrid.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    
    const rows = diceGrid.length;
    const cols = diceGrid[0].length;
    
    // Adjust cell size based on grid dimensions and device type
    // Compute available size from parent element so canvas fits its container
    const parentEl = canvas.parentElement;
    const parentRect = parentEl ? parentEl.getBoundingClientRect() : null;
    
    // Fallback to viewport dimensions if parent has no size or is not visible
    let maxCanvasWidth = isMobile ? window.innerWidth * 0.9 : Math.min(window.innerWidth * 0.8, 1400);
    let maxCanvasHeight = isMobile ? window.innerHeight * 0.5 : Math.min(window.innerHeight * 0.65, 900);
    
    // If parent element exists and has reasonable dimensions, use them
    if (parentEl && parentRect && parentRect.width > 100 && parentRect.height > 100) {
      maxCanvasWidth = Math.min(parentRect.width - 20, 1400);
      maxCanvasHeight = Math.min(parentRect.height - 20, 900);
    }
    
    // Calculate cell size based on available space and grid size
    const cellSizeByWidth = maxCanvasWidth / cols;
    const cellSizeByHeight = maxCanvasHeight / rows;
    const cellSize = Math.min(cellSizeByWidth, cellSizeByHeight);
    
    // Store original cell size for reference
    setOriginalCellSize(cellSize);
    
    // Apply zoom to cell size with increased resolution multiplier
    const zoomedCellSize = cellSize * zoomLevel;
    
    // Improved resolution multiplier for better quality when zoomed
    const resolutionMultiplier = Math.max(4, Math.ceil(zoomLevel * 2)); // Higher resolution with zoom
    const canvasWidth = cols * zoomedCellSize;
    const canvasHeight = rows * zoomedCellSize;
    
    // Set the physical canvas size to the displayed size with higher resolution
    canvas.width = canvasWidth * resolutionMultiplier;
    canvas.height = canvasHeight * resolutionMultiplier;
    
    // Set the CSS size (display size)
    setCanvasSize({ width: canvasWidth, height: canvasHeight });
    
    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Scale the context to match the resolution multiplier
    ctx.scale(resolutionMultiplier, resolutionMultiplier);
    
    // Clear canvas with transparent background (don't fill with solid color)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Only set background color for non-white/black themes or for visual separation
    // Don't use solid fill for black/white themes as it obscures the grid
    if (settings.theme !== "black" && settings.theme !== "white") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    // Draw each dice cell with improved styling and resolution
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Use editedGrid override if provided
        const override = editedGrid && editedGrid[row] && editedGrid[row][col];
        const diceValue = override && typeof override.face === 'number' ? override.face : diceGrid[row][col];
        const x = col * zoomedCellSize;
        const y = row * zoomedCellSize;

        // Determine dice color: override color > settings.faceColors[diceValue] > default
        const diceColor = (override && override.color) || settings.faceColors[diceValue] || "#ffffff";
        ctx.fillStyle = diceColor;

        // For a cleaner look, draw dice background with small gap between dice
        const padding = zoomedCellSize * 0.01; // Reduced padding for more accurate image representation
        ctx.fillRect(x + padding, y + padding, zoomedCellSize - padding * 2, zoomedCellSize - padding * 2);

        // Always draw the dots/pips, regardless of cell size
        // Reduce minimum threshold for small cells so dots still render when zoomed out
        if (zoomedCellSize > 3 && settings.useShading) {
          // Draw dice face with pips
          drawDiceFace(ctx, diceValue, x, y, zoomedCellSize, diceColor);
        } else if (zoomedCellSize <= 3 && settings.useShading) {
          // For very small cells, draw a minimal indicator dot in the center
          const dotRadius = Math.max(0.3, zoomedCellSize * 0.15);
          const brightness = (parseInt(diceColor.slice(1, 3), 16) * 0.299 + 
                             parseInt(diceColor.slice(3, 5), 16) * 0.587 + 
                             parseInt(diceColor.slice(5, 7), 16) * 0.114);
          ctx.fillStyle = brightness > 128 ? '#000000' : '#FFFFFF';
          ctx.beginPath();
          ctx.arc(x + zoomedCellSize / 2, y + zoomedCellSize / 2, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // No numeric labels: dots/face rendering handled by drawDiceFace
      }
    }

    // Call the callback with the canvas reference
    if (canvas) {
      onCanvasReady(canvas);
    }
    // store values for event coordinate mapping
    resolutionRef.current = resolutionMultiplier;
    logicalCellSizeRef.current = zoomedCellSize;
    rowsRef.current = rows;
    colsRef.current = cols;
  }, [diceGrid, settings, onCanvasReady, isMobile, zoomLevel, forceRender, editedGrid]);

  // Attach click handler to map clicks to a tile
  useEffect(() => {
    // no-op placeholder to keep hook ordering stable
  }, []);

  // Create a stable click handler using refs and prop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onTileClick) return;

    const onClick = (evt: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width; // device pixels per CSS pixel
      const scaleY = canvas.height / rect.height;
      const resolution = resolutionRef.current || 1;
      const logicalX = (evt.clientX - rect.left) * scaleX / resolution;
      const logicalY = (evt.clientY - rect.top) * scaleY / resolution;
      const cell = logicalCellSizeRef.current || 0;
      if (cell <= 0) return;
      const col = Math.floor(logicalX / cell);
      const row = Math.floor(logicalY / cell);
      if (row >= 0 && row < rowsRef.current && col >= 0 && col < colsRef.current) {
        onTileClick(row, col);
      }
    };

    canvas.addEventListener('click', onClick);
    return () => canvas.removeEventListener('click', onClick);
  }, [onTileClick]);

  return (
    <div className="dice-canvas-wrapper w-full overflow-x-auto">
      <canvas
        ref={canvasRef}
        className="max-w-full mx-auto border border-gray-200 shadow-sm"
        style={{ 
          width: canvasSize.width > 0 ? canvasSize.width : "auto",
          height: canvasSize.height > 0 ? canvasSize.height : "auto",
          backgroundColor: settings.theme === "white" ? "#F8F8F8" : 
                         settings.theme === "black" ? "#111111" : "#FFFFFF",
        }}
      />
    </div>
  );
};

export default DiceCanvas;
