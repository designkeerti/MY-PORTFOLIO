import type { ToolSlug } from './data';

/** Tiny previews of each tool, in CSS only (cheap enough to sit on the home page). */
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";

export function ToolThumb({ slug, className = '' }: { slug: ToolSlug; className?: string }) {
  const box = `overflow-hidden ${className}`;
  switch (slug) {
    case 'shader': return <span aria-hidden className={`pg-thumb-shader block ${box}`} />;
    case 'type': return (
      <span aria-hidden className={`flex items-center justify-center gap-0.5 bg-[#f7f6f2] text-[#17191e] ${box}`}>
        <span style={{ fontFamily: "'Chillax', sans-serif", fontWeight: 600, fontSize: '1.45em', lineHeight: 1 }}>A</span>
        <span style={{ fontFamily: "'Sofia Sans', sans-serif", fontSize: '1.2em', lineHeight: 1 }}>a</span>
      </span>
    );
    case 'picks': return (
      <span aria-hidden className={`grid grid-cols-2 ${box}`}>
        {['#2c8bc6', '#b5dbed', '#ff8a3d', '#17191e'].map(c => <span key={c} style={{ background: c }} />)}
      </span>
    );
    case 'contrast': return (
      <span aria-hidden className={`grid grid-cols-2 ${box}`}>
        <span className="flex items-center justify-center bg-[#17191e] font-semibold text-[#ffd27a]" style={{ fontSize: '1em' }}>Aa</span>
        <span className="flex items-center justify-center bg-[#ffd27a] font-semibold text-[#17191e]" style={{ fontSize: '1em' }}>Aa</span>
      </span>
    );
    case 'scales': return (
      <span aria-hidden className={`flex ${box}`}>
        {['#dbeefa', '#a9d4f0', '#6cb3e2', '#2c8bc6', '#1d6aa1', '#164d75', '#0f3150'].map(c => <span key={c} className="flex-1" style={{ background: c }} />)}
      </span>
    );
    case 'image-palette': return (
      <span aria-hidden className={`relative block ${box}`} style={{ background: "url('/world/bougainvillea-sky.jpg') center / cover" }}>
        <span className="absolute inset-x-0 bottom-0 flex h-[28%]">{['#c2185b', '#7cb342', '#90caf9', '#f5f5f5'].map(c => <span key={c} className="flex-1" style={{ background: c }} />)}</span>
      </span>
    );
    case 'type-scale': return (
      <span aria-hidden className={`flex items-end justify-center gap-[0.12em] bg-[#f7f6f2] pb-[14%] text-[#17191e] ${box}`} style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 600, lineHeight: 0.8 }}>
        <span style={{ fontSize: '0.55em' }}>A</span><span style={{ fontSize: '0.8em' }}>A</span><span style={{ fontSize: '1.15em' }}>A</span><span style={{ fontSize: '1.6em' }}>A</span>
      </span>
    );
    case 'easing': return (
      <span aria-hidden className={`flex items-center justify-center bg-[#f7f6f2] ${box}`}>
        <svg viewBox="0 0 40 40" className="h-[72%] w-[72%]"><path d="M4 36 C 13 36, 15 4, 36 4" fill="none" stroke="#17191e" strokeWidth="3" strokeLinecap="round" /><circle cx="13" cy="36" r="3" fill="#2c8bc6" /><circle cx="15" cy="4" r="3" fill="#ff6a2a" /></svg>
      </span>
    );
    case 'shadows': return (
      <span aria-hidden className={`flex items-center justify-center bg-[#dcebf4] ${box}`}>
        <span className="h-[46%] w-[58%] rounded-[22%] bg-white" style={{ boxShadow: '0 1px 1px rgba(15,30,55,.08), 0 3px 4px rgba(15,30,55,.08), 0 8px 10px rgba(15,30,55,.08), 0 14px 18px rgba(15,30,55,.07)' }} />
      </span>
    );
    case 'grain': return (
      <span aria-hidden className={`block ${box}`} style={{ background: `${GRAIN}, linear-gradient(150deg, #1f78bd, #8fcbef 60%, #f7f6f2)`, backgroundBlendMode: 'overlay, normal' }} />
    );
  }
}
