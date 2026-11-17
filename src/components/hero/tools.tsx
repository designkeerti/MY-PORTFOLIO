import type { ReactNode } from 'react';

const FigmaMark = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M8 24a4 4 0 0 0 4-4v-4H8a4 4 0 0 0 0 8Zm-4-12a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4Zm0-8a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4Zm8-4h4a4 4 0 0 1 0 8h-4V0Zm8 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" /></svg>
);
// Claude's spark: rays of uneven length round a point, in its terracotta
const CLAUDE_RAYS = [[0, 10], [31, 7.4], [58, 9.6], [92, 8], [121, 10], [149, 7.2], [180, 9.4], [211, 8.2], [238, 10], [270, 7.6], [301, 9.8], [329, 7.8]];
const ClaudeMark = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <g stroke="#D97757" strokeWidth="1.9" strokeLinecap="round">
      {CLAUDE_RAYS.map(([a, r]) => {
        const t = (a * Math.PI) / 180;
        return <line key={a} x1="12" y1="12" x2={12 + r * Math.cos(t)} y2={12 + r * Math.sin(t)} />;
      })}
    </g>
  </svg>
);
// The cards are light: marks stay dark as supplied.
const Img = ({ src }: { src: string; invert?: boolean }) => (
  <img src={src} alt="" className="h-4 w-4 object-contain opacity-85" draggable={false} />
);

export type Tool = {
  /** what the card is about: the thing made, not the software */
  makes: string;
  detail: string;
  tools: { name: string; mark: ReactNode }[];
};

export const TOOLS: Tool[] = [
  {
    makes: 'Interfaces & systems',
    detail: 'Product UI, components and tokens that hold up at scale.',
    tools: [{ name: 'Figma', mark: <FigmaMark /> }],
  },
  {
    makes: 'Motion that responds',
    detail: 'State machines and micro-interactions, not decoration.',
    tools: [{ name: 'Rive', mark: <span className="text-[9px] font-black tracking-tight">RIVE</span> }],
  },
  {
    makes: 'Art direction',
    detail: 'Imagery, identity and the look of a brand.',
    tools: [{ name: 'Adobe', mark: <Img src="/work/home/W07nH8VDiwrgbmo4r8CmiIChg.png" /> }],
  },
  {
    makes: 'Designs that ship',
    detail: 'Production front-ends, built by directing AI in code.',
    tools: [
      { name: 'Claude', mark: <ClaudeMark /> },
      { name: 'ChatGPT', mark: <Img src="/work/home/FRggyEbUloy2PxkUIkcfqmFkXoM.png" /> },
    ],
  },
];

export type Company = {
  name: string;
  href: string;
  /** cream version shown at rest, and the brand's own colours on hover */
  mono: string;
  color: string;
  /** visual height in px, tuned per logo so they read at the same weight */
  h: number;
  /** a wordmark set as text next to the mark, where the brand does that itself */
  word?: string;
  /** on a light tile: show the brand colours, or (for white-on-dark logos) the logo in ink */
  tile?: 'color' | 'ink';
};

// In the order Keerthi wants them shown.
export const COMPANIES: Company[] = [
  { name: 'WeWork', href: 'https://wework.co.in', mono: '/logos/wework-mono.png', color: '/logos/wework.png', h: 32, tile: 'ink' },
  { name: 'SpiceJet', href: 'https://www.spicejet.com', mono: '/logos/spicejet-mono.svg', color: '/logos/spicejet.svg', h: 26, tile: 'ink' },
  { name: 'ekai', href: 'https://www.yourekai.com', mono: '/logos/ekai-mono.svg', color: '/logos/ekai.svg', h: 24 },
  { name: 'Misfits', href: 'https://www.misfits.net.in', mono: '/logos/misfits-mono.png', color: '/logos/misfits.svg', h: 26 },
  { name: 'Infinity Ventures', href: 'https://www.infiventures.com', mono: '/logos/infinity-mono.png', color: '/logos/infinity.png', h: 28, word: 'Infinity' },
  { name: 'Design Tribe', href: 'https://designtribe.studio', mono: '/logos/designtribe-mono.svg', color: '/logos/designtribe.svg', h: 22, tile: 'ink' },
];
