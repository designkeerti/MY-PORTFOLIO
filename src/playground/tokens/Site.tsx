import type { CSSProperties } from 'react';
import { STYLES, type Bp } from './model';
import iWaves from '@phosphor-icons/core/assets/regular/waves.svg?raw';
import iBolt from '@phosphor-icons/core/assets/regular/lightning.svg?raw';
import iChart from '@phosphor-icons/core/assets/regular/chart-line-up.svg?raw';
import iBell from '@phosphor-icons/core/assets/regular/bell-simple.svg?raw';
import iCheck from '@phosphor-icons/core/assets/regular/check.svg?raw';
import iArrow from '@phosphor-icons/core/assets/regular/arrow-right.svg?raw';
import iSpark from '@phosphor-icons/core/assets/regular/sparkle.svg?raw';
import iInfo from '@phosphor-icons/core/assets/regular/info.svg?raw';
import iOk from '@phosphor-icons/core/assets/regular/check-circle.svg?raw';
import iWarn from '@phosphor-icons/core/assets/regular/warning.svg?raw';
import iErr from '@phosphor-icons/core/assets/regular/x-circle.svg?raw';
import iCaret from '@phosphor-icons/core/assets/regular/caret-down.svg?raw';
import iUp from '@phosphor-icons/core/assets/regular/trend-up.svg?raw';
import iDown from '@phosphor-icons/core/assets/regular/trend-down.svg?raw';
import iList from '@phosphor-icons/core/assets/regular/list.svg?raw';
import iSearch from '@phosphor-icons/core/assets/regular/magnifying-glass.svg?raw';

/**
 * A small product website built only from the tokens: every colour, size, gap, corner and
 * shadow is a CSS variable, so a change anywhere in the system shows up here as it happens.
 * `data-t` on an element lists the tokens it uses, for the inspector.
 */

