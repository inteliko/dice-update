
import React from 'react';
import AutoScrollingImageRow from '@/components/AutoScrollingImageRow';

const MosaicGallery = () => {
  // First row images (scrolling right to left)
  const firstRowImages = ["https://dicemosaicgenerator.com/static/media/car1.2b9b7be17159a82bc43c.png", "https://dicemosaicgenerator.com/static/media/yinYang.1eeef9aab210031a02ba.png", "https://dicemosaicgenerator.com/static/media/car2.535e06a0f2a15568e98f.png", "https://dicemosaicgenerator.com/static/media/dice.9559ee83c943d039bd0a.png", "https://dicemosaicgenerator.com/static/media/tree.f1526d7be55ddc75022c.png", "https://dicemosaicgenerator.com/static/media/anime.8460fd027c3b67cb0901.png", "https://dicemosaicgenerator.com/static/media/yinYang.1eeef9aab210031a02ba.png", "https://dicemosaicgenerator.com/static/media/car2.535e06a0f2a15568e98f.png"];

  // Second row images (scrolling right to left as well)
  const secondRowImages = ["https://dicemosaicgenerator.com/static/media/wolf.a25ead19fe894148ac9d.png", "https://dicemosaicgenerator.com/static/media/kobe.b79c54763247bf3e15f8.png", "https://dicemosaicgenerator.com/static/media/eye.269314c83e917205135a.png", "https://dicemosaicgenerator.com/static/media/bikini.cf7cc83c5cfced46ad4f.png", "https://dicemosaicgenerator.com/static/media/jackpot.b0c94d4bcc868aeea525.png", "https://dicemosaicgenerator.com/static/media/monopoly.7700ff36d90be2577d4d.png", "https://dicemosaicgenerator.com/static/media/mrBeast.c6155d15ebcf2ee4f450.png", "https://dicemosaicgenerator.com/static/media/kobe.b79c54763247bf3e15f8.png"];
  
  return (
    <div className="space-y-8 my-16 py-8 bg-[#000000]"> {/* Ash color background */}
      <h2 className="font-bold italic text-center mb-8 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent text-5xl">
        Featured Mosaic
      </h2>
      
      <div className="py-4">
        <AutoScrollingImageRow images={firstRowImages} direction="right" speed={25} />
      </div>
      
      <div className="py-4">
        <AutoScrollingImageRow images={secondRowImages} direction="right" speed={25} />
      </div>
    </div>
  );
};

export default MosaicGallery;
