'use client';

import { useEffect, useRef } from 'react';

/**
 * 字符雨使用的字符集。
 *
 * 字符本身保持短小、等宽，便于在 canvas 网格中对齐显示。
 */
const CHARS = 'AISDPEL01<>=+*-#$';

/**
 * Canvas 的渐变遮罩。
 *
 * 垂直渐变让字符从中部向上下边缘淡出，水平渐变让左右两端淡出，
 * 从而避免矩阵字符在画布边缘突然截断。
 */
const MASK =
  'linear-gradient(to bottom, black 50%, transparent 96%), linear-gradient(to right, transparent, black 18%, black 82%, transparent)';

/** 从字符集中随机取出一个字符，用于初始化或刷新字符单元。 */
function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]!;
}

/**
 * 单列字符雨的运行时状态。
 *
 * 每一列拥有独立的字符、透明度、尾部亮度、头部位置和移动速度，
 * 因此各列可以看起来像是独立下落，而不是整片字符同步移动。
 */
type Column = {
  /** 当前列中每一行要绘制的字符。 */
  chars: string[];
  /** 字符雨尾部的透明度，会在每一帧逐渐衰减。 */
  alphas: number[];
  /** 每一行透明度的最低值，用来保留若隐若现的字符尾迹。 */
  floors: number[];
  /** 指针经过时产生的局部高光透明度。 */
  glows: number[];
  /** 当前字符雨头部所在的浮点行位置。 */
  head: number;
  /** 每次更新时头部向下移动的距离。 */
  speed: number;
  /** 当前列允许显示到的最大行数。 */
  maxRow: number;
  /** 当前列整体的亮度倍率。 */
  brightness: number;
};

/**
 * Hero 区域的流动代码背景。
 *
 * 这是对 aiforui.dev `MatrixRain` 效果的移植：使用 1200×400 的逻辑画布、
 * 等宽字符和指针高光，并在用户偏好减少动效时退化为静态绘制。
 *
 * @returns 包含装饰性 canvas 的不可读背景层
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

    /**
     * 初始化或回收一列字符雨。
     *
     * 初始状态允许头部已经位于画布内部，避免页面刚加载时所有列同时从
     * 画布顶部开始；回收状态则从画布上方重新进入，形成连续流动。
     *
     * @param col 要更新的列状态
     * @param initial 是否为首次初始化
     */
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

    /**
     * 推进所有列的状态，但不负责把结果绘制到 canvas。
     *
     * 每次更新会移动头部、衰减尾迹和指针高光，并以一定概率替换字符。
     */
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

    /** 将当前列状态绘制成一帧 canvas 图像。 */
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

    /**
     * 使用 requestAnimationFrame 驱动动画，并限制实际绘制频率。
     *
     * requestAnimationFrame 仍然负责跟随浏览器刷新节奏，但只有间隔达到
     * 90ms 时才真正更新状态和重绘，以减少装饰性背景的运行开销。
     */
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

    /**
     * 将指针位置映射到附近的字符单元，并为这些单元增加短暂高光。
     *
     * 通过一次 requestAnimationFrame 合并同一帧内的多个 pointermove，
     * 避免指针事件频率过高时重复绘制。
     */
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
