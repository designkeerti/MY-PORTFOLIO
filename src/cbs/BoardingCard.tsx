import { useEffect, useRef } from 'react';

/* The live card outline: one SVG path with the two tear-notch arcs in it, and the same path
   used as the clip-path of the inner wrapper. Ported from the store's CBS-BP-SHAPE-V1 script. */
const CORNER_R = 8, NOTCH_R = 8, TOP_STRIP_H = 36;
function buildPath(W: number, H: number) {
  const c = CORNER_R, n = NOTCH_R;
  let notchY = TOP_STRIP_H + W;
  if (notchY < c + n) notchY = c + n;
  if (notchY > H - c - n) notchY = H - c - n;
  return ['M', c, 0, 'H', W - c, 'A', c, c, 0, 0, 1, W, c, 'V', notchY - n, 'A', n, n, 0, 0, 0, W, notchY + n, 'V', H - c, 'A', c, c, 0, 0, 1, W - c, H, 'H', c, 'A', c, c, 0, 0, 1, 0, H - c, 'V', notchY + n, 'A', n, n, 0, 0, 0, 0, notchY - n, 'V', c, 'A', c, c, 0, 0, 1, c, 0, 'Z'].join(' ');
}

export type Leg = { flag: string; iso: string };
export type CardProps = {
  code: string; from?: Leg; to?: Leg; img: string; title: string; price: string; category: string;
  pills?: string[]; soldOut?: boolean; rating?: { n: string; count: number }; href?: string; className?: string;
};

