import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeroSection } from '../components/HeroSection';
import { WorkFlow } from '../components/WorkFlow';
import { WorldGate } from '../components/WorldGate';
import { SkillsSection } from '../components/SkillsSection';
import { AboutSection } from '../components/AboutSection';
import { useScrollControl } from '../components/SmoothScroll';

export const Home = ({ onReveal }: { onReveal: (n: number) => void }) => {
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
          {/* the work arrives after the hero sequence: fades and slides up, a beat late */}
          <motion.div
            initial={{ opacity: 0, y: 90 }}
            whileInView={{ opacity: 1, y: 0 }}
            // trigger on its top edge (it is many screens tall, so a share of it would never fit)
            viewport={{ once: true, amount: 0, margin: '0px 0px -12% 0px' }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <WorkFlow />
          </motion.div>
          <WorldGate />
          <SkillsSection />
          <AboutSection />
        </>
      )}
    </>
  );
};
