import { useEffect, useState } from 'react';
import type { Scene } from './types';
import { Bg, Slide, Counter, Mono, Words } from './kit';
import { Vault, useVaultTimeline } from '../cbs/Vault';
import { WallHero, heroStates } from '../cbs/WallHero';
import { BoardingCard, sampleCards } from '../cbs/BoardingCard';
import { StackTicket, stacks } from '../cbs/StackTicket';
import { StampSheet, brands } from '../cbs/StampSheet';

const VaultScene = () => {
  const { phase } = useVaultTimeline(1150, true);
  return (
    <Bg color="#000">
      <WallHero state={heroStates[0]} enterDelay={1.25} />
      <Vault phase={phase} />
    </Bg>
  );
};

const StampScene = () => {
  const [lit, setLit] = useState<number[]>([]);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => { setLit([i % brands.length, (i + 4) % brands.length]); i++; }, 260);
    return () => clearInterval(id);
  }, []);
  return (
    <Bg color="#06080b">
      <div className="cbs" style={{ position: 'absolute', inset: 0, padding: '4% 5% 58px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="cbs-trust__intro cbs-trust__intro--noeyebrow" style={{ marginBottom: 14 }}>
          <Slide delay={0.05} from="bottom" distance={20}><h2 className="cbs-home__h" style={{ fontSize: 'clamp(22px, calc(var(--fw) * 0.0400), 52px)' }}>11 BRANDS.<span className="cbs-home__h-rest"> ONE STORE.</span></h2></Slide>
        </div>
        <Slide delay={0.2} from="bottom" distance={30}>
          <StampSheet lit={lit} cols={6} style={{ gap: 10 }} />
        </Slide>
      </div>
    </Bg>
  );
};

export const cbsScenes = (): Scene[] => [
  { id: 'vault', duration: 5200, caption: 'A first visit starts behind a steel door', render: () => <VaultScene /> },
  {
    id: 'cards', duration: 3600, caption: 'Every product is a boarding pass: reference, route, perforation. Hover one.',
    render: () => (
      <Bg color="#06080b">
        <div className="cbs" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2.5%', padding: '4% 4% 8%' }}>
          {sampleCards.map((c, i) => (
            <Slide key={c.code} delay={0.1 + i * 0.14} from="bottom" distance={90}
              style={{ width: '23%', flex: '0 0 auto' }}>
              <BoardingCard {...c} />
            </Slide>
          ))}
        </div>
      </Bg>
    ),
  },
  {
    id: 'stacks', duration: 3400, caption: 'Curated bundles are full tickets, barcode and all',
    render: () => (
      <Bg color="#06080b">
        <div className="cbs" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3%', padding: '4% 5% 8%' }}>
          {stacks.slice(0, 2).map((s, i) => (
            <Slide key={s.num} delay={0.1 + i * 0.22} from="bottom" distance={110} rotate={i ? 2 : -2}
              style={{ width: '44%', flex: '0 0 auto' }}>
              <StackTicket {...s} />
            </Slide>
          ))}
        </div>
      </Bg>
    ),
  },
  { id: 'stamps', duration: 3400, caption: 'Eleven brands on a sheet of stamps, each hiding its country', render: () => <StampScene /> },
  {
    id: 'live', duration: 3400, caption: 'Built on a live store taking real orders. No git, no staging, one change at a time.',
    render: () => (
      <Bg color="#06080b">
        <div className="absolute inset-0 flex items-center justify-center gap-[7%] px-[6%]" >
          {[[81, ' ms', 'blocking long tasks on the home page, from 1,249'], [321, '', 'URLs audited at four widths, zero failures'], [76, ' MB', 'decoded image memory on a phone, from 144']].map(([n, s, l], i) => (
            <Slide key={String(l)} delay={0.15 + i * 0.2} from="bottom" distance={40} style={{ maxWidth: '28%' }}>
              <div style={{ fontFamily: 'var(--cbs-font-display, Anton)', color: '#fff', fontSize: 'clamp(40px, calc(var(--fw) * 0.0800), 110px)', lineHeight: 1, letterSpacing: '.01em' }}><Counter to={n as number} duration={1.4} delay={0.15 + i * 0.2} /><span style={{ fontSize: '.45em', color: '#6cbde0' }}>{s as string}</span></div>
              <Mono color="rgba(255,255,255,.55)" style={{ marginTop: 10, textTransform: 'none', letterSpacing: '.02em', fontSize: 12, fontFamily: 'Satoshi, sans-serif' }}>{l as string}</Mono>
            </Slide>
          ))}
        </div>
        <div className="absolute left-[6%] top-[10%]"><Words text="Shipped." size="clamp(18px, calc(var(--fw) * 0.0300), 40px)" color="rgba(255,255,255,.4)" weight={700} /></div>
      </Bg>
    ),
  },
];
