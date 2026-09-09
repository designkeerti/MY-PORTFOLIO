import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PreviewPlayer } from '../previews/PreviewPlayer';
import { projects as content } from '../content/projects';

interface ProjectProps {
  title: string;
  subtitle: string;
  category: string;
  color: string;
  image: string;
  link: string;
  /** matches a project in src/content, which supplies the animated preview */
  slug: string;
  /** true when the case study lives on this site rather than on Framer */
  internal?: boolean;
  index?: number;
}

export const projects: ProjectProps[] = [
  {
    title: "Cross Border Supps: An E-Commerce Storefront",
    subtitle: "Art Direction / Design System / Interaction Design",
    category: "E-Commerce",
    color: "rgb(222, 241, 250)",
    image: "/cbs/shots/home-hero.jpg",
    link: "/work/cbs",
    slug: "cbs",
    internal: true
  },
  {
    title: "Website Design and Product Experience for ekai",
    subtitle: "Interaction Design / Product Design",
    category: "B2B SaaS",
    color: "rgb(248, 242, 248)",
    image: "https://framerusercontent.com/images/Pe50ywX86rDfidaxqEPq1hHV4W4.png",
    link: "https://keerthivardhan.framer.website/Work/appproject11",
    slug: "ekai"
  },
  {
    title: "Misfits: Connecting Through Communities",
    subtitle: "UX/UI Design",
    category: "Mobile App",
    color: "rgb(222, 241, 250)",
    image: "https://framerusercontent.com/images/ohaffIRt0xglZU0U2rKGdrcYD5o.png",
    link: "https://keerthivardhan.framer.website/Work/AppProject2",
    slug: "misfits"
  },
  {
    title: "Redesigning the Delhi Metro Experience",
    subtitle: "System Design",
    category: "Public Transport",
    color: "rgb(252, 235, 239)",
    image: "https://framerusercontent.com/images/YijBlctGzn0Mk4J6rFwf6TL43P0.png",
    link: "https://keerthivardhan.framer.website/Work/AppProject1",
    slug: "dmrc"
  },
  {
    title: "Empowering Real Estate",
    subtitle: "CRM Application | Website design",
    category: "Real Estate",
    color: "rgb(244, 237, 255)",
    image: "https://framerusercontent.com/images/Sk5TswNLO6gk2IJhTVRELrLDT08.png",
    link: "https://keerthivardhan.framer.website/Work/AppProject1",
    slug: "infinity"
  }
];

const StarryBackground = ({ progress }: { progress: any }) => {
  const opacity = useTransform(progress, [0.1, 0.3], [0, 1]);
  const stars = useMemo(() => Array.from({ length: 36 }).map((_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 1.6 + 0.8, duration: Math.random() * 3 + 3, delay: Math.random() * 4,
  })), []);
  return (
    <motion.div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10" style={{ opacity, willChange: 'opacity' }}>
      {/* two soft pastel glows, the same ones the about section uses, drifting very slowly */}
      <motion.div className="absolute rounded-full" style={{ width: 640, height: 640, left: '-10%', top: '8%', background: 'radial-gradient(circle, rgba(223,149,255,.14), transparent 62%)', filter: 'blur(40px)' }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute rounded-full" style={{ width: 560, height: 560, right: '-8%', top: '46%', background: 'radial-gradient(circle, rgba(255,170,149,.12), transparent 62%)', filter: 'blur(40px)' }}
        animate={{ x: [0, -50, 0], y: [0, -60, 0] }} transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }} />
      {stars.map(star => (
        <motion.div key={star.id} className="absolute bg-white rounded-full" style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }}
          animate={{ opacity: [0.12, 0.6, 0.12] }} transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, ease: 'easeInOut' }} />
      ))}
    </motion.div>
  );
};

/** rgb(…) → rgba(…, a) for the pastel tints */
const tint = (rgb: string, a: number) => rgb.replace('rgb(', 'rgba(').replace(')', `, ${a})`);

