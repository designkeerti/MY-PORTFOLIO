import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const allVideos = [
  "/videos/1dark.mp4",
  "/videos/1light.mp4",
  "/videos/2dark.mp4",
  "/videos/2light.mp4",
];

// Select 4 distinct videos for the center row
const centerVideos = allVideos.slice(0, 4);

// Helper to build a column with a specific center video
const buildColumn = (centerVideoIndex: number) => {
  const centerVideo = centerVideos[centerVideoIndex];
  // Pick random or specific videos for top/bottom that are NOT the center one if possible
  const topVideo = allVideos[(centerVideoIndex + 1) % allVideos.length];
  const bottomVideo = allVideos[(centerVideoIndex + 2) % allVideos.length];
  
  return [topVideo, centerVideo, bottomVideo];
};

const columns = [
  buildColumn(0),
  buildColumn(1),
  buildColumn(2),
  buildColumn(3)
];

const VideoItem = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (isInView && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isInView]);

  return (
    <motion.div 
      className="relative w-full aspect-square overflow-hidden bg-gray-100"
      onViewportEnter={() => setIsInView(true)}
      onViewportLeave={() => setIsInView(false)}
      whileHover={{ scale: 1.02, zIndex: 10 }}
      transition={{ duration: 0.2 }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        preload="metadata"
      />
    </motion.div>
  );
};

const ParallaxColumn = ({ 
  videos, 
  direction, 
  scrollYProgress 
}: { 
  videos: string[], 
  direction: 1 | -1, 
  scrollYProgress: any 
}) => {
  // We just need to oscillate around 0% to create the parallax effect.
  
  const center = 0;
  const range = 60; // +/- 60% movement for prominent effect
  
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 1 
      ? [`${center - range}%`, `${center + range}%`] 
      : [`${center + range}%`, `${center - range}%`] 
  );
  
  // Smoothness: Lower stiffness/damping ratio for a fluid, floaty feel
  const springY = useSpring(y, { stiffness: 50, damping: 20, mass: 1.5 });

  return (
    <motion.div 
      className="flex flex-col gap-0 w-full"
      style={{ y: springY }}
    >
      {videos.map((src, i) => (
        <VideoItem key={i} src={src} />
      ))}
    </motion.div>
  );
};

export const VideoGridParallax = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <div 
      ref={containerRef} 
      className="w-full overflow-hidden relative bg-white"
    >
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-0"> 
        {columns.map((colVideos, i) => (
          // Wrap each column in a relative container that acts as the "window"
          // for that column. This allows the grid to wrap naturally on mobile (2 rows)
          // while maintaining the masking and alignment for each cell.
          <div 
            key={i}
            className="relative w-full flex items-center justify-center overflow-hidden"
            style={{
              // Mobile (2 cols): 50vw width -> 50vw height + 32px clip
              // Desktop (4 cols): 25vw width -> 25vw height + 64px clip
              height: typeof window !== 'undefined' && window.innerWidth < 768 
                ? 'calc(50vw + 32px)' 
                : 'calc(25vw + 64px)'
            }}
          >
            <ParallaxColumn 
              videos={colVideos} 
              direction={i % 2 === 0 ? 1 : -1} 
              scrollYProgress={scrollYProgress} 
            />
          </div>
        ))}
      </div>
      
      {/* Optional: Shadow overlay for depth at edges - Reduced opacity */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.05)] z-20" />
    </div>
  );
};
