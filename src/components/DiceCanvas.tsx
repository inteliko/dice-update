
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
  const resolutionRef = useRef<number>(1);
  const logicalCellSizeRef = useRef<number>(0);
  const rowsRef = useRef<number>(0);
  const colsRef = useRef<number>(0);

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
    const maxCanvasWidth = parentRect ? parentRect.width : (isMobile ? window.innerWidth * 0.85 : Math.min(window.innerWidth * 0.7, 1200));
    const maxCanvasHeight = parentRect ? parentRect.height : (isMobile ? window.innerHeight * 0.5 : Math.min(window.innerHeight * 0.6, 900));
    
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
    
    // Fill canvas with theme-appropriate background
    if (settings.theme === "black") {
      ctx.fillStyle = "#111111";
    } else if (settings.theme === "white") {
      ctx.fillStyle = "#F8F8F8";
    } else {
      ctx.fillStyle = "#FFFFFF"; // Default background for mixed theme
    }
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
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

        // Draw the dots with improved visibility
        if (zoomedCellSize > 6 && settings.useShading) {
          // pip color override not currently passed to drawDiceFace, but drawDiceFace uses diceColor to compute
          drawDiceFace(ctx, diceValue, x, y, zoomedCellSize, diceColor);
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
  }, [diceGrid, settings, onCanvasReady, isMobile, zoomLevel]);

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
