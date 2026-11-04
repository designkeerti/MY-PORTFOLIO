/**
 * Icons for the about section. Duotone: a soft tinted fill under a 1.75 stroke on
 * a 24px grid, with rounded joins, so they read as one set. Each has a small motion
 * that plays when its card (a `.group` ancestor) is hovered or focused; see `.ic-*`
 * in index.css. Colour comes from currentColor.
 */

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="ic h-full w-full" aria-hidden>
    {children}
  </svg>
);
const TINT = { fill: 'currentColor', fillOpacity: 0.14 } as const;

/** A paw print; the toes pop one after another */
export const PawIcon = () => (
  <Svg>
    <g className="ic-tilt">
      <path {...TINT} d="M12 12.6c-2.6 0-5.2 2.6-5.2 5 0 1.6 1.2 2.4 2.6 2.4 1.1 0 1.7-.6 2.6-.6s1.5.6 2.6.6c1.4 0 2.6-.8 2.6-2.4 0-2.4-2.6-5-5.2-5Z" />
      <ellipse className="ic-pop ic-d1" {...TINT} cx="5.4" cy="10.8" rx="1.7" ry="2" />
      <ellipse className="ic-pop ic-d2" {...TINT} cx="9" cy="6.4" rx="1.8" ry="2.3" />
      <ellipse className="ic-pop ic-d3" {...TINT} cx="15" cy="6.4" rx="1.8" ry="2.3" />
      <ellipse className="ic-pop ic-d4" {...TINT} cx="18.6" cy="10.8" rx="1.7" ry="2" />
    </g>
  </Svg>
);

/** Basketball; it spins and bounces */
export const BallIcon = () => (
  <Svg>
    <g className="ic-bounce">
      <g className="ic-spin">
        <circle {...TINT} cx="12" cy="12" r="8.5" />
        <path d="M12 3.5v17M3.5 12h17" />
        <path d="M6 6a8.5 8.5 0 0 1 0 12M18 6a8.5 8.5 0 0 0 0 12" />
      </g>
    </g>
  </Svg>
);

/** A fountain pen nib; it writes a line */
export const QuillIcon = () => (
  <Svg>
    <g className="ic-nudge">
      <path {...TINT} d="M15.5 3.5 20.5 8.5 13 16 8 17 9 12 15.5 3.5Z" />
      <path d="m9 12 4 4" />
      <circle cx="11.6" cy="12.4" r="0.9" fill="currentColor" stroke="none" />
    </g>
    <path className="ic-draw" d="M3.5 20.5c2-1.2 3.6-1.2 5 0s3 1.2 5 0" />
  </Svg>
);

/** An open book; a page turns */
export const BookIcon = () => (
  <Svg>
    <path {...TINT} d="M12 6.8C10.2 5.4 7.3 4.8 3.5 5.3v12.5c3.8-.5 6.7.1 8.5 1.5 1.8-1.4 4.7-2 8.5-1.5V5.3c-3.8-.5-6.7.1-8.5 1.5Z" />
    <path d="M12 6.8v12.5" />
    <path className="ic-page" d="M12 6.8c1.4-1 3.4-1.5 6-1.4v11.3c-2.6-.1-4.6.4-6 1.4" />
  </Svg>
);