export const ProjectCard = ({ project, index }: { project: ProjectProps; index: number }) => {
  const entry = useMemo(() => content.find(p => p.meta.slug === project.slug), [project.slug]);
  const scenes = useMemo(() => entry?.preview() ?? [], [entry]);
  const meta = entry?.meta;
  const blurb = meta ? meta.oneLiner.split(/(?<=\.)\s/)[0] : '';
  const facts = (entry?.facts ?? []).slice(0, 3);
  const ctaClass = "group inline-flex shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-[14px] md:text-[15px] px-5 py-2.5 md:px-6 md:py-3 transition-all duration-300 hover:scale-[1.03]";
  const arrow = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 0.61, 0.36, 1] }}
      className="sticky top-24 w-full max-w-[1240px] rounded-[28px] md:rounded-[36px] p-4 md:p-7 lg:p-9 flex flex-col md:flex-row gap-5 md:gap-9 items-stretch overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${tint(project.color, 0.09)} 0%, rgba(255,255,255,0.02) 46%, rgba(255,255,255,0) 100%), rgba(21, 19, 29, 0.92)`,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: `0 30px 80px -40px ${tint(project.color, 0.35)}, 0 1px 0 rgba(255,255,255,0.04) inset`,
      }}
    >
      {/* the reel comes first and takes the larger share of the card */}
      <div className="w-full md:w-[60%] lg:w-[62%] relative z-10">
        <motion.div className="relative w-full rounded-[20px] md:rounded-[24px] overflow-hidden" style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 50px -30px rgba(0,0,0,0.8)' }}
          whileHover={{ scale: 1.012 }} transition={{ type: "spring", stiffness: 140, damping: 18 }}>
          {scenes.length > 0
            ? <PreviewPlayer scenes={scenes} accent={project.color} />
            : <img src={project.image} alt={project.title} className="w-full aspect-[4/3] object-cover" />}
        </motion.div>
      </div>

      {/* what it is, in one breath */}
      <div className="flex flex-col justify-center gap-5 md:gap-6 w-full md:w-[40%] lg:w-[38%] z-10 px-1 pb-2 md:p-0">
        <div className="flex flex-col gap-3">
          <div className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: project.color, opacity: 0.85 }}>
            {meta ? `${meta.company} · ${meta.year}` : project.category}
          </div>
          <h2 className="text-[22px] md:text-[25px] lg:text-[28px] font-bold leading-[1.12] tracking-[-0.02em] text-white">
            {project.title}
          </h2>
          {blurb && <p className="text-[14px] md:text-[15px] leading-[1.55] text-white/60 max-w-[38ch]">{blurb}</p>}
        </div>
        {facts.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Project facts">
            {facts.map(f => (
              <li key={f} className="rounded-full px-3 py-1.5 text-[12px] leading-none text-white/85" style={{ background: tint(project.color, 0.1), border: `1px solid ${tint(project.color, 0.22)}` }}>{f}</li>
            ))}
          </ul>
        )}
        <div className="pt-1">
          {project.internal
            ? <Link to={project.link} className={ctaClass} style={{ ['--tint' as string]: project.color }} onMouseEnter={e => (e.currentTarget.style.background = project.color)} onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>View case study{arrow}</Link>
            : <a href={project.link} target="_blank" rel="noopener noreferrer" className={ctaClass} onMouseEnter={e => (e.currentTarget.style.background = project.color)} onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>View case study{arrow}</a>}
        </div>
      </div>
    </motion.div>
  );
};

