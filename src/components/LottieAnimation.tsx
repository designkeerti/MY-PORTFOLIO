import Lottie from 'lottie-react';
import { type CSSProperties, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';

interface LottieAnimationProps {
  animationData?: object;
  path?: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  style?: CSSProperties;
  width?: number | string;
  height?: number | string;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export const LottieAnimation = forwardRef<{ handleHoverStart: () => void; handleHoverEnd: () => void }, LottieAnimationProps>(({
  animationData,
  path,
  autoplay = true,
  speed = 1,
  className = '',
  style,
  width,
  height,
  onHoverStart,
  onHoverEnd,
}, ref) => {
  const lottieRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!animationData && !path) {
    console.error('LottieAnimation: Either animationData or path must be provided');
    return null;
  }

  // Animation duration: ~16 seconds (480 frames / 29.97 fps)
  // Last 2 seconds: frames 420-480 (approximately)
  const totalFrames = 480;
  const frameRate = 29.97;
  const last2SecondsStartFrame = Math.floor(totalFrames - (2 * frameRate)); // ~420

  const handleHoverStart = () => {
    console.log('handleHoverStart called');
    if (lottieRef.current) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Play the last 2 seconds segment
      const startFrame = last2SecondsStartFrame;
      const endFrame = totalFrames - 1;
      console.log('Playing segment from', startFrame, 'to', endFrame, 'Total frames:', totalFrames);
      
      // Stop current animation first
      lottieRef.current.stop();
      
      // Wait a tiny bit then play the segment
      setTimeout(() => {
        if (lottieRef.current) {
          // Try using playSegments first
          if (typeof lottieRef.current.playSegments === 'function') {
            console.log('Using playSegments');
            lottieRef.current.playSegments([startFrame, endFrame], true);
          } else if (lottieRef.current.goToAndPlay) {
            console.log('Using goToAndPlay');
            lottieRef.current.goToAndPlay(startFrame, true);
          } else if (lottieRef.current.play) {
            console.log('Using play after setting frame');
            lottieRef.current.currentFrame = startFrame;
            lottieRef.current.play();
          }
          
          // Calculate duration and stop at the end frame after it finishes
          const segmentDuration = ((endFrame - startFrame) / frameRate) * 1000; // in ms
          console.log('Segment duration:', segmentDuration, 'ms');
          timeoutRef.current = setTimeout(() => {
            if (lottieRef.current) {
              console.log('Stopping at frame', endFrame);
              lottieRef.current.goToAndStop(endFrame, true);
            }
            timeoutRef.current = null;
          }, segmentDuration + 100); // Add buffer
        }
      }, 10);
    } else {
      console.log('lottieRef.current is null');
    }
    onHoverStart?.();
  };

  const handleHoverEnd = () => {
    // Clear the timeout so it doesn't stop at the last frame
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (lottieRef.current) {
      // Immediately go back to looping the first part (original state)
      lottieRef.current.stop();
      lottieRef.current.playSegments([0, last2SecondsStartFrame], true);
    }
    onHoverEnd?.();
  };

  // Remove background from canvas after render and ensure animation starts
  useEffect(() => {
    const removeBackground = () => {
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector('canvas');
        const svg = containerRef.current.querySelector('svg');
        
        if (canvas) {
          canvas.style.background = 'transparent';
          canvas.style.backgroundColor = 'transparent';
        }
        if (svg) {
          svg.style.background = 'transparent';
          svg.style.backgroundColor = 'transparent';
          
          // Get SVG dimensions
          const svgWidth = parseFloat(svg.getAttribute('width') || '0') || 
                          parseFloat(svg.getAttribute('viewBox')?.split(' ')[2] || '0');
          const svgHeight = parseFloat(svg.getAttribute('height') || '0') || 
                           parseFloat(svg.getAttribute('viewBox')?.split(' ')[3] || '0');
          
          // Check all rectangles for potential backgrounds
          const allRects = svg.querySelectorAll('rect');
          allRects.forEach((el: any) => {
            const rectWidth = parseFloat(el.getAttribute('width') || '0');
            const rectHeight = parseFloat(el.getAttribute('height') || '0');
            const rectX = parseFloat(el.getAttribute('x') || '0');
            const rectY = parseFloat(el.getAttribute('y') || '0');
            const fill = el.getAttribute('fill') || '';
            
            // Check if it's a full-size background rectangle
            const isFullSize = Math.abs(rectWidth - svgWidth) < 2 && Math.abs(rectHeight - svgHeight) < 2;
            const isAtOrigin = Math.abs(rectX) < 1 && Math.abs(rectY) < 1;
            const isWhiteFill = fill.includes('white') || fill.includes('#fff') || fill.includes('#ffffff') || 
                               fill.includes('rgb(255') || fill === '' || !fill;
            
            if (isFullSize && isAtOrigin && isWhiteFill) {
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
            }
          });
          
          // Also check for g elements that might contain backgrounds
          const groups = svg.querySelectorAll('g');
          groups.forEach((g: any) => {
            const rects = g.querySelectorAll('rect');
            rects.forEach((rect: any) => {
              const fill = rect.getAttribute('fill') || '';
              if (fill.includes('white') || fill.includes('#fff') || fill.includes('#ffffff')) {
                const rectWidth = parseFloat(rect.getAttribute('width') || '0');
                const rectHeight = parseFloat(rect.getAttribute('height') || '0');
                if (Math.abs(rectWidth - svgWidth) < 2 && Math.abs(rectHeight - svgHeight) < 2) {
                  rect.style.opacity = '0';
                  rect.style.pointerEvents = 'none';
                }
              }
            });
          });
        }
      }
    };

    // Run immediately and after delays
    removeBackground();
    const timeout1 = setTimeout(removeBackground, 50);
    const timeout2 = setTimeout(removeBackground, 200);
    const timeout3 = setTimeout(removeBackground, 500);
    
    // Ensure animation starts playing the initial segment
    if (lottieRef.current && autoplay) {
      setTimeout(() => {
        if (lottieRef.current) {
          lottieRef.current.playSegments([0, last2SecondsStartFrame], true);
        }
      }, 100);
    }

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [animationData, path, autoplay, last2SecondsStartFrame]);

  // Expose handlers via ref
  useImperativeHandle(ref, () => ({
    handleHoverStart,
    handleHoverEnd,
  }));

  return (
    <div 
      ref={containerRef}
      className={className} 
      style={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'transparent',
        background: 'transparent',
        overflow: 'hidden',
        ...style 
      }}
    >
      <Lottie
        {...({
          lottieRef,
          animationData,
          path,
          loop: false,
          autoplay,
          speed,
          style: { 
            width: '100%', 
            height: '100%',
            backgroundColor: 'transparent',
          },
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
          },
          onComplete: () => {
            // When animation completes, loop the first part if not hovering
            if (lottieRef.current) {
              lottieRef.current.playSegments([0, last2SecondsStartFrame], true);
            }
          }
        } as any)}
      />
    </div>
  );
});

