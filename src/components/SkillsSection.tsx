import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const skills = [
  {
    title: "UX Design",
    desc: "Crafting intuitive journeys from wireframes to final prototypes.",
    icon: "🧭",
    gradient: "from-blue-400/20 to-cyan-400/20",
    border: "group-hover:border-blue-400/50"
  },
  {
    title: "UI Design",
    desc: "Polishing pixels to create interfaces that feel magical.",
    icon: "🎨",
    gradient: "from-purple-400/20 to-pink-400/20",
    border: "group-hover:border-purple-400/50"
  },
  {
    title: "UX Research",
    desc: "Digging deep into user data to find the 'why' behind the 'what'.",
    icon: "🧪",
    gradient: "from-green-400/20 to-emerald-400/20",
    border: "group-hover:border-green-400/50"
  },
  {
    title: "Prototyping",
    desc: "Building interactive models to test, validate, and iterate fast.",
    icon: "📱",
    gradient: "from-orange-400/20 to-amber-400/20",
    border: "group-hover:border-orange-400/50"
  },
  {
    title: "Vibecoding",
    desc: "Injecting pure soul into code. If it doesn't feel alive, it's not done.",
    icon: "⚡️",
    gradient: "from-yellow-400/20 to-red-400/20",
    border: "group-hover:border-yellow-400/50"
  },
  {
    title: "Collaboration",
    desc: "Bringing positive energy and clear communication to every team.",
    icon: "🤝",
    gradient: "from-pink-400/20 to-rose-400/20",
    border: "group-hover:border-pink-400/50"
  }
];

export const SkillsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Parallax effect
  const gridY = useTransform(scrollYProgress, [0, 1], [100, -200]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const gridScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={sectionRef} className="relative w-full max-w-[1300px] mx-auto px-6 py-20 md:py-32 flex flex-col gap-12 md:gap-20" style={{ paddingBottom: 'calc(8rem + 32px)' }}>
      
      {/* Parallax Grid Background */}
      <motion.div
        className="absolute z-0 pointer-events-none"
        style={{
          top: 0, left: 0, right: 0, height: 'calc(100% + 32px)',
          y: gridY, scale: gridScale, opacity: gridOpacity,
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 60% 100% at center, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 100% at center, black 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-12 md:gap-20">
        
        {/* Header - Centered & Clean */}
        <div className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md px-5 py-2 rounded-full border border-white/60 shadow-sm">
             <span className="text-lg">💡</span>
             <span className="font-bold text-gray-800 text-sm uppercase tracking-wide">My Toolkit</span>
          </div>
          <h2 className="text-3xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-500">
            Skills tailored for <br/> world-class products.
          </h2>
        </div>

        {/* Holographic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, i) => (
            <div key={i} className="relative group perspective-1000">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } }}
                className="relative rounded-[32px] transition-all duration-300 h-full"
                style={{ willChange: 'transform' }}
              >
                {/* Inner Card (Optimized: No blur, high opacity) */}
                <div className={`relative h-full p-6 md:p-8 rounded-[32px] flex flex-col justify-between min-h-[200px] md:min-h-[240px] overflow-hidden border border-white/60 bg-white/90 shadow-lg hover:shadow-2xl transition-all duration-300 ${skill.border}`}>
                    
                    {/* Gradient Orb Background */}
                    <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br ${skill.gradient} blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
                    
                    {/* Icon */}
                    <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center text-2xl md:text-3xl shadow-sm border border-white/50 group-hover:scale-110 transition-transform duration-300">
                        {skill.icon}
                    </div>

                    {/* Text */}
                    <div className="relative z-10 flex flex-col gap-2 mt-6">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">{skill.title}</h3>
                        <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed">
                        {skill.desc}
                        </p>
                    </div>
                    
                    {/* Hover Reveal Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ mixBlendMode: 'overlay' }} />
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
