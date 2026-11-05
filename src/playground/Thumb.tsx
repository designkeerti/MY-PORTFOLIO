import type { Tool } from './data';

/** Tiny previews of each tool, in CSS only (cheap enough to sit on the home page). */
export function ToolThumb({ slug, className = '' }: { slug: Tool['slug']; className?: string }) {
  if (slug === 'shader') return <span aria-hidden className={`pg-thumb-shader block overflow-hidden ${className}`} />;
  if (slug === 'type') return (
    <span aria-hidden className={`flex items-center justify-center gap-0.5 overflow-hidden bg-[#f7f6f2] text-[#17191e] ${className}`}>
      <span style={{ fontFamily: "'Chillax', sans-serif", fontWeight: 600, fontSize: '1.45em', lineHeight: 1 }}>A</span>
      <span style={{ fontFamily: "'Sofia Sans', sans-serif", fontSize: '1.2em', lineHeight: 1 }}>a</span>
    </span>
  );
  return (
    <span aria-hidden className={`grid grid-cols-2 overflow-hidden ${className}`}>
      {['#2c8bc6', '#b5dbed', '#ff8a3d', '#17191e'].map(c => <span key={c} style={{ background: c }} />)}
    </span>
  );
}
