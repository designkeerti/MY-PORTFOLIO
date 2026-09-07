export type Brand = { name: string; bg: string; cc: string; flag: string; logo: string };
export const brands: Brand[] = [
  { name: 'APOLLON NUTRITION', bg: '#2a1014', cc: 'us', flag: '🇺🇸', logo: 'apollon-nutrition' },
  { name: 'ANARCHY LABS', bg: '#1a0408', cc: 'us', flag: '🇺🇸', logo: 'anarchy-labs' },
  { name: 'BAKE NUTRITION', bg: '#1e1a14', cc: 'in', flag: '🇮🇳', logo: 'bake-nutrition' },
  { name: 'BEAST PHARM', bg: '#0a0d12', cc: 'gb', flag: '🇬🇧', logo: 'beast-pharm' },
  { name: 'COMBAT FUEL', bg: '#2d3a2a', cc: 'gb', flag: '🇬🇧', logo: 'combat-fuel' },
  { name: 'GENIUS NUTRITION', bg: '#1f0e1a', cc: 'ro', flag: '🇷🇴', logo: 'genius-nutrition' },
  { name: 'PER4M', bg: '#0d2848', cc: 'gb', flag: '🇬🇧', logo: 'per4m' },
  { name: 'BLACK LION', bg: '#1a1812', cc: 'us', flag: '🇺🇸', logo: 'black-lion' },
  { name: 'STROM', bg: '#3a1f25', cc: 'gb', flag: '🇬🇧', logo: 'strom' },
  { name: 'GASP', bg: '#1c1c1c', cc: 'se', flag: '🇸🇪', logo: 'gasp-v2' },
  { name: 'BETTER BODIES', bg: '#0c1016', cc: 'se', flag: '🇸🇪', logo: 'better-bodies-v2' },
];

/* The live brand rail: perforated stamps with the country flag underneath. Desktop reveals on hover;
   `lit` forces the reveal (the preview runs a wave through the sheet). */
export const StampSheet = ({ items = brands, lit = [], cols, className = '', style }: { items?: Brand[]; lit?: number[]; cols?: number; className?: string; style?: React.CSSProperties }) => (
  <div className={`cbs-home__brand-rail ${className}`} style={{ ...(cols ? { gridTemplateColumns: `repeat(${cols}, 1fr)` } : {}), ...style }}>
    {items.map((b, i) => (
      <a key={b.name} className={`cbs-brand-chip ${lit.includes(i) ? 'is-lit' : ''}`} href={`https://crossbordersupps.com/brand/${b.logo.replace('-v2', '')}/`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
        style={{ ['--brand-bg' as string]: b.bg, ['--flag-bg' as string]: `url(/cbs/flags/${b.cc}.png)` }}>
        <img className="cbs-brand-chip__logo-img" src={`/cbs/brands/${b.logo}.png`} alt={b.name} loading="lazy" />
        <div className="cbs-brand-chip__ft"><span className="cbs-brand-chip__flag" aria-hidden="true">{b.flag}</span><h3 className="cbs-brand-chip__name">{b.name}</h3></div>
      </a>
    ))}
  </div>
);
