import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const words = ["Interfaces", "Experiences", "Products", "Animations", "Websites"];

export const SlidingText = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[1.2em] overflow-visible inline-flex items-center justify-center min-w-[322px] text-[#DF95FF]">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="whitespace-nowrap font-bold"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