export const BoardingCard = ({ code, from, to = { flag: '🇮🇳', iso: 'IND' }, img, title, price, category, pills = [], soldOut, rating, href = 'https://crossbordersupps.com/shop/', className = '' }: CardProps) => {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const card = ref.current; if (!card) return;
    const apply = () => {
      const svg = card.querySelector('.cbs-bp__shape') as SVGSVGElement | null;
      const path = card.querySelector('.cbs-bp__shape-path') as SVGPathElement | null;
      const inner = card.querySelector('.cbs-bp__inner') as HTMLElement | null;
      if (!svg || !path) return;
      const r = card.getBoundingClientRect(); const W = Math.round(r.width), H = Math.round(r.height);
      if (W < 1 || H < 1) return;
      const d = buildPath(W, H);
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); path.setAttribute('d', d);
      if (inner) { inner.style.clipPath = `path("${d}")`; (inner.style as any).webkitClipPath = `path("${d}")`; }
    };
    apply();
    const ro = new ResizeObserver(apply); ro.observe(card);
    return () => ro.disconnect();
  }, []);

  return (
    <article ref={ref} className={`cbs-card cbs-card--bp ${className}`} data-product-id={code}>
      <svg className="cbs-bp__shape" aria-hidden="true" preserveAspectRatio="none"><path className="cbs-bp__shape-path" /></svg>
      <div className="cbs-bp__inner">
        <div className="cbs-bp__top">
          <span className="cbs-bp__code">{code}</span>
          <span className="cbs-bp__route">
            {from && <><span className="cbs-bp__route-leg"><span className="cbs-bp__flag">{from.flag}</span><span className="cbs-bp__iso">{from.iso}</span></span>
              <span className="cbs-bp__arrow"><i className="ph-bold ph-arrow-right" /></span></>}
            <span className="cbs-bp__route-leg"><span className="cbs-bp__flag">{to.flag}</span><span className="cbs-bp__iso">{to.iso}</span></span>
          </span>
        </div>
        <div className="cbs-bp__frame">
          <a className="cbs-bp__media" href={href} target="_blank" rel="noreferrer" aria-label={title} onClick={e => e.stopPropagation()}>
            <img width="300" height="300" src={img} alt={title} decoding="async" loading="lazy" />
          </a>
          {rating && <span className="cbs-bp__rating" aria-label={`Rated ${rating.n}`}><i className="ph-fill ph-star" /> {rating.n} · {rating.count}</span>}
          <button className="cbs-card__info" type="button" aria-label="Show details" aria-expanded="false" onClick={e => e.stopPropagation()}><i className="ph-bold ph-info" aria-hidden="true" /></button>
          {pills.length > 0 && <div className="cbs-card__pills" aria-hidden="true">{pills.map(p => <span key={p} className="cbs-card__pill">{p}</span>)}</div>}
        </div>
        <div className="cbs-bp__body">
          <button className="cbs-wish" type="button" aria-label="Add to wishlist" aria-pressed="false" onClick={e => { e.stopPropagation(); const b = e.currentTarget; const on = b.getAttribute('aria-pressed') === 'true'; b.setAttribute('aria-pressed', on ? 'false' : 'true'); b.classList.toggle('is-added', !on); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s-7-4.35-7-10c0-2.485 2.015-4.5 4.5-4.5 1.54 0 2.93.74 3.8 1.9.87-1.16 2.26-1.9 3.8-1.9C19.985 6.5 22 8.515 22 11c0 5.65-7 10-7 10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" /></svg>
          </button>
          <a className="cbs-bp__title" href={href} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>{title}</a>
          <div className="cbs-bp__metrics">
            <div className="cbs-bp__metric"><span className="cbs-bp__label">PRICE</span><span className="cbs-bp__value"><span className="woocommerce-Price-amount amount"><span className="woocommerce-Price-currencySymbol">₹</span>{price}</span></span></div>
            <div className="cbs-bp__metric">
              {soldOut ? <><span className="cbs-bp__label">&nbsp;</span><span className="cbs-bp__value cbs-bp__value--oos" style={{ color: 'var(--cbs-danger)' }}>SOLD OUT</span></>
                : <><span className="cbs-bp__label">CATEGORY</span><span className="cbs-bp__value cbs-bp__value--cat">{category}</span></>}
            </div>
          </div>
          {soldOut
            ? <button type="button" className="cbs-card__cta cbs-card__notify" onClick={e => e.stopPropagation()}><span className="cbs-card__cta-l">NOTIFY ME</span><span className="cbs-card__cta-arr"><i className="ph-bold ph-arrow-right" /></span></button>
            : <button type="button" className="cbs-card__cta cbs-card__addcart" onClick={e => e.stopPropagation()}><span className="cbs-card__cta-l">ADD TO CART</span><span className="cbs-card__cta-arr"><i className="ph-bold ph-shopping-cart-simple" /></span></button>}
        </div>
      </div>
    </article>
  );
};

export const sampleCards: CardProps[] = [
  { code: 'CBS-0192', from: { flag: '🇺🇸', iso: 'USA' }, img: '/cbs/products/Apollon_Omega_Supreme-removebg-preview-300x300.png', title: 'Apollon Nutrition: Omega Supreme', price: '4,900', category: 'FISH OIL', pills: ['1300 MG EPA', '945 MG DHA', '60 SERVINGS'], rating: { n: '5.0', count: 1 } },
  { code: 'CBS-1955', from: { flag: '🇸🇪', iso: 'SWE' }, img: '/cbs/products/Beast-CREATINE_ECOM_FRONT.png-Custom-1-300x300.webp', title: 'Beast Pharm: Creatine', price: '2,600', category: 'CREATINE', pills: ['PURE MONOHYDRATE', '5G PER SCOOP'], rating: { n: '4.6', count: 14 } },
  { code: 'CBS-0149', from: { flag: '🇬🇧', iso: 'GBR' }, img: '/cbs/products/CF-Omega3-Front.png-Custom-300x300.webp', title: 'Combat Fuel: Omega 3', price: '3,950', category: 'HEALTH', pills: ['HIGH STRENGTH', '90 CAPS'], soldOut: true, rating: { n: '4.7', count: 14 } },
  { code: 'CBS-0028', from: { flag: '🇮🇳', iso: 'IND' }, img: '/cbs/products/Bake-Upper-Pina_processed_by_imagy-300x300.webp', title: 'Bake Nutrition: Upper Pina', price: '1,850', category: 'PRE-WORKOUT', pills: ['PINEAPPLE', '30 SERVINGS'], rating: { n: '4.0', count: 1 } },
];
