/**
 * Icons for the about section's interests. Monoline: a 1.5 stroke on a 24px grid with
 * rounded joins, no fill, so they sit quietly beside the type. Each has one small,
 * unhurried motion when its row (a `.group` ancestor) is hovered or focused; see `.ic-*`
 * in index.css. Colour comes from currentColor.
 */

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ic h-full w-full" aria-hidden>
    {children}
  </svg>
);

/** Basketball; it turns a quarter */
export const BallIcon = () => (
  <Svg>
    <g className="ic-turn">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17M3.5 12h17" />
      <path d="M6.2 5.8a8.5 8.5 0 0 1 0 12.4M17.8 5.8a8.5 8.5 0 0 0 0 12.4" />
    </g>
  </Svg>
);

/** A fountain pen nib; it leans into a stroke */
export const PenIcon = () => (
  <Svg>
    <g className="ic-lean">
      <path d="M12 20.5 7 11.2 12 3.5l5 7.7-5 9.3Z" />
      <path d="M12 20.5v-7.3" />
      <circle cx="12" cy="11.6" r="1.1" />
    </g>
  </Svg>
);

/** An open book; a page turns */
export const BookIcon = () => (
  <Svg>
    <path d="M12 6.8C10.2 5.4 7.3 4.8 3.5 5.3v12.5c3.8-.5 6.7.1 8.5 1.5 1.8-1.4 4.7-2 8.5-1.5V5.3c-3.8-.5-6.7.1-8.5 1.5Z" />
    <path d="M12 6.8v12.5" />
    <path className="ic-page" d="M12 6.8c1.4-1 3.4-1.5 6-1.4v11.3c-2.6-.1-4.6.4-6 1.4" />
  </Svg>
);
