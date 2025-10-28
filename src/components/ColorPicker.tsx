
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorPickerProps {
  faceNumber: number;
  initialColor: string;
  onChange: (faceNumber: number, color: string) => void;
}

const ColorPicker = ({ faceNumber, initialColor, onChange }: ColorPickerProps) => {
  const [color, setColor] = useState(initialColor);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    onChange(faceNumber, newColor);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold w-5 text-center">{faceNumber}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 h-8 p-0 rounded-md border shadow-sm relative overflow-hidden"
          >
            <div 
              className="absolute inset-0" 
              style={{ backgroundColor: color }}
            />
            <span className="sr-only">Pick a color for dice face {faceNumber}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <div className="flex flex-col gap-2">
            <label htmlFor={`face-${faceNumber}`} className="text-sm font-medium flex justify-between items-center">
              <span>Face {faceNumber} Color</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{color}</span>
            </label>
            <input
              id={`face-${faceNumber}`}
              type="color"
              value={color}
              onChange={handleColorChange}
              className="w-full h-12 cursor-pointer rounded"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ColorPicker;
