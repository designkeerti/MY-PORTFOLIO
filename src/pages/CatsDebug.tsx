import { CardCat } from '../components/cats/CardCat';

/** Dev only (/__cats): the four card acts, one per card, three times their size. */
const ACTS = [['nap', 'ragdoll'], ['pounce', 'tabby'], ['groom', 'siamese'], ['stroll', 'tuxedo']] as const;

export default function CatsDebug() {
  return (
    <div style={{ background: '#d1d1d1', minHeight: '100vh', padding: '200px 24px 80px' }} className="flex flex-col gap-[230px]">
      {ACTS.map(([act, cat]) => (
        <div key={act} className="relative mx-auto h-[220px] w-full max-w-[560px] rounded-[28px] border border-white/80 bg-white/70 p-6 text-ink">
          <CardCat id={`demo-${act}`} size="xl" demo={{ cat, act }} />
          <p className="text-[12px] uppercase tracking-[0.24em] text-ink/50">{act} · {cat}</p>
        </div>
      ))}
    </div>
  );
}
