
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface ImageSliderProps {
  images: string[];
  title?: string;
}

export const ImageSlider = ({ images, title }: ImageSliderProps) => {
  return (
    <div className="w-full max-w-7xl mx-auto my-8">
      {title && (
        <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>
      )}
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <div className="p-1 h-full">
                <div className="overflow-hidden rounded-lg h-full bg-white border border-gray-100 shadow-sm">
                  <div className="aspect-square w-full overflow-hidden">
                    <img 
                      src={src} 
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-center gap-2 mt-4">
          <CarouselPrevious className="static transform-none mx-1" />
          <CarouselNext className="static transform-none mx-1" />
        </div>
      </Carousel>
    </div>
  );
};

export default ImageSlider;
