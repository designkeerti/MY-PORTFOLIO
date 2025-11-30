import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const videos = [
  "/videos/APEe8vAHJA8qvtT1UXxvKE2CA.mp4",
  "/videos/yXdMcYJicU7xfxsBmQJEYCf9H1c.mp4",
  "/videos/yvCOXE3FsehpZbAYAz4FgDbfhUc.mp4",
  "/videos/4ZbxNsQP7oZnAAYRONbYDwKJTc.mp4",
  "/videos/WoEzU6rPsJpT06fwcGi3b2IWWSE.mp4",
  "/videos/l7qUhfDxVpjSSGzjvXC3v2pMTIo.mp4"
];

const gifs = [
  "https://framerusercontent.com/images/APEe8vAHJA8qvtT1UXxvKE2CA.gif",
  "https://framerusercontent.com/images/yXdMcYJicU7xfxsBmQJEYCf9H1c.gif",
  "https://framerusercontent.com/images/yvCOXE3FsehpZbAYAz4FgDbfhUc.gif",
  "https://framerusercontent.com/images/4ZbxNsQP7oZnAAYRONbYDwKJTc.gif",
  "https://framerusercontent.com/images/WoEzU6rPsJpT06fwcGi3b2IWWSE.gif",
  "https://framerusercontent.com/images/l7qUhfDxVpjSSGzjvXC3v2pMTIo.gif"
];

// Function to extract dominant color from video frame
function getDominantColor(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '#e5e7eb';

  canvas.width = video.videoWidth || 180;
  canvas.height = video.videoHeight || 320;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const colorCounts: { [key: string]: number } = {};
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    if (a < 128) continue;
    
    const qr = Math.floor(r / 32) * 32;
    const qg = Math.floor(g / 32) * 32;
    const qb = Math.floor(b / 32) * 32;
    const color = `rgb(${qr},${qg},${qb})`;
    
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  }

  let maxCount = 0;
  let dominantColor = '#e5e7eb';
  for (const [color, count] of Object.entries(colorCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = color;
    }
  }

  return dominantColor;
}

const TickerCard = ({ 
  videoSrc, 
  gifSrc, 
  offset,
  isMobile
}: { 
  videoSrc: string; 
  gifSrc: string; 
  index: number;
  offset: number;
  isMobile: boolean;
  isMoving: boolean;
}) => {
  const [shouldLoad, setShouldLoad] = useState(true);
  const [useVideo, setUseVideo] = useState(true);
  const [bgColor, setBgColor] = useState('#e5e7eb');
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const isActive = offset === 0;

  // Calculate position on the arc
  const radius = isMobile ? 300 : 800; 
  
  // Adjusted angleStep for tighter overlap
  const angleStep = isMobile ? 10 : 6; 
  
  const angle = offset * angleStep;
  const radian = (angle * Math.PI) / 180;
  
  const x = Math.sin(radian) * radius;
  const y = radius - Math.cos(radian) * radius;
  
  const rotate = angle * 1.5;
  
  const zIndex = 100 - Math.abs(offset);
  
  const scale = Math.max(0.7, 1 - Math.abs(offset) * 0.1);
  
  const opacity = Math.max(0.3, 1 - Math.abs(offset) * 0.2);

  useEffect(() => {
    setShouldLoad(true);
  }, []);

  useEffect(() => {
    if (isActive && useVideo && videoRef.current) {
      videoRef.current.play().catch(() => setUseVideo(false));
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive, useVideo]);

  useEffect(() => {
    if (!videoRef.current || !useVideo) return;
    const video = videoRef.current;
    const handleLoadedData = () => {
       if (!isActive) video.currentTime = 0.1; 
    };
    const handleSeeked = () => {
      try {
        const color = getDominantColor(video);
        setBgColor(color);
      } catch (e) {}
    };
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('seeked', handleSeeked);
    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [useVideo, isActive]);

  const frameWidth = 220;
  const frameHeight = 390;

  return (
    <motion.div
      ref={containerRef}
      className="absolute rounded-xl overflow-hidden shadow-2xl origin-bottom"
      style={{
        width: `${frameWidth}px`,
        height: `${frameHeight}px`,
        backgroundColor: bgColor,
        left: '50%',
        top: '50%', 
        marginTop: -frameHeight / 2, // Vertically center the main card
        marginLeft: -frameWidth / 2,
        zIndex: zIndex,
        transformOrigin: 'center 120%',
      }}
      initial={false}
      animate={{
        x,
        y,
        rotate,
        scale,
        opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 14,
        mass: 1,
      }}
    >
      {shouldLoad ? (
        useVideo ? (
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full"
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setUseVideo(false)}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
        ) : (
          <img 
            src={gifSrc} 
            alt="" 
            className="w-full h-full"
            loading="lazy"
            decoding="async"
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
        )
      ) : (
        <div className="w-full h-full animate-pulse" style={{ backgroundColor: bgColor }} />
      )}
      
      {/* Overlay for non-active cards */}
      {!isActive && (
        <div className="absolute inset-0 bg-black/10 transition-colors duration-300" />
      )}
    </motion.div>
  );
};

export const Ticker = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered]);

  // Range controls how many cards on each side are rendered.
  const range = isMobile ? 2 : 4;
  const visibleIndices = [];
  for (let i = activeIndex - range; i <= activeIndex + range; i++) {
    visibleIndices.push(i);
  }

  return (
    <div 
      className="w-full pt-0 pb-12 relative flex justify-center items-center overflow-hidden"
      style={{ 
        minHeight: '500px',
        background: 'transparent',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Side Gradient Masks - High Z-Index to cover cards */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-white via-white to-transparent z-[200] pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white via-white to-transparent z-[200] pointer-events-none" />
      
      {/* Bottom Gradient Mask */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/50 to-transparent z-[200] pointer-events-none" />

      <div 
        className="relative w-full h-[500px] flex justify-center" 
      >
        <AnimatePresence initial={false}>
          {visibleIndices.map((i) => {
            const videoIndex = ((i % videos.length) + videos.length) % videos.length;
            
            return (
              <TickerCard 
                key={i} 
                videoSrc={videos[videoIndex]}
                gifSrc={gifs[videoIndex]}
                index={videoIndex}
                offset={i - activeIndex}
                isMobile={isMobile}
                isMoving={true}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
