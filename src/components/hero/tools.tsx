import type { ReactNode } from 'react';

const FigmaMark = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M8 24a4 4 0 0 0 4-4v-4H8a4 4 0 0 0 0 8Zm-4-12a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4Zm0-8a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4Zm8-4h4a4 4 0 0 1 0 8h-4V0Zm8 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" /></svg>
);
// The cards are paper-coloured, so the marks stay dark as supplied.
const Img = ({ src }: { src: string }) => (
  <img src={src} alt="" className="h-4 w-4 object-contain" draggable={false} />
);

export type Tool = {
  /** what the card is about: the thing made, not the software */
  makes: string;
  detail: string;
  tools: { name: string; mark: ReactNode }[];
  /** the colour of this card's underpainting stroke */
  color: string;
};

// Muted, warm pigments: they should read as paint, not as UI colours.
export const TOOLS: Tool[] = [
  {
    makes: 'Interfaces & systems',
    detail: 'Product UI, components and tokens that hold up at scale.',
    tools: [{ name: 'Figma', mark: <FigmaMark /> }],
    color: '#D9734E',
  },
  {
    makes: 'Motion that responds',
    detail: 'State machines and micro-interactions, not decoration.',
    tools: [{ name: 'Rive', mark: <span className="text-[9px] font-black tracking-tight">RIVE</span> }],
    color: '#C98BE0',
  },
  {
    makes: 'Art direction',
    detail: 'Imagery, identity and the look of a brand.',
    tools: [{ name: 'Adobe', mark: <Img src="/work/home/W07nH8VDiwrgbmo4r8CmiIChg.png" /> }],
    color: '#D9A441',
  },
  {
    makes: 'Designs that ship',
    detail: 'Production front-ends, built by directing AI in code.',
    tools: [
      { name: 'Cursor', mark: <Img src="/work/home/nWQ4pwGhNTr4aeYi8lUshZsc.png" /> },
      { name: 'ChatGPT', mark: <Img src="/work/home/FRggyEbUloy2PxkUIkcfqmFkXoM.png" /> },
    ],
    color: '#6CB4D6',
  },
];

export type Company = { name: string; role: string; year: string; href?: string };

export const COMPANIES: Company[] = [
  { name: 'Cross Border Supps', role: 'Design lead', year: '2026', href: '/work/cbs' },
  { name: 'ekai', role: 'Product designer', year: '2025' },
  { name: 'Infinity Lifespaces', role: 'UX designer', year: '2024' },
  { name: 'Misfits', role: 'UX/UI designer', year: '2023' },
];
