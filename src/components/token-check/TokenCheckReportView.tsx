'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import type { TokenCheckReport } from '@/lib/token-check/types';
import { AccuracySection, ExclusionSection } from './ChecksSections';
import { CategoryCoverage, CoverageOverview } from './CoverageSections';
import { ExportActions } from './ExportActions';
import { IssueList } from './IssueList';
import { formatDateTime } from './labels';

type Anchor = { id: string; label: string; count?: number };

const sectionIds = ['tc-overview', 'tc-categories', 'tc-issues', 'tc-accuracy', 'tc-exclusions'];

function useActiveSection(ids: string[], topOffset: number) {
  const [active, setActive] = useState(ids[0]);
  /** 点击导航后的平滑滚动期间不跟随滚动位置，避免高亮在途经区块间跳动；并排区块也能停在用户选的那个 */
  const lockedUntil = useRef(0);

  useEffect(() => {
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        if (performance.now() < lockedUntil.current) return;
        const first = ids.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      // 只看报告头下方、视口上半部的区域：哪个区块先进入这条带就算当前
      { rootMargin: `-${Math.round(topOffset) + 8}px 0px -55% 0px` },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids, topOffset]);

  const select = useCallback((id: string) => {
    // 滚动结束（scrollend）时解锁；不支持该事件的浏览器最多锁 3 秒
    lockedUntil.current = performance.now() + 3000;
    const release = () => {
      lockedUntil.current = 0;
    };
    window.addEventListener('scrollend', release, { once: true });
    setActive(id);
  }, []);

  // 用户自己滚动（滚轮、触摸、键盘）时立即解除锁定
  useEffect(() => {
    const release = () => {
      lockedUntil.current = 0;
    };
    const opts = { passive: true } as const;
    window.addEventListener('wheel', release, opts);
    window.addEventListener('touchmove', release, opts);
    window.addEventListener('keydown', release);
    return () => {
      window.removeEventListener('wheel', release);
      window.removeEventListener('touchmove', release);
      window.removeEventListener('keydown', release);
    };
  }, []);

  return [active, select] as const;
}

export const TokenCheckReportView = forwardRef<HTMLHeadingElement, { report: TokenCheckReport }>(
  function TokenCheckReportView({ report }, headingRef) {
    const barRef = useRef<HTMLDivElement>(null);
    const [barHeight, setBarHeight] = useState(0);

    useEffect(() => {
      const el = barRef.current;
      if (!el) return;
      const mq = window.matchMedia('(min-width: 1024px)');
      const update = () => setBarHeight(mq.matches ? el.offsetHeight : 0);
      const ro = new ResizeObserver(update);
      ro.observe(el);
      mq.addEventListener('change', update);
      update();
      return () => {
        ro.disconnect();
        mq.removeEventListener('change', update);
      };
    }, []);

    const anchors: Anchor[] = [
      { id: 'tc-overview', label: '总览' },
      { id: 'tc-categories', label: '分类覆盖率' },
      { id: 'tc-issues', label: '问题清单', count: report.issues.length },
      { id: 'tc-accuracy', label: '准确性检查', count: report.findings.length },
      { id: 'tc-exclusions', label: '排除与待确认' },
    ];
    // 窄屏报告头不吸顶，只需让出 PillNav（约 72px）
    const [active, setActive] = useActiveSection(sectionIds, barHeight || 72);

    const jump = useCallback(
      (event: MouseEvent<HTMLAnchorElement>, id: string) => {
        const target = document.getElementById(id);
        if (!target) return;
        event.preventDefault();
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        target.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
        history.replaceState(null, '', `#${id}`);
        setActive(id);
      },
      [setActive],
    );

    return (
      <article
        aria-labelledby="tc-report-title"
        className="tc-report mt-12 scroll-mt-20 lg:mt-0 lg:scroll-mt-0"
        style={barHeight ? ({ '--tc-bar-h': `${barHeight}px` } as CSSProperties) : undefined}
      >
        <div ref={barRef} className="tc-report-bar">
          <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pb-3">
            <div className="min-w-0">
              <h2
                id="tc-report-title"
                ref={headingRef}
                tabIndex={-1}
                className="tc-heading tc-report-heading"
              >
                {report.targets.length === 1
                  ? report.targets[0].nodeName
                  : `${report.targets.length} 个检查目标`}
              </h2>
              <p className="tc-meta mt-1 tabular-nums">
                {formatDateTime(report.generatedAt)} 生成 · 对照 {report.library.fileName}（
                {formatDateTime(report.library.exportedAt)} 快照）
              </p>
            </div>
            <ExportActions report={report} />
          </header>

          <nav aria-label="报告目录" className="tc-tabs">
            {anchors.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className="tc-tab"
                aria-current={active === a.id ? 'true' : undefined}
                onClick={(e) => jump(e, a.id)}
              >
                {a.label}
                {a.count !== undefined ? <span className="tc-tab-count">{a.count}</span> : null}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-6 space-y-6">
          <CoverageOverview report={report} />
          <CategoryCoverage report={report} />
          <IssueList report={report} />
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <AccuracySection report={report} />
            <ExclusionSection report={report} />
          </div>
        </div>
      </article>
    );
  },
);
