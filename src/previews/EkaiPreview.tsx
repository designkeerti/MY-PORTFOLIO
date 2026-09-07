import type { Scene } from './types';
import { Bg, Words, Slide, Counter, Device, Browser, Mono, Clip } from './kit';

const A = '/work/ekai/';
const cream = '#FBF3EA', teal = '#27403F', orange = '#FF6A2A';

export const ekaiScenes = (): Scene[] => [
  {
    id: 'hero', duration: 3200, caption: 'An AI twin on Slack, explained in one glance',
    render: () => (
      <Bg color={cream}>
        <Clip src={A + 'b4LEGCUCaclrfhX51x9RUiUasM.mp4'} fit="cover" position="top center" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent, rgba(20,20,20,.55))' }} />
        <div className="absolute left-[5%] bottom-[16%] max-w-[60%]">
          <Words text={'The website is the\nfirst sales call.'} color="#fff" size="clamp(22px, calc(var(--fw) * 0.0400), 56px)" delay={0.4} />
        </div>
      </Bg>
    ),
  },
  {
    id: 'bounce', duration: 2800, caption: 'What the analytics said about the old site',
    render: () => (
      <Bg color={teal}>
        <div className="absolute inset-0 flex items-center justify-center gap-[6%] px-[6%]">
          <div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(64px, calc(var(--fw) * 0.1400), 180px)', letterSpacing: '-.05em', lineHeight: 1 }}>
              <Counter to={63} suffix="%" duration={1.4} />
            </div>
            <Mono color="rgba(255,255,255,.7)" style={{ marginTop: 6 }}>mobile bounce rate</Mono>
          </div>
          <div className="flex flex-col gap-3 md:gap-5">
            {[['12s', 'spent on the website'], ['<2%', 'ever touched the CTA'], ['<0.5%', 'saw the features']].map(([n, l], i) => (
              <Slide key={n} delay={0.5 + i * 0.18} from="right" distance={40}>
                <div style={{ color: orange, fontWeight: 900, fontSize: 'clamp(22px, calc(var(--fw) * 0.0400), 46px)', letterSpacing: '-.03em', lineHeight: 1 }}>{n}</div>
                <Mono color="rgba(255,255,255,.6)">{l}</Mono>
              </Slide>
            ))}
          </div>
        </div>
      </Bg>
    ),
  },
  {
    id: 'concepts', duration: 3400, caption: 'Three directions. B scored highest, A had the heart. We built the hybrid.',
    render: () => (
      <Bg color={cream}>
        <div className="absolute inset-0 flex items-center justify-center gap-[3%] px-[5%]">
          {[['A', 'vy77NpmDiVnpU2AD.png'], ['B', 'iAwUppv898zbQLku.png'], ['C', 'DP3DEoZ5bpzZdh0u.png']].map(([k, f], i) => (
            <Slide key={k} delay={0.15 + i * 0.16} from="bottom" distance={50} style={{ width: '30%' }}>
              <div style={{ position: 'relative' }}>
                <div className="fig" style={{ aspectRatio: '4/3', overflow: 'hidden', outline: k === 'B' ? `3px solid ${orange}` : '3px solid transparent', outlineOffset: 4, transition: 'outline-color .4s' }}>
                  <img src={A + f} alt={`Concept ${k}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                </div>
                <Mono color={k === 'B' ? orange : 'rgba(0,0,0,.45)'} style={{ marginTop: 10, textAlign: 'center' }}>Concept {k}{k === 'B' ? ' · highest score' : k === 'A' ? ' · best opener' : ''}</Mono>
              </div>
            </Slide>
          ))}
        </div>
      </Bg>
    ),
  },
  {
    id: 'alive', duration: 3200, caption: 'Micro-interactions that remove hesitation',
    render: () => (
      <Bg color="#111">
        <div className="absolute inset-0 grid grid-cols-2 gap-[2%] p-[3%]">
          <Slide delay={0.1} from="left" distance={40} style={{ overflow: 'hidden', borderRadius: 14 }}>
            <Clip src={A + 'yvCOXE3FsehpZbAYAz4FgDbfhUc.mp4'} />
          </Slide>
          <Slide delay={0.3} from="right" distance={40} style={{ overflow: 'hidden', borderRadius: 14 }}>
            <Clip src={A + 'qJlWawcCzXTwNSh3ZDbm19udE.mp4'} />
          </Slide>
        </div>
      </Bg>
    ),
  },
  {
    id: 'ship', duration: 3600, caption: 'Shipped. Live at yourekai.com',
    render: () => (
      <Bg color={cream}>
        <div className="absolute inset-0 flex items-end justify-center gap-[4%] px-[6%]">
          <Slide delay={0.1} from="bottom" style={{ width: '62%', height: '92%' }}>
            <Browser src={A + 'h67k8Am6rvHpo62aF0F8jg5PYY.webp'} alt="ekai final site" style={{ height: '100%', borderRadius: '14px 14px 0 0' }} scrollTo={70} duration={9} />
          </Slide>
          <Slide delay={0.4} from="bottom" distance={80} style={{ marginBottom: '4%' }}>
            <Device src={A + 'Alv7K57kzIG1tKlgVoal0XhvQ0k.png'} alt="ekai on mobile" width="clamp(110px, calc(var(--fw) * 0.1500), 210px)" />
          </Slide>
        </div>
      </Bg>
    ),
  },
];
