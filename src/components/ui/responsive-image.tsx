import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  containerClassName?: string;
}

const ResponsiveImage = ({
  src,
  alt,
  fallbackSrc = '/placeholder-image.jpg',
  aspectRatio = '16/9',
  objectFit = 'cover',
  containerClassName,
  className,
  ...props
}: ResponsiveImageProps) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error && fallbackSrc) {
      setError(true);
    }
  };

  return (
    <div 
      className={cn(
        'relative overflow-hidden w-full', 
        containerClassName
      )}
      style={{ aspectRatio }}
    >
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        onError={handleError}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          `object-${objectFit}`,
          className
        )}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export { ResponsiveImage };
