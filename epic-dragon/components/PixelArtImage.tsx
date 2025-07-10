
import React from 'react';

interface PixelArtImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const PixelArtImage: React.FC<PixelArtImageProps> = ({ src, alt, className, width, height }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain ${className || ''}`} // object-contain helps preserve aspect ratio
      style={{ imageRendering: 'pixelated', width: width ? `${width}px` : 'auto', height: height ? `${height}px` : 'auto' }}
    />
  );
};

export default PixelArtImage;
