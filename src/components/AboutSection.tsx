import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { setBack } from './sky/sky';
import type { ReactNode } from 'react';
import { PawIcon, BallIcon, QuillIcon, BookIcon } from './icons/SkillIcons';

// frosted glass, as in the hero
const GLASS = 'border border-white/80 bg-white/65 backdrop-blur-md shadow-[0_24px_50px_-30px_rgba(15,30,55,0.55)]';

export const AboutSection = () => {
  // the sky rolls back in over the burn as this section rises into view (and back out on the way up)
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 60%'] });
  useMotionValueEvent(scrollYProgress, 'change', v => setBack(v));
  useEffect(() => { setBack(scrollYProgress.get()); return () => setBack(0); }, [scrollYProgress]);

  return (
    <section ref={ref} id="about" className="w-full relative z-10 py-20 md:py-32 overflow-hidden">
      

      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-8 md:gap-12"
        >
          {/* Section Header */}
          <div className="flex flex-col items-center text-center gap-4 mb-4 md:mb-8">
            <span className="rounded-full border border-white/80 bg-white/55 px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.22em] text-ink/70 backdrop-blur-md">About me</span>
            <h2 className="section-title text-[clamp(34px,5vw,64px)] leading-[1.02] text-ink pb-1">
              More than just pixels.
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[minmax(280px,auto)]">
            
            {/* 1. Main Bio Card - Optimized: No blur, high opacity */}
            <motion.div 
              whileHover={{ y: -5 }}
              className={`md:col-span-2 ${GLASS} rounded-[24px] p-6 md:p-12 flex flex-col justify-between gap-8 transition-all duration-300 group relative overflow-hidden`}
            >
               <div className="relative z-10">
                 <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
                   <h3 className="text-2xl md:text-4xl font-bold tracking-[-0.02em] text-ink leading-tight">
                     I'm Keerthi Vardhan.
                   </h3>
                   <span className="px-3 py-1 bg-green-500/15 text-green-800 text-xs font-bold rounded-full border border-green-600/25 flex items-center gap-1.5">
                     <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                     OPEN TO WORK
                   </span>
                 </div>
                 
                 <h4 className="text-lg md:text-xl text-ink/55 font-medium mb-4 md:mb-6">
                   Designing with purpose, heart, & <span className="font-semibold text-ink">rhythm.</span>
                 </h4>

                 <p className="text-ink/70 text-base md:text-lg leading-relaxed max-w-2xl">
                   I’m an Experience Designer who blends empathy, creativity, and a touch of fun. 
                   With a <span className="text-ink font-semibold bg-[#c4adff]/45 px-1 rounded">B.Tech in Aerospace Engineering</span> and a <span className="text-ink font-semibold bg-[#ffb68a]/45 px-1 rounded">Master’s in UX Design</span>, my journey has been anything but ordinary.
                 </p>
               </div>
               
               <div className="flex flex-col md:flex-row gap-3 md:gap-4 relative z-10">
                 <button className="w-full md:w-auto px-6 py-3 bg-ink text-white rounded-full font-medium hover:-translate-y-0.5 transition-transform duration-300">
                   Download Resume
                 </button>
                 <button className="w-full md:w-auto px-6 py-3 bg-white/40 text-ink border border-ink/20 rounded-full font-medium hover:border-ink/50 transition-colors duration-300">
                   Send me a message
                 </button>
               </div>

            </motion.div>

            {/* 2. Photo Card - Interactive */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="md:col-span-1 md:row-span-2 h-[300px] md:h-auto rounded-[24px] overflow-hidden relative shadow-[0_24px_50px_-30px_rgba(15,30,55,0.55)] border border-white/80 group"
            >
               <img 
                 src="/work/home/HJQw8ElsRLJCST5Te5LibBGNdY.webp" 
                 alt="Keerthi" 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
               <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 text-white z-10 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                 <p className="font-bold text-lg">That's me.</p>
                 <p className="text-white/80 text-sm">Always smiling</p>
               </div>
            </motion.div>

            {/* 3. Philosophy Card - Vibrant Gradient */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="rounded-[24px] p-8 md:p-10 flex flex-col justify-center items-center text-center border border-white/80 shadow-[0_24px_50px_-30px_rgba(15,30,55,0.55)] relative overflow-hidden group min-h-[240px] text-ink"
              style={{ background: 'linear-gradient(135deg,#efe6ff,#ffe7d6)' }}
            >
               <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-white/70 p-3 text-ink/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_-12px_rgba(15,30,55,0.4)] md:mb-6"><PawIcon /></span>
               <p className="text-lg md:text-2xl font-semibold tracking-[-0.01em] leading-snug relative z-10">
                 “I just want to be rich enough to feed every animal around me.”
               </p>
            </motion.div>

            {/* 4. Personal Interests - Optimized: No blur */}
            <motion.div 
              whileHover={{ y: -5 }}
              className={`${GLASS} rounded-[24px] p-8 flex flex-col group`}
            >
               <h3 className="text-ink/50 font-medium mb-6 uppercase tracking-[0.22em] text-xs flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-ink/40 rounded-full"></span>
                 Offline Mode
               </h3>
               
               <div className="flex flex-col gap-5 justify-center flex-1">
                 <InterestRow 
                   icon={<BallIcon />}
                   bg="linear-gradient(135deg,#ffe7d6,#ffb68a)" 
                   title="Basketball" 
                   desc="Teamwork & Rhythm" 
                 />
                 <InterestRow 
                   icon={<QuillIcon />}
                   bg="linear-gradient(135deg,#efe6ff,#c4adff)" 
                   title="Poetry" 
                   desc="Finding clarity in verse" 
                 />
                 <InterestRow 
                   icon={<BookIcon />}
                   bg="linear-gradient(135deg,#dcf2ff,#93d2f5)" 
                   title="Novels" 
                   desc="Exploring new worlds" 
                 />
               </div>
            </motion.div>

            {/* 5. Footer Integration - Sleek & Full Width */}
            <motion.div 
              className="md:col-span-3 mt-4 md:mt-8 border-t border-ink/15 pt-8 md:pt-12 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 pb-12 md:pb-0"
            >
               <div className="flex flex-col gap-1 text-center md:text-left order-2 md:order-1">
                 <span className="text-lg md:text-xl font-bold text-ink">Keerthi Vardhan</span>
                 <p className="text-ink/55 text-xs md:text-sm">© 2025. Vibecoded the shit out of this.</p>
               </div>

               <div className="flex flex-wrap justify-center gap-4 md:gap-8 order-1 md:order-2">
                 <SocialLink href="https://www.linkedin.com/in/vardhankeerti/" label="LinkedIn" />
                 <SocialLink href="https://x.com/ikeerthivardhan" label="Twitter" />
                 <SocialLink href="https://www.instagram.com/poemsbyraahgir/?next=%2Fpoemsbyraahgir%2F&hl=en" label="Instagram" />
                 <SocialLink href="mailto:design.keerti@gmail.com" label="Email" />
               </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

const InterestRow = ({ icon, bg, title, desc }: { icon: ReactNode, bg: string, title: string, desc: string }) => (
  <div className="group flex items-center gap-4 transition-transform duration-300 hover:translate-x-1.5">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] p-[11px] text-ink/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_-12px_rgba(15,30,55,0.4)]" style={{ background: bg }}>
      {icon}
    </div>
    <div>
      <p className="font-semibold text-ink text-lg leading-tight">{title}</p>
      <p className="text-sm text-ink/55">{desc}</p>
    </div>
  </div>
);

const SocialLink = ({ href, label }: { href: string; label: string }) => (
  <a 
    href={href} 
    className="text-ink/60 hover:text-ink font-medium transition-colors relative group"
  >
    {label}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-ink transition-all duration-300 group-hover:w-full" />
  </a>
);
