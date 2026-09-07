import { useEffect, useState } from 'react';

export type VaultPhase = 'closed' | 'cleared' | 'open' | 'done';

/* The store's first-visit loading screen: two steel leaves, the logo engraved across the seam.
   Markup and CSS are the live ones; this only drives the phase classes. */
export const Vault = ({ phase }: { phase: VaultPhase }) => (
  <div className="cbs cbs-vault-scope cbs-vault-on" aria-hidden="true">
    <div className={`cbs-vault ${phase === 'cleared' ? 'is-cleared' : ''} ${phase === 'open' ? 'is-cleared is-open' : ''} ${phase === 'done' ? 'is-done' : ''}`} data-hero="1">
      <div className="cbs-vault__leaf cbs-vault__leaf--l"><span className="cbs-vault__face" /><span className="cbs-vault__logo" /></div>
      <div className="cbs-vault__leaf cbs-vault__leaf--r"><span className="cbs-vault__face" /><span className="cbs-vault__logo" /></div>
      <div className="cbs-vault__vig" />
    </div>
  </div>
);

/** Runs the live timing: settle beat, then the leaves part. `openAt` ms after mount. */
export const useVaultTimeline = (openAt = 1100, run = true) => {
  const [phase, setPhase] = useState<VaultPhase>('closed');
  useEffect(() => {
    if (!run) return;
    setPhase('closed');
    const t1 = setTimeout(() => setPhase('cleared'), Math.max(0, openAt - 180));
    const t2 = setTimeout(() => setPhase('open'), openAt);
    const t3 = setTimeout(() => setPhase('done'), openAt + 720);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [openAt, run]);
  const replay = () => { setPhase('closed'); setTimeout(() => setPhase('cleared'), 700); setTimeout(() => setPhase('open'), 900); setTimeout(() => setPhase('done'), 1620); };
  return { phase, replay };
};
