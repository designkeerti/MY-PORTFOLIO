import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LottieAnimation } from './LottieAnimation';

export const Navigation = ({ revealStep, isDarkMode = false }: { revealStep: number; isDarkMode?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNameHovered, setIsNameHovered] = useState(false);
  const lottieRef = useRef<{ handleHoverStart: () => void; handleHoverEnd: () => void } | null>(null);

  const textColor = isDarkMode ? 'text-white' : 'text-text-primary';
  const menuBg = isDarkMode ? 'bg-white/10 border-white/10' : 'bg-white/80 border-white/50';
  const hoverColor = isDarkMode ? 'hover:text-[#FFAA95]' : 'hover:text-purple-600';

  return (
    <>
      {/* Fixed Navbar */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 px-8 pt-6 pb-3 flex justify-between items-center bg-transparent backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: revealStep >= 3 ? 1 : 0,
          y: revealStep >= 3 ? 0 : -20,
        }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        <div 
          className="inline-block font-bold text-xl tracking-tight cursor-pointer group relative"
          style={{ 
            backgroundColor: 'transparent',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            transform: 'scale(1.2)',
            transformOrigin: 'left center',
          }}
          onMouseEnter={() => {
            setIsNameHovered(true);
            lottieRef.current?.handleHoverStart();
          }}
          onMouseLeave={() => {
            setIsNameHovered(false);
            lottieRef.current?.handleHoverEnd();
          }}
        >
          <span className={`${textColor} leading-none transition-colors relative z-10 inline-block ${isNameHovered ? 'text-[#FFAA95]' : ''}`} style={{ backgroundColor: 'transparent' }}>Keerthi Vardhan</span>
          <div className="absolute left-full top-1/2 flex items-center justify-center shrink-0 overflow-visible pointer-events-none" style={{ marginLeft: '-8px', marginTop: '-8px', transform: 'translateY(-50%)', backgroundColor: 'transparent' }}>
            <LottieAnimation 
              ref={lottieRef}
              path="/lottie/Cat is sleeping and rolling.json"
              width={80}
              height={80}
              loop={true}
              autoplay={true}
              className="bg-transparent pointer-events-auto"
            />
          </div>
        </div>

        {/* Desktop Menu */}
        <div className={`hidden md:flex items-center gap-8 px-6 py-3 rounded-full border shadow-sm backdrop-blur-md transition-colors duration-300 ${menuBg}`}>
          <a href="#work" className={`text-sm font-medium transition-colors ${textColor} ${hoverColor}`}>Work</a>
          <a href="#about" className={`text-sm font-medium transition-colors ${textColor} ${hoverColor}`}>About</a>
          <a href="#contact" className={`text-sm font-medium transition-colors ${textColor} ${hoverColor}`}>Contact</a>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 rounded-full shadow-sm z-50 transition-colors duration-300 ${isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-black'}`}
        >
          <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
            <span className={`block w-full h-0.5 transition-transform ${isDarkMode ? 'bg-white' : 'bg-black'} ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-full h-0.5 transition-opacity ${isDarkMode ? 'bg-white' : 'bg-black'} ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-full h-0.5 transition-transform ${isDarkMode ? 'bg-white' : 'bg-black'} ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8"
          >
            <a href="#work" onClick={() => setIsOpen(false)} className="text-2xl font-bold">Work</a>
            <a href="#about" onClick={() => setIsOpen(false)} className="text-2xl font-bold">About</a>
            <a href="#contact" onClick={() => setIsOpen(false)} className="text-2xl font-bold">Contact</a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

