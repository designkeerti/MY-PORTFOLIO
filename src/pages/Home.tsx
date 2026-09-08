import { useState, useEffect } from 'react';
import { HeroSection } from '../components/HeroSection';
import { WorkSection } from '../components/WorkSection';
import { SkillsSection } from '../components/SkillsSection';
import { AboutSection } from '../components/AboutSection';
import { useScrollControl } from '../components/SmoothScroll';
import { Theatre } from './Theatre';

const useWide = () => {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1200px) and (min-height: 700px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1200px) and (min-height: 700px)');
    const on = () => setWide(mq.matches); mq.addEventListener('change', on); return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
};

export const Home = ({ onReveal, onDarkModeChange }: { onReveal: (n: number) => void; onDarkModeChange: (d: boolean) => void }) => {
  const wide = useWide();
  useEffect(() => { if (wide) onReveal(-1); }, [wide, onReveal]);
  if (wide) return <Theatre />;
  return <ClassicHome onReveal={onReveal} onDarkModeChange={onDarkModeChange} />;
};

const ClassicHome = ({ onReveal, onDarkModeChange }: { onReveal: (n: number) => void; onDarkModeChange: (d: boolean) => void }) => {
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
          <WorkSection onDarkModeChange={onDarkModeChange} />
          <SkillsSection />
          <AboutSection />
        </>
      )}
    </>
  );
};
