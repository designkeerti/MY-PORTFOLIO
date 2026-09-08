const socials = [
  { href: 'https://www.linkedin.com/in/vardhankeerti/', icon: 'ph-linkedin-logo', label: 'LinkedIn' },
  { href: 'https://x.com/ikeerthivardhan', icon: 'ph-x-logo', label: 'X' },
  { href: 'https://www.instagram.com/poemsbyraahgir/', icon: 'ph-instagram-logo', label: 'Instagram' },
  { href: 'mailto:design.keerti@gmail.com', icon: 'ph-envelope-simple', label: 'Email' },
];

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5 py-3.5 border-t border-[var(--line)]">
    <div className="d-label">{label}</div>
    <div className="text-[13.5px] leading-[1.55] text-[var(--ink)]">{children}</div>
  </div>
);

/** The profile, in the shape of a profile card: photo, name, then the facts in rows. */
export const ProfileCard = ({ compact = false }: { compact?: boolean }) => (
  <div className={`d-card overflow-hidden flex ${compact ? 'flex-col sm:flex-row' : 'flex-col'}`}>
    <div className={`relative shrink-0 ${compact ? 'sm:w-[40%] aspect-[4/3] sm:aspect-auto sm:min-h-[320px]' : 'aspect-[4/4.6]'} m-2 rounded-[10px] overflow-hidden bg-[#eee]`}>
      <img src="https://framerusercontent.com/images/HJQw8ElsRLJCST5Te5LibBGNdY.jpeg" alt="Keerthi Vardhan" className="absolute inset-0 w-full h-full object-cover" />
    </div>

    <div className="px-4 pb-4 pt-2 flex flex-col min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3 pb-3.5">
        <div>
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--ink)]">Keerthi Vardhan</div>
          <div className="text-[13.5px] text-[var(--ink-2)] mt-0.5">Experience Designer</div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--ink-2)] pt-1 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Open to work</span>
      </div>

      <Row label="About">I blend empathy, creativity, and a touch of fun. My journey has been anything but ordinary.</Row>
      <Row label="Education">B.Tech in Aerospace Engineering<br />Master’s in UX Design</Row>
      <Row label="On design"><span className="text-[var(--ink-2)]">“Great design isn’t just about how it works, it’s about how it feels.”</span></Row>
      <Row label="Off screen">Basketball, poetry, novels, and every animal in the neighbourhood.</Row>

      <div className="flex gap-2 pt-4 border-t border-[var(--line)]">
        <a href="mailto:design.keerti@gmail.com" className="d-btn d-btn--ink flex-1">Message</a>
        <a href="https://www.linkedin.com/in/vardhankeerti/" target="_blank" rel="noreferrer" className="d-btn flex-1">LinkedIn</a>
      </div>
      <div className="flex items-center gap-1 pt-3 -ml-1.5">
        {socials.map(s => <a key={s.label} href={s.href} target={s.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer" aria-label={s.label} className="w-8 h-8 grid place-items-center rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--line-2)]"><i className={`ph-bold ${s.icon} text-[17px]`} /></a>)}
      </div>
    </div>
  </div>
);
