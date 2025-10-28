
import { FileImage, FileText, ShoppingCart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MosaicSummaryProps {
  width: number;
  height: number;
  blackDiceCount: number;
  whiteDiceCount: number;
  isVisible: boolean;
  onDownloadImage: () => void;
  diceColors?: Record<string, number>;
}



const MosaicSummary = ({
  width,
  height,
  blackDiceCount,
  whiteDiceCount,
  isVisible,
  onDownloadImage,
  diceColors = {}
}: MosaicSummaryProps) => {
  if (!isVisible) return null;

  const totalDice = blackDiceCount + whiteDiceCount;
  const estimatedHours = Math.floor((totalDice / 10) / 60);
  const estimatedMinutes = Math.floor((totalDice / 10) % 60);

  return (
    <div className="space-y-6 w-full">
      <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm w-full">
        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-amber-500 text-center mb-4">
            Your Mosaic is looking Great!
          </h3>
          <p className="text-center text-gray-600 text-sm sm:text-base">
            Dice mosaics are an awesome project to keep you entertained and harness your inner creativity! 
            Impress your friends, make a personable gift, or spend some valuable time putting one together 
            with the family. When you are finished, hang it on your wall to show off your amazing skills!
          </p>
        </div>

        <div className="mt-6 mb-4">
          <h3 className="font-bold text-lg mb-2">Now what?</h3>
          <ul className="space-y-2 text-left text-sm">
            <li className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              <span>Save your customized dice art as a png for <span className="font-bold">free!</span></span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              <span>Use our <span className="font-bold">dice counter</span> to check how many dice you will need for the project</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              <span>Head over to our <span className="font-bold">shop</span> where you can purchase the dice in bulk</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              <span>Explore our <span className="font-bold">tutorials and guides</span> for tips and tricks about how to create dice mosaics</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 flex justify-center w-full">
          <Button 
            onClick={onDownloadImage}
            className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
          >
            Generate PNG
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MosaicSummary;   
