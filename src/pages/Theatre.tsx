import { useState } from 'react';
import { motion } from 'framer-motion';
import { projects } from '../content/projects';
import { HeroColumn } from '../theatre/HeroColumn';
import { Screen } from '../theatre/Screen';
import { AboutColumn } from '../theatre/AboutColumn';

/** One viewport, no scrolling: the hero on the left, the film screen in the middle, about me on the right. */
export const Theatre = () => {
  const [cur, setCur] = useState(0);
  const [ready, setReady] = useState(false);
  return (
    <div className="theatre">
      <div className="theatre-grid">
        <aside className="theatre-col"><HeroColumn onReady={() => setReady(true)} /></aside>
        <motion.main className="theatre-col theatre-main" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <Screen projects={projects} current={cur} onPick={setCur} />
        </motion.main>
        <motion.aside className="theatre-col" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 0.7, delay: 0.25 }}>
          <AboutColumn />
        </motion.aside>
      </div>
    </div>
  );
};
