
import { useRef, useEffect, useState } from "react";
import { drawDiceFace } from "@/utils/diceDrawing";
import { MosaicSettings } from "./MosaicControls";
import { useIsMobile } from "@/hooks/use-mobile";

interface DiceCanvasProps {
  diceGrid: number[][];
  settings: MosaicSettings;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  zoomLevel?: number;
}

const DiceCanvas = ({ diceGrid, settings, onCanvasReady, zoomLevel = 1 }: DiceCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [originalCellSize, setOriginalCellSize] = useState(0);

  useEffect(() => {
    if (!canvasRef.current || !diceGrid.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    
    const rows = diceGrid.length;
    const cols = diceGrid[0].length;
    
    // Adjust cell size based on grid dimensions and device type
    const maxCanvasWidth = isMobile ? window.innerWidth * 0.85 : Math.min(window.innerWidth * 0.7, 1200);
    const maxCanvasHeight = isMobile ? window.innerHeight * 0.5 : Math.min(window.innerHeight * 0.6, 900);
    
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
        const diceValue = diceGrid[row][col];
        const x = col * zoomedCellSize;
        const y = row * zoomedCellSize;
        
        // Set color based on the dice face value
        const diceColor = settings.faceColors[diceValue] || "#ffffff";
        ctx.fillStyle = diceColor;
        
        // For a cleaner look, draw dice background with small gap between dice
        const padding = zoomedCellSize * 0.01; // Reduced padding for more accurate image representation
        ctx.fillRect(x + padding, y + padding, zoomedCellSize - padding * 2, zoomedCellSize - padding * 2);
        
        // Draw the dots with improved visibility
        if (zoomedCellSize > 4 && settings.useShading) {
          drawDiceFace(ctx, diceValue, x, y, zoomedCellSize, diceColor);
        }
      }
    }

    // Call the callback with the canvas reference
    if (canvas) {
      onCanvasReady(canvas);
    }
  }, [diceGrid, settings, onCanvasReady, isMobile, zoomLevel]);

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
