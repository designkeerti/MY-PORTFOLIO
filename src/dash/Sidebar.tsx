import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { LottieAnimation } from '../components/LottieAnimation';
import { MusicPlayer } from '../components/MusicPlayer';
import { projects } from '../content/projects';

export const Brand = ({ className = '' }: { className?: string }) => {
  const lottieRef = useRef<{ handleHoverStart: () => void; handleHoverEnd: () => void } | null>(null);
  return (
    <Link to="/" className={`inline-flex items-center group ${className}`} onMouseEnter={() => lottieRef.current?.handleHoverStart()} onMouseLeave={() => lottieRef.current?.handleHoverEnd()}>
      <span className="font-semibold text-[16px] tracking-[-0.01em] text-[var(--ink)] whitespace-nowrap">Keerthi Vardhan</span>
      <span className="inline-block w-[56px] h-[40px] -ml-1.5 -my-2 pointer-events-auto"><LottieAnimation ref={lottieRef} path="/lottie/Cat is sleeping and rolling.json" width={56} height={56} loop autoplay className="bg-transparent" /></span>
    </Link>
  );
};

const NAV = [
  { id: 'top', icon: 'ph-house', label: 'Home' },
  { id: 'work', icon: 'ph-play-circle', label: 'Work' },
  { id: 'skills', icon: 'ph-squares-four', label: 'Skills' },
  { id: 'about', icon: 'ph-user', label: 'About' },
];

export const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** The left rail: navigation, the library of reels, and what is on repeat. */
export const Sidebar = ({ current, onPick, active }: { current: number; onPick: (i: number) => void; active: string }) => (
  <div className="d-card h-full flex flex-col p-3 gap-4 overflow-hidden">
    <div className="px-2 pt-2 pb-1"><Brand /></div>

    <nav className="d-nav flex flex-col gap-0.5" aria-label="Sections">
      {NAV.map(n => (
        <button key={n.id} type="button" className={active === n.id ? 'is-active' : ''} onClick={() => go(n.id)}>
          <i className={`ph-bold ${n.icon}`} aria-hidden="true" />{n.label}
        </button>
      ))}
      <a href="mailto:design.keerti@gmail.com"><i className="ph-bold ph-envelope-simple" aria-hidden="true" />Contact</a>
    </nav>

    <div className="border-t border-[var(--line)] pt-3 flex flex-col gap-1.5 min-h-0">
      <div className="d-label px-2 pb-1">Reels</div>
      <ul className="flex flex-col gap-0.5 overflow-auto d-scroll pr-0.5">
        {projects.map((p, i) => (
          <li key={p.meta.slug}>
            <button type="button" onClick={() => { onPick(i); go('work'); }} className={`d-row ${i === current ? 'is-active' : ''}`}>
              <img src={p.cover} alt="" loading="lazy" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-[var(--ink)] truncate">{p.meta.company}</span>
                <span className="block text-[11.5px] text-[var(--ink-3)] truncate">{p.meta.tag} · {p.meta.year}</span>
              </span>
              {i === current && <span className="d-eq" aria-hidden="true"><i /><i /><i /></span>}
            </button>
          </li>
        ))}
      </ul>
    </div>

    <div className="mt-auto border-t border-[var(--line)] pt-3 flex flex-col gap-2">
      <div className="d-label px-2">On repeat</div>
      <MusicPlayer />
    </div>
  </div>
);
