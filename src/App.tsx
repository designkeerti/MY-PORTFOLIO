import { HeroSection } from './components/HeroSection';
import { Navigation } from './components/Navigation';
import { WorkSection } from './components/WorkSection';
import { SkillsSection } from './components/SkillsSection';
import { AboutSection } from './components/AboutSection';
import { useState, useEffect } from 'react';
import { useScrollControl } from './components/SmoothScroll';

function App() {
  const [revealStep, setRevealStep] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { stopScroll, startScroll } = useScrollControl();

  // Lock scroll until hero animation is complete (revealStep >= 3)
  useEffect(() => {
    if (revealStep < 3) {
      stopScroll();
    } else {
      startScroll();
    }
  }, [revealStep, stopScroll, startScroll]);

  return (
    <main className="w-full min-h-screen bg-white overflow-x-hidden selection:bg-[#DF95FF]/30 relative">
      <Navigation revealStep={revealStep} isDarkMode={isDarkMode} />
      <HeroSection onRevealStepChange={setRevealStep} />
      {revealStep >= 3 && (
        <>
          <WorkSection onDarkModeChange={setIsDarkMode} />
          <SkillsSection />
          <AboutSection />
        </>
      )}
    </main>
  );
}

export default App;
