/** About me, compacted from the about section so it fits beside the screen. */
const Interest = ({ icon, bg, title, desc }: { icon: string; bg: string; title: string; desc: string }) => (
  <div className="flex items-center gap-3">
    <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center text-base shadow-sm shrink-0`}>{icon}</div>
    <div className="min-w-0">
      <p className="font-bold text-gray-800 text-[14px] leading-tight">{title}</p>
      <p className="about-hide-2 text-[12px] text-gray-500">{desc}</p>
    </div>
  </div>
);

const Social = ({ href, label }: { href: string; label: string }) => (
  <a href={href} target={href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer" className="text-gray-500 hover:text-[#DF95FF] font-medium transition-colors text-[13px]">{label}</a>
);

export const AboutColumn = () => (
  <div className="about-col h-full flex flex-col px-6 pt-5 pb-5 min-h-0">
    <div className="flex items-center gap-2 self-start bg-white/80 px-3.5 py-1.5 rounded-full border border-white/40 shadow-sm">
      <span>👋</span><span className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">About me</span>
    </div>

    <div className="about-photo rounded-[24px] overflow-hidden relative shadow-lg border border-white/20 shrink-0">
      <img src="https://framerusercontent.com/images/HJQw8ElsRLJCST5Te5LibBGNdY.jpeg" alt="Keerthi" className="w-full h-full object-cover" style={{ objectPosition: '50% 30%' }} />
    </div>

    <div className="about-card bg-white/90 rounded-[24px] shadow-lg border border-white/50 flex flex-col gap-2.5 shrink-0">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="about-h3 font-bold text-gray-900 leading-tight">I'm Keerthi Vardhan.</h3>
        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" />OPEN TO WORK</span>
      </div>
      <p className="about-hide-1 text-[14px] text-gray-500 font-medium -mt-1">Designing with purpose, heart, &amp; <span className="text-[#DF95FF]">rhythm.</span></p>
      <p className="about-text text-gray-600 leading-relaxed">
        I’m an Experience Designer who blends empathy, creativity, and a touch of fun. With a <span className="text-black font-semibold bg-[#DF95FF]/20 px-1 rounded">B.Tech in Aerospace Engineering</span> and a <span className="text-black font-semibold bg-[#FFAA95]/20 px-1 rounded">Master’s in UX Design</span>, my journey has been anything but ordinary.
      </p>
      <div className="flex flex-wrap gap-2 pt-0.5">
        <button type="button" className="px-4 py-2.5 bg-black text-white rounded-full text-[13px] font-medium hover:bg-[#DF95FF] transition-colors duration-300 shadow-lg shadow-[#DF95FF]/20">Download Resume</button>
        <a href="mailto:design.keerti@gmail.com" className="px-4 py-2.5 bg-white text-black border border-gray-200 rounded-full text-[13px] font-medium hover:bg-gray-50 transition-colors duration-300">Send me a message</a>
      </div>
    </div>

    <div className="grid grid-cols-[1fr_1.15fr] gap-3 min-h-0 shrink-0">
      <div className="about-card bg-gradient-to-br from-[#DF95FF] to-[#FFAA95] rounded-[24px] flex flex-col justify-center items-center text-center shadow-lg shadow-[#FFAA95]/30 border border-white/20">
        <span className="about-hide-2 text-2xl mb-2 drop-shadow-md">✨</span>
        <p className="about-text font-bold text-white leading-snug drop-shadow-sm">“Great design isn’t just about how it works, it’s about how it feels.”</p>
      </div>
      <div className="about-card bg-white/90 rounded-[24px] flex flex-col gap-2.5 shadow-lg border border-white/50">
        <h4 className="text-gray-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />Offline mode</h4>
        <Interest icon="🏀" bg="bg-orange-100" title="Basketball" desc="Teamwork & Rhythm" />
        <Interest icon="✍️" bg="bg-purple-100" title="Poetry" desc="Finding clarity in verse" />
        <Interest icon="📚" bg="bg-blue-100" title="Novels" desc="Exploring new worlds" />
      </div>
    </div>

    <div className="mt-auto flex flex-col gap-1 pt-2 border-t border-gray-200">
      <div className="flex gap-4">
        <Social href="https://www.linkedin.com/in/vardhankeerti/" label="LinkedIn" />
        <Social href="https://x.com/ikeerthivardhan" label="Twitter" />
        <Social href="https://www.instagram.com/poemsbyraahgir/" label="Instagram" />
        <Social href="mailto:design.keerti@gmail.com" label="Email" />
      </div>
      <p className="text-gray-500 text-[11.5px]">© 2025. Vibecoded the shit out of this.</p>
    </div>
  </div>
);
