import type { ProjectMeta, Scene } from '../previews/types';

export type Img = { src: string; alt: string; caption?: string };
export type Block =
  | { type: 'p'; text: string }
  | { type: 'lead'; text: string }
  | { type: 'h'; text: string }
  | { type: 'img'; src: string; alt: string; caption?: string; size?: 'text' | 'wide' | 'full'; bg?: string; pad?: boolean }
  | { type: 'grid'; images: Img[]; cols?: 2 | 3 | 4; phone?: boolean; bg?: string; caption?: string }
  | { type: 'stats'; items: { n: string; l: string }[] }
  | { type: 'quote'; text: string; who?: string }
  | { type: 'list'; items: string[] }
  | { type: 'cards'; items: { title: string; text: string; kicker?: string }[]; cols?: 2 | 3 }
  | { type: 'live'; id: 'cbs-cards' | 'cbs-stacks' | 'cbs-stamps' | 'cbs-vault' | 'cbs-wall' }
  | { type: 'note'; text: string };

export type Chapter = { id: string; title: string; kicker?: string; blocks: Block[] };

export type Project = {
  meta: ProjectMeta;
  cover: string;
  timeline: string;
  expertise: string;
  summary: string;
  link?: { href: string; label: string };
  /** the Framer case study, for projects not yet rebuilt on this site */
  externalLink?: string;
  chapters: Chapter[];
  preview: () => Scene[];
};
