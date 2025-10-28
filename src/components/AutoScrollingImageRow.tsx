
import React, { useEffect, useState, useRef } from 'react';

interface AutoScrollingImageRowProps {
  images: string[];
  direction: 'left' | 'right';
  speed?: number;
}

const AutoScrollingImageRow: React.FC<AutoScrollingImageRowProps> = ({ 
  images, 
  direction,
  speed = 25 
}) => {
  const [duplicatedImages, setDuplicatedImages] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Duplicate images to create seamless scrolling effect
  useEffect(() => {
    setDuplicatedImages([...images, ...images, ...images]);
  }, [images]);

  useEffect(() => {
    if (!scrollRef.current) return;
    
    const animate = () => {
      if (!scrollRef.current) return;
      
      const scrollAmount = direction === 'left' ? 1 : -1;
      
      setScrollPosition(prev => {
        const containerWidth = scrollRef.current?.scrollWidth || 0;
        const viewportWidth = scrollRef.current?.clientWidth || 0;
        const newPosition = prev + scrollAmount;
        
        // Reset position when we've scrolled one full width
        if (direction === 'left' && prev >= containerWidth / 3) {
          return 0;
        } else if (direction === 'right' && prev <= -containerWidth / 3) {
          return 0;
        }
        
        return newPosition;
      });
    };

    const intervalId = setInterval(animate, speed);
    
    return () => clearInterval(intervalId);
  }, [direction, speed]);

  return (
    <div className="overflow-hidden w-full relative">
      <div 
        ref={scrollRef}
        className="flex flex-nowrap whitespace-nowrap"
        style={{ 
          transform: `translateX(${scrollPosition}px)`,
          transition: 'transform 0.2s linear'
        }}
      >
        {duplicatedImages.map((image, index) => (
          <div 
            key={index}
            className="inline-block flex-none px-1 w-48 md:w-64 lg:w-72"
          >
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-100 shadow-sm">
              <img
                src={image}
                alt={`Random image ${index}`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutoScrollingImageRow;
