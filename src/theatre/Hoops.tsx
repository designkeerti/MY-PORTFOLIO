import { useEffect, useRef, useState } from 'react';

/**
 * Hoops: a one-hand basketball toy. Flick the ball (press, drag, let go) and it flies the way you flicked.
 * Gravity, a rim you can clank off, a backboard, a floor. Score for the session, best kept in localStorage.
 */
type Drag = { x0: number; y0: number; x: number; y: number };
type Pop = { x: number; y: number; t: number };

const G = 2000;      // px/s²
const K = 6.8;       // px/s of launch speed per px of flick
const VMAX = 1700;   // px/s

export const Hoops = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => { try { return Number(localStorage.getItem('hoopsBest')) || 0; } catch { return 0; } });
  const [streak, setStreak] = useState(0);
  const [shots, setShots] = useState(0);

  useEffect(() => {
    const box = boxRef.current, cv = cvRef.current; if (!box || !cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;

    let W = 0, H = 0;
    let r = 16, floorY = 0, boardX = 0, boardTop = 0, boardBot = 0, rimY = 0, rimX = 0, startX = 0, startY = 0;
    const ball = { x: 0, y: 0, vx: 0, vy: 0, a: 0, live: false, scored: false, t: 0, rest: 0 };
    let drag: Drag | null = null;
    let net = 9;                 // seconds since the last swish: drives the net wobble
    const pops: Pop[] = [];
    let raf = 0, last = 0, running = false;
    let sc = 0, bs = best, st = 0;

    const rrect = (x: number, y: number, w: number, h: number, rad: number) => {
      ctx.beginPath(); ctx.moveTo(x + rad, y); ctx.arcTo(x + w, y, x + w, y + h, rad); ctx.arcTo(x + w, y + h, x, y + h, rad);
      ctx.arcTo(x, y + h, x, y, rad); ctx.arcTo(x, y, x + w, y, rad); ctx.closePath();
    };

    const launchVel = () => {
      if (!drag) return null;
      const dx = drag.x - drag.x0, dy = drag.y - drag.y0;
      if (Math.hypot(dx, dy) < 14 || dy > -6) return null;
      let vx = dx * K, vy = dy * K; const v = Math.hypot(vx, vy);
      if (v > VMAX) { vx *= VMAX / v; vy *= VMAX / v; }
      return { vx, vy };
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // floor
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(11,11,11,.14)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(18, floorY + 1); ctx.lineTo(W - 18, floorY + 1); ctx.stroke();
      // the ball's shadow, tighter and darker the closer it is to the floor
      const h = Math.max(0, floorY - (ball.y + r));
      const sw = r * (1.1 - Math.min(0.6, h / 500));
      ctx.fillStyle = `rgba(11,11,11,${(0.16 - Math.min(0.12, h / 3000)).toFixed(3)})`;
      ctx.beginPath(); ctx.ellipse(ball.x, floorY, sw, sw * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      // backboard on its mount
      ctx.strokeStyle = 'rgba(11,11,11,.55)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(boardX + 9, boardTop + 16); ctx.lineTo(W, boardTop + 16); ctx.stroke();
      ctx.save(); ctx.shadowColor = 'rgba(11,11,11,.16)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#fff'; rrect(boardX, boardTop, 9, boardBot - boardTop, 4); ctx.fill(); ctx.restore();
      ctx.strokeStyle = '#d6d6de'; ctx.lineWidth = 1; rrect(boardX + 0.5, boardTop + 0.5, 8, boardBot - boardTop - 1, 4); ctx.stroke();
      // net
      const wob = net < 0.9 ? Math.exp(-net * 3.2) * Math.sin(net * 22) * 7 : 0;
      const nb = rimY + 46, inset = 9, n = 6;
      ctx.strokeStyle = 'rgba(11,11,11,.30)'; ctx.lineWidth = 1.2;
      for (let i = 0; i <= n; i++) {
        const t = i / n, xt = rimX + (boardX - rimX) * t;
        const xb = rimX + inset + (boardX - rimX - 2 * inset) * t + wob * (1 - Math.abs(t - 0.5) * 0.6);
        ctx.beginPath(); ctx.moveTo(xt, rimY); ctx.lineTo(xb, nb); ctx.stroke();
      }
      for (const f of [0.45, 0.85]) {
        const y = rimY + (nb - rimY) * f;
        ctx.beginPath(); ctx.moveTo(rimX + inset * f + wob * f, y); ctx.lineTo(boardX - inset * f + wob * f, y); ctx.stroke();
      }
      // rim, drawn over the net
      ctx.strokeStyle = '#0b0b0b'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(rimX, rimY); ctx.lineTo(boardX, rimY); ctx.stroke();
      ctx.fillStyle = '#0b0b0b'; ctx.beginPath(); ctx.arc(rimX, rimY, 3.5, 0, Math.PI * 2); ctx.fill();
      // aim: the first half-second of the flight as dots
      if (drag && !ball.live) {
        const v = launchVel();
        if (v) {
          let x = ball.x, y = ball.y, vx = v.vx, vy = v.vy;
          ctx.fillStyle = '#0b0b0b';
          for (let i = 1; i <= 9; i++) {
            const dt = 0.045; vy += G * dt; x += vx * dt; y += vy * dt;
            if (y > floorY - r) break;
            ctx.globalAlpha = 0.6 * (1 - i / 11); ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      }
      // ball
      const s = drag && !ball.live ? 1.06 : 1;
      ctx.save(); ctx.translate(ball.x, ball.y); ctx.rotate(ball.a); ctx.scale(s, s);
      const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
      g.addColorStop(0, '#ffc4ae'); g.addColorStop(1, '#ff8961');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = 'rgba(70,25,10,.55)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
      ctx.beginPath(); ctx.arc(-r * 1.15, 0, r * 0.75, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(r * 1.15, 0, r * 0.75, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
      ctx.strokeStyle = 'rgba(11,11,11,.14)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      // +1
      if (pops.length) {
        ctx.font = '700 15px Satoshi, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#DF95FF';
        for (const p of pops) { ctx.globalAlpha = Math.max(0, 1 - p.t / 0.8); ctx.fillText('+1', p.x, p.y - p.t * 40); }
        ctx.globalAlpha = 1;
      }
    };

    const reset = () => {
      if (!ball.scored) { st = 0; setStreak(0); }
      ball.live = false; ball.scored = false; ball.t = 0; ball.rest = 0; ball.vx = ball.vy = 0; ball.a = 0; ball.x = startX; ball.y = startY;
    };

    const step = (dt: number) => {
      if (!ball.live) return;
      ball.t += dt;
      const py = ball.y;
      ball.vy += G * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.a += (ball.vx * dt) / r;
      // backboard: the ball only ever arrives from the left
      if (ball.x + r > boardX && ball.y > boardTop - r && ball.y < boardBot + r && ball.vx > 0) { ball.x = boardX - r; ball.vx = -ball.vx * 0.65; }
      // the front of the rim is a little post the ball can clank off
      const dx = ball.x - rimX, dy = ball.y - rimY, d = Math.hypot(dx, dy), pr = 3.5;
      if (d < r + pr && d > 0) {
        const nx = dx / d, ny = dy / d, vn = ball.vx * nx + ball.vy * ny;
        if (vn < 0) { ball.vx -= 1.55 * vn * nx; ball.vy -= 1.55 * vn * ny; ball.vx *= 0.92; ball.vy *= 0.92; }
        ball.x = rimX + nx * (r + pr); ball.y = rimY + ny * (r + pr);
      }
      // through the hoop: crossing the rim line downward, between the front of the rim and the board
      if (!ball.scored && py < rimY && ball.y >= rimY && ball.vy > 0 && ball.x > rimX + 4 && ball.x < boardX - 4) {
        ball.scored = true; sc += 1; st += 1; net = 0; pops.push({ x: (rimX + boardX) / 2, y: rimY - 10, t: 0 });
        if (sc > bs) { bs = sc; try { localStorage.setItem('hoopsBest', String(bs)); } catch { /* private mode */ } setBest(bs); }
        setScore(sc); setStreak(st);
      }
      // floor
      if (ball.y + r > floorY) { ball.y = floorY - r; ball.vy = -ball.vy * 0.5; ball.vx *= 0.8; if (Math.abs(ball.vy) < 80) ball.vy = 0; }
      const resting = ball.vy === 0 && Math.abs(ball.vx) < 30 && ball.y + r >= floorY - 0.5;
      ball.rest = resting ? ball.rest + dt : 0;
      if (ball.rest > 0.35 || ball.x < -3 * r || ball.x > W + 3 * r || ball.t > 6) reset();
    };

    const active = () => ball.live || !!drag || net < 0.9 || pops.length > 0;
    const tick = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000 || 0); last = now;
      net += dt; for (const p of pops) p.t += dt; while (pops.length && pops[0].t > 0.8) pops.shift();
      step(dt / 2); step(dt / 2); draw();
      if (active()) raf = requestAnimationFrame(tick); else running = false;
    };
    const wake = () => { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(tick); };

    const layout = () => {
      const b = box.getBoundingClientRect(); W = Math.round(b.width); H = Math.round(b.height);
      if (!W || !H) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      r = Math.max(14, Math.min(20, W / 17));
      floorY = H - 30; boardX = W - 36;
      const rise = Math.min(400, Math.max(220, H * 0.58));   // rim height above the floor grows with the court
      rimY = Math.round(floorY - rise); boardTop = rimY - 62; boardBot = boardTop + 92; rimX = boardX - Math.round(r * 4.2);
      startX = Math.round(W * 0.24); startY = floorY - r;
      if (!ball.live) { ball.x = startX; ball.y = startY; }
      draw();
    };

    const pos = (e: PointerEvent) => { const b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
    const down = (e: PointerEvent) => { if (ball.live) return; const p = pos(e); drag = { x0: p.x, y0: p.y, x: p.x, y: p.y }; try { cv.setPointerCapture(e.pointerId); } catch { /* synthetic */ } box.classList.add('is-dragging'); wake(); };
    const move = (e: PointerEvent) => { if (!drag) return; const p = pos(e); drag.x = p.x; drag.y = p.y; };
    const up = () => {
      if (!drag) return;
      const v = launchVel(); box.classList.remove('is-dragging');
      if (v) { ball.vx = v.vx; ball.vy = v.vy; ball.live = true; ball.t = 0; setShots(s => s + 1); }
      drag = null; wake();
    };

    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    const ro = new ResizeObserver(layout); ro.observe(box); layout();
    return () => {
      ro.disconnect(); cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={boxRef} className="hoops">
      <canvas ref={cvRef} aria-label="A little basketball game: flick the ball at the hoop" />
      <div className="hoops__ghost" aria-hidden="true">{score}</div>
      <div className="hoops__hud">
        <span className="hoops__tag">🏀 Hoops</span>
        <span className="hoops__best" aria-label={`Score ${score}, best ${best}`}>{streak >= 3 && <em>🔥 {streak}</em>}best <b>{best}</b></span>
      </div>
      <p className={`hoops__hint ${shots ? 'is-gone' : ''}`}>Flick the ball at the hoop</p>
    </div>
  );
};
