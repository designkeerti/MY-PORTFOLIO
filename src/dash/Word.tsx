import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const words = ['Interfaces', 'Experiences', 'Products', 'Animations', 'Websites'];

/** The rotating word from the old hero, laid out so the longest word reserves the space and nothing jumps. */
export const Word = () => {
  const [i, setI] = useState(3);
  useEffect(() => { const t = setInterval(() => setI(k => (k + 1) % words.length), 2200); return () => clearInterval(t); }, []);
  return (
    <span className="inline-grid text-left align-baseline" style={{ color: 'var(--accent-ink)' }}>
      {words.map(w => <span key={w} aria-hidden="true" className="invisible whitespace-nowrap" style={{ gridArea: '1 / 1' }}>{w}</span>)}
      <AnimatePresence mode="wait">
        <motion.span key={words[i]} className="whitespace-nowrap font-semibold" style={{ gridArea: '1 / 1' }}
          initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.45, ease: 'easeInOut' }}>{words[i]}</motion.span>
      </AnimatePresence>
    </span>
  );
};