export const WorkSection = ({ 
  onDarkModeChange,
}: { 
  onDarkModeChange?: (isDark: boolean) => void;
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Trigger: Start animation when the top of the section reaches the middle of the viewport
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 60%", "start -10%"] // Extended range to give more scroll time
  });

  // Dark Mode Trigger: Track when the section covers the navbar area
  const { scrollYProgress: darkModeScroll } = useScroll({
    target: sectionRef,
    offset: ["start 100px", "end 100px"]
  });

  useEffect(() => {
    return darkModeScroll.on("change", (v) => {
      if (onDarkModeChange) {
        // If we have started entering (v > 0) and haven't fully left (v < 1)
        // Actually useScroll with target maps the distance. 0 is start point, 1 is end point.
        // With ["start 100px", "end 100px"], 0 is when top is at 100px, 1 is when bottom is at 100px.
        // So if v > 0 && v < 1, we are intersecting the top area.
        onDarkModeChange(v > 0 && v < 1);
      }
    });
  }, [darkModeScroll, onDarkModeChange]);

  // Fluid Physics: Use spring to simulate viscosity/liquid inertia
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    mass: 1,
    restDelta: 0.001
  });

  // Paint Spill Animation:
  // Accelerate the fill: Reaches 100% height when scroll is only 60% done.
  // This ensures the screen is black BEFORE the section hits the top.
  const spillHeight = useTransform(smoothProgress, [0, 0.6], ["0px", "100%"]);
  
  // Opacity: Start fully transparent to hide the drips initially, then fade in smoother
  // Extended range to [0, 0.2] allows the paint to "materialize" more naturally as it starts flowing
  const paintOpacity = useTransform(smoothProgress, [0, 0.2], [0, 1]);
  
  // Stretch drips more aggressively as it speeds up/fills
  const dripStretch = useTransform(smoothProgress, [0, 0.3, 0.6], [1, 3, 1.5]);

  // Content Reveal: Trigger significantly earlier
  // Starts revealing when paint is mostly full (40% scroll) and completes quickly.
  // This ensures cards are visible well before they reach the top of the viewport.
  const contentOpacity = useTransform(smoothProgress, [0.4, 0.6], [0, 1]);
  const contentY = useTransform(smoothProgress, [0.4, 0.6], [100, 0]);

  return (
    <div className="relative w-full bg-white min-h-[200vh] z-20 overflow-hidden"> {/* Added min-h to allow scrolling without content */}
      
      {/* Paint Spill Layer */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ clipPath: 'inset(-200px -200px 0px -200px)' }}
      >
        <motion.div 
          className="absolute top-0 left-0 w-full"
          style={{ height: spillHeight, opacity: paintOpacity }}
        >
          {/* Solid Black Body - Fills the growing height */}
          <motion.div 
            className="absolute inset-0 z-20" 
            style={{ willChange: 'height', background: '#0f0d16' }}
          >
             <StarryBackground progress={smoothProgress} />
          </motion.div>

          {/* Drip Edge - Attached to bottom of the growing black body */}
          <motion.div 
            className="absolute top-full left-0 w-full h-[250px] -mt-[50px] z-10"
            style={{ scaleY: dripStretch, originY: 0, willChange: 'transform' }}
          >
            <motion.div
              className="w-full h-full"
              animate={{ 
                y: [0, 10, 0],
                scaleY: [1, 1.05, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ originY: 0, willChange: 'transform' }}
            >
               <svg 
               viewBox="0 0 1440 370" 
               preserveAspectRatio="none" 
               className="w-full h-full"
               style={{ display: 'block' }}
             >
               <defs>
                 {/* Optimized: Replaced expensive filter with simple gradient for performance */}
                 <linearGradient id="paint-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                   <stop offset="0%" stopColor="#0f0d16" />
                   <stop offset="50%" stopColor="#0f0d16" />
                   <stop offset="100%" stopColor="#1a1726" />
                 </linearGradient>
               </defs>
               
               <g>
                  {/* 1. Flat Buffer Zone */}
                  <rect x="0" y="0" width="1440" height="60" fill="#0f0d16" />
                  
                  {/* 2. The Drips */}
                  <g transform="translate(0, 50)">
                    <path 
                      d="M0,0 L1440,0 C1380,100 1260,120 1200,60 C1140,0 1080,150 1020,100 C960,50 900,250 840,150 C780,50 720,200 660,100 C600,0 540,120 480,60 C420,0 360,180 300,120 C240,60 180,250 120,150 C60,50 0,200 0,0 Z" 
                      fill="url(#paint-gradient)"
                    />
                    {/* Fake 3D Rim Light (Stroke) - Only on the curved bottom edge, NOT the top line */}
                    <path 
                      d="M1440,0 C1380,100 1260,120 1200,60 C1140,0 1080,150 1020,100 C960,50 900,250 840,150 C780,50 720,200 660,100 C600,0 540,120 480,60 C420,0 360,180 300,120 C240,60 180,250 120,150 C60,50 0,200 0,0" 
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1.5"
                      className="mix-blend-screen"
                    />
                  </g>
               </g>
             </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <section 
        ref={sectionRef} 
        id="work" 
        className="w-full max-w-[1400px] mx-auto px-4 pt-60 pb-20 flex flex-col gap-10 items-center relative z-10"
      >
        <motion.div 
          className="flex flex-col gap-16 md:gap-20 w-full items-center"
          style={{ opacity: contentOpacity, y: contentY, willChange: 'opacity, transform' }}
        >
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
              <span aria-hidden="true">✨</span>
              <span className="text-[12px] font-bold text-white/80 uppercase tracking-wider">Selected work</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/55 pb-1">Things I’ve made.</h2>
          </div>
          {projects.map((project, i) => (
            <div key={i} className="w-full flex justify-center">
              <ProjectCard 
                project={project} 
                index={i} 
              />
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};
