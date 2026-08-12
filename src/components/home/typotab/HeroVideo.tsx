'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';

type HeroVideoProps = {
  mp4: string;
  webm?: string;
  poster: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

/**
 * Hero 无声循环视频：进视口自动播、离视口暂停；点击切换，手动暂停后不再自动恢复。
 * 无原生 controls；暂停时显示轻量播放提示。
 */
export function HeroVideo({
  mp4,
  webm,
  poster,
  alt,
  width,
  height,
  className,
}: HeroVideoProps) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  /** 用户主动暂停后，滚回视口也不自动 resume */
  const userPausedRef = useRef(false);
  const [paused, setPaused] = useState(true);
  const [inView, setInView] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(
          Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.7),
        );
      },
      { threshold: [0, 0.5, 0.7, 0.85, 1] },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [reduce]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduce) return;

    if (inView && !userPausedRef.current) {
      const playAttempt = el.play();
      if (playAttempt) {
        void playAttempt
          .then(() => setPaused(false))
          .catch(() => setPaused(true));
      }
      return;
    }

    el.pause();
    setPaused(true);
  }, [inView, reduce]);

  const toggle = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;

    if (el.paused) {
      userPausedRef.current = false;
      void el
        .play()
        .then(() => setPaused(false))
        .catch(() => {
          userPausedRef.current = true;
          setPaused(true);
        });
      return;
    }

    userPausedRef.current = true;
    el.pause();
    setPaused(true);
  }, []);

  if (reduce) {
    return (
      <Image
        src={poster}
        alt={alt}
        width={width}
        height={height}
        className={cn('typo-media typo-media--flush h-auto w-full', className)}
        sizes="(max-width: 1240px) calc(100vw - 2rem), 1240px"
        priority
        unoptimized
      />
    );
  }

  const showPlayHint = paused;
  const showPauseHint = !paused && hovering;

  return (
    <div
      ref={rootRef}
      className={cn('group relative w-full', className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <video
        ref={videoRef}
        className="typo-media typo-media--flush h-auto w-full"
        width={width}
        height={height}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        tabIndex={-1}
      >
        {webm ? <source src={webm} type="video/webm" /> : null}
        <source src={mp4} type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={toggle}
        aria-label={paused ? '播放演示视频' : '暂停演示视频'}
        aria-pressed={!paused}
        className="absolute inset-0 z-[1] flex cursor-pointer items-center justify-center rounded-[20px] border-0 bg-transparent p-0"
      >
        <span
          className={cn(
            'pointer-events-none flex size-14 items-center justify-center rounded-full bg-black/45 text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)] backdrop-blur-sm transition-opacity duration-200',
            showPlayHint || showPauseHint ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden
        >
          {paused ? (
            <Play className="size-6 translate-x-0.5" fill="currentColor" />
          ) : (
            <Pause className="size-6" fill="currentColor" />
          )}
        </span>
      </button>
    </div>
  );
}
