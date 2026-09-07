import type { Project } from './types';
import { cbs } from './cbs';
import { ekai } from './ekai';
import { misfits } from './misfits';
import { dmrc } from './dmrc';
import { infinity } from './infinity';

/** Running order. `cbs` lives on this site; the rest still link out to the Framer case studies. */
export const projects: Project[] = [cbs, ekai, misfits, dmrc, infinity];
export const bySlug = (slug?: string) => projects.find(p => p.meta.slug === slug);
