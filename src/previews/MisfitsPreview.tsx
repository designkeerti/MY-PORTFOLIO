import type { Scene } from './types';
import { Bg, Words, Slide, Counter, Device, Mono, Shot } from './kit';

const A = '/work/misfits/';
const ink = '#0E0A1C', violet = '#8B5CF6';

export const misfitsScenes = (): Scene[] => [
  {
    id: 'open', duration: 3000, caption: 'Misfits, 2023. A community app for finding your people',
    render: () => (
      <Bg color={ink}>
        <div className="absolute inset-0 flex items-center justify-between px-[7%]">
          <div style={{ maxWidth: '52%' }}>
            <Mono color={violet} style={{ marginBottom: 14 }}>Misfits · UX/UI · 2023</Mono>
            <Words text={'Find your\npeople.'} size="clamp(34px, calc(var(--fw) * 0.0700), 96px)" delay={0.2} />
          </div>
          <Slide delay={0.5} from="bottom" distance={90}>
            <Device src={A + 'LlJ5OvpyCvxaPCT39k3u9kVFocU.png'} alt="Discover hobbies you love" width="clamp(120px, calc(var(--fw) * 0.1700), 230px)" />
          </Slide>
        </div>
      </Bg>
    ),
  },
  {
    id: 'flow', duration: 3200, caption: 'Explore a club, feel the vibe, join the chat, show up',
    render: () => (
      <Bg color={ink}>
        <div className="absolute inset-0 flex items-end justify-center gap-[3%] px-[6%]">
          {[['ohaffIRt0xglZU0U2rKGdrcYD5o.webp', 'Explore Misfits', -8, '2%'], ['Yqrk26djw5tgPKy7Ix365qrk3s.webp', 'Club detail', 0, '10%'], ['XpJNlpQXMaQtWyVGkRLhMl174.png', 'Club chat', 8, '2%']].map(([f, alt, r, mb], i) => (
            <Slide key={f as string} delay={0.15 + i * 0.18} from="bottom" distance={120} rotate={r as number} style={{ marginBottom: mb as string }}>
              <Device src={A + (f as string)} alt={alt as string} width="clamp(110px, calc(var(--fw) * 0.1500), 200px)" />
            </Slide>
          ))}
        </div>
      </Bg>
    ),
  },
  {
    id: 'research', duration: 2600, caption: 'Surveys first. The gap was authenticity, and the leap from online to real life',
    render: () => (
      <Bg color={violet}>
        <div className="absolute inset-0 flex items-center justify-center gap-[8%] px-[6%]">
          <div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(64px, calc(var(--fw) * 0.1400), 180px)', letterSpacing: '-.05em', lineHeight: 1 }}><Counter to={200} suffix="+" duration={1.3} /></div>
            <Mono color="rgba(255,255,255,.75)" style={{ marginTop: 6 }}>people surveyed</Mono>
          </div>
          <Slide delay={0.6} from="right" distance={40}>
            <Words text={'“I want real\nfriends, not\nmore followers.”'} size="clamp(18px, calc(var(--fw) * 0.0300), 36px)" weight={700} color="#fff" letterSpacing="-.02em" lineHeight={1.12} />
          </Slide>
        </div>
      </Bg>
    ),
  },
  {
    id: 'vibe', duration: 3000, caption: 'Check the vibe before you commit',
    render: () => (
      <Bg color={ink}>
        <Shot src={A + 'YFMAoHq6S23Hc3M6YhFtRK0th5M.webp'} alt="A boardgaming club meetup" fit="cover" position="center" from={{ scale: 1.15 }} to={{ scale: 1.02 }} duration={5} style={{ filter: 'saturate(1.05)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(14,10,28,.85) 30%, rgba(14,10,28,.15))' }} />
        <div className="absolute left-[7%] top-1/2 -translate-y-1/2 max-w-[55%]">
          <Words text={'See the vibe\nbefore you\ncommit.'} size="clamp(26px, calc(var(--fw) * 0.0500), 70px)" delay={0.3} />
        </div>
      </Bg>
    ),
  },
  {
    id: 'welcome', duration: 2600, caption: 'Welcome to Misfits',
    render: () => (
      <Bg color={ink}>
        <div className="absolute inset-0 flex items-center justify-center gap-[6%] px-[6%]">
          <Slide delay={0.1} from="left" distance={60}>
            <Words text={'Woohooo!'} size="clamp(36px, calc(var(--fw) * 0.0800), 110px)" color={violet} />
            <Mono color="rgba(255,255,255,.6)" style={{ marginTop: 10 }}>pick an avatar, you’re in</Mono>
          </Slide>
          <Slide delay={0.35} from="bottom" distance={90}>
            <Device src={A + 'YyM87pl8zqWCd4Bs2uGCujP0srA.webp'} alt="Welcome to Misfits, choose your avatar" width="clamp(120px, calc(var(--fw) * 0.1700), 230px)" />
          </Slide>
        </div>
      </Bg>
    ),
  },
];
