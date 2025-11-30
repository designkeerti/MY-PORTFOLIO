import { motion } from 'framer-motion';

export const AboutSection = () => {
  return (
    <section id="about" className="w-full relative z-10 py-20 md:py-32 overflow-hidden">
      
      {/* Ambient Background Glows - Optimized: Removed mix-blend-mode, reduced blur */}
      <div className="absolute top-1/2 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#DF95FF]/10 rounded-full blur-[60px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#FFAA95]/10 rounded-full blur-[60px] translate-y-1/4 translate-x-1/2 pointer-events-none" />

      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-8 md:gap-12"
        >
          {/* Section Header */}
          <div className="flex flex-col items-center text-center gap-4 mb-4 md:mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
              <span>👋</span>
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">About Me</span>
            </div>
            <h2 className="text-3xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600 pb-2">
              More than just pixels.
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[minmax(280px,auto)]">
            
            {/* 1. Main Bio Card - Optimized: No blur, high opacity */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 bg-white/90 rounded-[32px] p-6 md:p-12 flex flex-col justify-between gap-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
            >
               <div className="relative z-10">
                 <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
                   <h3 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                     I'm Keerthi Vardhan.
                   </h3>
                   <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1.5 animate-pulse">
                     <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                     OPEN TO WORK
                   </span>
                 </div>
                 
                 <h4 className="text-lg md:text-xl text-gray-500 font-medium mb-4 md:mb-6">
                   Designing with purpose, heart, & <span className="text-[#DF95FF]">rhythm.</span>
                 </h4>

                 <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl">
                   I’m an Experience Designer who blends empathy, creativity, and a touch of fun. 
                   With a <span className="text-black font-semibold bg-[#DF95FF]/20 px-1 rounded">B.Tech in Aerospace Engineering</span> and a <span className="text-black font-semibold bg-[#FFAA95]/20 px-1 rounded">Master’s in UX Design</span>, my journey has been anything but ordinary.
                 </p>
               </div>
               
               <div className="flex flex-col md:flex-row gap-3 md:gap-4 relative z-10">
                 <button className="w-full md:w-auto px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-[#DF95FF] hover:scale-105 transition-all duration-300 shadow-lg shadow-[#DF95FF]/20">
                   Download Resume
                 </button>
                 <button className="w-full md:w-auto px-6 py-3 bg-white text-black border border-gray-200 rounded-full font-medium hover:bg-gray-50 hover:scale-105 transition-all duration-300">
                   Send me a message
                 </button>
               </div>

               {/* Decorative Gradient Blob */}
               <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-gradient-to-br from-[#DF95FF]/10 to-[#FFAA95]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            </motion.div>

            {/* 2. Photo Card - Interactive */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="md:col-span-1 md:row-span-2 h-[300px] md:h-auto rounded-[32px] overflow-hidden relative shadow-lg border border-white/20 group"
            >
               <img 
                 src="https://framerusercontent.com/images/HJQw8ElsRLJCST5Te5LibBGNdY.jpeg" 
                 alt="Keerthi" 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
               <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 text-white z-10 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                 <p className="font-bold text-lg">That's me! 📸</p>
                 <p className="text-white/80 text-sm">Always smiling</p>
               </div>
            </motion.div>

            {/* 3. Philosophy Card - Vibrant Gradient */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-[#DF95FF] to-[#FFAA95] rounded-[32px] p-8 md:p-10 flex flex-col justify-center items-center text-center shadow-lg shadow-[#FFAA95]/30 border border-white/20 relative overflow-hidden group min-h-[240px]"
            >
               <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               
               <span className="text-4xl md:text-5xl mb-4 md:mb-6 transform group-hover:scale-125 transition-transform duration-300 drop-shadow-md">✨</span>
               <p className="text-lg md:text-2xl font-bold text-white leading-relaxed relative z-10 drop-shadow-sm">
                 "Great design isn’t just about how it works, it’s about how it feels."
               </p>
            </motion.div>

            {/* 4. Personal Interests - Optimized: No blur */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/90 rounded-[32px] p-8 flex flex-col shadow-lg border border-white/50 hover:border-[#FFAA95]/50 transition-colors group"
            >
               <h3 className="text-gray-400 font-bold mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                 Offline Mode
               </h3>
               
               <div className="flex flex-col gap-5 justify-center flex-1">
                 <InterestRow 
                   icon="🏀" 
                   bg="bg-orange-100" 
                   title="Basketball" 
                   desc="Teamwork & Rhythm" 
                 />
                 <InterestRow 
                   icon="✍️" 
                   bg="bg-purple-100" 
                   title="Poetry" 
                   desc="Finding clarity in verse" 
                 />
                 <InterestRow 
                   icon="📚" 
                   bg="bg-blue-100" 
                   title="Novels" 
                   desc="Exploring new worlds" 
                 />
               </div>
            </motion.div>

            {/* 5. Footer Integration - Sleek & Full Width */}
            <motion.div 
              className="md:col-span-3 mt-4 md:mt-8 border-t border-gray-200 pt-8 md:pt-12 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 opacity-60 hover:opacity-100 transition-opacity duration-500 pb-12 md:pb-0"
            >
               <div className="flex flex-col gap-1 text-center md:text-left order-2 md:order-1">
                 <span className="text-lg md:text-xl font-bold text-gray-900">Keerthi Vardhan</span>
                 <p className="text-gray-500 text-xs md:text-sm">© 2025. Vibecoded the shit out of this.</p>
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

const InterestRow = ({ icon, bg, title, desc }: { icon: string, bg: string, title: string, desc: string }) => (
  <div className="flex items-center gap-4 group/item hover:translate-x-2 transition-transform duration-300">
    <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover/item:scale-110 transition-transform`}>
      {icon}
    </div>
    <div>
      <p className="font-bold text-gray-800 text-lg leading-tight">{title}</p>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  </div>
);

const SocialLink = ({ href, label }: { href: string; label: string }) => (
  <a 
    href={href} 
    className="text-gray-500 hover:text-[#DF95FF] font-medium transition-colors relative group"
  >
    {label}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#DF95FF] transition-all duration-300 group-hover:w-full" />
  </a>
);
