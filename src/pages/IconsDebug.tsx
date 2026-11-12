import { useSearchParams } from 'react-router-dom';
import { ICONS } from '../playground/icons/set';
import { ICON_CSS } from '../playground/icons/motion';
import { STYLES, iconSvg } from '../playground/icons/render';

/** Dev only (/__icons): every icon in every style, large. ?play=1 runs them; ?only=bell,mail picks a few. */
export default function IconsDebug() {
  const [q] = useSearchParams();
  const play = q.get('play') === '1';
  const only = q.get('only')?.split(',');
  const size = Number(q.get('size') ?? 72);
  const list = only ? ICONS.filter(i => only.includes(i.id)) : ICONS;
  return (
    <div style={{ background: '#f7f6f2', minHeight: '100vh', padding: 16 }}>
      <style>{ICON_CSS}</style>
      <div className="grid gap-x-2 gap-y-3" style={{ gridTemplateColumns: `80px repeat(${STYLES.length}, minmax(0, 1fr))` }}>
        <span />{STYLES.map(s => <span key={s.value} className="pg-label text-center">{s.label}</span>)}
        {list.map(i => (
          <div key={i.id} className="contents">
            <span className="self-center text-[12px] font-medium text-ink/60">{i.name}</span>
            {STYLES.map(s => (
              <span key={s.value} className="flex items-center justify-center rounded-[12px] bg-white py-2 [&>svg]:h-auto [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: iconSvg(i, s.value, {
                stroke: 1.6, color: '#17191e', accent: '#2c8bc6', uid: `dbg-${i.id}-${s.value}`, play, size: s.value === 'isometric' ? Math.round(size * 1.4) : size,
              }) }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
