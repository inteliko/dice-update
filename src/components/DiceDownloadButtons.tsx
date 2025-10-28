
import { Button } from "@/components/ui/button";
import { FileImage, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DiceDownloadButtonsProps {
  onDownloadImage: () => void;
  onDownloadCSV: () => void;
}

const DiceDownloadButtons = ({ onDownloadImage, onDownloadCSV }: DiceDownloadButtonsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex ${isMobile ? 'flex-col w-full' : 'flex-wrap'} gap-4 justify-center my-4`}>
      <Button 
        className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 w-full sm:w-auto"
        onClick={onDownloadImage}
      >
        <FileImage className="w-4 h-4" />
        Download Image
      </Button>
      <Button 
        variant="outline"
        className="border-black text-black hover:bg-gray-100 flex items-center gap-2 w-full sm:w-auto"
        onClick={onDownloadCSV}
      >
        <FileText className="w-4 h-4" />
        Download CSV
      </Button>
    </div>
  );
};

export default DiceDownloadButtons;
