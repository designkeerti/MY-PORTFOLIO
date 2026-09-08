import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ProfilePicture3D } from '../components/ProfilePicture3D';
import { SlidingText } from '../components/SlidingText';
import { MusicPlayer } from '../components/MusicPlayer';

const ease = [0.25, 0.1, 0.25, 1] as const;

const Tile = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div title={label} className="hero-tile bg-white rounded-[20px] flex items-center justify-center shadow-sm border border-gray-100 hover:scale-105 transition-transform duration-300">{children}</div>
);

/**
 * The greeting: the pill, then a chat bubble beneath it for the line a pill this wide has to cut off.
 * Idle, the bubble shows a typing indicator; hover (or the intro) swaps in the line. Nothing else moves.
 */
const Hello = ({ auto }: { auto: boolean }) => {
  const [hover, setHover] = useState(false);
  const open = hover || auto;
  return (
    <div className="hello-wrap" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <motion.div className="hello" animate={{ scale: open ? 1.04 : 1 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
        <span className="hello__l1">Hi I'm Keerthi 👋</span>
      </motion.div>
      <div className="hello-bubble">
        <motion.span className="hello-dots" aria-hidden="true" initial={false} animate={{ opacity: open ? 0 : 1, scale: open ? 0.85 : 1 }} transition={{ duration: 0.18 }}>
          <i /><i /><i />
        </motion.span>
        <motion.span className="hello__l2" initial={false} animate={{ opacity: open ? 1 : 0, y: open ? 0 : -6, scale: open ? 1 : 0.96 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
          I want to be rich enough to feed<br />every animal 🐱 around me
        </motion.span>
      </div>
    </div>
  );
};

/** The original hero, exactly as it stacks on a phone. `onStep` reports the reveal sequence (3 = done). */
export const HeroColumn = ({ skip, onStep }: { skip: boolean; onStep?: (n: number) => void }) => {
  const [step, setStep] = useState(skip ? 3 : 0);
  const [auto, setAuto] = useState(false);
  useEffect(() => { onStep?.(step); }, [step, onStep]);

  const done = () => {
    setTimeout(() => setStep(1), 200);
    setTimeout(() => setStep(2), 700);
    setTimeout(() => { setStep(3); setTimeout(() => { setAuto(true); setTimeout(() => setAuto(false), 2400); }, 1100); }, 1200);
  };

  return (
    <div className="hero-stack h-full w-full flex flex-col items-center justify-center px-6 min-h-0">
      <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : -24 }} transition={{ duration: 0.6, ease }}>
        <Hello auto={auto} />
      </motion.div>

      <div className="hero-dp"><ProfilePicture3D instant={skip} onAnimationComplete={done} /></div>

      <motion.div className="flex flex-col items-center gap-1 text-center" initial={{ opacity: 0, y: 24 }} animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 24 }} transition={{ duration: 0.6, ease }}>
        <h1 className="text-[30px] font-medium text-text-primary opacity-90 leading-none">I design</h1>
        <div className="text-[38px] font-bold leading-none"><SlidingText /></div>
      </motion.div>

      <motion.div className="hero-tiles grid grid-cols-3" initial={{ opacity: 0, y: 24 }} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 24 }} transition={{ duration: 0.6, ease }}>
        <Tile label="Figma"><svg viewBox="0 0 24 24" className="w-[40%] h-[40%] fill-black" xmlns="http://www.w3.org/2000/svg"><path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z"/></svg></Tile>
        <Tile label="Adobe"><img src="https://framerusercontent.com/images/W07nH8VDiwrgbmo4r8CmiIChg.png" alt="Adobe" className="w-[52%] h-[52%] object-contain" /></Tile>
        <Tile label="Rive"><span className="font-bold text-[13px] tracking-wide">RIVE</span></Tile>
        <Tile label="ChatGPT"><img src="https://framerusercontent.com/images/FRggyEbUloy2PxkUIkcfqmFkXoM.png" alt="ChatGPT" className="w-[52%] h-[52%] object-contain" /></Tile>
        <Tile label="Claude"><img src="/icons/claude.svg" alt="Claude" className="w-[46%] h-[46%] object-contain" /></Tile>
        <Tile label="Spline"><img src="https://framerusercontent.com/images/nWQ4pwGhNTr4aeYi8lUshZsc.png" alt="Spline" className="w-[52%] h-[52%] object-contain" /></Tile>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 16 }} transition={{ duration: 0.6, delay: 0.15, ease }}>
        <MusicPlayer />
      </motion.div>
    </div>
  );
};
