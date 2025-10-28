
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">About Dice Mosaic Maker</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <h2 className="text-xl font-semibold mb-4">What is Dice Mosaic Maker?</h2>
            <p className="mb-4">
              Dice Mosaic Maker is a creative tool that transforms your images into mosaics made of dice. 
              The app analyzes your image and converts it into a grid where each cell is represented by 
              a die face (1-6), creating a unique pixelated representation of your original image.
            </p>
            <p>
              Whether you're a board game enthusiast looking for a creative project, an artist seeking 
              a unique medium, or just someone who loves dice, this tool helps you create stunning 
              physical or digital art from ordinary images.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            <ol className="list-decimal list-inside space-y-4">
              <li>
                <span className="font-medium">Image Processing:</span> Your image is converted to 
                grayscale and processed to match your specified grid dimensions.
              </li>
              <li>
                <span className="font-medium">Brightness Mapping:</span> The brightness values of 
                each pixel are mapped to dice faces from 1-6, with darker areas receiving higher 
                values (more dots).
              </li>
              <li>
                <span className="font-medium">Color Customization:</span> You can customize the colors 
                associated with each dice face to create different visual effects.
              </li>
              <li>
                <span className="font-medium">Output Generation:</span> The final output is a visual 
                representation of dice and a downloadable CSV file containing the grid of dice values 
                for physical assembly.
              </li>
            </ol>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <h2 className="text-xl font-semibold mb-4">Tips for Best Results</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Use images with good contrast between the subject and background</li>
              <li>Simple images with clear outlines work best</li>
              <li>Adjust the contrast slider to enhance details</li>
              <li>Start with smaller grid sizes (20×20) for testing</li>
              <li>Experiment with different color schemes for dice faces</li>
              <li>For physical assembly, standard dice come in 16mm size; plan accordingly</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
            <p className="mb-4">
              Dice Mosaic Maker is built with modern web technologies:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Built with React and TypeScript</li>
              <li>Uses HTML Canvas for image processing</li>
              <li>Responsive design with Tailwind CSS</li>
              <li>No server-side processing - your images stay private</li>
              <li>Compatible with all modern browsers</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
