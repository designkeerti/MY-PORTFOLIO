import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ICON_CSS } from '../playground/icons/motion';
import { loadCategory, loadIndex, type IconMeta } from '../playground/icons/data';
import { STYLES, iconSvg, paletteFrom, type Geo } from '../playground/icons/render';

const PICKS = 'bell,gear,heart,house,rocket,chart-line-up,envelope-simple,camera,lightning,cloud-rain,shopping-cart,lock,magnifying-glass,trash,airplane,coffee,github-logo,arrow-right';

/** Dev only (/__icons): a few icons in every style, large. ?play=1 runs them; ?only=bell,gear picks them. */
export default function IconsDebug() {
  const [q] = useSearchParams();
  const play = q.get('play') === '1';
  const only = (q.get('only') ?? PICKS).split(',');
  const size = Number(q.get('size') ?? 72);
  const [list, setList] = useState<IconMeta[]>([]);
  const [geo, setGeo] = useState<Record<string, Geo>>({});
  useEffect(() => {
    loadIndex().then(all => {
      const l = only.map(n => all.find(i => i.name === n)).filter((i): i is IconMeta => !!i);
      setList(l);
      Promise.all([...new Set(l.map(i => i.cats[0]))].map(loadCategory)).then(fs => setGeo(Object.assign({}, ...fs)));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const palette = paletteFrom('#2f6bed');
  return (
    <div style={{ background: '#f7f6f2', minHeight: '100vh', padding: 16 }}>
      <style>{ICON_CSS}</style>
      <div className="grid gap-x-2 gap-y-3" style={{ gridTemplateColumns: `100px repeat(${STYLES.length}, minmax(0, 1fr))` }}>
        <span />{STYLES.map(s => <span key={s.value} className="pg-label text-center">{s.label}</span>)}
        {list.filter(i => geo[i.name]).map(i => (
          <div key={i.name} className="contents">
            <span className="self-center text-[12px] font-medium text-ink/60">{i.name}</span>
            {STYLES.map(s => (
              <span key={s.value} className="flex items-center justify-center rounded-[12px] bg-white py-2 [&>svg]:h-auto [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: iconSvg(i, geo[i.name], s.value, {
                color: '#17191e', accent: '#2f6bed', palette, uid: `dbg-${i.name}-${s.value}`, play, size: s.value === 'isometric' ? Math.round(size * 1.4) : size,
              }) }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
