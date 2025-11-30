import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring, useTransform, useAnimation, AnimatePresence } from 'framer-motion';

// Cursor animation component
const CursorAnimation = ({ 
  containerRef, 
  animationComplete,
  onAnimationComplete
}: { 
  containerRef: React.RefObject<HTMLDivElement>;
  animationComplete: boolean;
  onAnimationComplete?: () => void;
}) => {
  const controls = useAnimation();
  const [showPill, setShowPill] = useState(false);
  const [hideCursor, setHideCursor] = useState(false);
  const [pillPosition, setPillPosition] = useState({ x: 0, y: 0 });
  const [typewriterText, setTypewriterText] = useState('');
  const hiddenTextRef = useRef<HTMLSpanElement>(null);
  const [pillWidth, setPillWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Calculate bottom-right corner position based on rotation
  const getCornerPosition = useCallback((rotation: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const radians = (rotation * Math.PI) / 180;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const halfSize = rect.width / 2;
    
    // Bottom-right corner: rotate (halfSize, halfSize) around center
    const cornerX = centerX + halfSize * Math.cos(radians) - halfSize * Math.sin(radians);
    const cornerY = centerY + halfSize * Math.sin(radians) + halfSize * Math.cos(radians);
    
    // Add offset for the handle (4px from corner)
    return { x: cornerX + 4 - 20, y: cornerY + 4 - 22 }; // Center the cursor
  }, [containerRef]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hardcoded animation sequence matching box rotation exactly
  useEffect(() => {
    if (!animationComplete && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const startX = rect.width + 60; // 60px from the right
      const startY = rect.height / 2;
      const startPos = getCornerPosition(-45);
      const endPos = getCornerPosition(-5);

      const sequence = async () => {
        // Set initial position (right side, 60px from right, invisible)
        await controls.start({
          x: startX,
          y: startY,
          opacity: 0,
        });

        // Start moving cursor immediately (0.5s earlier to eliminate lag)
        // Takes 0.4s to reach corner, arrives at 0.4s
        await controls.start({
          x: startPos.x,
          y: startPos.y,
          opacity: 1,
          transition: {
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
          },
        });

        // Wait for box fade in (0.5s) + wait period (0.5s) + delay (0.4s) = 1.4s total
        // Cursor already arrived at 0.4s, so wait 0.75s to sync with rotation start (sweet spot)
        await new Promise(resolve => setTimeout(resolve, 750));

        // Now animate following the rotation path from -45 to -5 (1.2s)
        // This matches the exact box rotation timing and easing
        await controls.start({
          x: endPos.x,
          y: endPos.y,
          transition: {
            duration: 1.2,
            ease: [0.25, 0.1, 0.25, 1],
          },
        });

        // Set pill position at cursor's final position
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const pillX = rect.left + endPos.x + 20; // Cursor center + offset
          const pillY = rect.top + endPos.y + 22; // Cursor center + offset
          setPillPosition({
            x: pillX,
            y: pillY,
          });
          console.log('Pill position set:', { x: pillX, y: pillY, endPos, rect: { left: rect.left, top: rect.top } });
        }

        // Wait 0.5 seconds before showing the pill
        await new Promise(resolve => setTimeout(resolve, 500));

        // Show "Have fun!" pill at the end
        setShowPill(true);
        console.log('Pill should be visible now');

        // Typewriter effect for "Have fun!"
        const text = "Have fun!";
        setTypewriterText('');
        setPillWidth(0);
        
        // Typewriter effect - type each character
        for (let i = 0; i <= text.length; i++) {
          setTimeout(() => {
            const currentText = text.slice(0, i);
            setTypewriterText(currentText);
            
            // Calculate width for current text
            if (i > 0) {
              const tempSpan = document.createElement('span');
              tempSpan.style.visibility = 'hidden';
              tempSpan.style.position = 'absolute';
              tempSpan.style.whiteSpace = 'nowrap';
              tempSpan.style.fontSize = '0.875rem';
              tempSpan.style.fontWeight = '500';
              tempSpan.style.padding = '0.75rem 1.5rem';
              tempSpan.textContent = currentText;
              document.body.appendChild(tempSpan);
              const currentWidth = tempSpan.offsetWidth;
              document.body.removeChild(tempSpan);
              setPillWidth(currentWidth);
            } else {
              setPillWidth(0);
            }
          }, i * 80); // 80ms per character
        }

        // After 1.5 seconds, start fade out for both pill and cursor
        setTimeout(() => {
          setShowPill(false);
          // Wait for fade out animation to complete before hiding cursor and notifying
          setTimeout(() => {
            setHideCursor(true);
            // Notify parent that animation is complete
            onAnimationComplete?.();
          }, 400); // Wait for fade out duration
        }, 1500);
      };

      sequence();
    }
  }, [animationComplete, containerRef, getCornerPosition, controls]);

  return (
    <>
      <AnimatePresence>
        {!hideCursor && (
          <motion.div
            className="absolute pointer-events-none z-[9999]"
            style={{
              width: '40px',
              height: '44px',
            }}
            animate={controls}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
            }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.4,
                ease: "easeOut",
              },
            }}
          >
          <svg 
            width="40" 
            height="44" 
            viewBox="0 0 396 433" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="filter0_d_cursor" x="0" y="0" width="395.86" height="432.694" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="19.8759"/>
                <feGaussianBlur stdDeviation="19.8759"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.28 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2_20"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2_20" result="shape"/>
              </filter>
            </defs>
            <g filter="url(#filter0_d_cursor)">
              <path d="M39.9744 31.8759C38.2182 23.4825 47.2034 16.9545 54.6432 21.2183L351.11 191.127C358.653 195.45 357.401 206.692 349.09 209.248L205.199 253.511C202.971 254.196 201.054 255.643 199.785 257.599L127.77 368.534C122.94 375.973 111.523 373.84 109.707 365.158L39.9744 31.8759Z" fill="#333333"/>
              <path d="M346.169 199.749L202.277 244.012C197.821 245.383 193.988 248.277 191.449 252.188L119.434 363.121L49.7012 29.8407L346.169 199.749Z" stroke="white" strokeWidth="19.8759"/>
            </g>
          </svg>
        </motion.div>
        )}
      </AnimatePresence>

      {/* "Have fun!" pill - rendered via portal for proper layering */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showPill && pillPosition.x > 0 && (
            <motion.div
              className="fixed pointer-events-none"
              style={{
                left: isMobile ? '50%' : `${pillPosition.x}px`,
                top: `${pillPosition.y - 60}px`,
                transform: 'translate(-50%, 0)',
                zIndex: 10000,
                maxWidth: isMobile ? '90vw' : 'none', // Prevent overflow on mobile
              }}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ 
                opacity: 0, 
                scale: 0.8, 
                y: -10,
                transition: {
                  duration: 0.4,
                  ease: "easeOut",
                },
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            >
            <motion.div
              className="inline-flex items-center px-6 py-3 rounded-full text-white font-medium text-sm shadow-lg whitespace-nowrap overflow-visible"
              style={{
                background: 'linear-gradient(135deg, #DF95FF 0%, #FFAA95 100%)',
                minWidth: pillWidth > 0 ? pillWidth : 0,
              }}
              animate={{
                width: pillWidth > 0 ? pillWidth : 0,
              }}
              transition={{
                duration: 0.08, // Match typing speed (80ms per character)
                ease: "linear",
              }}
            >
              <span ref={hiddenTextRef} className="opacity-0 absolute pointer-events-none" style={{ visibility: 'hidden' }}>
                Have fun!
              </span>
              <span>
                {typewriterText}
                {typewriterText.length > 0 && typewriterText.length < 9 && (
                  <span className="animate-pulse ml-0.5">|</span>
                )}
              </span>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export const ProfilePicture3D = ({ onAnimationComplete }: { onAnimationComplete?: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(-45);
  const controls = useAnimation();
  const rotateZ = useMotionValue(-45);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
    stiffness: 100,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 100,
    damping: 20,
  });

  // Initial load animation
  useEffect(() => {
    const sequence = async () => {
      // Start at -45 degrees
      setCurrentRotation(-45);
      rotateZ.set(-45);
      await controls.start({
        rotateZ: -45,
        opacity: 0,
        scale: 0.8,
      });

      // Fade in and show selection rectangle
      await controls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5 },
      });

      // Wait a bit, then animate cursor dragging the corner
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add small delay to match cursor reaching the corner (cursor takes 0.4s to reach corner)
      await new Promise(resolve => setTimeout(resolve, 400));

      // Rotate to final position (-5 degrees) with cursor animation
      // Update rotation state during animation
      const startTime = Date.now();
      const duration = 1200;
      const startRot = -45;
      const endRot = -5;
      
      const animateRotation = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        const currentRot = startRot + (endRot - startRot) * easeProgress;
        setCurrentRotation(currentRot);
        
        if (progress < 1) {
          requestAnimationFrame(animateRotation);
        } else {
          setCurrentRotation(endRot);
        }
      };
      
      requestAnimationFrame(animateRotation);
      
      await controls.start({
        rotateZ: -5,
        transition: { 
          duration: 1.2,
          ease: [0.25, 0.1, 0.25, 1], // Custom easing for smooth drag
        },
      });

      // Hide selection rectangle and cursor
      setAnimationComplete(true);
    };

    sequence();
  }, [controls, rotateZ]);

  useEffect(() => {
    let lastTime = 0;
    const throttleDelay = 16; // ~60fps

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastTime < throttleDelay) return;
      lastTime = now;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Only tilt if cursor is within 250px of the image
        if (distance < 250) {
          // Normalize to -0.5 to 0.5 range
          const normalizedX = (distanceX / 250) * 0.5;
          const normalizedY = (distanceY / 250) * 0.5;
          mouseX.set(normalizedX);
          mouseY.set(normalizedY);
        } else {
          mouseX.set(0);
          mouseY.set(0);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [mouseX, mouseY]);

  // Track rotation value
  useEffect(() => {
    rotateZ.set(currentRotation);
  }, [currentRotation, rotateZ]);

  return (
    <div
      ref={containerRef}
      className="w-[212px] h-[217px] relative shrink-0"
      style={{ perspective: '1000px', overflow: 'visible' }}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
    >
      {/* Cursor - Animates from right side to bottom-right corner */}
      <CursorAnimation 
        containerRef={containerRef}
        animationComplete={animationComplete}
        onAnimationComplete={onAnimationComplete}
      />

      <motion.div
        className="w-full h-full relative"
        animate={controls}
        style={{
          rotateX: animationComplete ? rotateX : 0,
          rotateY: animationComplete ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Figma-like Selection Rectangle - Rotates with the image */}
        {!animationComplete && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {/* Rectangle Stroke */}
            <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="none"
                stroke="#18A0FB"
                strokeWidth="2"
                rx="8"
                style={{ vectorEffect: 'non-scaling-stroke' }}
              />
            </svg>
            
            {/* Corner Handles - Small filled squares */}
            {[
              { x: 0, y: 0 }, // Top-left
              { x: '100%', y: 0 }, // Top-right
              { x: 0, y: '100%' }, // Bottom-left
              { x: '100%', y: '100%' }, // Bottom-right (draggable)
            ].map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[#18A0FB]"
                style={{
                  left: pos.x === 0 ? '-4px' : undefined,
                  right: pos.x === '100%' ? '-4px' : undefined,
                  top: pos.y === 0 ? '-4px' : undefined,
                  bottom: pos.y === '100%' ? '-4px' : undefined,
                  transform: 'translate(50%, 50%)',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, duration: 0.2 }}
              />
            ))}
          </motion.div>
        )}

        <motion.img
          src="https://framerusercontent.com/images/4EgpRHgmfUkxQFXjxJH66BuVt8.png?width=316&height=316"
          className="w-full h-full object-cover rounded-[190px] border-4 border-white shadow-lg"
          alt="Keerthi"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        />
      </motion.div>
    </div>
  );
};

