import { motion } from 'framer-motion';
import { ProfilePicture3D } from '../components/ProfilePicture3D';

/** The cursor-drags-the-avatar opener, kept as the boot screen of the dashboard. */
export const Intro = ({ onDone }: { onDone: () => void }) => (
  <motion.div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'var(--paper)' }}
    initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] } }}>
    <div className="flex flex-col items-center gap-6">
      <ProfilePicture3D onAnimationComplete={() => setTimeout(onDone, 500)} />
    </div>
    <button type="button" onClick={onDone} className="absolute bottom-8 right-8 text-[13px] font-medium text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors">Skip intro</button>
  </motion.div>
);
