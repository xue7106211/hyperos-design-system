'use client';

import { useEffect, useRef } from 'react';

/** Character set from aiforui.dev MatrixRain */
const CHARS = 'AISDPEL01<>=+*-#$';

const MASK =
  'linear-gradient(to bottom, black 50%, transparent 96%), linear-gradient(to right, transparent, black 18%, black 82%, transparent)';

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]!;
}

type Column = {
  chars: string[];
  alphas: number[];
  floors: number[];
  glows: number[];
  head: number;
  speed: number;
  maxRow: number;
  brightness: number;
};

/**
 * Hero streaming-code canvas — port of aiforui.dev `MatrixRain`.
 * Canvas 1200×400, mono glyphs, pointer glow, reduced-motion safe.
 */
export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 1200 * dpr;
    canvas.height = 400 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { fontFamily } = getComputedStyle(canvas);
    ctx.font = `12px ${fontFamily}`;
    const colWidth = 1.7 * ctx.measureText('0').width;
    const cols = Math.ceil(1200 / colWidth);
    const rows = 25;

    const resetCol = (col: Column, initial = false) => {
      col.head = initial ? Math.random() * rows * 2 : -Math.random() * rows * 1.5;
      col.speed = 0.25 + 0.75 * Math.random();
      if (initial || Math.random() < 0.2) {
        col.maxRow = Math.floor(rows * (0.35 + 0.65 * Math.random()));
        col.brightness = 0.5 + 0.5 * Math.random();
      }
    };

    const columns: Column[] = Array.from({ length: cols }, () => {
      const col: Column = {
        chars: Array.from({ length: rows }, randomChar),
        alphas: Array.from({ length: rows }, () => 0),
        floors: Array.from({ length: rows }, () => 0.04 + 0.08 * Math.random()),
        glows: Array.from({ length: rows }, () => 0),
        head: 0,
        speed: 0,
        maxRow: 0,
        brightness: 1,
      };
      resetCol(col, true);
      return col;
    });

    const tick = () => {
      for (const col of columns) {
        col.head += col.speed;
        const headRow = Math.floor(col.head);
        for (let r = 0; r <= col.maxRow; r++) {
          if (col.alphas[r]! > 0) {
            col.alphas[r] = Math.max(0.94 * col.alphas[r]!, col.floors[r]!);
          }
        }
        if (headRow >= 0 && headRow <= col.maxRow && headRow < rows) {
          col.alphas[headRow] = 0.8;
        }
        for (let r = 0; r < rows; r++) {
          if (col.glows[r]! > 0) {
            col.glows[r] = col.glows[r]! < 0.03 ? 0 : 0.82 * col.glows[r]!;
          }
        }
        if (Math.random() < 0.4) {
          col.chars[Math.floor(Math.random() * rows)] = randomChar();
        }
        if (headRow > col.maxRow + 4) resetCol(col);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, 1200, 400);
      ctx.font = `12px ${fontFamily}`;
      ctx.textBaseline = 'top';
      const style = getComputedStyle(canvas);
      const color = style.color;
      const glowColor =
        style.getPropertyValue('--color-blue-900').trim() || '#0090ff';
      let currentFill = color;
      ctx.fillStyle = color;
      for (let c = 0; c < cols; c++) {
        const col = columns[c]!;
        for (let r = 0; r < rows; r++) {
          const alpha = col.alphas[r]! * col.brightness;
          const glow = col.glows[r]!;
          const opacity = Math.max(alpha, glow);
          if (opacity < 0.02) continue;
          const fill = glow > alpha ? glowColor : color;
          if (fill !== currentFill) {
            ctx.fillStyle = fill;
            currentFill = fill;
          }
          ctx.globalAlpha = opacity;
          ctx.fillText(col.chars[r]!, c * colWidth, 16 * r);
        }
      }
      ctx.globalAlpha = 1;
    };

    for (let i = 0; i < 4 * rows; i++) tick();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      void document.fonts.ready.then(draw);
      draw();
      return;
    }

    let raf = 0;
    let last = 0;
    let visible = true;

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (time - last < 90) return;
      last = time;
      tick();
      draw();
    };

    const io = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      if (entry.isIntersecting && !visible) {
        raf = requestAnimationFrame(loop);
      }
      if (!entry.isIntersecting) cancelAnimationFrame(raf);
      visible = entry.isIntersecting;
    });

    let glowScheduled = false;
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < -44 || x > 1244 || y < -44 || y > 444) return;

      const c0 = Math.max(0, Math.floor((x - 44) / colWidth));
      const c1 = Math.min(cols - 1, Math.ceil((x + 44) / colWidth));
      const r0 = Math.max(0, Math.floor((y - 44) / 16));
      const r1 = Math.min(rows - 1, Math.ceil((y + 44) / 16));

      for (let c = c0; c <= c1; c++) {
        for (let r = r0; r <= r1; r++) {
          const dist = Math.hypot(
            c * colWidth + colWidth / 2 - x,
            16 * r + 8 - y,
          );
          if (dist > 44) continue;
          const g = 0.95 * (1 - dist / 44) ** 1.5;
          columns[c]!.glows[r] = Math.max(columns[c]!.glows[r]!, g);
        }
      }

      if (!glowScheduled) {
        glowScheduled = true;
        requestAnimationFrame(() => {
          glowScheduled = false;
          draw();
        });
      }
    };

    io.observe(canvas);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <div aria-hidden className="resources-matrix-wrap">
      <canvas
        ref={canvasRef}
        className="resources-matrix-canvas"
        style={{
          maskImage: MASK,
          WebkitMaskImage: MASK,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      />
    </div>
  );
}
