import { useEffect, useRef, useState, type CSSProperties } from 'react';

type Size = { w: number; h: number; src?: string };

type Props = {
  /** a document under /cbs/live/: the store's own markup, stylesheet and scripts */
  src: string;
  /** the width and height the document is laid out at, in CSS pixels */
  w: number;
  h: number;
  /** below `mobileBelow` px of container width, lay the same document out at this phone size instead */
  mobile?: Size;
  mobileBelow?: number;
  /** `width`: scale to the container width, the height follows. `contain`: fit inside the container, centred. */
  fit?: 'width' | 'contain';
  interactive?: boolean;
  lazy?: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
};

/**
 * A page of the live store embedded at a fixed design size and scaled as a whole,
 * so the components keep their desktop (or phone) proportions at any frame width.
 * Given a `mobile` size, a narrow container gets the store's real phone layout instead of a shrunken desktop.
 */
export const LiveFrame = ({ src, w, h, mobile, mobileBelow = 640, fit = 'width', interactive = true, lazy = true, className = '', style, title = 'Cross Border Supps, live component' }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const useMobile = !!mobile && box.w > 0 && box.w < mobileBelow;
  const dw = useMobile ? mobile!.w : w;
  const dh = useMobile ? mobile!.h : h;
  const url = useMobile && mobile!.src ? mobile!.src : src;

  const scale = fit === 'contain'
    ? (box.w && box.h ? Math.min(box.w / dw, box.h / dh) : 1)
    : (box.w ? box.w / dw : 1);
  const left = fit === 'contain' ? (box.w - dw * scale) / 2 : 0;
  const top = fit === 'contain' ? (box.h - dh * scale) / 2 : 0;

  return (
    <div ref={ref} className={className} style={{ position: 'relative', width: '100%', height: fit === 'width' ? Math.round(dh * scale) : '100%', overflow: 'hidden', background: '#000', ...style }}>
      {box.w > 0 && (
        <iframe
          key={url + dw}
          src={url}
          title={title}
          loading={lazy ? 'lazy' : 'eager'}
          style={{ position: 'absolute', top, left, width: dw, height: dh, border: 0, display: 'block', transform: `scale(${scale})`, transformOrigin: '0 0', pointerEvents: interactive ? 'auto' : 'none', background: '#000' }}
        />
      )}
    </div>
  );
};
