import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LiveFrame } from '../cbs/LiveFrame';
import { Vault, useVaultTimeline } from '../cbs/Vault';

import type { LiveId } from '../content/types';

/* Every panel below embeds a page of the store itself: crossbordersupps.com's markup, stylesheet and
   scripts, served from this site with the same assets. Nothing is redrawn. */

const Panel = ({ children, label, right, href, wide = true }: { children: ReactNode; label: string; right?: ReactNode; href?: string; wide?: boolean }) => (
  <motion.div className={`w-full ${wide ? 'max-w-[1240px]' : 'max-w-[1000px]'} mx-auto px-6`} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: .6 }}>
    <div className="rounded-[26px] overflow-hidden" style={{ background: '#000', boxShadow: '0 40px 80px -40px rgba(0,0,0,.6)' }}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 md:px-8 pt-5 pb-4">
        <span className="kicker" style={{ color: '#6cbde0' }}>● Live from the store · {label}</span>
        <span className="flex items-center gap-4 shrink-0">
          {right}
          {href && <a className="kicker text-white/40 hover:text-white/80 transition-colors" href={href} target="_blank" rel="noreferrer">Open on the site ↗</a>}
        </span>
      </div>
      {children}
    </div>
  </motion.div>
);

const btn = 'kicker rounded-full px-4 py-2 border border-white/20 text-white/80 hover:bg-white/10 transition-colors';
const hint = (t: string) => <span className="kicker text-white/40">{t}</span>;

export const CbsLive = ({ id }: { id: LiveId }) => {
  switch (id) {
    case 'cbs-wall': return (
      <Panel label="home hero, brand conveyor" href="https://crossbordersupps.com/" right={hint('hover pauses · arrows cycle brands')}>
        <LiveFrame src="/cbs/live/hero.html?first=1" w={1440} h={900} mobile={{ w: 390, h: 844 }} />
      </Panel>
    );
    case 'cbs-cards': return <CardsPanel />;
    case 'cbs-stacks': return (
      <Panel label="pre-built stacks" href="https://crossbordersupps.com/product-category/stack/">
        <LiveFrame src="/cbs/live/stacks.html" w={1280} h={1400} mobile={{ w: 390, h: 1000, src: '/cbs/live/stacks.html?scroll=1' }} />
      </Panel>
    );
    case 'cbs-stamps': return (
      <Panel label="shop by brand, the stamp sheet" href="https://crossbordersupps.com/#brands" right={hint('hover a stamp')}>
        <LiveFrame src="/cbs/live/brands.html" w={1440} h={1140} mobile={{ w: 390, h: 900, src: '/cbs/live/brands.html?scroll=1' }} />
      </Panel>
    );
    case 'cbs-vault': return <VaultPanel />;
    case 'cbs-mobile': return <MobilePanel />;
    case 'cbs-nav': return (
      <Panel label="site chrome: ticker, logo pill, floating nav" href="https://crossbordersupps.com/" right={hint('type ⌘K, open Shop')}>
        <LiveFrame src="/cbs/live/nav.html" w={1280} h={330} mobile={{ w: 390, h: 620 }} />
      </Panel>
    );
    case 'cbs-buy': return (
      <Panel label="product page, the buy column" href="https://crossbordersupps.com/product/combat-fuel-omega-3-fish-oil/" wide={false}>
        <LiveFrame src="/cbs/live/buy.html" w={900} h={600} mobile={{ w: 390, h: 700 }} />
      </Panel>
    );
    case 'cbs-cathead': return (
      <Panel label="category page, the header" href="https://crossbordersupps.com/product-category/new-arrival/">
        <LiveFrame src="/cbs/live/cathead.html" w={1280} h={360} mobile={{ w: 390, h: 520 }} />
      </Panel>
    );
    case 'cbs-parts': return (
      <Panel label="the small parts, on one sheet" href="https://crossbordersupps.com/" right={hint('the toast fires itself')}>
        <LiveFrame src="/cbs/live/parts.html" w={1280} h={1613} mobile={{ w: 390, h: 1100, src: '/cbs/live/parts.html?scroll=1' }} />
      </Panel>
    );
    case 'cbs-tokens': return <TokensPanel />;
  }
};

const CardsPanel = () => {
  const [oos, setOos] = useState(false);
  return (
    <Panel label="boarding-pass product cards" href="https://crossbordersupps.com/product-category/new-arrival/" right={<><span className="hidden md:inline">{hint('tap ⓘ for the benefits, ♡ to save')}</span><button className={btn} onClick={() => setOos(o => !o)}>{oos ? 'Show in stock' : 'Show sold out'}</button></>}>
      <LiveFrame key={String(oos)} src={`/cbs/live/cards.html?center=1${oos ? '&oos=1' : ''}`} w={1280} h={850} mobile={{ w: 390, h: 900, src: `/cbs/live/cards.html?scroll=1${oos ? '&oos=1' : ''}` }} />
    </Panel>
  );
};

const VaultPanel = () => {
  const { phase, replay } = useVaultTimeline(1500, true);
  return (
    <Panel label="first-visit vault" href="https://crossbordersupps.com/" right={<button className={btn} onClick={replay}>↺ Open again</button>}>
      <div className="relative">
        <LiveFrame src="/cbs/live/hero.html?first=1&still=1" w={1440} h={900} mobile={{ w: 390, h: 844 }} interactive={false} />
        <Vault phase={phase} />
      </div>
    </Panel>
  );
};

