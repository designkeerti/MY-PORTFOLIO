/**
 * Line icons for the toolkit and about sections. Each has a small motion that plays
 * when its card (a `.group` ancestor) is hovered or focused; see `.ic-*` in index.css.
 * Stroke is currentColor, so they take the text colour.
 */

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="ic h-full w-full" aria-hidden>
    {children}
  </svg>
);

/** UX design: a compass; the needle swings round */
export const CompassIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <g className="ic-spin"><path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6Z" /><circle cx="12" cy="12" r="0.6" fill="currentColor" /></g>
  </Svg>
);

/** UI design: a pen nib drawing a curve */
export const PenIcon = () => (
  <Svg>
    <path className="ic-draw" d="M3 20c3-1 4.5-4 7-4s3.5 2 6 1" />
    <g className="ic-nudge"><path d="m14 4 6 6-5 2-3-3 2-5Z" /><path d="m12 9-2.5 4.5" /></g>
  </Svg>
);

/** UX research: a magnifier that searches around */
export const SearchIcon = () => (
  <Svg>
    <g className="ic-scan"><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></g>
    <path d="M8 10.5h5" opacity="0.5" />
  </Svg>
);

/** Prototyping: a phone with a tap ripple */
export const TapIcon = () => (
  <Svg>
    <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
    <path d="M10.5 5h3" />
    <circle cx="12" cy="13" r="1.3" fill="currentColor" />
    <circle className="ic-ripple" cx="12" cy="13" r="3.5" />
  </Svg>
);

/** Vibecoding: code brackets that spring apart */
export const CodeIcon = () => (
  <Svg>
    <path className="ic-left" d="m8 7-5 5 5 5" />
    <path className="ic-right" d="m16 7 5 5-5 5" />
    <path className="ic-tilt" d="m13.5 5-3 14" />
  </Svg>
);

/** Collaboration: two overlapping circles that come together */
export const MergeIcon = () => (
  <Svg>
    <circle className="ic-left" cx="9" cy="12" r="5.5" />
    <circle className="ic-right" cx="15" cy="12" r="5.5" />
  </Svg>
);

/** A sparkle that turns */
export const SparkleIcon = () => (
  <Svg>
    <g className="ic-spin"><path d="M12 3c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7Z" /></g>
    <path className="ic-twinkle" d="M19 16.5v3M17.5 18h3" />
  </Svg>
);

/** Basketball: the ball spins */
export const BallIcon = () => (
  <Svg>
    <g className="ic-spin"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3v18" /><path d="M5.6 5.6c2.7 2.9 2.7 9.9 0 12.8M18.4 5.6c-2.7 2.9-2.7 9.9 0 12.8" /></g>
  </Svg>
);

/** Poetry: a quill writing a line */
export const QuillIcon = () => (
  <Svg>
    <g className="ic-nudge"><path d="M20 3c-6 1-11 6-12 13l3-1c1-4 4-8 9-12Z" /><path d="M8 16 6.5 19" /></g>
    <path className="ic-draw" d="M3 21h9" />
  </Svg>
);

/** Novels: a book whose page turns */
export const BookIcon = () => (
  <Svg>
    <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z" />
    <path d="M12 6.5v13" />
    <path className="ic-page" d="M12 6.5c1.6-1 3.6-1.3 6-1.2v11.5c-2.4-.1-4.4.2-6 1.2" />
  </Svg>
);
