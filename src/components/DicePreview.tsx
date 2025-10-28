
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MosaicSettings } from "./MosaicControls";
import DiceCanvas from "./DiceCanvas";
import MosaicSummary from "./MosaicSummary";
import DiceDownloadButtons from "./DiceDownloadButtons";
import { ZoomIn, ZoomOut, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DicePreviewProps {
  diceGrid: number[][];
  settings: MosaicSettings;
  blackDiceCount: number;
  whiteDiceCount: number;
  isVisible: boolean;
}

const DicePreview = ({ diceGrid, settings, blackDiceCount, whiteDiceCount, isVisible }: DicePreviewProps) => {
  const [currentCanvas, setCurrentCanvas] = useState<HTMLCanvasElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { toast } = useToast();

  if (!isVisible) {
    return null;
  }

  const downloadImage = () => {
    if (!currentCanvas) return;
    
    // Create a high-resolution version for download
    const downloadCanvas = document.createElement("canvas");
    const ctx = downloadCanvas.getContext("2d");
    if (!ctx) return;
    
    // Set higher resolution for download
    const scaleFactor = 4; // Higher resolution for downloads
    downloadCanvas.width = currentCanvas.width * scaleFactor;
    downloadCanvas.height = currentCanvas.height * scaleFactor;
    
    // Draw with high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      currentCanvas, 
      0, 0, currentCanvas.width, currentCanvas.height,
      0, 0, downloadCanvas.width, downloadCanvas.height
    );
    
    // Generate high-quality PNG
    const dataUrl = downloadCanvas.toDataURL("image/png", 1.0);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "dice-mosaic.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Download started",
      description: "Your high-resolution dice mosaic image has been downloaded.",
    });
  };

  const downloadCSV = () => {
    const headers = ["Row", "Column", "Dice Value"];
    const csvRows = [headers];

    diceGrid.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        csvRows.push([String(rowIndex + 1), String(colIndex + 1), String(value)]);
      });
    });

    const csvContent = csvRows
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dice-mosaic.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your dice mosaic CSV has been downloaded.",
    });
  };

  const increaseZoom = () => {
    if (zoomLevel < 5) {
      const newZoomLevel = Math.min(zoomLevel + 0.5, 5);
      setZoomLevel(newZoomLevel);
      toast({
        title: "Zoom In",
        description: `Zoom level: ${newZoomLevel.toFixed(1)}x`,
      });
    }
  };

  const decreaseZoom = () => {
    if (zoomLevel > 0.5) {
      const newZoomLevel = Math.max(zoomLevel - 0.5, 0.5);
      setZoomLevel(newZoomLevel);
      toast({
        title: "Zoom Out",
        description: `Zoom level: ${newZoomLevel.toFixed(1)}x`,
      });
    }
  };

  // Calculate dice counts by face value
  const diceColorCounts: Record<string, number> = {};
  diceGrid.forEach(row => {
    row.forEach(value => {
      const color = settings.faceColors[value] || "#000000";
      diceColorCounts[color] = (diceColorCounts[color] || 0) + 1;
    });
  });

  if (!diceGrid.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-gray-50 h-96">
        <p className="text-gray-500">Upload an image and generate a dice mosaic to see the preview.</p>
      </div>
    );
  }

  // Calculate dimensions based on dice size
  const diceSizeCm = settings.diceSizeMm / 10;
  const width = typeof settings.gridSize === "number" 
    ? settings.gridSize * diceSizeCm 
    : diceGrid[0].length * diceSizeCm;
  const height = typeof settings.gridSize === "number" 
    ? settings.gridSize * diceSizeCm 
    : diceGrid.length * diceSizeCm;

  return (
    <div className="mosaic-preview-container">
      <div className="preview-section">
        <div className="px-4 py-6 preview-content-wrapper">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Mosaic Preview</h3>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={decreaseZoom}
                className="flex items-center gap-1"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
                <span className="sr-only md:not-sr-only md:inline">Zoom Out</span>
              </Button>
              <span className="px-2 py-1 text-sm bg-gray-100 rounded">
                {zoomLevel.toFixed(1)}x
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={increaseZoom}
                className="flex items-center gap-1"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
                <span className="sr-only md:not-sr-only md:inline">Zoom In</span>
              </Button>
            </div>
          </div>
          
          <div className="canvas-container flex justify-center mb-6">
            <DiceCanvas
              diceGrid={diceGrid}
              settings={settings}
              onCanvasReady={setCurrentCanvas}
              zoomLevel={zoomLevel}
            />
          </div>
          
         
          
          <div className="mosaic-info-grid mt-6">
            <div className="grid grid-cols-2 gap-2 text-sm max-w-md mx-auto">
              <div className="text-left">Dice Size</div>
              <div className="text-right font-medium">{settings.diceSizeMm} mm</div>
              
              <div className="text-left">Width</div>
              <div className="text-right font-medium">{width.toFixed(2)} cm</div>
              
              <div className="text-left">Height</div>
              <div className="text-right font-medium">{height.toFixed(2)} cm</div>
              
              <div className="text-left">Total Dice</div>
              <div className="text-right font-medium">
                {diceGrid.length * diceGrid[0].length}
              </div>
              
              <div className="text-left">Estimated Time</div>
              <div className="text-right font-medium">
                {Math.floor((blackDiceCount + whiteDiceCount) / 10 / 60)} hours, {Math.floor((blackDiceCount + whiteDiceCount) / 10 % 60)} minutes
              </div>
              
              
              
              <div className="text-left flex items-center">
                <div className="w-3 h-3 bg-black rounded-sm mr-1"></div>
                <span>Black Dice</span>
              </div>
              <div className="text-right font-medium">{blackDiceCount}</div>
              
              <div className="text-left flex items-center">
                <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm mr-1"></div>
                <span>White Dice</span>
              </div>
              <div className="text-right font-medium">{whiteDiceCount}</div>
            </div>
          </div>
          
          <div className="text-center my-6">
            <DiceDownloadButtons
              onDownloadImage={downloadImage}
              onDownloadCSV={downloadCSV}
            />
          </div>
          
          <div className="mt-8">
            <MosaicSummary
              width={width}
              height={height}
              blackDiceCount={blackDiceCount}
              whiteDiceCount={whiteDiceCount}
              isVisible={true}
              onDownloadImage={downloadImage}
              diceColors={diceColorCounts}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DicePreview;
