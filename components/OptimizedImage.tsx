import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  preloadSiblings?: string[];
}

const imageCache = new Set<string>();

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  preloadSiblings = [],
}) => {
  const [isLoaded, setIsLoaded] = useState(() => imageCache.has(src));
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageCache.has(src)) {
      setIsLoaded(true);
      return;
    }

    const img = new Image();
    img.src = src;
    
    if (img.complete) {
      imageCache.add(src);
      setIsLoaded(true);
    } else {
      img.onload = () => {
        imageCache.add(src);
        setIsLoaded(true);
      };
      img.onerror = () => setHasError(true);
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  useEffect(() => {
    if (preloadSiblings.length === 0) return;

    preloadSiblings.forEach((siblingUrl) => {
      if (!imageCache.has(siblingUrl)) {
        const img = new Image();
        img.src = siblingUrl;
        img.onload = () => imageCache.add(siblingUrl);
      }
    });
  }, [preloadSiblings]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
      )}
      
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => {
          imageCache.add(src);
          setIsLoaded(true);
        }}
        onError={() => setHasError(true)}
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
          <span className="text-slate-400 text-xs">Imagen no disponible</span>
        </div>
      )}
    </div>
  );
};

export const preloadImages = (urls: string[]) => {
  urls.forEach((url) => {
    if (!imageCache.has(url)) {
      const img = new Image();
      img.src = url;
      img.onload = () => imageCache.add(url);
    }
  });
};
