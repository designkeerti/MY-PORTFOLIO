import { Hoops } from './Hoops';

/** About me as one card: a game on top, the person underneath. */
const Social = ({ href, label, icon }: { href: string; label: string; icon: string }) => (
  <a href={href} target={href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer" aria-label={label} title={label} className="about-social"><i className={`ph-bold ${icon}`} aria-hidden="true" /></a>
);

const Interest = ({ icon, label }: { icon: string; label: string }) => (
  <span className="about-pill"><span aria-hidden="true">{icon}</span>{label}</span>
);

export const AboutColumn = () => (
  <div className="about-col h-full flex flex-col px-6 pt-5 pb-5 min-h-0">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 bg-white/80 px-3.5 py-1.5 rounded-full border border-white/40 shadow-sm">
        <span>👋</span><span className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">About me</span>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Social href="https://www.linkedin.com/in/vardhankeerti/" label="LinkedIn" icon="ph-linkedin-logo" />
        <Social href="https://x.com/ikeerthivardhan" label="Twitter" icon="ph-x-logo" />
        <Social href="https://www.instagram.com/poemsbyraahgir/" label="Instagram" icon="ph-instagram-logo" />
        <Social href="mailto:design.keerti@gmail.com" label="Email" icon="ph-envelope-simple" />
      </div>
    </div>

    <div className="about-one flex-1 min-h-0 flex flex-col overflow-hidden rounded-[22px] bg-white/90 shadow-lg border border-white/60">
      <Hoops />

      <div className="about-card flex flex-col gap-2.5 shrink-0 border-t border-black/5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h3 className="about-h3 font-bold text-gray-900 leading-tight">I'm Keerthi Vardhan.</h3>
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" />OPEN TO WORK</span>
        </div>
        <p className="about-hide-1 text-[13.5px] text-gray-500 font-medium -mt-1">Designing with purpose, heart, &amp; <span className="text-[#DF95FF]">rhythm.</span></p>
        <p className="about-text text-gray-600 leading-relaxed">
          I’m an Experience Designer who blends empathy, creativity, and a touch of fun. With a <span className="about-chip text-black font-semibold bg-[#DF95FF]/20 px-1 rounded">B.Tech in Aerospace Engineering</span> and a <span className="about-chip text-black font-semibold bg-[#FFAA95]/20 px-1 rounded">Master’s in UX Design</span>, my journey has been anything but ordinary.
        </p>
        <div className="flex gap-2 pt-0.5">
          <button type="button" className="px-4 py-2 bg-black text-white rounded-full text-[12.5px] font-medium hover:bg-[#DF95FF] transition-colors duration-300 shadow-lg shadow-[#DF95FF]/20 whitespace-nowrap">Download Resume</button>
          <a href="mailto:design.keerti@gmail.com" className="px-4 py-2 bg-white text-black border border-gray-200 rounded-full text-[12.5px] font-medium hover:bg-gray-50 transition-colors duration-300 whitespace-nowrap">Send me a message</a>
        </div>
        <div className="about-hide-2 flex flex-wrap items-center gap-1.5 pt-1.5" aria-label="Offline mode">
          <Interest icon="🏀" label="Basketball" />
          <Interest icon="✍️" label="Poetry" />
          <Interest icon="📚" label="Novels" />
        </div>
      </div>
    </div>

    <div className="pt-2.5 border-t border-gray-200">
      <p className="text-gray-400 text-[11px] leading-tight whitespace-nowrap">© 2025 · Vibecoded the shit out of this.</p>
    </div>
  </div>
);
