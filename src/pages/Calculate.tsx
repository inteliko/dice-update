import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "@/components/ImageUploader";
import { processImage } from "@/utils/imageProcessor";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ControlSidebar from "@/components/ControlSidebar";
import DicePreview from "@/components/DicePreview";
import { MosaicSettings } from "@/components/MosaicControls";
import { FileDown, Plus, Minus, FileOutput, Dices, Circle, Square } from "lucide-react";
import DiceCanvas from "@/components/DiceCanvas";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const MAX_DICE = 10000;
const DEFAULT_SIZE = 50;

// Updated interface to match MosaicSettings and specify theme as a union type
interface Settings {
  gridSize: number | "auto" | "custom";
  gridWidth?: number;
  gridHeight?: number;
  contrast: number;
  useShading: boolean;
  diceSizeMm: number;
  theme?: "black" | "white" | "mixed"; // Updated to match MosaicSettings
  faceColors: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
  };
}

const Calculate = () => {
  const [width, setWidth] = useState<number>(DEFAULT_SIZE);
  // Sidebar open/close state
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [height, setHeight] = useState<number>(DEFAULT_SIZE);
  const [contrast, setContrast] = useState<number>(50);
  const [brightness, setBrightness] = useState<number>(50);
  const [diceGrid, setDiceGrid] = useState<number[][]>([]);
  const [diceCount, setDiceCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dicePrice, setDicePrice] = useState<number>(0.10);
  const [settings, setSettings] = useState<Settings>({
    gridSize: DEFAULT_SIZE,
    contrast: 50,
    useShading: true,
    diceSizeMm: 1.6,
    faceColors: {
      1: "#FFFFFF",
      2: "#DDDDDD",
      3: "#BBBBBB",
      4: "#888888",
      5: "#555555",
      6: "#222222",
    }
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [outputDialogOpen, setOutputDialogOpen] = useState<boolean>(false);
  
  // New state for dice theme, replacing invertColors
  const [diceTheme, setDiceTheme] = useState<"mixed" | "black" | "white">("mixed");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { toast } = useToast();

  // Calculate counts of each dice face
  const diceColorCounts = diceGrid.reduce((acc, row) => {
    row.forEach(value => {
      acc[value] = (acc[value] || 0) + 1;
    });
    return acc;
  }, {} as Record<number, number>);

  // Count black and white dice (faces 1 and 6)
  const whiteDiceCount = diceColorCounts[1] || 0;
  const blackDiceCount = diceColorCounts[6] || 0;

  // Calculate actual dice count from the processed grid
  const actualDiceCount = diceGrid.length > 0 ? diceGrid.length * diceGrid[0].length : width * height;
  
  // Calculate total cost using actual dice count
  const totalCost = (actualDiceCount * dicePrice).toFixed(2);

  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setDicePrice(value);
    }
  };

  // Helper to get face colors by theme
  const getFaceColors = (theme: "black" | "white" | "mixed") => {
    if (theme === "black") {
      return { 1: "#222222", 2: "#222222", 3: "#222222", 4: "#222222", 5: "#222222", 6: "#222222" };
    }
    if (theme === "white") {
      return { 1: "#FFFFFF", 2: "#FFFFFF", 3: "#FFFFFF", 4: "#FFFFFF", 5: "#FFFFFF", 6: "#FFFFFF" };
    }
    // Mixed
    return { 1: "#FFFFFF", 2: "#DDDDDD", 3: "#BBBBBB", 4: "#888888", 5: "#555555", 6: "#222222" };
  };

  // Update settings when theme changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      faceColors: getFaceColors(diceTheme),
      theme: diceTheme,
    }));
    // If image is loaded, re-process mosaic
    if (imageFile) {
      processCurrentImage();
    }
    // eslint-disable-next-line
  }, [diceTheme]);

  // Automatically generate mosaic when image is uploaded
  useEffect(() => {
    if (imageFile) {
      processCurrentImage();
    }
    // eslint-disable-next-line
  }, [imageFile]);

  // Update processCurrentImage to use current theme's faceColors
  const processCurrentImage = async () => {
    if (!imageFile) {
      toast({
        title: "No image selected",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      toast({
        title: "Processing image",
        description: "Please wait while we convert your image to dice...",
      });

      const invertColors = diceTheme === "black";
      const grid = await processImage(
        imageFile,
        "custom",
        contrast,
        width,
        height,
        brightness,
        invertColors
      );

      setDiceGrid(grid);

      // Count dice
      const totalDice = grid.length * grid[0].length;
      setDiceCount(totalDice);

      setSettings(prev => ({
        ...prev,
        gridSize: "custom" as const,
        gridWidth: width,
        gridHeight: height,
        contrast,
        diceSizeMm: 1.6,
        theme: diceTheme,
        faceColors: getFaceColors(diceTheme),
      }));

      toast({
        title: "Image processed successfully",
        description: `Your image has been converted to a dice mosaic pattern with ${totalDice} dice.`,
      });
    } catch (error) {
      console.error("Image processing error:", error);
      toast({
        title: "Error processing image",
        description: "There was an error processing your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    // Check if this is a real file (not an empty file used for clearing)
    if (file.size > 0) {
      setImageFile(file);
      setSidebarOpen(true); // Open sidebar after image upload
      try {
        setIsProcessing(true);
        // Process the image immediately after upload
        await processCurrentImage();
      } catch (error) {
        console.error("Error in image upload handler:", error);
        toast({
          title: "Upload error",
          description: "There was a problem processing your image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Clear the current image if an empty file was provided
      setImageFile(null);
      setDiceGrid([]);
      setSidebarOpen(false); // Close sidebar if image is cleared
    }
  };

  const increaseSize = () => {
    if (width * height < MAX_DICE) {
      setWidth(prev => Math.min(prev + 10, 100));
      setHeight(prev => Math.min(prev + 10, 100));
    } else {
      toast({
        title: "Maximum size reached",
        description: `You cannot exceed ${MAX_DICE} dice in total.`,
        variant: "destructive",
      });
    }
  };

  const decreaseSize = () => {
    setWidth(prev => Math.max(prev - 10, 10));
    setHeight(prev => Math.max(prev - 10, 10));
  };

  const increaseContrast = () => {
    setContrast(prev => Math.min(prev + 10, 100));
  };

  const decreaseContrast = () => {
    setContrast(prev => Math.max(prev - 10, 0));
  };

  const increaseBrightness = () => {
    setBrightness(prev => Math.min(prev + 10, 100));
  };

  const decreaseBrightness = () => {
    setBrightness(prev => Math.max(prev - 10, 0));
  };

  // Handle theme change
  const handleThemeChange = (value: string) => {
    if (value === "black" || value === "white" || value === "mixed") {
      setDiceTheme(value);
      
      // Automatically process image if one is loaded
      if (imageFile && !isProcessing) {
        processCurrentImage();
      }
      
      toast({
        title: `${value.charAt(0).toUpperCase() + value.slice(1)} Dice Theme`,
        description: `Switched to ${value} dice theme`,
      });
    }
  };

  const openOutput = () => {
    if (diceGrid.length === 0) {
      toast({
        title: "No dice mosaic generated",
        description: "Please upload an image and generate a dice mosaic first.",
        variant: "destructive",
      });
      return;
    }
    
    setOutputDialogOpen(true);
    toast({
      title: "Output opened",
      description: "Showing dice layout for printing.",
    });
  };

  const downloadCSV = () => {
    if (diceGrid.length === 0) return;
    
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

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Create a high-resolution version for download
    const downloadCanvas = document.createElement("canvas");
    const ctx = downloadCanvas.getContext("2d");
    if (!ctx) return;
    
    // Set higher resolution for download
    const scaleFactor = 2; // Double resolution for downloads
    downloadCanvas.width = canvas.width * scaleFactor;
    downloadCanvas.height = canvas.height * scaleFactor;
    
    // Draw with high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      canvas, 
      0, 0, canvas.width, canvas.height,
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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex flex-1">
        {/* Left Control Sidebar */}
        <ControlSidebar
          onGenerate={processCurrentImage}
          imageFile={imageFile}
          onImageUpload={handleImageUpload}
          blackDiceCount={blackDiceCount}
          whiteDiceCount={whiteDiceCount}
          diceColorCounts={diceColorCounts}
          isOpen={isSidebarOpen}
          onOpenChange={setSidebarOpen}
        />
        {/* Main Content */}
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            {/* Toggle Controls Button - centered at the top */}
            <div className="flex justify-center my-6">
              <button
                onClick={() => setSidebarOpen((open) => !open)}
                className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-3 flex items-center gap-2 shadow-md transition-colors duration-300"
              >
                {isSidebarOpen ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-left">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                      <line x1="9" x2="9" y1="3" y2="21"/>
                    </svg>
                    Close Controls
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-right">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                      <line x1="15" x2="15" y1="3" y2="21"/>
                    </svg>
                    Open Controls
                  </>
                )}
              </button>
            </div>
            <h1 className="text-2xl font-bold mb-6">Calculate Dice Mosaic</h1>
            {/* Image Upload */}
            <ImageUploader onImageUpload={handleImageUpload} />
            {/* Controls - responsive: stack on small screens, inline on md+ */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 my-6">
              <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                <Label className="whitespace-nowrap">Width</Label>
                <Input className="w-full md:w-24" type="number" value={width} onChange={e => setWidth(Number(e.target.value))} min={10} max={100} />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                <Label className="whitespace-nowrap">Height</Label>
                <Input className="w-full md:w-24" type="number" value={height} onChange={e => setHeight(Number(e.target.value))} min={10} max={100} />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                <Label className="whitespace-nowrap">Contrast</Label>
                <Input className="w-full md:w-24" type="number" value={contrast} onChange={e => setContrast(Number(e.target.value))} min={0} max={100} />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                <Label className="whitespace-nowrap">Brightness</Label>
                <Input className="w-full md:w-24" type="number" value={brightness} onChange={e => setBrightness(Number(e.target.value))} min={0} max={100} />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                <Label className="whitespace-nowrap">Theme</Label>
                <div className="w-full md:w-auto">
                  <ToggleGroup type="single" value={diceTheme} onValueChange={handleThemeChange}>
                    <ToggleGroupItem value="mixed">Mixed</ToggleGroupItem>
                    <ToggleGroupItem value="black">Black</ToggleGroupItem>
                    <ToggleGroupItem value="white">White</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <Button className="w-full md:w-auto" onClick={processCurrentImage}>Generate Mosaic</Button>
              </div>
            </div>
            {/* Preview */}
            {isProcessing && (
              <div className="my-8 text-center">
                <span>Processing...</span>
              </div>
            )}
            {diceGrid.length > 0 && !isProcessing && (
              <div className="my-8">
                <DicePreview
                  diceGrid={diceGrid}
                  settings={settings as MosaicSettings}
                  blackDiceCount={blackDiceCount}
                  whiteDiceCount={whiteDiceCount}
                  isVisible={true}
                />
                <div className="mt-4">
                  <Button onClick={downloadCSV}>Download CSV</Button>
                  <Button onClick={downloadPNG}>Download PNG</Button>
                  <Button onClick={openOutput}>Show Output</Button>
                </div>
                <div className="mt-4">
                  <p>Total Dice: {actualDiceCount}</p>
                  <p>Total Cost: ${totalCost}</p>
                </div>
              </div>
            )}
            {/* Output Dialog */}
            <Dialog open={outputDialogOpen} onOpenChange={setOutputDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dice Mosaic Output</DialogTitle>
                </DialogHeader>
                <DiceCanvas onCanvasReady={(c: HTMLCanvasElement) => { canvasRef.current = c; }} diceGrid={diceGrid} settings={settings as MosaicSettings} />
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Calculate;
