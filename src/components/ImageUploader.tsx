
import { useState, useRef, ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageUpload: (imageFile: File) => void;
  id?: string;
}

const ImageUploader = ({ onImageUpload, id }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Check file type
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG image.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Notify user that processing has started
    toast({
      title: "Processing image",
      description: "Please wait while we convert your image to dice...",
    });

    // Send the valid file to the parent component for immediate processing
    onImageUpload(file);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button 
        onClick={handleButtonClick}
        className="w-full bg-black hover:bg-gray-800 text-white shadow-md font-medium rounded-md"
      >
        <Upload size={18} className="mr-2" />
        Select Image
      </Button>
      
      <div className="text-center text-xs text-gray-500 my-1">or drag & drop image here</div>
      
      <div 
        className={`w-full border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragging ? 'border-gray-500 bg-gray-50' : 'border-gray-300 bg-gray-50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndProcessFile(e.dataTransfer.files[0]);
          }
        }}
      >
        <div className="flex flex-col items-center justify-center py-4">
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Drop your image here</p>
          <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 5MB</p>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png"
        className="hidden"
        id={id}
      />
    </div>
  );
};

export default ImageUploader;
