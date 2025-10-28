import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ImageUploader from './ImageUploader';
import { useToast } from '@/hooks/use-toast';

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const {
    toast
  } = useToast();
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Sample images for quick selection - updated with a 4x4 grid of object images
  const presetImages = [
    {
      name: "Rubik's Cube",
      thumbnail: "https://images.unsplash.com/photo-1496354265829-17b1c7b7c363?w=800&auto=format&fit=crop",
      url: "https://images.unsplash.com/photo-1496354265829-17b1c7b7c363?w=800&auto=format&fit=crop"
    },
    {
      name: "Panda",
      thumbnail: "https://dicemosaicgenerator.com/static/media/panda.ead9b240e3e013bc6418.png",
      url: "https://dicemosaicgenerator.com/static/media/panda.ead9b240e3e013bc6418.png"
    },
    {
      name: "Guitar",
      thumbnail: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&auto=format&fit=crop",
      url: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&auto=format&fit=crop"
    },
    {
      name: "Capybara",
      thumbnail: "https://images.unsplash.com/photo-1580795479225-c50ab8c3348d?w=800&auto=format&fit=crop",
      url: "https://images.unsplash.com/photo-1580795479225-c50ab8c3348d?w=800&auto=format&fit=crop"
    },
    {
      name: "White Tiger",
      thumbnail: "https://images.unsplash.com/photo-1549480017-d76466a4b7e8?w=800&auto=format&fit=crop",
      url: "https://images.unsplash.com/photo-1549480017-d76466a4b7e8?w=800&auto=format&fit=crop"
    },
    {
      name: "Toucan",
      thumbnail: "https://images.unsplash.com/photo-1550853024-fae8cd4be47f?w=800&auto=format&fit=crop",
      url: "https://images.unsplash.com/photo-1550853024-fae8cd4be47f?w=800&auto=format&fit=crop"
    },
    {
      name: "Frog",
      thumbnail: "https://dicemosaicgenerator.com/static/media/aiFrog.ff2b84ebafb9fbee504c.png",
      url: "https://dicemosaicgenerator.com/static/media/aiFrog.ff2b84ebafb9fbee504c.png"
    },
    {
      name: "Tabby Cat",
      thumbnail: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop",
      url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop"
    }
  ];
  const handlePresetSelect = (imageUrl: string) => {
    setSelectedPreset(imageUrl);
    // Create a data transfer object to pass to generate mosaic
    const dataToPass = {
      presetImageUrl: imageUrl
    };
    navigate('/', {
      state: dataToPass
    });
  };
  const handleImageUpload = (file: File) => {
    toast({
      title: "Image selected",
      description: "Your image has been selected for processing."
    });
    setShowImageUpload(false);
    
    // Navigate to home with the file data
    // Since we can't pass File objects directly in state, we'll use URL.createObjectURL
    const fileUrl = URL.createObjectURL(file);
    const dataToPass = {
      presetImageUrl: fileUrl,
      fileName: file.name
    };
    
    navigate('/', {
      state: dataToPass
    });
  };
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0); // Soft ash color

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 20;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Improved lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Add spotlight
    const spotlight = new THREE.SpotLight(0xffffff, 0.8);
    spotlight.position.set(0, 15, 15);
    spotlight.angle = Math.PI / 6;
    spotlight.penumbra = 0.2;
    scene.add(spotlight);

    // Calculate the visible width at camera z-position for full width distribution
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const visibleHeight = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.z);
    const visibleWidth = visibleHeight * camera.aspect;

    // Create an array to hold all dice objects
    const diceObjects: {
      mesh: THREE.Mesh;
      rotVel: {
        x: number;
        y: number;
        z: number;
      };
      vel: {
        x: number;
        y: number;
        z: number;
      };
      isWhite: boolean;
    }[] = [];

    // Adjust values based on screen size
    const isMobileView = window.innerWidth < 768;

    // Dice creation function with responsive sizing - now with white and black dice variants
    const createDice = () => {
      // Smaller dice size on mobile
      const diceSize = isMobileView ? 1.5 : 2;
      const geometry = new THREE.BoxGeometry(diceSize, diceSize, diceSize);

      // Randomly select white or black dice
      const isWhite = Math.random() > 0.5;

      // Material based on dice color
      const material = new THREE.MeshStandardMaterial({
        color: isWhite ? 0xffffff : 0x000000,  // Changed to pure black (#000000)
        roughness: 0.1,
        metalness: 0.2
      });
      const dice = new THREE.Mesh(geometry, material);

      // Add dice dots with contrasting colors
      const addDot = (x: number, y: number, z: number) => {
        const dotSize = isMobileView ? 0.15 : 0.18;
        const dotGeo = new THREE.SphereGeometry(dotSize, 16, 16);
        const dotMat = new THREE.MeshStandardMaterial({
          color: isWhite ? 0x000000 : 0xffffff,  // Black dots on white dice, white dots on black dice
          roughness: 0.3,
          metalness: 0.1
        });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.set(x, y, z);
        dice.add(dot);
      };

      // Randomly select a dice face (1-6)
      const diceFace = Math.floor(Math.random() * 6) + 1;
      switch (diceFace) {
        case 1:
          // Center dot
          addDot(0, -diceSize / 2 - 0.01, 0);
          break;
        case 2:
          // Two diagonal dots
          addDot(-diceSize / 4, -diceSize / 2 - 0.01, -diceSize / 4);
          addDot(diceSize / 4, -diceSize / 2 - 0.01, diceSize / 4);
          break;
        case 3:
          // Three diagonal dots
          addDot(-diceSize / 4, -diceSize / 2 - 0.01, -diceSize / 4);
          addDot(0, -diceSize / 2 - 0.01, 0);
          addDot(diceSize / 4, -diceSize / 2 - 0.01, diceSize / 4);
          break;
        case 4:
          // Four corner dots
          addDot(-diceSize / 4, -diceSize / 2 - 0.01, -diceSize / 4);
          addDot(-diceSize / 4, -diceSize / 2 - 0.01, diceSize / 4);
          addDot(diceSize / 4, -diceSize / 2 - 0.01, -diceSize / 4);
          addDot(diceSize / 4, -diceSize / 2 - 0.01, diceSize / 4);
          break;
        case 5:
          // Four corner dots + center
          addDot(-diceSize / 4, -diceSize / 2 - 0.01, -diceSize / 4);
          addDot(-diceSize / 4, -diceSize / 2 - 0.01, diceSize / 4);
          addDot(0, -diceSize / 2 - 0.01, 0);
          addDot(diceSize / 4, -diceSize / 2 - 0.01, -diceSize / 4);
          addDot(diceSize / 4, -diceSize / 2 - 0.01, diceSize / 4);
          break;
        case 6:
          // Six dots in two rows
          addDot(-diceSize / 4, -diceSize / 2 - 0.01, -diceSize / 4);
          addDot(-diceSize / 4, -diceSize / 2 - 0.01, 0);
          addDot(-diceSize / 4, -diceSize / 2 - 0.01, diceSize / 4);
          addDot(diceSize / 4, -diceSize / 2 - 0.01, -diceSize / 4);
          addDot(diceSize / 4, -diceSize / 2 - 0.01, 0);
          addDot(diceSize / 4, -diceSize / 2 - 0.01, diceSize / 4);
          break;
      }

      // Position dice at random horizontal positions
      dice.position.set((Math.random() * visibleWidth - visibleWidth / 2) * 0.9, 15 + Math.random() * 10, Math.random() * 10 - 15);
      dice.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      // Slower animation for all devices
      const speedFactor = isMobileView ? 0.3 : 0.4;  // Reduced speed factor to make animation slower

      // Randomized rotation velocity
      const rotVel = {
        x: (Math.random() * 0.025 - 0.0125) * speedFactor,
        y: (Math.random() * 0.025 - 0.0125) * speedFactor,
        z: (Math.random() * 0.025 - 0.0125) * speedFactor
      };

      // Randomized falling speed
      const vel = {
        x: (Math.random() * 0.015 - 0.0075) * speedFactor,
        y: (-Math.random() * 0.08 - 0.04) * speedFactor,
        z: (Math.random() * 0.015 - 0.0075) * speedFactor
      };
      return {
        mesh: dice,
        rotVel,
        vel,
        isWhite
      };
    };

    // Spawn dice with delay between each - fewer dice on mobile
    let diceCount = 0;
    const maxDice = isMobileView ? 15 : 30;

    // Initial set of dice
    const initialDice = isMobileView ? 5 : 10;
    for (let i = 0; i < initialDice; i++) {
      const dice = createDice();
      scene.add(dice.mesh);
      diceObjects.push(dice);
      diceCount++;
    }

    // Create a spawn interval
    const spawnDelay = isMobileView ? 700 : 500;  // Increased delay for slower spawning
    const spawnInterval = setInterval(() => {
      if (diceCount < maxDice) {
        const dice = createDice();
        scene.add(dice.mesh);
        diceObjects.push(dice);
        diceCount++;
      } else {
        clearInterval(spawnInterval);
      }
    }, spawnDelay);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      diceObjects.forEach(dice => {
        // Apply rotation
        dice.mesh.rotation.x += dice.rotVel.x;
        dice.mesh.rotation.y += dice.rotVel.y;
        dice.mesh.rotation.z += dice.rotVel.z;

        // Apply movement
        dice.mesh.position.x += dice.vel.x;
        dice.mesh.position.y += dice.vel.y;
        dice.mesh.position.z += dice.vel.z;

        // Reset position if dice goes out of view
        if (dice.mesh.position.y < -15) {
          // Reset to top of screen with new random x position
          dice.mesh.position.y = 15 + Math.random() * 5;
          dice.mesh.position.x = (Math.random() * visibleWidth - visibleWidth / 2) * 0.9;
          dice.mesh.position.z = Math.random() * 10 - 15;

          // Reset rotation with randomness
          dice.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

          // New random velocities for variation
          const speedFactor = isMobileView ? 0.5 : 1;
          dice.vel.y = (-Math.random() * 0.08 - 0.04) * speedFactor;
          dice.vel.x = (Math.random() * 0.015 - 0.0075) * speedFactor;
          dice.vel.z = (Math.random() * 0.015 - 0.0075) * speedFactor;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    // Responsive handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // Update camera and renderer
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      // Update visible width calculation
      const vFOV = THREE.MathUtils.degToRad(camera.fov);
      const visibleHeight = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.z);
      const newVisibleWidth = visibleHeight * camera.aspect;

      // Check if view changed between mobile and desktop
      const newIsMobileView = window.innerWidth < 768;

      // Adjust dice parameters if view type changed
      if (newIsMobileView !== isMobileView) {
        // Update dice sizes and speeds
        const speedFactor = newIsMobileView ? 0.5 : 1;
        diceObjects.forEach(dice => {
          // Scale rotation and velocity based on device
          dice.rotVel.x *= speedFactor;
          dice.rotVel.y *= speedFactor;
          dice.rotVel.z *= speedFactor;
          dice.vel.x *= speedFactor;
          dice.vel.y *= speedFactor;
          dice.vel.z *= speedFactor;

          // Reset positions to be within the new visible width
          if (dice.mesh.position.y > 0) {
            dice.mesh.position.x = (Math.random() * newVisibleWidth - newVisibleWidth / 2) * 0.9;
          }
        });
      } else {
        // Just adjust positions for the new screen width
        diceObjects.forEach(dice => {
          if (dice.mesh.position.y > 0) {
            dice.mesh.position.x = (Math.random() * newVisibleWidth - newVisibleWidth / 2) * 0.9;
          }
        });
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearInterval(spawnInterval);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);

      // Dispose of Three.js objects
      diceObjects.forEach(dice => {
        scene.remove(dice.mesh);
        (dice.mesh.geometry as THREE.BufferGeometry).dispose();
        (dice.mesh.material as THREE.Material).dispose();
      });
    };
  }, []);
  return <div className="relative w-full h-[80vh] overflow-hidden bg-[#e0e0e0]">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDMiPjwvcmVjdD4KPC9zdmc+')] opacity-30"></div>
      <div ref={containerRef} className="absolute inset-0" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10">
        <div className="animate-fade-in mx-0 px-0 pt-12"> {/* Added top padding (pt-12) to the hero title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 tracking-tight font-serif italic" style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
            <span className="bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text drop-shadow-sm mx-0 font-light text-8xl text-gray-900">Dice Mosaics</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-800 max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed font-serif">
            Create stunning artwork using nothing but dice. 
            Upload an image and transform it into a unique dice mosaic.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-10 justify-center">
            {showImageUpload ? <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs w-full mx-auto">
                <ImageUploader onImageUpload={handleImageUpload} />
                <Button variant="outline" className="mt-2 w-full" onClick={() => setShowImageUpload(false)}>
                  Cancel
                </Button>
              </div> : <Button size={isMobile ? "default" : "lg"} onClick={() => setShowImageUpload(true)} className="bg-black hover:bg-gray-800 text-white rounded-full px-6 md:px-8 py-2 md:py-6 font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Upload className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Choose Image
              </Button>}
          </div>
        </div>
        
        {/* Preset images section in a 4x4 grid */}
        <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl animate-fade-in px-2 sm:px-4" style={{
        animationDelay: '0.3s'
      }}>
          <h3 className="text-black text-base md:text-lg mb-3 md:mb-4 font-medium">Or select one of our preset images</h3>
          <div className={`grid ${isMobile ? 'grid-cols-4' : 'grid-cols-4'} gap-2 sm:gap-3`}>
            {presetImages.map((preset, index) => <div key={index} className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${selectedPreset === preset.url ? 'ring-2 ring-black' : ''}`} onClick={() => handlePresetSelect(preset.url)}>
                <div className="relative aspect-square">
                  <img src={preset.thumbnail} alt={preset.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70"></div>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};
export default HeroSection;
