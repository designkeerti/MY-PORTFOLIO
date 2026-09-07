import { useState } from 'react';
import { motion } from 'framer-motion';
import { BoardingCard, sampleCards } from '../cbs/BoardingCard';
import { StackTicket, stacks } from '../cbs/StackTicket';
import { StampSheet } from '../cbs/StampSheet';
import { Vault, useVaultTimeline } from '../cbs/Vault';
import { WallHero, heroStates } from '../cbs/WallHero';

const Panel = ({ children, label, right }: { children: React.ReactNode; label: string; right?: React.ReactNode }) => (
  <motion.div className="w-full max-w-[1240px] mx-auto px-6" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: .6 }}>
    <div className="rounded-[26px] overflow-hidden" style={{ background: '#06080b', boxShadow: '0 40px 80px -40px rgba(0,0,0,.6)' }}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 md:px-8 pt-5 pb-1">
        <span className="kicker" style={{ color: '#6cbde0' }}>● Live component · {label}</span>
        <span className="shrink-0">{right}</span>
      </div>
      {children}
    </div>
  </motion.div>
);

const btn = 'kicker rounded-full px-4 py-2 border border-white/20 text-white/80 hover:bg-white/10 transition-colors';

export const CbsLive = ({ id }: { id: 'cbs-cards' | 'cbs-stacks' | 'cbs-stamps' | 'cbs-vault' | 'cbs-wall' }) => {
  if (id === 'cbs-cards') return <CardsPanel />;
  if (id === 'cbs-stacks') return (
    <Panel label="stack tickets">
      <div className="cbs p-6 md:p-8 cbs-home__stack-grid--free">{stacks.map(s => <StackTicket key={s.num} {...s} />)}</div>
    </Panel>
  );
  if (id === 'cbs-stamps') return (
    <Panel label="brand rail" right={<span className="kicker text-white/40">hover a stamp</span>}>
      <div className="cbs cbs-live p-6 md:p-8"><StampSheet /></div>
    </Panel>
  );
  if (id === 'cbs-vault') return <VaultPanel />;
  return <WallPanel />;
};

const CardsPanel = () => {
  const [oos, setOos] = useState(false);
  return (
    <Panel label="boarding-pass product cards" right={<button className={btn} onClick={() => setOos(o => !o)}>{oos ? 'Show in stock' : 'Show sold out'}</button>}>
      <div className="cbs p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {sampleCards.map(c => <div key={c.code} className="w-full max-w-[320px] mx-auto"><BoardingCard {...c} soldOut={oos ? true : c.soldOut} /></div>)}
      </div>
    </Panel>
  );
};

const VaultPanel = () => {
  const { phase, replay } = useVaultTimeline(1400, true);
  return (
    <Panel label="first-visit vault" right={<button className={btn} onClick={replay}>↺ Open again</button>}>
      <div className="relative m-6 md:m-8 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/8', containerType: 'inline-size' }}>
        <div className="absolute inset-0" style={{ ['--fw' as string]: '100cqw' }}><WallHero state={heroStates[0]} enterDelay={1.6} /></div>
        <Vault phase={phase} />
      </div>
    </Panel>
  );
};

const WallPanel = () => {
  const [i, setI] = useState(1);
  const s = heroStates[i];
  return (
    <Panel label="home hero, brand cycle" right={<span className="flex gap-2"><button className={btn} onClick={() => setI((i + heroStates.length - 1) % heroStates.length)}>←</button><button className={btn} onClick={() => setI((i + 1) % heroStates.length)}>→</button></span>}>
      <div className="relative m-6 md:m-8 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/8', containerType: 'inline-size' }}>
        <div className="absolute inset-0" style={{ ['--fw' as string]: '100cqw' }}><WallHero key={i} state={s} enterDelay={0} /></div>
      </div>
    </Panel>
  );
};
