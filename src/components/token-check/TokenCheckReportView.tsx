'use client';

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { groupIssuesByFix } from '@/lib/token-check/fix-groups';
import {
  applyWaivers,
  diffRuns,
  historyKey,
  recordRun,
  snapshotOf,
  type RunDiff,
} from '@/lib/token-check/review-state';
import type { TokenCheckReport } from '@/lib/token-check/types';
import { AccuracySection, Appendix } from './ChecksSections';
import { Distribution, Verdict } from './CoverageSections';
import { ExportActions } from './ExportActions';
import { IssueList, type FixFocusRequest, type StateFilterRequest } from './IssueList';
import { formatDateTime, formatRate } from './labels';
import { CoverageBar } from './primitives';
import { readHistory, useWaivers, writeHistory } from './review-store';

/** 与同一组检查目标的上一次结果对比；只在浏览器里记录 */
function useRunDiff(raw: TokenCheckReport) {
  const [diff, setDiff] = useState<RunDiff | null>(null);
  useEffect(() => {
    const key = historyKey(raw);
    const current = snapshotOf(raw);
    const history = recordRun(readHistory(key), current);
    writeHistory(key, history);
    setDiff(diffRuns(history, current));
  }, [raw]);
  return diff;
}

type Anchor = { id: string; label: string; count?: number };

/** PillNav（fixed）下沿，scroll-spy 的观察带从这里开始 */
const NAV_CLEAR = 72;

const sectionIds = ['tc-verdict', 'tc-issues', 'tc-accuracy', 'tc-distribution', 'tc-appendix'];

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  /** 点击目录后的平滑滚动期间不跟随滚动位置，避免高亮在途经区块间跳动 */
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
        // 回到页首时结论区还在观察带下方，没有区块命中；此时高亮第一项
        if (first) setActive(first);
        else if (window.scrollY < 120) setActive(ids[0]);
      },
      // 只看 PillNav 下方、视口上半部的区域：哪个区块先进入这条带就算当前
      { rootMargin: `-${NAV_CLEAR + 8}px 0px -55% 0px` },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  const select = useCallback((id: string) => {
    // 滚动结束（scrollend）时解锁；不支持该事件的浏览器最多锁 3 秒
    lockedUntil.current = performance.now() + 3000;
    window.addEventListener(
      'scrollend',
      () => {
        lockedUntil.current = 0;
      },
      { once: true },
    );
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

/**
 * 报告 = 一份校样：正文按「结论 → 批注（问题清单、准确性）→ 分布 → 校对说明」排列；
 * 宽屏右侧是固定的页边栏（覆盖率小计、目录、导出），窄屏收到正文上方。
 */
export const TokenCheckReportView = forwardRef<HTMLHeadingElement, { report: TokenCheckReport }>(
  function TokenCheckReportView({ report: raw }, headingRef) {
    const [waivers, setWaived] = useWaivers();
    const { report, waived } = useMemo(() => applyWaivers(raw, waivers), [raw, waivers]);
    const diff = useRunDiff(raw);
    const fixes = useMemo(() => groupIssuesByFix(report.issues), [report.issues]);
    const [focusRequest, setFocusRequest] = useState<FixFocusRequest>();
    const [filterRequest, setFilterRequest] = useState<StateFilterRequest>();
    const filterState = useCallback(
      (state: StateFilterRequest['state']) => {
        setFilterRequest((prev) => ({ state, seq: (prev?.seq ?? 0) + 1 }));
      },
      [],
    );

    const anchors: Anchor[] = [
      { id: 'tc-verdict', label: '结论' },
      { id: 'tc-issues', label: '问题清单', count: fixes.length },
      { id: 'tc-accuracy', label: '准确性检查', count: report.findings.length },
      { id: 'tc-distribution', label: '分布' },
      { id: 'tc-appendix', label: '校对说明', count: waived.length > 0 ? waived.length : undefined },
    ];
    const [active, setActive] = useActiveSection(sectionIds);

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

    const focusFix = useCallback(
      (key: string) => {
        setFocusRequest((prev) => ({ key, seq: (prev?.seq ?? 0) + 1 }));
        setActive('tc-issues');
      },
      [setActive],
    );

    const { overall } = report.coverage;

    return (
      <article aria-labelledby="tc-report-title" className="tc-report">
        <header className="tc-report-head">
          <h2 id="tc-report-title" ref={headingRef} tabIndex={-1} className="tc-report-heading">
            {report.targets.length === 1 ? report.targets[0].nodeName : `${report.targets.length} 个检查目标`}
          </h2>
          <p className="tc-meta mt-1 tabular-nums">
            {formatDateTime(report.generatedAt)} 生成 · 对照 {report.library.fileName}
          </p>
        </header>

        <aside className="tc-aside" aria-label="报告页边栏">
          <div className="tc-aside-inner">
            <div className="tc-aside-score">
              <p>
                <span className="tc-aside-rate">{formatRate(overall.rate)}</span>
                <span className="tc-meta">HyperOS 覆盖率</span>
              </p>
              <CoverageBar stat={overall} onSelect={overall.total > overall.hyperos ? filterState : undefined} />
            </div>

            <nav aria-label="报告目录" className="tc-toc">
              <ol>
                {anchors.map((a) => (
                  <li key={a.id}>
                    <a
                      href={`#${a.id}`}
                      className="tc-toc-link"
                      aria-current={active === a.id ? 'true' : undefined}
                      onClick={(e) => jump(e, a.id)}
                    >
                      <span>{a.label}</span>
                      {a.count !== undefined ? <span className="tc-toc-count">{a.count}</span> : null}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="tc-aside-export">
              <ExportActions report={report} waived={waived} />
            </div>
          </div>
        </aside>

        <div className="tc-report-body">
          <Verdict
            report={report}
            fixes={fixes}
            waivedCount={waived.length}
            diff={diff}
            onFocusFix={focusFix}
            onFilterState={filterState}
          />
          <IssueList
            report={report}
            fixes={fixes}
            focusRequest={focusRequest}
            filterRequest={filterRequest}
            onWaive={setWaived}
            waivedCount={waived.length}
          />
          <AccuracySection report={report} />
          <Distribution report={report} />
          <Appendix report={report} waived={waived} onWaive={setWaived} />
        </div>
      </article>
    );
  },
);
