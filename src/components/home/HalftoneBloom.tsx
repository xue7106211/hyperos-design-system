'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

type Dot = {
  x: number;
  y: number;
  r: number;
  alpha: number;
  ox: number;
  oy: number;
};

type HalftoneBloomProps = {
  spacing?: number;
  maxRadius?: number;
  pushRadius?: number;
  pushStrength?: number;
  className?: string;
};

export function HalftoneBloom({
  spacing = 10,
  maxRadius = 5.2,
  pushRadius = 140,
  pushStrength = 30,
  className,
}: HalftoneBloomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let disposed = false;
    let raf = 0;
    let looping = false;
    let color = getComputedStyle(canvas).color;
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    const rebuild = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      color = getComputedStyle(canvas).color;

      const ellipseY = 0.5 * window.innerHeight;
      const ellipseX = 1.33 * ellipseY;
      const cx = width / 2;
      const cy = height;

      dots = [];
      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          const falloff = 1 - Math.hypot((x - cx) / ellipseX, (y - cy) / ellipseY);
          if (falloff <= 0) continue;
          const radius = falloff * maxRadius;
          if (radius < 0.3) continue;
          dots.push({
            x,
            y,
            r: radius,
            alpha: Math.min(1, 0.12 + 0.9 * falloff),
            ox: 0,
            oy: 0,
          });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      let moving = false;

      for (const dot of dots) {
        let tx = 0;
        let ty = 0;

        if (pointer.active) {
          const dx = dot.x - pointer.x;
          const dy = dot.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < pushRadius && dist > 0.001) {
            const t = 1 - dist / pushRadius;
            const strength = t * t;
            tx = (dx / dist) * strength * pushStrength;
            ty = (dy / dist) * strength * pushStrength;
          }
        }

        dot.ox += (tx - dot.ox) * 0.18;
        dot.oy += (ty - dot.oy) * 0.18;
        if (Math.abs(dot.ox) > 0.1 || Math.abs(dot.oy) > 0.1) moving = true;

        ctx.globalAlpha = dot.alpha;
        ctx.beginPath();
        ctx.arc(dot.x + dot.ox, dot.y + dot.oy, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      return moving;
    };

    const loop = () => {
      if (disposed) return;
      const moving = draw();
      if (pointer.active || moving) {
        raf = requestAnimationFrame(loop);
      } else {
        looping = false;
      }
    };

    const ensureLoop = () => {
      if (looping || disposed || reducedMotion) return;
      looping = true;
      raf = requestAnimationFrame(loop);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active =
        pointer.x >= -pushRadius &&
        pointer.x <= width + pushRadius &&
        pointer.y >= -pushRadius &&
        pointer.y <= height + pushRadius;
      if (reducedMotion) {
        draw();
      } else {
        ensureLoop();
      }
    };

    const onBlur = () => {
      pointer.active = false;
      if (reducedMotion) draw();
      else ensureLoop();
    };

    const onResize = () => {
      rebuild();
      draw();
      if (!reducedMotion) ensureLoop();
    };

    rebuild();
    draw();
    if (!reducedMotion) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('blur', onBlur);
    }
    window.addEventListener('resize', onResize);

    const observer = new MutationObserver(onResize);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
    };
  }, [spacing, maxRadius, pushRadius, pushStrength]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 h-[60vh] w-full text-[var(--home-accent)]',
        className,
      )}
    />
  );
}
