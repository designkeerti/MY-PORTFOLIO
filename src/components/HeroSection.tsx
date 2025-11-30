import { VideoGridParallax } from './VideoGridParallax';
import { SlidingText } from './SlidingText';
import { ProfilePicture3D } from './ProfilePicture3D';
import { RiveAnimation } from './RiveAnimation';
import { MusicPlayer } from './MusicPlayer';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

export const HeroSection = ({ onRevealStepChange }: { onRevealStepChange?: (step: number) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hiddenTextRef = useRef<HTMLSpanElement>(null);
  const baseTextRef = useRef<HTMLSpanElement>(null);
  const [fullTextWidth, setFullTextWidth] = useState(0);
  const [baseTextWidth, setBaseTextWidth] = useState(0);
  const [dpAnimationComplete, setDpAnimationComplete] = useState(false);
  const [revealStep, setRevealStep] = useState(0); // 0: hidden, 1: rive, 2: pill+text, 3: tools+nav
  const [autoExpandPill, setAutoExpandPill] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (hiddenTextRef.current) {
      setFullTextWidth(hiddenTextRef.current.scrollWidth + 4);
    }
    if (baseTextRef.current) {
      setBaseTextWidth(baseTextRef.current.scrollWidth);
    }
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle animation completion sequence
  useEffect(() => {
    if (dpAnimationComplete) {
      setTimeout(() => {
        setRevealStep(1);
        onRevealStepChange?.(1);
      }, 200);

      setTimeout(() => {
        setRevealStep(2);
        onRevealStepChange?.(2);
      }, 800);

      setTimeout(() => {
        setRevealStep(3);
        onRevealStepChange?.(3);
        
        setTimeout(() => {
          if (!isMobile) {
            setAutoExpandPill(true);
            setTimeout(() => {
              setAutoExpandPill(false);
            }, 2000);
          }
        }, 500);
      }, 1400);
    }
  }, [dpAnimationComplete, onRevealStepChange, isMobile]);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Top Constrained Section */}
      <section className="relative w-full max-w-[1200px] mx-auto pt-[120px] pb-10 px-8 flex flex-col items-center gap-10 z-10">
        
        {/* Hero Content Container */}
        <div className="w-full flex flex-col gap-12 items-center relative z-10">
          
          {/* Main Column: Tagline -> DP -> Text -> Grid */}
          <div className="flex flex-col items-center gap-8">
            
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ 
                opacity: revealStep >= 2 ? 1 : 0,
                y: revealStep >= 2 ? 0 : -50,
                scale: (isHovered || autoExpandPill) ? 1.05 : 1,
              }}
              transition={{
                opacity: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
                y: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
                scale: { type: "spring", stiffness: 400, damping: 25, bounce: 0.5 }
              }} 
              className="rounded-full shadow-lg cursor-pointer overflow-hidden inline-flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #DF95FF 0%, #FFAA95 100%)' }}
              onHoverStart={() => !isMobile && setIsHovered(true)}
              onHoverEnd={() => !isMobile && setIsHovered(false)}
            >
              <span ref={hiddenTextRef} className="text-base font-medium text-white opacity-0 absolute pointer-events-none" style={{ visibility: 'hidden', whiteSpace: 'nowrap' }}>
                Hi I'm Keerthi 👋 I want to be rich enough to feed every animal 🐱 around me
              </span>
              <span ref={baseTextRef} className="text-base font-medium text-white opacity-0 absolute pointer-events-none" style={{ visibility: 'hidden', whiteSpace: 'nowrap' }}>
                Hi I'm Keerthi 👋
              </span>
              
              <motion.div
                className="flex items-center whitespace-nowrap px-4 py-2"
                style={{ overflow: 'visible' }}
                animate={{ width: (isHovered || autoExpandPill) ? fullTextWidth + 32 : baseTextWidth + 32 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, bounce: 0.5 }}
              >
                <span className="text-base font-medium text-white shrink-0">Hi I'm Keerthi 👋</span>
                <motion.span
                  className="text-base font-medium text-white inline-block"
                  animate={{ 
                    width: (isHovered || autoExpandPill) ? fullTextWidth - baseTextWidth + 8 : 0,
                    opacity: (isHovered || autoExpandPill) ? 1 : 0,
                    marginLeft: (isHovered || autoExpandPill) ? 8 : 0,
                  }}
                  transition={{ width: { type: "spring", stiffness: 400, damping: 25, bounce: 0.5 }, opacity: { duration: 0.2 }, marginLeft: { type: "spring", stiffness: 400, damping: 25, bounce: 0.5 } }}
                  style={{ minWidth: 0, overflow: 'visible' }}
                >
                  <span className="inline-block whitespace-nowrap">&nbsp;I want to be rich enough to feed every animal 🐱 around me</span>
                </motion.span>
              </motion.div>
            </motion.div>

            {/* Profile Image */}
            <ProfilePicture3D onAnimationComplete={() => setDpAnimationComplete(true)} />

            {/* Text Block */}
            <motion.div 
              className="flex flex-col items-center gap-2 text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: revealStep >= 2 ? 1 : 0, y: revealStep >= 2 ? 0 : 50 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h1 className="text-3xl md:text-4xl font-medium text-text-primary opacity-90">I design</h1>
              <div className="text-4xl md:text-5xl font-bold"><SlidingText /></div>
            </motion.div>

            {/* Tools Grid & Music Player */}
            <div className="flex flex-col items-center gap-6">
              <motion.div 
                className="flex flex-wrap justify-center gap-6 max-w-[600px]"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: revealStep >= 3 ? 1 : 0, y: revealStep >= 3 ? 0 : 50 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                 <GridItem><svg viewBox="0 0 24 24" className="w-8 h-8 fill-black" xmlns="http://www.w3.org/2000/svg"><path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z"/></svg></GridItem>
                 <GridItem><img src="https://framerusercontent.com/images/W07nH8VDiwrgbmo4r8CmiIChg.png" className="w-10 h-10 object-contain" /></GridItem>
                 <GridItem><span className="font-bold text-lg">RIVE</span></GridItem>
                 <GridItem><img src="https://framerusercontent.com/images/FRggyEbUloy2PxkUIkcfqmFkXoM.png" className="w-10 h-10 object-contain" /></GridItem>
                 <GridItem><svg viewBox="0 0 24 24" className="w-8 h-8 fill-black" xmlns="http://www.w3.org/2000/svg"><path d="M19.07 10.93C16.83 11.42 15.08 13.17 14.59 15.41C14.38 16.35 13.12 16.35 12.96 15.41C12.47 13.17 10.72 11.42 8.48 10.93C7.54 10.72 7.54 9.46 8.48 9.25C10.72 8.76 12.47 7.01 12.96 4.77C13.17 3.83 14.43 3.83 14.59 4.77C15.08 7.01 16.83 8.76 19.07 9.25C20.01 9.46 20.01 10.72 19.07 10.93ZM9.93 18.07C8.81 18.31 7.93 19.19 7.69 20.31C7.58 20.78 6.95 20.78 6.87 20.31C6.63 19.19 5.75 18.31 4.63 18.07C4.16 17.96 4.16 17.33 4.63 17.23C5.75 16.99 6.63 16.11 6.87 14.99C6.98 14.52 7.61 14.52 7.69 14.99C7.93 16.11 8.81 16.99 9.93 17.23C10.4 17.33 10.4 17.96 9.93 18.07Z"/></svg></GridItem>
                 <GridItem><img src="https://framerusercontent.com/images/nWQ4pwGhNTr4aeYi8lUshZsc.png" className="w-10 h-10 object-contain" /></GridItem>
              </motion.div>

              {/* Music Player */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: revealStep >= 3 ? 1 : 0, y: revealStep >= 3 ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <MusicPlayer />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Background Elements (HeroBg) - Constrained to Top Section */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[94%] h-[580px] max-w-[1400px] rounded-[100px] z-0 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
           <motion.div className="absolute inset-0 z-0 overflow-hidden rounded-[100px]" style={{ top: '60px' }} initial={{ opacity: 0 }} animate={{ opacity: revealStep >= 1 ? 0.12 : 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
             <div style={{ opacity: 1, width: '100%', height: '100%' }}>
               <RiveAnimation src="/rive/phaBVZUUldo57fBvZJa90Hciik.riv" artboard="Artboard" stateMachineName="State Machine 1" width="100%" height="100%" className="w-full h-full" />
             </div>
           </motion.div>
           <div className="absolute inset-0 z-[2] pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`, backgroundSize: '40px 40px', maskImage: 'radial-gradient(ellipse 60% 100% at center, black 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 100% at center, black 0%, transparent 70%)' }} />
        </div>
      </section>

      {/* Full Width Video Grid Block - OUTSIDE constrained section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: revealStep >= 3 ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full relative z-10 mt-10"
      >
        <VideoGridParallax />
      </motion.div>
    </div>
  );
};

const GridItem = ({ children }: { children: React.ReactNode }) => (
  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 hover:scale-105 transition-transform duration-300">
    {children}
  </div>
);
