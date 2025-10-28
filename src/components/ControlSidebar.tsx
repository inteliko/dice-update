
import { useState, useEffect } from "react";
import { Settings, X, PanelLeft, PanelRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ImageUploader from "./ImageUploader";
import MosaicControls, { MosaicSettings } from "./MosaicControls";
import { cn } from "@/lib/utils";

interface ControlSidebarProps {
  onGenerate: (settings: MosaicSettings) => void;
  imageFile: File | null;
  onImageUpload: (file: File) => void;
  blackDiceCount: number;
  whiteDiceCount: number;
  diceColorCounts: Record<number, number>;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const ControlSidebar = ({
  onGenerate,
  imageFile,
  onImageUpload,
  blackDiceCount,
  whiteDiceCount,
  diceColorCounts,
  isOpen: propIsOpen,
  onOpenChange
}: ControlSidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (propIsOpen !== undefined) {
      setIsOpen(propIsOpen);
    }
  }, [propIsOpen]);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [imageFile]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  return (
    <>
      {/* Toggle button for both mobile and desktop */}
     

      {/* Desktop sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold text-lg text-purple-800">Dice Mosaic Controls</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleOpenChange(false)}
              className="hover:bg-purple-100"
            >
              <X className="h-5 w-5 text-gray-500" />
              <span className="sr-only">Close controls</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-3">
              <h3 className="font-medium text-purple-800">Image Upload</h3>
              <div className="bg-gray-100 rounded-lg p-4">
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="mx-auto overflow-hidden rounded-md border-2 border-purple-200 shadow-sm max-w-xs">
                      <img 
                        src={previewUrl} 
                        alt="Selected" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      className="text-sm w-full"
                      onClick={() => {
                        onImageUpload(new File([], ""));
                        setPreviewUrl(null);
                      }}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <ImageUploader
                    onImageUpload={onImageUpload}
                  />
                )}
              </div>
            </div>

            {/* Mosaic Controls */}
            <MosaicControls 
              onGenerate={onGenerate}
              blackDiceCount={blackDiceCount}
              whiteDiceCount={whiteDiceCount}
              diceColorCounts={diceColorCounts}
            />
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => handleOpenChange(false)}
        ></div>
      )}
    </>
  );
};

export default ControlSidebar;
