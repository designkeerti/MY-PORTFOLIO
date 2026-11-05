import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { rig, pose, type Pose } from '../components/cats/rig';
import { RIGS } from '../components/cats/rigs';

/**
 * Dev only (/__rig?cat=tabby): one cat, large, on a grid in its own drawing units, to build
 * and check its rig. mode=parts colours each part and outlines its region and joint;
 * test=1 swings every part, to look for seams.
 */
const COLORS = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#9a6324', '#469990', '#800000', '#000075', '#bfef45'];

export default function RigDebug() {
  const [q] = useSearchParams();
  const name = q.get('cat') ?? 'tabby', W = Number(q.get('w') ?? 640), mode = q.get('mode') ?? 'parts', test = q.get('test') === '1';
  const host = useRef<SVGGElement>(null), svgRef = useRef<SVGSVGElement>(null), over = useRef<SVGGElement>(null);

  useEffect(() => {
    let raf = 0, alive = true;
    fetch(`/about/cats/${name}.svg`).then(r => r.text()).then(txt => {
      if (!alive) return;
      const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      const src = doc.documentElement;
      // crop=x,y,w,h zooms into one region of the drawing
      const box = q.get('crop')?.split(',').join(' ') ?? src.getAttribute('viewBox')!;
      svgRef.current!.setAttribute('viewBox', box);
      const [vx, vy, vw, vh] = box.split(/\s+/).map(Number);
      svgRef.current!.style.height = `${(W * vh) / vw}px`;
      const g = host.current!;
      g.innerHTML = src.innerHTML;
      const def = RIGS[name];
      // every shape's index, fill and box, for writing `assign` fix-ups
      (window as unknown as { geo: string }).geo = [...g.querySelectorAll<SVGGraphicsElement>('path,ellipse,polygon,circle,rect,polyline,line')].map((l, i) => {
        const b = l.getBBox();
        return `${i} ${l.getAttribute('fill')} x${b.x.toFixed(0)}-${(b.x + b.width).toFixed(0)} y${b.y.toFixed(0)}-${(b.y + b.height).toFixed(0)}`;
      }).join('\n');
      const r = rig(g, def, `dbg-${name}`);
      const names = ['body', ...def.parts.map(p => p.name)];
      const o = over.current!; o.innerHTML = '';
      const add = (tag: string, attrs: Record<string, string | number>) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, String(attrs[k])); o.appendChild(e); return e; };
      // grid every 5 units, stronger every 10 and labelled every 20
      const step = vw > 90 ? 5 : 2, major = vw > 90 ? 20 : 10;
      for (let x = Math.ceil(vx / step) * step; x <= vx + vw; x += step) {
        add('line', { x1: x, x2: x, y1: vy, y2: vy + vh, stroke: x % (step * 2) ? 'rgba(0,0,0,.08)' : 'rgba(0,0,0,.25)', 'stroke-width': vw / W });
        if (x % major === 0) add('text', { x: x + vw / 300, y: vy + vw / 50, 'font-size': vw / 45, fill: '#c00' }).textContent = String(x);
      }
      for (let y = Math.ceil(vy / step) * step; y <= vy + vh; y += step) {
        add('line', { y1: y, y2: y, x1: vx, x2: vx + vw, stroke: y % (step * 2) ? 'rgba(0,0,0,.08)' : 'rgba(0,0,0,.25)', 'stroke-width': vw / W });
        if (y % major === 0) add('text', { x: vx + vw / 300, y: y - vw / 300, 'font-size': vw / 45, fill: '#c00' }).textContent = String(y);
      }
      if (mode === 'parts') {
        const style = document.createElement('style');
        style.textContent = names.map((n, i) => `[data-part="${n}"] > * { fill: ${n === 'body' ? '#bbb' : COLORS[i % COLORS.length]} !important; }`).join('\n');
        g.appendChild(style);
        def.parts.forEach((p, i) => {
          add('path', { d: 'M' + p.poly.map(v => v.join(' ')).join('L') + 'Z', fill: 'none', stroke: COLORS[(i + 1) % COLORS.length], 'stroke-width': (vw / W) * 2, 'stroke-dasharray': `${vw / W * 6} ${vw / W * 4}` });
          add('circle', { cx: p.pivot[0], cy: p.pivot[1], r: vw / W * 5, fill: '#000' });
          add('text', { x: p.pivot[0] + 1, y: p.pivot[1] - 1, 'font-size': vw / 45, fill: '#000' }).textContent = p.name;
        });
        add('circle', { cx: def.pivot[0], cy: def.pivot[1], r: vw / W * 6, fill: '#fff', stroke: '#000' });
      }
      if (test) {
        const loop = (t: number) => {
          const s = Math.sin(t / 500), p: Pose = {};
          // eyes only ever blink; everything else swings, to look for seams
          def.parts.forEach((part, i) => { p[part.name] = part.name === 'eyes' ? { sy: Math.max(0.1, Math.abs(s)) } : { r: s * (i % 2 ? 18 : -18) }; });
          p.body = { sy: 1 + s * 0.03 };
          pose(r, p);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      }
      document.title = `rig ${name} ready`;
    });
    return () => { alive = false; cancelAnimationFrame(raf); };
  }, [name, W, mode, test]);

  return (
    <div style={{ background: '#d1d1d1', minHeight: '100vh', padding: 24 }}>
      <svg ref={svgRef} style={{ width: W, display: 'block', overflow: 'visible' }}>
        <g ref={host} />
        <g ref={over} pointerEvents="none" />
      </svg>
    </div>
  );
}
