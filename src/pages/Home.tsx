import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { HeroSection } from '../components/HeroSection';
import { WorkCards } from '../components/WorkCards';
import { PlaygroundSection } from '../components/PlaygroundSection';
import { WorldGate } from '../components/WorldGate';
import { AboutSection } from '../components/AboutSection';
import { useScrollControl } from '../components/SmoothScroll';

export const Home = ({ onReveal }: { onReveal: (n: number) => void }) => {
  const reduce = useReducedMotion();
  const [revealStep, setRevealStep] = useState(0);
  const { stopScroll, startScroll } = useScrollControl();

  // Lock scroll until the hero animation is complete
  useEffect(() => {
    if (revealStep < 3) stopScroll(); else startScroll();
    return () => startScroll();
  }, [revealStep, stopScroll, startScroll]);

  useEffect(() => { onReveal(revealStep); }, [revealStep, onReveal]);

  return (
    <>
      <HeroSection onRevealStepChange={setRevealStep} />
      {revealStep >= 3 && (
        <>
          {/* The work rises into the same frame as the logos: pulled up under the end of the
              pinned hero, it fades and slides in a beat after its top edge appears. */}
          <motion.div
            className={reduce ? 'relative z-20' : 'relative z-20 -mt-[12svh] md:-mt-[36svh]'}
            initial={{ opacity: 0, y: 90 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <WorkCards />
          </motion.div>
          {/* the playground: small tools (on phones this is where the skill cards were) */}
          <PlaygroundSection />
          <WorldGate />
          <AboutSection />
        </>
      )}
    </>
  );
};
