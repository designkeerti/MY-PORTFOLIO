import type { Scene } from './types';
import { Bg, Slide, Counter, Mono, Words } from './kit';
import { Vault, useVaultTimeline } from '../cbs/Vault';
import { LiveFrame } from '../cbs/LiveFrame';

/* Every scene here is the store's own page, embedded as it is on crossbordersupps.com:
   the hero with its brick wall, the boarding-pass cards, the stack tickets, the stamp sheet. */

const VaultScene = () => {
  const { phase } = useVaultTimeline(1350, true);
  return (
    <Bg color="#000">
      <LiveFrame src="/cbs/live/hero.html?first=1&still=1" w={1280} h={960} fit="contain" lazy={false} interactive={false} />
      <Vault phase={phase} />
    </Bg>
  );
};

export const cbsScenes = (): Scene[] => [
  { id: 'vault', duration: 5600, caption: 'A first visit starts behind a steel door', render: () => <VaultScene /> },
  {
    id: 'cards', duration: 3800, caption: 'Every product is a boarding pass: reference, route, perforation',
    render: () => (
      <Bg color="#000">
        <Slide delay={0.05} from="bottom" distance={60} style={{ position: 'absolute', inset: 0 }}>
          <LiveFrame src="/cbs/live/cards.html?center=1" w={1280} h={960} fit="contain" interactive={false} />
        </Slide>
      </Bg>
    ),
  },
  {
    id: 'stacks', duration: 3600, caption: 'Curated bundles are full tickets, barcode and all',
    render: () => (
      <Bg color="#000">
        <Slide delay={0.05} from="bottom" distance={60} style={{ position: 'absolute', inset: 0 }}>
          <LiveFrame src="/cbs/live/stacks.html?n=2&center=1" w={1280} h={960} fit="contain" interactive={false} />
        </Slide>
      </Bg>
    ),
  },
  {
    id: 'stamps', duration: 6400, caption: 'Eleven brands on a sheet of stamps, each hiding its country',
    render: () => (
      <Bg color="#000">
        <Slide delay={0.05} from="bottom" distance={40} style={{ position: 'absolute', inset: 0 }}>
          <LiveFrame src="/cbs/live/brands.html?wave=1&center=1" w={1466} h={1100} fit="contain" interactive={false} />
        </Slide>
      </Bg>
    ),
  },
  {
    id: 'live', duration: 3400, caption: 'Built on a live store taking real orders. No git, no staging, one change at a time.',
    render: () => (
      <Bg color="#06080b">
        <div className="absolute inset-0 flex items-center justify-center gap-[7%] px-[6%]" >
          {[[81, ' ms', 'blocking long tasks on the home page, from 1,249'], [321, '', 'URLs audited at four widths, zero failures'], [76, ' MB', 'decoded image memory on a phone, from 144']].map(([n, s, l], i) => (
            <Slide key={String(l)} delay={0.15 + i * 0.2} from="bottom" distance={40} style={{ maxWidth: '28%' }}>
              <div style={{ fontFamily: "'Anton', Impact, sans-serif", color: '#fff', fontSize: 'clamp(40px, calc(var(--fw) * 0.0800), 110px)', lineHeight: 1, letterSpacing: '.01em' }}><Counter to={n as number} duration={1.4} delay={0.15 + i * 0.2} /><span style={{ fontSize: '.45em', color: '#6cbde0' }}>{s as string}</span></div>
              <Mono color="rgba(255,255,255,.55)" style={{ marginTop: 10, textTransform: 'none', letterSpacing: '.02em', fontSize: 12, fontFamily: 'Satoshi, sans-serif' }}>{l as string}</Mono>
            </Slide>
          ))}
        </div>
        <div className="absolute left-[6%] top-[10%]"><Words text="Shipped." size="clamp(18px, calc(var(--fw) * 0.0300), 40px)" color="rgba(255,255,255,.4)" weight={700} /></div>
      </Bg>
    ),
  },
];
