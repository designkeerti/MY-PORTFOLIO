import { useState } from 'react';
import { books } from '../content/books';

/** Covers standing on a plank. Hover (or click, or tab to) a book and the line beneath says why it is there. */
export const Shelf = () => {
  const [sel, setSel] = useState(0);
  const [hov, setHov] = useState<number | null>(null);
  const cur = hov ?? sel;
  const b = books[cur];
  return (
    <div className="shelf about-hide-2">
      <div className="shelf__label">On my shelf</div>
      <div className="shelf__row" onMouseLeave={() => setHov(null)}>
        {books.map((bk, i) => (
          <button key={bk.title} type="button" className={`shelf__book ${i === cur ? 'is-on' : ''}`} style={{ ['--tilt' as string]: `${bk.tilt ?? 0}deg` }}
            onMouseEnter={() => setHov(i)} onFocus={() => setHov(i)} onBlur={() => setHov(null)} onClick={() => setSel(i)}
            aria-label={`${bk.title} by ${bk.author}`} aria-pressed={i === sel}>
            <img src={bk.cover} alt="" loading="lazy" draggable={false} />
          </button>
        ))}
      </div>
      <div className="shelf__plank" aria-hidden="true" />
      <p className="shelf__cap" aria-live="polite">
        <span className="shelf__t"><b>{b.title}</b> · {b.author}</span>
        <em>{b.why}</em>
      </p>
    </div>
  );
};