const phones: { src: string; label: string; note: string }[] = [
  { src: '/cbs/live/hero.html?first=1&still=1', label: 'Home hero', note: 'one top pill, the wall composition, a white primary and a flag secondary, three-cell stats' },
  { src: '/cbs/live/brands.html?scroll=1', label: 'Shop by brand', note: 'no hover on a phone, so the flag reveals as a stamp crosses the centre. Scroll it.' },
  { src: '/cbs/live/cards.html?scroll=1', label: 'Product cards', note: 'one full-width boarding pass per row; ⓘ opens the benefits' },
];

const MobilePanel = () => (
  <motion.div className="w-full max-w-[1240px] mx-auto px-6" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: .6 }}>
    <div className="rounded-[26px] p-6 md:p-10" style={{ background: '#000' }}>
      <div className="kicker mb-8" style={{ color: '#6cbde0' }}>● Live from the store · the same pages at 390px, scrollable</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 items-start">
        {phones.map(p => (
          <div key={p.src} className="flex flex-col items-center gap-4">
            <div className="phone w-full max-w-[300px]"><LiveFrame src={p.src} w={390} h={844} /></div>
            <div className="text-center max-w-[300px]"><div className="kicker text-white/80 mb-1">{p.label}</div><div className="text-[13.5px] leading-snug text-white/50">{p.note}</div></div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

/* The design tokens, straight from the store's stylesheet (DS-V2 :root). */
const inks = [
  { n: 'bg-0', v: '#000', l: 'the ground' }, { n: 'bg-1', v: '#0e1116', l: 'panel' }, { n: 'bg-2', v: '#161b22', l: 'raised panel' }, { n: 'bg-3', v: '#1d232c', l: 'hover' },
  { n: 'line', v: '#262d37', l: 'hairline' }, { n: 'brand', v: '#4aa3cc', l: 'brand' }, { n: 'edge', v: '#6cbde0', l: 'the one accent' }, { n: 'accent', v: '#ff4d4d', l: 'sale, sold out' },
];
const stamps = [['#2a1014', 'Apollon'], ['#1a0408', 'Anarchy'], ['#1e1a14', 'Bake'], ['#0a0d12', 'Beast'], ['#2d3a2a', 'Combat Fuel'], ['#1f0e1a', 'Genius'], ['#0d2848', 'Per4m'], ['#1a1812', 'Black Lion'], ['#3a1f25', 'Strom'], ['#1c1c1c', 'Gasp'], ['#0c1016', 'Better Bodies']];

const TokensPanel = () => (
  <motion.div className="w-full max-w-[1240px] mx-auto px-6" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: .6 }}>
    <div className="rounded-[26px] overflow-hidden p-6 md:p-10 grid gap-10 md:gap-12 md:grid-cols-[1.25fr_1fr]" style={{ background: '#000', color: '#fff' }}>
      <div>
        <div className="kicker mb-6" style={{ color: '#6cbde0' }}>Type</div>
        <div style={{ fontFamily: "'Anton', Impact, sans-serif", fontSize: 'clamp(44px, 6vw, 84px)', lineHeight: .92, textTransform: 'uppercase', letterSpacing: '.005em' }}>Pure fuel.<br /><span style={{ color: '#6cbde0' }}>Zero fakes.</span></div>
        <div className="kicker mt-3 text-white/40">Anton · display, always uppercase, always two lines</div>
        <p className="mt-8 text-[17px] leading-[1.55] max-w-[42ch]" style={{ fontFamily: "'Inter', sans-serif", color: '#b9bec4' }}><b style={{ color: '#f5f6f7' }}>Inter</b> carries every sentence. Bold for the product name, regular for the claim, never lighter than 400 on black.</p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6e757d' }}>
          <span>CBS-0209</span><span style={{ color: '#6cbde0' }}>GBR → IND</span><span>Price</span><span>100% genuine</span><span>Stack protocol</span>
        </div>
        <div className="kicker mt-3 text-white/40">JetBrains Mono · every label, reference and route, letter-spaced like a manifest</div>
      </div>
      <div>
        <div className="kicker mb-6" style={{ color: '#6cbde0' }}>Colour</div>
        <div className="grid grid-cols-4 gap-3">
          {inks.map(c => (
            <div key={c.n} className="flex flex-col gap-2">
              <div className="rounded-lg h-14 border border-white/10" style={{ background: c.v }} />
              <div className="kicker text-white/70" style={{ fontSize: 10 }}>{c.n}</div>
              <div className="text-[11.5px] text-white/40 leading-tight">{c.l}<br />{c.v}</div>
            </div>
          ))}
        </div>
        <div className="kicker mt-8 mb-4" style={{ color: '#6cbde0' }}>Eleven stamp colours</div>
        <div className="grid grid-cols-6 gap-2">
          {stamps.map(([v, l]) => <div key={l} title={l} className="rounded h-9 border border-white/10" style={{ background: v }} />)}
        </div>
        <div className="text-[13px] text-white/45 mt-3 leading-snug">One near-black per brand, each a different hue so a sheet of eleven never reads as one grey block. The flag underneath is the only saturated thing on the page, and it only shows when you ask.</div>
        <div className="kicker mt-8 mb-3" style={{ color: '#6cbde0' }}>Rules that never bend</div>
        <ul className="text-[13.5px] leading-relaxed text-white/60 flex flex-col gap-1.5">
          <li>Radius 2px on plates, full pill on true pills. Nothing in between.</li>
          <li>Phosphor icons only. No hand-drawn SVG paths, anywhere.</li>
          <li>One accent. If two things are cyan, one of them is wrong.</li>
          <li>Perforation is a 1px dashed line at 0.18 alpha. It gets brighter on hover, never thicker.</li>
        </ul>
      </div>
    </div>
  </motion.div>
);