const I = ({ svg, className = '' }: { svg: string; className?: string }) => <span aria-hidden className={`ic ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />;

const typeCss = STYLES.map(s => `.tks .t-${s.id}{font-family:var(--text-${s.id}-family);font-size:var(--text-${s.id}-size);line-height:var(--text-${s.id}-lh);letter-spacing:var(--text-${s.id}-tracking);font-weight:var(--text-${s.id}-weight);text-transform:var(--text-${s.id}-case);margin:0}`).join('');

export const SITE_CSS = `
.tks{--ease:cubic-bezier(.2,.7,.2,1);background:var(--color-bg-canvas);color:var(--color-fg-default);font-family:var(--font-body);font-size:var(--text-body-size);line-height:var(--text-body-lh);font-weight:var(--text-body-weight);-webkit-font-smoothing:antialiased;position:relative;text-align:left}
.tks *,.tks *::before,.tks *::after{box-sizing:border-box}
.tks.anim *{transition:background-color .45s var(--ease),color .45s var(--ease),border-color .45s var(--ease),border-radius .45s var(--ease),padding .45s var(--ease),gap .45s var(--ease),row-gap .45s var(--ease),column-gap .45s var(--ease),box-shadow .45s var(--ease),font-size .45s var(--ease),line-height .45s var(--ease),letter-spacing .45s var(--ease),margin .45s var(--ease)}
.tks.anim{transition:background-color .45s var(--ease),color .45s var(--ease)}
${typeCss}
.tks p{margin:0}
.tks .ic{display:inline-flex;width:1.15em;height:1.15em;flex:none}.tks .ic svg{width:100%;height:100%}
.tks .wrap{max-width:calc(var(--container-max) + 2 * var(--grid-margin));margin:0 auto;padding-inline:var(--grid-margin)}
.tks .row{display:grid;grid-template-columns:repeat(var(--grid-columns),minmax(0,1fr));column-gap:var(--grid-gutter);row-gap:var(--space-stack-lg)}
.tks .stack{display:flex;flex-direction:column}
.tks .muted{color:var(--color-fg-muted)}.tks .subtle{color:var(--color-fg-subtle)}
.tks .sec{padding-block:var(--space-section-md)}
.tks .band{background:var(--color-bg-subtle);border-block:1px solid var(--color-border-subtle)}
.tks .nav{position:sticky;top:0;z-index:5;background:var(--color-bg-canvas);border-bottom:1px solid var(--color-border-subtle)}
.tks .nav-in{display:flex;align-items:center;justify-content:space-between;gap:var(--space-inline-lg);padding-block:var(--space-inset-md)}
.tks .logo{display:flex;align-items:center;gap:var(--space-inline-sm);font-family:var(--font-heading);font-weight:var(--text-h4-weight);font-size:var(--text-body-lg-size);letter-spacing:-0.01em}
.tks .mark{display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-button);background:var(--color-bg-brand);color:var(--color-fg-on-brand)}
.tks .links{display:flex;gap:var(--space-inline-lg)}.tks .links a{color:var(--color-fg-muted);text-decoration:none}
.tks .btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-inline-xs);padding:var(--space-inset-sm) var(--space-inset-md);border-radius:var(--radius-button);border:1px solid transparent;font-family:var(--text-label-family);font-size:var(--text-label-size);line-height:var(--text-label-lh);font-weight:var(--text-label-weight);white-space:nowrap;cursor:pointer;text-decoration:none}
.tks .btn-lg{padding:calc(var(--space-inset-sm) * 1.5) var(--space-inset-lg);font-size:var(--text-body-size);line-height:var(--text-body-lh)}
.tks .btn-primary{background:var(--color-bg-brand);color:var(--color-fg-on-brand);box-shadow:var(--shadow-xs)}.tks .btn-primary:hover{background:var(--color-bg-brand-hover)}
.tks .btn-secondary{background:var(--color-bg-surface);color:var(--color-fg-default);border-color:var(--color-border-default);box-shadow:var(--shadow-xs)}.tks .btn-secondary:hover{background:var(--color-bg-muted)}
.tks .btn-ghost{background:transparent;color:var(--color-fg-default)}.tks .btn-ghost:hover{background:var(--color-bg-muted)}
.tks .btn-inverse{background:var(--color-bg-canvas);color:var(--color-fg-default)}
.tks .btn-outline-on{background:transparent;color:var(--color-fg-on-brand);border-color:currentColor}
.tks .badge{display:inline-flex;align-items:center;gap:var(--space-inline-xs);padding:2px var(--space-inset-sm);border-radius:var(--radius-badge);font-family:var(--text-caption-family);font-size:var(--text-caption-size);line-height:var(--text-caption-lh);font-weight:var(--text-label-weight);white-space:nowrap;border:1px solid transparent}
.tks .b-brand{background:var(--color-bg-brand-subtle);color:var(--color-fg-brand);border-color:var(--color-border-brand)}
.tks .b-accent{background:var(--color-bg-accent-subtle);color:var(--color-fg-accent)}
.tks .b-success{background:var(--color-bg-success-subtle);color:var(--color-fg-success)}
.tks .b-warning{background:var(--color-bg-warning-subtle);color:var(--color-fg-warning)}
.tks .b-danger{background:var(--color-bg-danger-subtle);color:var(--color-fg-danger)}
.tks .b-info{background:var(--color-bg-info-subtle);color:var(--color-fg-info)}
.tks .b-muted{background:var(--color-bg-muted);color:var(--color-fg-muted)}
.tks .card{background:var(--color-bg-surface);border:1px solid var(--color-border-default);border-radius:var(--radius-card);padding:var(--space-inset-lg);box-shadow:var(--shadow-sm)}
.tks .card:hover{box-shadow:var(--shadow-md)}
.tks .hero{padding-block:var(--space-section-sm) var(--space-section-md)}
.tks .hero-copy{display:flex;flex-direction:column;gap:var(--space-stack-lg);align-self:center}
.tks .actions{display:flex;flex-wrap:wrap;gap:var(--space-inline-md);align-items:center}
.tks .app{background:var(--color-bg-raised);border:1px solid var(--color-border-default);border-radius:var(--radius-dialog);padding:var(--space-inset-lg);box-shadow:var(--shadow-lg);display:flex;flex-direction:column;gap:var(--space-stack-md)}
.tks .app-head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-inline-md)}
.tks .seg{display:flex;gap:2px;padding:3px;border-radius:var(--radius-button);background:var(--color-bg-muted)}
.tks .seg span{padding:calc(var(--space-inset-xs)) var(--space-inset-sm);border-radius:max(calc(var(--radius-button) - 3px),0px);font-size:var(--text-caption-size);line-height:var(--text-caption-lh);font-weight:var(--text-label-weight);color:var(--color-fg-muted)}
.tks .seg .on{background:var(--color-bg-surface);color:var(--color-fg-default);box-shadow:var(--shadow-xs)}
.tks .tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-inline-md)}
.tks .tile{background:var(--color-bg-subtle);border:1px solid var(--color-border-subtle);border-radius:max(calc(var(--radius-dialog) - var(--space-inset-lg) / 2),0px);padding:var(--space-inset-md);display:flex;flex-direction:column;gap:var(--space-stack-xs)}
.tks .chart{display:flex;align-items:flex-end;gap:6px;height:120px;padding-top:var(--space-stack-sm);border-bottom:1px solid var(--color-border-default);background:repeating-linear-gradient(to top,transparent 0 29px,var(--color-border-subtle) 29px 30px)}
.tks .bar{flex:1;border-radius:max(calc(var(--radius-button) / 2),0px) max(calc(var(--radius-button) / 2),0px) 0 0;background:var(--color-bg-brand);opacity:.9}
.tks .bar.soft{opacity:.38}
.tks .bar.acc{background:var(--color-bg-accent)}
.tks table{width:100%;border-collapse:collapse}
.tks th{text-align:left;font-family:var(--text-overline-family);font-size:var(--text-overline-size);line-height:var(--text-overline-lh);letter-spacing:var(--text-overline-tracking);font-weight:var(--text-overline-weight);text-transform:uppercase;color:var(--color-fg-muted);padding:var(--space-inset-xs) 0;border-bottom:1px solid var(--color-border-default)}
.tks td{padding:var(--space-inset-sm) 0;border-bottom:1px solid var(--color-border-subtle);font-size:var(--text-body-sm-size);line-height:var(--text-body-sm-lh)}
.tks tr:last-child td{border-bottom:0}
.tks .who{display:flex;align-items:center;gap:var(--space-inline-sm)}
.tks .av{display:grid;place-items:center;width:28px;height:28px;flex:none;border-radius:var(--radius-avatar);background:var(--color-bg-accent-subtle);color:var(--color-fg-accent);font-size:var(--text-caption-size);font-weight:var(--text-label-weight)}
.tks .av.lg{width:44px;height:44px;font-size:var(--text-body-size)}
.tks .av.b{background:var(--color-bg-brand-subtle);color:var(--color-fg-brand)}
.tks .avs{display:flex}.tks .avs .av{border:2px solid var(--color-bg-raised);margin-left:-8px}.tks .avs .av:first-child{margin-left:0}
.tks .head{display:flex;flex-direction:column;gap:var(--space-stack-sm);margin-bottom:var(--space-stack-xl)}
.tks .icon-box{display:grid;place-items:center;width:44px;height:44px;border-radius:var(--radius-input);background:var(--color-bg-brand-subtle);color:var(--color-fg-brand);font-size:22px}
.tks .feat{display:flex;flex-direction:column;gap:var(--space-stack-sm)}
.tks .link{display:inline-flex;align-items:center;gap:var(--space-inline-xs);color:var(--color-fg-brand);font-weight:var(--text-label-weight);font-size:var(--text-label-size);text-decoration:none;margin-top:var(--space-stack-xs)}
.tks .field{display:flex;flex-direction:column;gap:var(--space-stack-xs)}
.tks .lbl{font-family:var(--text-label-family);font-size:var(--text-label-size);line-height:var(--text-label-lh);font-weight:var(--text-label-weight)}
.tks .input{display:flex;align-items:center;justify-content:space-between;gap:var(--space-inline-sm);padding:var(--space-inset-sm) calc(var(--space-inset-sm) * 1.5);border:1px solid var(--color-border-strong);border-radius:var(--radius-input);background:var(--color-bg-surface);color:var(--color-fg-default);min-height:40px}
.tks .input.focus{border-color:var(--color-border-focus);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-border-focus) 28%,transparent)}
.tks .help{font-size:var(--text-caption-size);line-height:var(--text-caption-lh);color:var(--color-fg-subtle)}
.tks .form{display:flex;flex-direction:column;gap:var(--space-stack-lg)}
.tks .pair{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-inline-md)}
.tks .setting{display:flex;align-items:center;justify-content:space-between;gap:var(--space-inline-md);padding-top:var(--space-stack-md);border-top:1px solid var(--color-border-subtle)}
.tks .toggle{position:relative;width:40px;height:24px;flex:none;border-radius:999px;background:var(--color-bg-brand)}
.tks .toggle::after{content:'';position:absolute;top:3px;left:19px;width:18px;height:18px;border-radius:50%;background:var(--color-fg-on-brand);box-shadow:var(--shadow-xs)}
.tks .tick{display:grid;place-items:center;width:20px;height:20px;flex:none;border-radius:min(var(--radius-input),6px);background:var(--color-bg-brand);color:var(--color-fg-on-brand);font-size:13px}
.tks .row-end{display:flex;justify-content:flex-end;gap:var(--space-inline-md);padding-top:var(--space-stack-md);border-top:1px solid var(--color-border-subtle)}
.tks .alerts{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-inline-md)}
.tks .alert{display:flex;gap:var(--space-inline-sm);padding:var(--space-inset-md);border-radius:var(--radius-input);border:1px solid}
.tks .alert .ic{font-size:20px;margin-top:2px}
.tks .alert b{display:block;font-weight:var(--text-label-weight)}
.tks .alert p{color:var(--color-fg-default);font-size:var(--text-body-sm-size);line-height:var(--text-body-sm-lh)}
.tks .a-success{background:var(--color-bg-success-subtle);border-color:var(--color-border-success);color:var(--color-fg-success)}
.tks .a-warning{background:var(--color-bg-warning-subtle);border-color:var(--color-border-warning);color:var(--color-fg-warning)}
.tks .a-danger{background:var(--color-bg-danger-subtle);border-color:var(--color-border-danger);color:var(--color-fg-danger)}
.tks .a-info{background:var(--color-bg-info-subtle);border-color:var(--color-border-info);color:var(--color-fg-info)}
.tks .ticks{display:flex;flex-direction:column;gap:var(--space-stack-sm);padding:0;margin:0;list-style:none}
.tks .ticks li{display:flex;gap:var(--space-inline-sm);align-items:flex-start}.tks .ticks .ic{color:var(--color-fg-success);margin-top:.2em}
.tks .price{display:flex;flex-direction:column;gap:var(--space-stack-md)}
.tks .price.pick{border:2px solid var(--color-border-brand);box-shadow:var(--shadow-lg);position:relative}
.tks .amount{display:flex;align-items:baseline;gap:var(--space-inline-xs)}
.tks .quote{display:flex;flex-direction:column;gap:var(--space-stack-lg);align-items:center;text-align:center}
.tks .cta{background:var(--color-bg-brand);color:var(--color-fg-on-brand);border-radius:var(--radius-dialog);padding:var(--space-inset-xl);display:flex;flex-wrap:wrap;gap:var(--space-stack-lg);align-items:center;justify-content:space-between;box-shadow:var(--shadow-md)}
.tks .cta p{opacity:.85}
.tks .inv{background:var(--color-bg-inverse);color:var(--color-fg-inverse);border-radius:var(--radius-card);padding:var(--space-inset-sm) var(--space-inset-md);display:inline-flex;gap:var(--space-inline-sm);align-items:center;box-shadow:var(--shadow-xl)}
.tks .foot{background:var(--color-bg-subtle);border-top:1px solid var(--color-border-default);padding-block:var(--space-section-sm)}
.tks .foot a{display:block;color:var(--color-fg-muted);text-decoration:none;font-size:var(--text-body-sm-size);line-height:var(--text-body-sm-lh);margin-top:var(--space-stack-sm)}
.tks .rule{height:1px;background:var(--color-border-default);margin-block:var(--space-stack-xl) var(--space-stack-lg)}
.tks code{font-family:var(--font-mono);font-size:var(--text-code-size);line-height:var(--text-code-lh);background:var(--color-bg-muted);border-radius:min(var(--radius-input),6px);padding:1px 6px}
.tks.bp-mobile .hide-m{display:none}.tks:not(.bp-mobile) .only-m{display:none}
.tks.bp-mobile .tiles{grid-template-columns:1fr 1fr}.tks.bp-mobile .tiles .tile:last-child{display:none}
.tks.bp-mobile .alerts,.tks.bp-mobile .pair{grid-template-columns:1fr}
.tks.bp-mobile .cta{flex-direction:column;align-items:flex-start}
`;

const BARS = [38, 52, 44, 61, 48, 70, 58, 76, 66, 84, 72, 92];

export function Site({ name, bp, columns }: { name: string; bp: Bp; columns: number }) {
  const cols = Math.max(1, columns);
  const full = { gridColumn: '1 / -1' } as CSSProperties;
  const span = (frac: number) => Math.max(1, Math.min(cols, Math.round(cols * frac)));
  const desk = bp === 'desktop', mob = bp === 'mobile';
  // three across on desktop, two on tablet, one on a phone; centred when the columns don't divide
  const per = desk ? Math.max(1, Math.floor(cols / 3)) : bp === 'tablet' ? Math.max(1, Math.floor(cols / 2)) : cols;
  const lead = desk ? Math.floor((cols - per * 3) / 2) : bp === 'tablet' ? Math.floor((cols - per * 2) / 2) : 0;
  const third = (i: number): CSSProperties => {
    const across = desk ? 3 : bp === 'tablet' ? 2 : 1;
    return { gridColumn: i % across === 0 && lead ? `${lead + 1} / span ${per}` : `span ${per}` };
  };
  const heroText = desk ? span(5 / 12) : cols;
  const quote = desk ? span(8 / 12) : cols;

  return (
    <>
      <header className="nav" data-t="bg:bg/canvas border:border/subtle pad:inset/md">
        <div className="wrap nav-in">
          <span className="logo" data-t="text:h4 fg:fg/default"><span className="mark" data-t="bg:bg/brand fg:fg/on-brand radius:button"><I svg={iWaves} /></span>{name}</span>
          <nav className="links hide-m" data-t="fg:fg/muted gap:inline/lg text:body">{['Product', 'Pricing', 'Customers', 'Docs'].map(l => <a key={l}>{l}</a>)}</nav>
          <div className="actions">
            <a className="btn btn-ghost hide-m" data-t="fg:fg/default radius:button pad:inset/sm,inset/md text:label">Sign in</a>
            <a className="btn btn-primary hide-m" data-t="bg:bg/brand fg:fg/on-brand radius:button pad:inset/sm,inset/md text:label shadow:xs">Start free</a>
            <a className="btn btn-secondary only-m" aria-label="Menu" data-t="bg:bg/surface border:border/default radius:button"><I svg={iList} /></a>
          </div>
        </div>
      </header>

      <section className="wrap hero">
        <div className="row" style={{ alignItems: 'center', rowGap: 'var(--space-section-sm)' }}>
          <div className="hero-copy" style={{ gridColumn: `span ${heroText}` }} data-t="gap:stack/lg">
            <span><span className="badge b-brand" data-t="bg:bg/brand-subtle fg:fg/brand border:border/brand radius:badge text:caption"><I svg={iSpark} />New: forecasts are here</span></span>
            <h1 className="t-display" data-t="text:display fg:fg/default">Know where your week is going.</h1>
            <p className="t-body-lg muted" data-t="text:body-lg fg:fg/muted">{name} turns your team’s tools into one calm dashboard. See what shipped, what’s stuck and what’s next, without the status meeting.</p>
            <div className="actions" data-t="gap:inline/md">
              <a className="btn btn-primary btn-lg" data-t="bg:bg/brand fg:fg/on-brand radius:button pad:inset/sm,inset/lg text:body">Start free trial <I svg={iArrow} /></a>
              <a className="btn btn-secondary btn-lg" data-t="bg:bg/surface fg:fg/default border:border/default radius:button pad:inset/sm,inset/lg shadow:xs">Book a demo</a>
            </div>
            <p className="t-caption subtle" data-t="text:caption fg:fg/subtle">Free for 14 days. No card needed.</p>
          </div>
          <div style={{ gridColumn: desk ? `span ${Math.max(1, cols - heroText)}` : '1 / -1', position: 'relative' }}>
            <div className="app" data-t="bg:bg/raised border:border/default radius:dialog pad:inset/lg shadow:lg gap:stack/md">
              <div className="app-head">
                <div className="stack"><span className="t-overline muted" data-t="text:overline fg:fg/muted">This week</span><span className="t-h4" data-t="text:h4">Overview</span></div>
                <div className="seg hide-m" data-t="bg:bg/muted radius:button"><span>Day</span><span className="on" data-t="bg:bg/surface fg:fg/default shadow:xs">Week</span><span>Month</span></div>
                <div className="avs only-m"><span className="av">AO</span><span className="av b">MK</span></div>
              </div>
              <div className="tiles" data-t="gap:inline/md">
                {[['Shipped', '128', '+12%', 'success', iUp], ['In review', '34', '−4%', 'danger', iDown], ['Cycle time', '2.4d', '−0.3d', 'success', iDown]].map(([k, v, d, tone, ic]) => (
                  <div key={k} className="tile" data-t="bg:bg/subtle border:border/subtle pad:inset/md gap:stack/xs">
                    <span className="t-caption muted" data-t="text:caption fg:fg/muted">{k}</span>
                    <span className="t-h3" data-t="text:h3">{v}</span>
                    <span><span className={`badge b-${tone}`} data-t={`bg:bg/${tone}-subtle fg:fg/${tone} radius:badge`}><I svg={ic} />{d}</span></span>
                  </div>
                ))}
              </div>
              <div className="chart" data-t="bg:bg/brand border:border/default">
                {BARS.map((h, i) => <span key={i} className={`bar${i === BARS.length - 1 ? ' acc' : i % 4 === 1 ? ' soft' : ''}`} style={{ height: `${h}%` }} />)}
              </div>
              {!mob && (
                <table data-t="text:body-sm border:border/subtle">
                  <thead><tr><th>Project</th><th>Owner</th><th>Status</th><th style={{ textAlign: 'right' }}>Due</th></tr></thead>
                  <tbody>
                    {[['Checkout redesign', 'AO', 'On track', 'success', 'Fri'], ['Billing API', 'MK', 'At risk', 'warning', 'Mon'], ['Search', 'JL', 'Blocked', 'danger', 'Wed']].map(([p, o, s, tone, d]) => (
                      <tr key={p}>
                        <td className="t-label">{p}</td>
                        <td><span className="who"><span className="av" data-t="bg:bg/accent-subtle fg:fg/accent radius:avatar">{o}</span></span></td>
                        <td><span className={`badge b-${tone}`} data-t={`bg:bg/${tone}-subtle fg:fg/${tone} radius:badge text:caption`}>{s}</span></td>
                        <td className="muted" style={{ textAlign: 'right' }}>{d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {!mob && <span className="inv" style={{ position: 'absolute', left: desk ? '-6%' : '4%', bottom: '-18px' }} data-t="bg:bg/inverse fg:fg/inverse radius:card shadow:xl"><I svg={iBell} /><span className="t-body-sm">Billing API is at risk</span></span>}
          </div>
        </div>
      </section>

      <section className="band sec" data-t="bg:bg/subtle border:border/subtle pad:section/md">
        <div className="wrap">
          <div className="head" style={{ maxWidth: 640 }}>
            <span className="t-overline" style={{ color: 'var(--color-fg-brand)' }} data-t="text:overline fg:fg/brand">Why teams switch</span>
            <h2 className="t-h2" data-t="text:h2">Everything in one calm place</h2>
            <p className="t-body-lg muted" data-t="text:body-lg fg:fg/muted">No more chasing updates across five tools. {name} reads them for you and shows only what changed.</p>
          </div>
          <div className="row">
            {[[iChart, 'Live status', 'Every project’s state, pulled from the tools you already use. Updated as work moves.'],
              [iBolt, 'Forecasts', 'See which dates will slip a week before they do, and why.'],
              [iBell, 'Quiet alerts', 'One digest a day, and a ping only when something is truly blocked.']].map(([ic, h, p], i) => (
              <div key={h} className="card feat" style={third(i)} data-t="bg:bg/surface border:border/default radius:card pad:inset/lg shadow:sm gap:stack/sm">
                <span className="icon-box" data-t="bg:bg/brand-subtle fg:fg/brand radius:input"><I svg={ic} /></span>
                <h3 className="t-h4" style={{ marginTop: 'var(--space-stack-sm)' }} data-t="text:h4">{h}</h3>
                <p className="muted" data-t="text:body fg:fg/muted">{p}</p>
                <a className="link" data-t="fg:fg/brand text:label">Learn more <I svg={iArrow} /></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap sec">
        <div className="row">
          <div className="stack" style={{ gridColumn: desk ? `span ${span(5 / 12)}` : '1 / -1', gap: 'var(--space-stack-lg)' }}>
            <span className="t-overline" style={{ color: 'var(--color-fg-brand)' }}>Set up</span>
            <h2 className="t-h2" data-t="text:h2">Ready in two minutes</h2>
            <p className="t-body-lg muted">Name your workspace, connect a tool and invite the team. Everything else has a sensible default.</p>
            <ul className="ticks" data-t="fg:fg/success gap:stack/sm">
              {['Connects to GitHub, Linear and Jira', 'Single sign-on on every plan', <>Or use the API: <code key="c">npm i @{name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'tidal'}/sdk</code></>].map((l, i) => <li key={i}><I svg={iCheck} /><span>{l}</span></li>)}
            </ul>
          </div>
          <div style={{ gridColumn: desk ? `span ${Math.max(1, cols - span(5 / 12))}` : '1 / -1' }} className="stack">
            <div className="card form" data-t="bg:bg/surface border:border/default radius:card pad:inset/lg gap:stack/lg">
              <div className="pair">
                <label className="field" data-t="gap:stack/xs text:label"><span className="lbl">Workspace name</span><span className="input" data-t="bg:bg/surface border:border/strong radius:input pad:inset/sm text:body">Northside Studio</span></label>
                <label className="field"><span className="lbl">Team size</span><span className="input" data-t="border:border/strong radius:input">11–50 people<I svg={iCaret} className="subtle" /></span></label>
              </div>
              <label className="field">
                <span className="lbl">Work email</span>
                <span className="input focus" data-t="border:border/focus radius:input fg:fg/subtle"><span className="subtle">you@company.com</span><I svg={iSearch} className="subtle" /></span>
                <span className="help" data-t="text:caption fg:fg/subtle">We’ll send the weekly digest here.</span>
              </label>
              <div className="setting" data-t="border:border/subtle gap:inline/md">
                <span className="stack"><span className="lbl">Weekly digest</span><span className="t-body-sm muted">Every Monday at 9:00</span></span>
                <span className="toggle" data-t="bg:bg/brand fg:fg/on-brand" />
              </div>
              <div className="setting" style={{ justifyContent: 'flex-start' }}>
                <span className="tick" data-t="bg:bg/brand fg:fg/on-brand"><I svg={iCheck} /></span>
                <span className="t-body-sm">Ping me when something is blocked</span>
              </div>
              <div className="row-end">
                <a className="btn btn-secondary">Cancel</a>
                <a className="btn btn-primary">Save changes</a>
              </div>
            </div>
            <div className="alerts" style={{ marginTop: 'var(--space-stack-lg)' }}>
              {[['info', iInfo, 'Heads up', 'Your trial ends in 9 days.'], ['success', iOk, 'Saved', 'Changes are live for everyone.'], ['warning', iWarn, 'Check this', 'Two integrations need a new token.'], ['danger', iErr, 'Couldn’t sync', 'GitHub didn’t answer. Try again.']].map(([tone, ic, h, p]) => (
                <div key={tone} className={`alert a-${tone}`} data-t={`bg:bg/${tone}-subtle border:border/${tone} fg:fg/${tone} radius:input pad:inset/md`}>
                  <I svg={ic} /><span><b className="t-label">{h}</b><p>{p}</p></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="band sec">
        <div className="wrap">
          <div className="head" style={{ alignItems: 'center', textAlign: 'center' }}>
            <span className="t-overline" style={{ color: 'var(--color-fg-brand)' }}>Pricing</span>
            <h2 className="t-h2">Simple, per-seat pricing</h2>
          </div>
          <div className="row" style={{ alignItems: 'stretch' }}>
            {[['Starter', '$0', 'For trying it with a few people.', ['3 projects', 'Daily digest'], false],
              ['Team', '$12', 'For teams that ship every week.', ['Unlimited projects', 'Forecasts', 'Slack alerts'], true],
              ['Business', '$24', 'For many teams and their leads.', ['Everything in Team', 'SSO and audit log', 'Priority help'], false]].map(([n, pr, d, f, pick], i) => (
              <div key={n as string} className={`card price${pick ? ' pick' : ''}`} style={third(i)} data-t={pick ? 'border:border/brand shadow:lg radius:card pad:inset/lg' : 'bg:bg/surface border:border/default radius:card pad:inset/lg shadow:sm'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="t-h4">{n as string}</span>
                  {pick && <span className="badge b-brand">Most popular</span>}
                </div>
                <span className="amount"><span className="t-h1" data-t="text:h1">{pr as string}</span><span className="t-body-sm muted">per seat a month</span></span>
                <p className="muted t-body-sm">{d as string}</p>
                <ul className="ticks">{(f as string[]).map(x => <li key={x}><I svg={iCheck} /><span className="t-body-sm">{x}</span></li>)}</ul>
                <span style={{ flex: 1 }} />
                <a className={`btn ${pick ? 'btn-primary' : 'btn-secondary'}`}>{pick ? 'Start free trial' : n === 'Business' ? 'Talk to us' : 'Get started'}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap sec">
        <div className="row">
          <figure className="quote" style={{ gridColumn: desk ? `${Math.floor((cols - quote) / 2) + 1} / span ${quote}` : '1 / -1', margin: 0 }}>
            <blockquote className="t-h3" style={{ margin: 0 }} data-t="text:h3 fg:fg/default">“We dropped two status meetings a week the day we turned {name} on.”</blockquote>
            <figcaption className="who" style={{ gap: 'var(--space-inline-md)' }}>
              <span className="av lg b" data-t="bg:bg/brand-subtle fg:fg/brand radius:avatar">AO</span>
              <span className="stack" style={{ textAlign: 'left' }}><span className="t-label">Ari Okafor</span><span className="t-caption muted">Head of Product, Fernbrook</span></span>
            </figcaption>
          </figure>
        </div>
        <div className="cta" style={{ marginTop: 'var(--space-section-md)' }} data-t="bg:bg/brand fg:fg/on-brand radius:dialog pad:inset/xl shadow:md">
          <div className="stack" style={{ gap: 'var(--space-stack-sm)', maxWidth: 520 }}>
            <h2 className="t-h2" data-t="text:h2 fg:fg/on-brand">Try {name} with your team</h2>
            <p className="t-body-lg">Free for 14 days. Bring everyone; it’s more useful that way.</p>
          </div>
          <div className="actions">
            <a className="btn btn-inverse btn-lg" data-t="bg:bg/canvas fg:fg/default radius:button">Start free trial</a>
            <a className="btn btn-outline-on btn-lg" data-t="fg:fg/on-brand radius:button">Book a demo</a>
          </div>
        </div>
      </section>

      <footer className="foot" data-t="bg:bg/subtle border:border/default pad:section/sm">
        <div className="wrap">
          <div className="row">
            <div style={{ gridColumn: desk ? `span ${span(4 / 12)}` : '1 / -1' }} className="stack">
              <span className="logo"><span className="mark"><I svg={iWaves} /></span>{name}</span>
              <p className="t-body-sm muted" style={{ marginTop: 'var(--space-stack-sm)', maxWidth: 280 }}>The calm dashboard for teams that ship.</p>
            </div>
            {[['Product', ['Features', 'Pricing', 'Changelog']], ['Company', ['About', 'Careers', 'Blog']], ['Help', ['Docs', 'Status', 'Contact']]].map(([h, ls]) => (
              <div key={h as string} style={{ gridColumn: desk ? `span ${Math.max(1, Math.floor((cols - span(4 / 12)) / 3))}` : mob ? `span ${Math.max(1, Math.floor(cols / 2))}` : `span ${Math.max(1, Math.floor(cols / 3))}` }}>
                <span className="t-overline muted">{h as string}</span>
                {(ls as string[]).map(l => <a key={l}>{l}</a>)}
              </div>
            ))}
          </div>
          <div className="rule" />
          <p className="t-caption subtle" style={full}>© 2026 {name}. A sample site, built only from your tokens.</p>
        </div>
      </footer>
    </>
  );
}

/** the columns, gutters and margins, laid over the site */
export function GridOverlay({ columns }: { columns: number }) {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      <div className="wrap" style={{ height: '100%' }}>
        <div className="row" style={{ height: '100%' }}>
          {Array.from({ length: Math.max(1, columns) }, (_, i) => (
            <span key={i} style={{ background: 'rgba(255, 64, 112, 0.09)', borderInline: '1px solid rgba(255, 64, 112, 0.22)', animation: 'tk-col .4s cubic-bezier(.2,.7,.2,1) both', animationDelay: `${i * 18}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export type Annot = { kind: string; token: string };
/** parse an element's `data-t` */
export const annotations = (s: string): Annot[] =>
  s.split(/\s+/).filter(Boolean).flatMap(pair => {
    const [kind, v] = pair.split(':');
    return (v ?? '').split(',').map(token => ({ kind, token }));
  });
