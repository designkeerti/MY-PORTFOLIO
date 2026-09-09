import { useState, useEffect } from 'react';
import { HeroSection } from '../components/HeroSection';
import { WorkFlow } from '../components/WorkFlow';
import { SkillsSection } from '../components/SkillsSection';
import { AboutSection } from '../components/AboutSection';
import { useScrollControl } from '../components/SmoothScroll';

export const Home = ({ onReveal, onDarkModeChange }: { onReveal: (n: number) => void; onDarkModeChange: (d: boolean) => void }) => {
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
          <WorkFlow onDarkModeChange={onDarkModeChange} />
          <SkillsSection />
          <AboutSection />
        </>
      )}
    </>
  );
};
