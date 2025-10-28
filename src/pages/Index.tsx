
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ControlSidebar from "@/components/ControlSidebar";
import DicePreview from "@/components/DicePreview";
import HeroSection from "@/components/HeroSection";
import { MosaicSettings } from "@/components/MosaicControls";
import { processImage, generateSampleGrid } from "@/utils/imageProcessor";
import { Helmet } from "react-helmet";
import MosaicGallery from "@/components/MosaicGallery";

const Index = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<MosaicSettings | null>(null);
  const [diceGrid, setDiceGrid] = useState<number[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [blackDiceCount, setBlackDiceCount] = useState(0);
  const [whiteDiceCount, setWhiteDiceCount] = useState(0);
  const [diceColorCounts, setDiceColorCounts] = useState<Record<number, number>>({});
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if we have a preset image from navigation state
    if (location.state && (location.state as any).presetImageUrl) {
      const presetUrl = (location.state as any).presetImageUrl;
      setImageUrl(presetUrl);
      processPresetImage(presetUrl);
    }
  }, [location.state]);

  const processPresetImage = async (url: string) => {
    setIsProcessing(true);
    try {
      // Fetch the image from URL
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "preset-image.jpg", { type: blob.type });
      
      setImageFile(file);
      
      // Generate mosaic with default settings using black and white color scheme
      const defaultSettings = {
        gridSize: "auto" as const, // Use automatic grid sizing
        diceSizeMm: 1.6, // Standard dice size
        contrast: 50,
        useShading: true,
        theme: "mixed" as const,
        faceColors: {
          1: "#FFFFFF", // White
          2: "#DDDDDD", // Light Gray
          3: "#BBBBBB", // Medium Gray
          4: "#888888", // Gray
          5: "#555555", // Dark Gray
          6: "#000000", // Black
        }
      };
      
      const grid = await processImage(
        file, 
        defaultSettings.gridSize,
        defaultSettings.contrast
      );
      
      setDiceGrid(grid);
      setSettings(defaultSettings);
      setShowPreview(true);
      
      const counts = countDiceColors(grid, defaultSettings.faceColors);
      setBlackDiceCount(counts.black);
      setWhiteDiceCount(counts.white);
      setDiceColorCounts(counts.byFace);
      
      localStorage.setItem("diceMosaicGrid", JSON.stringify(grid));
    } catch (error) {
      console.error("Error processing preset image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (file: File) => {
    // If an empty file was passed, clear the current image
    if (file.size === 0) {
      setImageFile(null);
      setImageUrl(null);
      setDiceGrid([]);
      setShowPreview(false);
      return;
    }
    
    setImageFile(file);
    setImageUrl(null);
    setDiceGrid([]);
    setBlackDiceCount(0);
    setWhiteDiceCount(0);
    setDiceColorCounts({});
    setSidebarOpen(true);
  };

  const generateMosaic = async (newSettings: MosaicSettings) => {
    setSettings(newSettings);
    
    if (!imageFile) {
      // For sample grid, handle both square and custom grid sizes
      let sampleGridWidth, sampleGridHeight;
      
      if (newSettings.gridSize === "custom" && newSettings.gridWidth && newSettings.gridHeight) {
        sampleGridWidth = newSettings.gridWidth;
        sampleGridHeight = newSettings.gridHeight;
      } else if (typeof newSettings.gridSize === "number") {
        sampleGridWidth = newSettings.gridSize;
        sampleGridHeight = newSettings.gridSize;
      } else {
        // Auto sizing
        sampleGridWidth = 80;
        sampleGridHeight = 80;
      }
      
      const sampleGrid = generateSampleGrid(sampleGridWidth, sampleGridHeight);
      setDiceGrid(sampleGrid);
      const counts = countDiceColors(sampleGrid, newSettings.faceColors);
      setBlackDiceCount(counts.black);
      setWhiteDiceCount(counts.white);
      setDiceColorCounts(counts.byFace);
      localStorage.setItem("diceMosaicGrid", JSON.stringify(sampleGrid));
      setShowPreview(true);
      return;
    }
    
    setIsProcessing(true);
    try {
      const grid = await processImage(
        imageFile, 
        newSettings.gridSize,
        newSettings.contrast,
        newSettings.gridWidth,
        newSettings.gridHeight
      );
      setDiceGrid(grid);
      const counts = countDiceColors(grid, newSettings.faceColors);
      setBlackDiceCount(counts.black);
      setWhiteDiceCount(counts.white);
      setDiceColorCounts(counts.byFace);
      localStorage.setItem("diceMosaicGrid", JSON.stringify(grid));
      setShowPreview(true);
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const countDiceColors = (grid: number[][], faceColors: Record<number, string>) => {
    let black = 0;
    let white = 0;
    const byFace: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    };
    
    grid.forEach(row => {
      row.forEach(value => {
        if (value === 6) black++;
        if (value === 1) white++;
        if (byFace[value] !== undefined) {
          byFace[value]++;
        }
      });
    });
    
    return { black, white, byFace };
  };

  // Toggle function for the control sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Helmet>
        <title>Dices by Ceez | Images to Dice Art </title>
        <meta name="description" content="Create beautiful dice mosaics from your images. Transform photos into unique artwork made entirely of dice." />
      </Helmet>
      
      <Header />
      
      {/* Control Sidebar */}
      <ControlSidebar
        onGenerate={generateMosaic}
        imageFile={imageFile}
        onImageUpload={handleImageUpload}
        blackDiceCount={blackDiceCount}
        whiteDiceCount={whiteDiceCount}
        diceColorCounts={diceColorCounts}
        isOpen={isSidebarOpen}
        onOpenChange={setSidebarOpen}
      />
      
      <main className="flex-grow transition-all duration-300">
        <HeroSection />
        
        <div className="container mx-auto px-4">
          {/* Toggle Controls Button - centered at the top */}
          <div className="flex justify-center my-6">
            <button
              onClick={toggleSidebar}
              className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-3 flex items-center gap-2 shadow-md transition-colors duration-300"
            >
              {isSidebarOpen ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-left">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="9" y1="3" y2="21"/>
                  </svg>
                  Close Controls
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-right">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="15" x2="15" y1="3" y2="21"/>
                  </svg>
                  Open Controls
                </>
              )}
            </button>
          </div>
          
          {/* Preview section - only shown when there's something to preview */}
          <div className="max-w-5xl mx-auto">
            {(isProcessing || showPreview) && (
              <div className="bg-white p-2 sm:p-4 md:p-6 rounded-lg shadow-lg border border-gray-200 mb-16 overflow-visible">
                <h2 className="text-xl font-semibold mb-4 text-black">Preview Your Mosaic</h2>
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-white h-96">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Processing your image...</p>
                  </div>
                ) : (
                  <div className="dice-preview-scroll">
                    <DicePreview 
                      diceGrid={diceGrid} 
                      settings={settings || {
                        gridSize: "auto",
                        diceSizeMm: 1.6,
                        contrast: 50,
                        useShading: true,
                        faceColors: {
                          1: "#FFFFFF", // White
                          2: "#DDDDDD", // Light Gray
                          3: "#BBBBBB", // Medium Gray
                          4: "#888888", // Gray
                          5: "#555555", // Dark Gray
                          6: "#000000", // Black
                        },
                      }}
                      blackDiceCount={blackDiceCount}
                      whiteDiceCount={whiteDiceCount}
                      isVisible={showPreview}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <MosaicGallery />
        </div>
      </main>
      
      <Footer />
      
      {/* Updated styling for the preview container */}
      <style>
        {`
        .dice-preview-scroll {
          overflow-y: visible;
          height: auto !important;
          max-height: none;
        }
        
        .fixed-preview {
          max-height: none !important;
          overflow: visible !important;
          height: auto !important;
        }
        
        .fixed-preview > div {
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: visible;
        }
        
        /* Ensure no horizontal overflow on mobile */
        @media (max-width: 640px) {
          .mosaic-preview-container {
            width: 100%;
            padding: 0 5px;
            overflow-x: hidden;
          }
          
          .canvas-container {
            width: 100%;
            margin: 0 auto;
          }
          
          canvas {
            max-width: 100%;
            width: auto !important;
            height: auto !important;
          }
        }
        `}
      </style>
    </div>
  );
};

export default Index;
