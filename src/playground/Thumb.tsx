import type { ToolSlug } from './data';

/** Tiny previews of each tool, in CSS only (cheap enough to sit on the home page). */
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";

export function ToolThumb({ slug, className = '' }: { slug: ToolSlug; className?: string }) {
  const box = `overflow-hidden ${className}`;
  switch (slug) {
    case 'tokens': return (
      // a palette, a type sample, a spacing staircase and three corners
      <span aria-hidden className={`grid grid-cols-2 gap-[0.07em] bg-[#f7f6f2] p-[0.16em] ${box}`}>
        <span className="flex overflow-hidden rounded-[0.08em]">{['#e1ecff', '#a2c2ff', '#4e86f9', '#2f6bed', '#0636a2'].map(c => <span key={c} className="flex-1" style={{ background: c }} />)}</span>
        <span className="flex items-center justify-center rounded-[0.08em] bg-white font-semibold text-[#17191e]" style={{ fontSize: '0.42em', fontFamily: "'Chillax', sans-serif" }}>Aa</span>
        <span className="flex items-end gap-[0.04em] rounded-[0.08em] bg-white p-[0.07em]">{[0.25, 0.45, 0.7, 1].map(h => <span key={h} className="flex-1 rounded-[0.02em] bg-[#2f6bed]" style={{ height: `${h * 100}%` }} />)}</span>
        <span className="flex items-center justify-center gap-[0.07em] rounded-[0.08em] bg-white">{[0, 0.07, 0.16].map(r => <span key={r} className="h-[0.3em] w-[0.3em] border-[0.035em] border-[#17191e]" style={{ borderRadius: `${r}em` }} />)}</span>
      </span>
    );
    case 'icons': return (
      <span aria-hidden className={`flex items-center justify-center gap-[0.18em] bg-[#f7f6f2] ${box}`}>
        <svg viewBox="0 0 24 24" style={{ width: '0.62em' }} fill="none" stroke="#17191e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.2s-7.6-4.7-7.6-10.4A4.4 4.4 0 0 1 12 7.1a4.4 4.4 0 0 1 7.6 2.7c0 5.7-7.6 10.4-7.6 10.4z" /></svg>
        <svg viewBox="0 0 24 24" style={{ width: '0.78em' }}><defs><linearGradient id="thumb-ic" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#ffe08a" /><stop offset=".55" stopColor="#f5a524" /><stop offset="1" stopColor="#c46f0c" /></linearGradient></defs><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="url(#thumb-ic)" /></svg>
        <svg viewBox="0 0 24 24" style={{ width: '0.62em' }} fill="#2c8bc6" stroke="#2c8bc6" strokeWidth="1.6" strokeLinejoin="round"><path d="M6.2 16.6v-5.1a5.8 5.8 0 0 1 11.6 0v5.1l1.6 1.9H4.6z" /><path d="M10 19.4a2 2 0 0 0 4 0z" /></svg>
      </span>
    );
    case 'jobs': return (
      // three openings, each with how well it fits
      <span aria-hidden className={`flex flex-col justify-center gap-[0.12em] bg-[#f7f6f2] px-[0.5em] ${box}`}>
        {[['#17191e', 92], ['#2f6bed', 81], ['#9aa3b2', 64]].map(([c, n]) => (
          <span key={n} className="flex items-center gap-[0.18em] rounded-[0.12em] bg-white px-[0.16em] py-[0.1em] shadow-[0_1px_3px_rgba(15,30,55,0.12)]">
            <span className="h-[0.28em] w-[0.28em] shrink-0 rounded-[0.06em]" style={{ background: c as string }} />
            <span className="h-[0.08em] flex-1 rounded-full bg-[#17191e]/20" />
            <span className="text-[0.2em] font-semibold tabular-nums text-[#17191e]/70">{n}%</span>
          </span>
        ))}
      </span>
    );
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
