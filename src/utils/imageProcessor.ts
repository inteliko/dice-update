
/**
 * Processes an image and returns a 2D array representing the dice values
 */
export const processImage = async (
  imageFile: File,
  gridSize: number | "auto" | "custom",
  contrast: number,
  gridWidth?: number,
  gridHeight?: number,
  brightness: number = 50,
  invertColors: boolean = false
): Promise<number[][]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Create object URL immediately to speed up loading
    const imageUrl = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      // Create a canvas to draw and process the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not create canvas context"));
        return;
      }
      
      try {
        // Determine dimensions and optimal grid size
        const aspectRatio = img.width / img.height;
        
        // Handle different grid size modes
        let width: number, height: number;
        
        if (gridSize === "custom" && gridWidth && gridHeight) {
          // Use custom width and height settings
          width = gridWidth;
          height = gridHeight;
        } else if (typeof gridSize === "number") {
          // Use square grid with the specified size
          width = gridSize;
          height = gridSize;
        } else {
          // Auto mode: determine optimal grid size based on image dimensions
          // Base target: around 6000 dice total for high-quality rendering
          width = Math.round(Math.sqrt(6000 * aspectRatio));
          height = Math.round(width / aspectRatio);
          
          // Ensure we maintain a reasonable grid size
          if (height > width * 2) {
            height = width;
            width = Math.round(height * aspectRatio);
          }
          
          // Cap grid dimensions for performance while maintaining quality
          const maxDimension = 150; // Increased for better quality
          if (width > maxDimension) {
            width = maxDimension;
            height = Math.round(width / aspectRatio);
          }
          if (height > maxDimension) {
            height = maxDimension;
            width = Math.round(height * aspectRatio);
          }
          
          // Ensure minimum dimensions for visibility
          const minDimension = 50;
          if (width < minDimension) width = minDimension;
          if (height < minDimension) height = minDimension;
        }
        
        // Set canvas size to our grid dimensions with 2x scale for better resolution
        canvas.width = width * 2;
        canvas.height = height * 2;
        
        // Draw image scaled down to our grid size with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width * 2, height * 2);
        
        // Get image data at higher resolution
        const imageData = ctx.getImageData(0, 0, width * 2, height * 2);
        const data = imageData.data;
        
        // Apply brightness - convert from 0-100 scale to -100-100 scale
        const brightnessValue = (brightness - 50) * 2;
        
        // Apply contrast - use the actual contrast value from settings
        // The contrast parameter is now a value between 0-100
        const contrastValue = contrast * 2 - 100; // Convert 0-100 to -100-100 range
        const factor = (259 * (contrastValue + 255)) / (255 * (259 - contrastValue));
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Convert to grayscale with improved luminance formula
          const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          
          // Apply brightness adjustment
          let adjustedGray = Math.min(255, Math.max(0, gray + brightnessValue));
          
          // Apply the contrast adjustment using the slider value
          adjustedGray = Math.min(255, Math.max(0, 
            factor * (adjustedGray - 128) + 128
          ));
          
          // Store back as grayscale
          data[i] = adjustedGray;
          data[i + 1] = adjustedGray;
          data[i + 2] = adjustedGray;
        }
        
        // Put data back to canvas
        ctx.putImageData(imageData, 0, 0);
        
        // Downsample to actual grid size with better quality
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = width;
        finalCanvas.height = height;
        const finalCtx = finalCanvas.getContext('2d');
        
        if (finalCtx) {
          finalCtx.imageSmoothingEnabled = true;
          finalCtx.imageSmoothingQuality = "high";
          finalCtx.drawImage(canvas, 0, 0, width * 2, height * 2, 0, 0, width, height);
          
          // Create the dice grid with more defined values for clearer dot patterns
          const diceGrid: number[][] = [];
          const finalImageData = finalCtx.getImageData(0, 0, width, height);
          const finalData = finalImageData.data;
          
          for (let y = 0; y < height; y++) {
            const row: number[] = [];
            for (let x = 0; x < width; x++) {
              const index = (y * width + x) * 4;
              const grayValue = finalData[index]; // All channels are equal in grayscale
              
              // Map grayscale value to dice face with sharper thresholds
              // This creates more defined areas of dots vs. background
              let diceValue: number;
              
              if (grayValue < 42) {
                diceValue = 6; // Darkest areas get highest value (most dots)
              } else if (grayValue < 85) {
                diceValue = 5;
              } else if (grayValue < 128) {
                diceValue = 4;
              } else if (grayValue < 171) {
                diceValue = 3;
              } else if (grayValue < 213) {
                diceValue = 2;
              } else {
                diceValue = 1; // Lightest areas get lowest value (fewest dots)
              }
              
              // If invertColors is true, invert the dice values (1 becomes 6, 2 becomes 5, etc.)
              if (invertColors) {
                diceValue = 7 - diceValue;
              }
              
              row.push(diceValue);
            }
            diceGrid.push(row);
          }
          
          // Clean up URL object to prevent memory leaks
          URL.revokeObjectURL(imageUrl);
          
          resolve(diceGrid);
        } else {
          URL.revokeObjectURL(imageUrl);
          reject(new Error("Could not create final canvas context"));
        }
      } catch (err) {
        URL.revokeObjectURL(imageUrl);
        reject(err);
      }
    };
    
    img.onerror = (err) => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("Failed to load image"));
    };
    
    // Start loading the image
    img.src = imageUrl;
  });
};

/**
 * Generates a random grid of dice values (for testing or fallback)
 */
export const generateRandomGrid = (width: number, height: number = width): number[][] => {
  const grid: number[][] = [];
  for (let i = 0; i < height; i++) {
    const row: number[] = [];
    for (let j = 0; j < width; j++) {
      row.push(Math.floor(Math.random() * 6) + 1);
    }
    grid.push(row);
  }
  return grid;
};

/**
 * Generates a sample grid pattern for testing
 */
export const generateSampleGrid = (width: number, height: number = width): number[][] => {
  const grid: number[][] = [];
  for (let i = 0; i < height; i++) {
    const row: number[] = [];
    for (let j = 0; j < width; j++) {
      // Create a gradient pattern
      const value = Math.floor(((i + j) / (width + height)) * 6) + 1;
      row.push(Math.min(6, Math.max(1, value)));
    }
    grid.push(row);
  }
  return grid;
};
