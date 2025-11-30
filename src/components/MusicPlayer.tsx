import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const MusicPlayer = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // REPLACE THIS LINK with your own Spotify Playlist/Song Embed URL
  // To get it: Go to Spotify > Share > Embed > Copy the 'src' url from the code
  const spotifyEmbedUrl = "https://open.spotify.com/embed/playlist/7vYVNddNccodqHK73wo6j4?utm_source=generator";

  return (
    <motion.div
      className="relative w-full max-w-[300px] h-[80px] rounded-[12px] overflow-hidden shadow-lg border border-[#DF95FF]/30 bg-[#DF95FF]/10 backdrop-blur-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.5 }}
      whileHover={!isMobile ? { scale: 1.02, borderColor: 'rgba(223, 149, 255, 0.6)' } : undefined}
    >
      <iframe 
        style={{ borderRadius: '12px' }} 
        src={spotifyEmbedUrl}
        width="100%" 
        height="80" 
        frameBorder="0" 
        allowFullScreen 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="eager"
        className={`bg-transparent transition-opacity duration-300 ${isMobile ? 'opacity-100' : 'opacity-90 hover:opacity-100'}`}
      />
    </motion.div>
  );
};
