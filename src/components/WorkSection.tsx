import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface ProjectProps {
  title: string;
  subtitle: string;
  category: string;
  color: string;
  image: string;
  link: string;
  index?: number;
}

const projects = [
  {
    title: "Website Design and Product Experience for ekai",
    subtitle: "Interaction Design / Product Design",
    category: "B2B SaaS",
    color: "rgb(248, 242, 248)",
    image: "https://framerusercontent.com/images/Pe50ywX86rDfidaxqEPq1hHV4W4.png",
    link: "https://keerthivardhan.framer.website/Work/appproject11"
  },
  {
    title: "Misfits: Connecting Through Communities",
    subtitle: "UX/UI Design",
    category: "Mobile App",
    color: "rgb(222, 241, 250)",
    image: "https://framerusercontent.com/images/ohaffIRt0xglZU0U2rKGdrcYD5o.png",
    link: "https://keerthivardhan.framer.website/Work/AppProject2"
  },
  {
    title: "Redesigning the Delhi Metro Experience",
    subtitle: "System Design",
    category: "Public Transport",
    color: "rgb(252, 235, 239)",
    image: "https://framerusercontent.com/images/YijBlctGzn0Mk4J6rFwf6TL43P0.png",
    link: "https://keerthivardhan.framer.website/Work/AppProject1"
  },
  {
    title: "Empowering Real Estate",
    subtitle: "CRM Application | Website design",
    category: "Real Estate",
    color: "rgb(244, 237, 255)",
    image: "https://framerusercontent.com/images/Sk5TswNLO6gk2IJhTVRELrLDT08.png",
    link: "https://keerthivardhan.framer.website/Work/AppProject1"
  }
];

const StarryBackground = ({ progress }: { progress: any }) => {
  // Fade in stars much earlier: Start at 0.1 scroll, fully visible by 0.3
  const opacity = useTransform(progress, [0.1, 0.3], [0, 1]);
  
  // Generate static stars with reduced density
  const stars = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 2 + 1,
    delay: Math.random() * 2
  }));

  // Generate meteors with reduced count
  const meteors = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100, // Distributed across full height
    delay: Math.random() * 10,
    duration: Math.random() * 2 + 1
  }));

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10"
      style={{ opacity, willChange: 'opacity' }}
    >
      {/* Twinkling Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Meteor Showers */}
      {meteors.map((meteor) => (
        <motion.div
          key={meteor.id}
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            width: '100px',
            left: `${meteor.x}%`,
            top: `${meteor.y}%`,
            rotate: 45,
          }}
          animate={{ 
            x: [-100, 200], 
            y: [-100, 200],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: meteor.delay,
            repeatDelay: Math.random() * 5 + 3,
            ease: "linear"
          }}
        />
      ))}
    </motion.div>
  );
};

const ProjectCard = ({ project, index }: { project: ProjectProps; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="sticky top-24 w-full max-w-[1240px] min-h-[500px] md:min-h-[620px] rounded-[32px] md:rounded-[40px] p-8 md:p-16 flex flex-col-reverse md:flex-row gap-8 md:gap-10 items-center justify-between overflow-hidden border border-white/10"
      style={{ 
        backgroundColor: 'rgba(17, 17, 17, 0.95)', // Increased opacity to avoid heavy backdrop blur
        boxShadow: `0 0 40px -10px ${project.color}22` // Reduced spread and opacity for performance
      }}
    >
      {/* Performance optimization: Removed blur-[120px] glow div and backdrop-blur */}

      {/* Text Content */}
      <div className="flex flex-col gap-6 md:gap-10 w-full md:w-1/2 z-10">
        <div className="flex flex-col gap-4 md:gap-6">
          <span 
            className="text-xs md:text-sm font-bold tracking-widest uppercase text-white/60"
          >{project.subtitle}</span>
          <h2 className="text-3xl md:text-6xl font-bold leading-tight text-white">
            {project.title}
          </h2>
        </div>
        <div className="flex gap-4">
          <a 
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-white text-black hover:bg-[#DF95FF] hover:scale-105"
          >
            View Case Study
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Image/Preview - Floating Glass Effect */}
      <div className="w-full md:w-1/2 h-full relative min-h-[240px] md:min-h-full flex items-center justify-center z-10">
         <motion.a 
           href={project.link}
           target="_blank"
           rel="noopener noreferrer"
           className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl block cursor-pointer"
           whileHover={{ scale: 1.02, rotateY: 5 }}
           transition={{ type: "spring", stiffness: 100 }}
         >
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
         </motion.a>
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
            className="absolute inset-0 bg-black z-20"
            style={{ willChange: 'height' }}
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
                   <stop offset="0%" stopColor="#000000" />
                   <stop offset="50%" stopColor="#000000" />
                   <stop offset="100%" stopColor="#1a1a1a" />
                 </linearGradient>
               </defs>
               
               <g>
                  {/* 1. Flat Buffer Zone */}
                  <rect x="0" y="0" width="1440" height="60" fill="black" />
                  
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
          className="flex flex-col gap-20 w-full items-center"
          style={{ opacity: contentOpacity, y: contentY, willChange: 'opacity, transform' }}
        >
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
