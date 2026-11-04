/**
 * Line icons for the about section. Each has a small motion that plays
 * when its card (a `.group` ancestor) is hovered or focused; see `.ic-*` in index.css.
 * Stroke is currentColor, so they take the text colour.
 */

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="ic h-full w-full" aria-hidden>
    {children}
  </svg>
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
