import type { Scene } from './types';
import { Bg, Words, Slide, Device, Mono, Shot, Browser } from './kit';

const A = '/work/realestate/';
const ink = '#0E1418', gold = '#C9A96E';

export const infinityScenes = (): Scene[] => [
  {
    id: 'site', duration: 3200, caption: 'Infinity Lifespaces, a design-and-build firm in Gurugram',
    render: () => (
      <Bg color={ink}>
        <Shot src={A + '0rOejDMdIS2JXmUu7tkHyN19o74.webp'} alt="Infinity Lifespaces website hero" fit="cover" position="top center" from={{ scale: 1.08 }} to={{ scale: 1.0 }} duration={5} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(14,20,24,.15), rgba(14,20,24,.8))' }} />
        <div className="absolute left-[6%] bottom-[14%] max-w-[60%]">
          <Mono color={gold} style={{ marginBottom: 12 }}>Website + CRM · 2024</Mono>
          <Words text={'Trust is the\nwhole product.'} size="clamp(24px, calc(var(--fw) * 0.0460), 64px)" delay={0.3} />
        </div>
      </Bg>
    ),
  },
  {
    id: 'quote', duration: 3000, caption: 'A quotation calculator answers the first question before anyone has to ask it',
    render: () => (
      <Bg color={ink}>
        <div className="absolute inset-0 flex items-center justify-center gap-[6%] px-[6%]">
          <Slide delay={0.1} from="left" distance={50} style={{ maxWidth: '38%' }}>
            <Words text={'How much\nwill it cost?'} size="clamp(24px, calc(var(--fw) * 0.0440), 60px)" />
            <Mono color="rgba(255,255,255,.55)" style={{ marginTop: 12 }}>commercial · renovation · residential → estimate</Mono>
          </Slide>
          <Slide delay={0.35} from="bottom" distance={70} style={{ width: '48%' }}>
            <Browser src={A + 'jlpwQrRBs9GjmV3lttfdvBD2e4.png'} alt="Steps to your dream space, the quotation calculator" style={{ aspectRatio: '16/10' }} />
          </Slide>
        </div>
      </Bg>
    ),
  },
  {
    id: 'crm', duration: 3400, caption: 'One app for updates, payments, documents and the build team',
    render: () => (
      <Bg color="#F6F3EE">
        <div className="absolute inset-0 flex items-end justify-center gap-[4%] px-[6%]">
          {[['2oIQ5vxAoAawlGTcs38j8m8ejYA.png', 'CRM dashboard', -7, '4%'], ['z83VUveSouF2uuCiEumjf7RQxYQ.png', 'Payment milestones', 0, '12%'], ['Wph8fnmXv9WM4agA4LiMhm1Cc8.png', 'Messages with the team', 7, '4%']].map(([f, alt, r, mb], i) => (
            <Slide key={f as string} delay={0.15 + i * 0.18} from="bottom" distance={120} rotate={r as number} style={{ marginBottom: mb as string }}>
              <Device src={A + (f as string)} alt={alt as string} width="calc(var(--fw) * 0.235)" />
            </Slide>
          ))}
        </div>
      </Bg>
    ),
  },
  {
    id: 'features', duration: 2800, caption: 'Transparency, as features',
    render: () => (
      <Bg color={ink}>
        <div className="absolute inset-0 flex flex-col justify-center px-[8%]" style={{ gap: 16 }}>
          {['Live video from your site.', 'Payment milestones you can see.', 'Moodboards you build together.'].map((t, i) => (
            <Words key={t} text={t} size="clamp(18px, calc(var(--fw) * 0.0360), 50px)" color={i === 1 ? gold : '#fff'} delay={0.2 + i * 0.5} stagger={0.05} />
          ))}
        </div>
      </Bg>
    ),
  },
];
