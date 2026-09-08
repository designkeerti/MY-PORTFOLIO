import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProfilePicture3D } from '../components/ProfilePicture3D';
import { SlidingText } from '../components/SlidingText';
import { MusicPlayer } from '../components/MusicPlayer';
import { LottieAnimation } from '../components/LottieAnimation';

const ease = [0.25, 0.1, 0.25, 1] as const;

const Tile = ({ children }: { children: React.ReactNode }) => (
  <div className="hero-tile bg-white rounded-[20px] flex items-center justify-center shadow-sm border border-gray-100 hover:scale-105 transition-transform duration-300">{children}</div>
);

/** The original hero, exactly as it stacks on a phone, as the left panel of the page. */
export const HeroColumn = ({ onReady }: { onReady?: () => void }) => {
  const [skip] = useState(() => { try { return sessionStorage.getItem('introSeen') === '1'; } catch { return false; } });
  const [step, setStep] = useState(skip ? 3 : 0);
  const [hover, setHover] = useState(false);
  const [auto, setAuto] = useState(false);
  const fullRef = useRef<HTMLSpanElement>(null);
  const baseRef = useRef<HTMLSpanElement>(null);
  const [full, setFull] = useState(0);
  const [base, setBase] = useState(0);
  const lottieRef = useRef<{ handleHoverStart: () => void; handleHoverEnd: () => void } | null>(null);
  const open = hover || auto;

  useEffect(() => { try { sessionStorage.setItem('introSeen', '1'); } catch { /* private mode */ } }, []);
  useEffect(() => {
    if (fullRef.current) setFull(fullRef.current.scrollWidth + 4);
    if (baseRef.current) setBase(baseRef.current.scrollWidth);
  }, []);
  useEffect(() => { if (step >= 3) onReady?.(); }, [step, onReady]);

  const done = () => {
    setTimeout(() => setStep(1), 200);
    setTimeout(() => setStep(2), 800);
    setTimeout(() => { setStep(3); setTimeout(() => { setAuto(true); setTimeout(() => setAuto(false), 2000); }, 500); }, 1400);
  };

  return (
    <div className="h-full flex flex-col items-center px-6 pt-5 pb-6">
      <Link to="/" className="self-start inline-flex items-center font-bold text-xl tracking-tight text-text-primary group" onMouseEnter={() => lottieRef.current?.handleHoverStart()} onMouseLeave={() => lottieRef.current?.handleHoverEnd()}>
        <span className="group-hover:text-[#FFAA95] transition-colors">Keerthi Vardhan</span>
        <span className="inline-block w-[72px] h-[48px] -ml-2 -my-2"><LottieAnimation ref={lottieRef} path="/lottie/Cat is sleeping and rolling.json" width={72} height={72} loop autoplay className="bg-transparent" /></span>
      </Link>

      <div className="hero-stack flex-1 w-full flex flex-col items-center justify-center min-h-0">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : -30, scale: open ? 1.05 : 1 }}
          transition={{ opacity: { duration: 0.6, ease }, y: { duration: 0.6, ease }, scale: { type: 'spring', stiffness: 400, damping: 25 } }}
          className="rounded-full shadow-lg cursor-pointer overflow-hidden inline-flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DF95FF 0%, #FFAA95 100%)' }}
          onHoverStart={() => setHover(true)} onHoverEnd={() => setHover(false)}>
          <span ref={fullRef} className="text-base font-medium text-white absolute pointer-events-none" style={{ visibility: 'hidden', whiteSpace: 'nowrap' }}>Hi I'm Keerthi 👋 I want to be rich enough to feed every animal 🐱 around me</span>
          <span ref={baseRef} className="text-base font-medium text-white absolute pointer-events-none" style={{ visibility: 'hidden', whiteSpace: 'nowrap' }}>Hi I'm Keerthi 👋</span>
          <motion.div className="flex items-center whitespace-nowrap px-4 py-2" animate={{ width: open ? Math.min(full + 32, 300) : base + 32 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} style={{ overflow: 'hidden' }}>
            <span className="text-base font-medium text-white shrink-0">Hi I'm Keerthi 👋</span>
            <motion.span className="text-base font-medium text-white inline-block" animate={{ width: open ? full - base + 8 : 0, opacity: open ? 1 : 0, marginLeft: open ? 8 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} style={{ minWidth: 0, overflow: 'visible' }}>
              <span className="inline-block whitespace-nowrap">&nbsp;I want to be rich enough to feed every animal 🐱 around me</span>
            </motion.span>
          </motion.div>
        </motion.div>

        <div className="hero-dp"><ProfilePicture3D instant={skip} onAnimationComplete={done} /></div>

        <motion.div className="flex flex-col items-center gap-1 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 30 }} transition={{ duration: 0.6, ease }}>
          <h1 className="text-3xl font-medium text-text-primary opacity-90">I design</h1>
          <div className="text-4xl font-bold"><SlidingText /></div>
        </motion.div>

        <motion.div className="hero-tiles grid grid-cols-3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 30 }} transition={{ duration: 0.6, ease }}>
          <Tile><svg viewBox="0 0 24 24" className="w-[40%] h-[40%] fill-black" xmlns="http://www.w3.org/2000/svg"><path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z"/></svg></Tile>
          <Tile><img src="https://framerusercontent.com/images/W07nH8VDiwrgbmo4r8CmiIChg.png" alt="Adobe" className="w-[52%] h-[52%] object-contain" /></Tile>
          <Tile><span className="font-bold text-[13px]">RIVE</span></Tile>
          <Tile><img src="https://framerusercontent.com/images/FRggyEbUloy2PxkUIkcfqmFkXoM.png" alt="ChatGPT" className="w-[52%] h-[52%] object-contain" /></Tile>
          <Tile><svg viewBox="0 0 24 24" className="w-[40%] h-[40%] fill-black" xmlns="http://www.w3.org/2000/svg"><path d="M19.07 10.93C16.83 11.42 15.08 13.17 14.59 15.41C14.38 16.35 13.12 16.35 12.96 15.41C12.47 13.17 10.72 11.42 8.48 10.93C7.54 10.72 7.54 9.46 8.48 9.25C10.72 8.76 12.47 7.01 12.96 4.77C13.17 3.83 14.43 3.83 14.59 4.77C15.08 7.01 16.83 8.76 19.07 9.25C20.01 9.46 20.01 10.72 19.07 10.93ZM9.93 18.07C8.81 18.31 7.93 19.19 7.69 20.31C7.58 20.78 6.95 20.78 6.87 20.31C6.63 19.19 5.75 18.31 4.63 18.07C4.16 17.96 4.16 17.33 4.63 17.23C5.75 16.99 6.63 16.11 6.87 14.99C6.98 14.52 7.61 14.52 7.69 14.99C7.93 16.11 8.81 16.99 9.93 17.23C10.4 17.33 10.4 17.96 9.93 18.07Z"/></svg></Tile>
          <Tile><img src="https://framerusercontent.com/images/nWQ4pwGhNTr4aeYi8lUshZsc.png" alt="Spline" className="w-[52%] h-[52%] object-contain" /></Tile>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 20 }} transition={{ duration: 0.6, delay: 0.2, ease }}>
          <MusicPlayer />
        </motion.div>
      </div>
    </div>
  );
};
