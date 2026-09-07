import { motion } from 'framer-motion';
import type { Scene } from './types';
import { Bg, Words, Slide, Counter, Device, Mono, Shot, EASE } from './kit';

const A = '/work/dmrc/';
const navy = '#0A1424';
const lines = [
  { c: '#E53935', d: 'M40 300 C 300 300, 500 120, 760 120 S 1100 300, 1360 300' },
  { c: '#FDD835', d: 'M700 40 C 700 200, 700 300, 700 480' },
  { c: '#1E88E5', d: 'M40 160 C 300 160, 420 380, 760 380 S 1200 160, 1360 160' },
  { c: '#43A047', d: 'M120 470 C 400 470, 600 60, 900 60 S 1300 470, 1360 470' },
  { c: '#EC407A', d: 'M40 420 C 300 420, 900 200, 1360 60' },
];
const stations = [[700, 120], [760, 380], [700, 300], [400, 300], [1000, 120], [700, 200], [900, 60], [500, 160], [1100, 300], [300, 420], [1150, 190]];

export const dmrcScenes = (): Scene[] => [
  {
    id: 'map', duration: 3800, caption: 'Delhi Metro. 288 stations, 393 km, 5.5 million people a day',
    render: () => (
      <Bg color={navy}>
        <svg viewBox="0 0 1400 520" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {lines.map((l, i) => (
            <motion.path key={l.c} d={l.d} fill="none" stroke={l.c} strokeWidth="10" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0.2 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.8, delay: i * 0.22, ease: EASE }} />
          ))}
          {stations.map(([x, y], i) => (
            <motion.circle key={i} cx={x} cy={y} r="9" fill="#fff" stroke={navy} strokeWidth="5" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.2 + i * 0.08, duration: 0.35, ease: EASE }} style={{ transformOrigin: `${x}px ${y}px` }} />
          ))}
          <motion.circle cx="700" cy="300" r="22" fill="none" stroke="#fff" strokeWidth="4" initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.15, 1], opacity: 1 }} transition={{ delay: 2.2, duration: 0.6 }} style={{ transformOrigin: '700px 300px' }} />
          <motion.text x="735" y="292" fill="#fff" fontFamily="JetBrains Mono, monospace" fontSize="15" letterSpacing="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>RAJIV CHOWK · INTERCHANGE</motion.text>
        </svg>
        <div className="absolute left-[5%] top-[12%]">
          <Words text={'One city.\nToo many people\nat the same gate.'} size="clamp(22px, calc(var(--fw) * 0.0420), 58px)" delay={0.6} />
        </div>
      </Bg>
    ),
  },
  {
    id: 'stats', duration: 2800, caption: 'What commuters told us',
    render: () => (
      <Bg color="#fff">
        <div className="absolute inset-0 flex items-center justify-center gap-[8%] px-[6%]">
          {[[72, 'cite peak-hour overcrowding as the biggest frustration', '#E53935'], [65, 'face delays; women and the elderly cite comfort and safety', '#1E88E5']].map(([n, l, c], i) => (
            <Slide key={String(n)} delay={0.2 + i * 0.35} from="bottom" distance={40} style={{ maxWidth: '38%' }}>
              <div style={{ color: c as string, fontWeight: 900, fontSize: 'clamp(56px, calc(var(--fw) * 0.1200), 160px)', letterSpacing: '-.05em', lineHeight: 1 }}><Counter to={n as number} suffix="%" duration={1.4} delay={0.2 + i * 0.35} /></div>
              <p style={{ color: '#333', fontSize: 'clamp(12px, calc(var(--fw) * 0.0150), 18px)', fontWeight: 600, lineHeight: 1.35, marginTop: 8 }}>{l as string}</p>
            </Slide>
          ))}
        </div>
      </Bg>
    ),
  },
  {
    id: 'world', duration: 3200, caption: 'Learning from Tokyo, London and Hong Kong',
    render: () => (
      <Bg color={navy}>
        <div className="absolute inset-0 flex items-center justify-center gap-[3%] px-[5%]">
          {[['26ueH5rNumxl3TWRnuijwkKIGE.webp', 'Tokyo: carriage maps tell you which car to board', -6], ['0PI4IszNcA1gFqyM6o5m2WmlLA.webp', 'London: tap in with your phone', 0], ['q0VpX6FtaR2etTq3ORrmX7PP3w.webp', 'Hong Kong: one Octopus card for everything', 6]].map(([f, alt, r], i) => (
            <Slide key={f as string} delay={0.15 + i * 0.2} from="bottom" distance={80} rotate={r as number} style={{ width: '30%' }}>
              <div className="fig" style={{ aspectRatio: '4/3' }}><img src={A + (f as string)} alt={alt as string} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <Mono color="rgba(255,255,255,.6)" style={{ marginTop: 10 }}>{(alt as string).split(':')[0]}</Mono>
            </Slide>
          ))}
        </div>
      </Bg>
    ),
  },
  {
    id: 'hats', duration: 2600, caption: 'Six Thinking Hats: every idea judged from six directions',
    render: () => (
      <Bg color="#F4F1EA">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <div className="flex gap-[2.5%] w-[76%] justify-center">
            {['#f5f5f5', '#FDD835', '#111', '#E53935', '#43A047', '#1E88E5'].map((c, i) => (
              <motion.div key={c} style={{ width: '12%', aspectRatio: '1', borderRadius: '50%', background: c, boxShadow: '0 12px 30px -12px rgba(0,0,0,.45), inset 0 -8px 16px rgba(0,0,0,.12)' }}
                initial={{ scale: 0, y: 40 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.12, type: 'spring', stiffness: 260, damping: 16 }} />
            ))}
          </div>
          <Words text="Six hats. One problem." size="clamp(20px, calc(var(--fw) * 0.0360), 48px)" color="#111" align="center" delay={0.9} />
        </div>
      </Bg>
    ),
  },
  {
    id: 'ar', duration: 3400, caption: 'Find Your Way: AR guidance inside the station, and the right exit gate',
    render: () => (
      <Bg color={navy}>
        <Shot src={A + 'RN2r3DBw4Fvr4fT8Ek9HKSrPvU.webp'} alt="AR path following inside a metro station" fit="cover" position="center" from={{ scale: 1.12 }} to={{ scale: 1.0 }} duration={5} style={{ opacity: .55 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(10,20,36,.2), rgba(10,20,36,.85) 70%)' }} />
        <div className="absolute right-[6%] bottom-0 flex items-end gap-[3%]">
          <Slide delay={0.2} from="bottom" distance={120}><Device src={A + 'Q2EbMIFM5Pvi5w33Cy9OZJt0h7U.png'} alt="You can exit from Gate No. 3" width="calc(var(--fw) * 0.165)" /></Slide>
          <Slide delay={0.45} from="bottom" distance={140}><Device src={A + 'YijBlctGzn0Mk4J6rFwf6TL43P0.png'} alt="Plan your journey" width="calc(var(--fw) * 0.19)" style={{ marginBottom: '-6%' }} /></Slide>
        </div>
        <div className="absolute left-[5%] top-[14%] max-w-[40%]">
          <Words text={'Find\nYour Way.'} size="clamp(28px, calc(var(--fw) * 0.0560), 80px)" delay={0.2} />
        </div>
      </Bg>
    ),
  },
];
