import type { ReactNode } from 'react';

export type SceneCtx = {
  active: boolean;
  /** frame narrower than 700px */
  compact: boolean;
  /** frame width in px, for scenes that need to drop detail when small */
  w: number;
};
export type Scene = {
  id: string;
  /** milliseconds this scene holds before the cut */
  duration: number;
  /** subtitle-style caption, bottom-left */
  caption?: string;
  render: (ctx: SceneCtx) => ReactNode;
};

export type ProjectMeta = {
  slug: string;
  title: string;
  oneLiner: string;
  role: string;
  year: string;
  company: string;
  /** primary accent for this project */
  accent: string;
  accent2?: string;
  tag: string;
};
