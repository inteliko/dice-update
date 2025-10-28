
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Export = () => {
  const [diceGrid, setDiceGrid] = useState<number[][]>([]);
  const [hasStoredGrid, setHasStoredGrid] = useState(false);
  const { toast } = useToast();

  // Check for stored grid in local storage on component mount
  useEffect(() => {
    const storedGrid = localStorage.getItem("diceMosaicGrid");
    if (storedGrid) {
      try {
        const parsedGrid = JSON.parse(storedGrid);
        if (Array.isArray(parsedGrid) && parsedGrid.length > 0) {
          setDiceGrid(parsedGrid);
          setHasStoredGrid(true);
        }
      } catch (error) {
        console.error("Error parsing stored grid:", error);
      }
    }
  }, []);

  // Function to download the grid as CSV
  const downloadCSV = () => {
    if (!diceGrid.length) return;
    
    const csvContent = diceGrid
      .map(row => row.join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dice-mosaic-grid.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your dice mosaic CSV has been downloaded.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Export Your Dice Mosaic</h1>
          
          {hasStoredGrid ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Last Generated Mosaic</h2>
              
              <div className="overflow-auto max-h-96 border rounded mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {diceGrid.map((row, rowIndex) => (
                      <tr key={rowIndex} className="divide-x divide-gray-200">
                        {row.map((cell, cellIndex) => (
                          <td 
                            key={`${rowIndex}-${cellIndex}`}
                            className="px-2 py-2 text-xs text-center"
                            style={{
                              backgroundColor: `rgba(155, 135, 245, ${cell / 6 * 0.5})`,
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={downloadCSV}
                  className="flex items-center gap-1 bg-dice-primary hover:bg-dice-secondary"
                >
                  <Download size={16} />
                  Download as CSV
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm border mb-8 text-center">
              <h2 className="text-xl font-semibold mb-4">No Mosaic Found</h2>
              <p className="text-gray-600 mb-6">
                You haven't generated any dice mosaic yet. Head to the home page to create one!
              </p>
              <Button asChild>
                <a href="/">Create a Mosaic</a>
              </Button>
            </div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Export Guide</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">CSV Format</h3>
                <p className="text-gray-600 text-sm">
                  The CSV file contains a grid of numbers (1-6) representing dice faces. 
                  Each row in the CSV corresponds to a row in your mosaic, and each number 
                  represents a die face value.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Physical Assembly</h3>
                <p className="text-gray-600 text-sm mb-2">
                  To build your physical dice mosaic:
                </p>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                  <li>Print the CSV file or open it in a spreadsheet application</li>
                  <li>Arrange real dice on a flat surface according to the grid</li>
                  <li>For each position, set the die to show the face value indicated in the grid</li>
                  <li>Use adhesive to fix dice in place once positioned correctly (optional)</li>
                  <li>Consider framing your final mosaic for display</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Materials Needed</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Standard six-sided dice (quantity depends on your grid size)</li>
                  <li>Flat board or canvas for mounting</li>
                  <li>Strong adhesive (e.g., craft glue, epoxy, or double-sided tape)</li>
                  <li>Ruler or grid paper for alignment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Export;
