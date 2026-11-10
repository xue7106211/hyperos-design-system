'use client';

import { PencilLine, RotateCw } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert } from '@/components/arc/alert/alert';
import { Button } from '@/components/arc/button/button';
import { Skeleton } from '@/components/arc/skeleton/skeleton';
import { cn } from '@/lib/cn';
import type {
  TokenCheckErrorCode,
  TokenCheckReport,
  TokenCheckResponse,
} from '@/lib/token-check/types';
import { errorMessages } from './labels';
import { NodeIdTag, Panel } from './primitives';
import { TokenCheckReportView } from './TokenCheckReportView';
import { UrlInputForm } from './UrlInputForm';

type CheckError = { code: TokenCheckErrorCode | 'network'; detail?: string; url?: string };

type State =
  | { status: 'idle' }
  | { status: 'loading'; startedAt: number }
  | { status: 'error'; error: CheckError }
  | { status: 'done'; report: TokenCheckReport };

const errorTitles: Partial<Record<CheckError['code'], string>> = {
  'not-configured': '检查服务未配置',
  'figma-rate-limit': '请求过于频繁',
  network: '无法连接检查服务',
};

function isResponse(value: unknown): value is TokenCheckResponse {
  return typeof value === 'object' && value !== null && 'ok' in value;
}

function ElapsedTime({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <>{Math.max(0, Math.floor((now - startedAt) / 1000))}</>;
}

function LoadingPanel({ startedAt }: { startedAt: number }) {
  return (
    <Panel
      id="tc-loading"
      title="正在检查"
      description={
        <span className="tabular-nums" aria-hidden>
          正在读取 Figma 图层并统计，已用 <ElapsedTime startedAt={startedAt} /> 秒。通常需要 10–30
          秒，图层多时会更久
        </span>
      }
    >
      <div className="tc-loading-grid">
        <Skeleton label="正在生成报告" lines={3} />
        <Skeleton label="正在生成报告" lines={4} />
      </div>
    </Panel>
  );
}

/** 出报告后，输入区收成一行：检查了什么 + 修改链接 / 重新检查 */
function CheckedBar({
  report,
  onEdit,
  onRerun,
}: {
  report: TokenCheckReport;
  onEdit: () => void;
  onRerun: () => void;
}) {
  return (
    <div className="tc-checked" role="group" aria-label="检查输入">
      <div className="tc-checked-targets">
        <span className="tc-meta shrink-0">已检查</span>
        <ul>
          {report.targets.map((t) => (
            <li key={t.target.url}>
              <a href={t.target.url} target="_blank" rel="noopener noreferrer" className="tc-checked-link">
                {t.nodeName}
              </a>
              <NodeIdTag id={t.target.nodeId} />
            </li>
          ))}
        </ul>
      </div>
      <div className="tc-checked-actions">
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          <PencilLine aria-hidden className="size-4" strokeWidth={1.5} />
          修改链接
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onRerun}>
          <RotateCw aria-hidden className="size-4" strokeWidth={1.5} />
          重新检查
        </Button>
      </div>
    </div>
  );
}

/** 检查前只有输入框；出报告后页面交给报告 */
export function TokenCheckApp({
  initialReport,
  intro,
}: {
  initialReport?: TokenCheckReport;
  /** 面包屑、标题、说明（及开发期演示提示），由页面传入 */
  intro: ReactNode;
}) {
  const [input, setInput] = useState('');
  const [state, setState] = useState<State>(
    initialReport ? { status: 'done', report: initialReport } : { status: 'idle' },
  );
  const abortRef = useRef<AbortController | null>(null);
  const reportHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLHeadingElement>(null);
  const lastUrls = useRef<string[]>([]);
  const focusAfterRun = useRef(false);
  const [editing, setEditing] = useState(false);
  /** 最近一份报告：修改链接时仍可返回，重新检查时沿用其目标 */
  const [lastReport, setLastReport] = useState<TokenCheckReport | undefined>(initialReport);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (!focusAfterRun.current) return;
    focusAfterRun.current = false;
    if (state.status === 'done') {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      reportHeadingRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    } else if (state.status === 'error') {
      errorRef.current?.focus();
    }
  }, [state.status]);

  async function run(urls: string[]) {
    if (abortRef.current) return;
    const controller = new AbortController();
    abortRef.current = controller;
    lastUrls.current = urls;
    setEditing(false);
    setState({ status: 'loading', startedAt: Date.now() });

    let next: State;
    try {
      const res = await fetch('/api/token-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
        signal: controller.signal,
      });
      const data: unknown = await res.json().catch(() => null);
      if (isResponse(data)) {
        next = data.ok
          ? { status: 'done', report: data.report }
          : {
              status: 'error',
              error: { code: data.error.code, detail: data.error.message, url: data.error.url },
            };
      } else {
        next = {
          status: 'error',
          error: { code: 'internal', detail: `服务返回了无法识别的结果（HTTP ${res.status}）` },
        };
      }
    } catch (err) {
      if (controller.signal.aborted) {
        abortRef.current = null;
        setState({ status: 'idle' });
        return;
      }
      next = {
        status: 'error',
        error: { code: 'network', detail: err instanceof Error ? err.message : undefined },
      };
    }

    abortRef.current = null;
    focusAfterRun.current = true;
    if (next.status === 'done') setLastReport(next.report);
    setState(next);
  }

  function cancel() {
    abortRef.current?.abort();
  }

  const loading = state.status === 'loading';
  const showReport = state.status === 'done' && !editing;

  function targetUrls(report: TokenCheckReport) {
    return lastUrls.current.length > 0 ? lastUrls.current : report.targets.map((t) => t.target.url);
  }

  function edit(report: TokenCheckReport) {
    if (!input.trim()) setInput(targetUrls(report).join('\n'));
    setEditing(true);
  }

  function backToReport() {
    if (!lastReport) return;
    setEditing(false);
    setState({ status: 'done', report: lastReport });
  }

  return (
    <div className={cn('tc-page', showReport ? 'tc-page--report' : 'tc-page--compose')}>
      {intro}

      {state.status === 'done' && !editing ? (
        <CheckedBar
          report={state.report}
          onEdit={() => edit(state.report)}
          onRerun={() => run(targetUrls(state.report))}
        />
      ) : (
        <UrlInputForm
          value={input}
          onChange={setInput}
          loading={loading}
          onSubmit={run}
          onCancel={cancel}
          onBack={lastReport && state.status !== 'loading' ? backToReport : undefined}
        />
      )}

      <div aria-live="polite" className="sr-only">
        {loading ? '正在检查，通常需要 10 到 30 秒' : ''}
        {state.status === 'done' && state.report !== initialReport ? '检查完成' : ''}
      </div>

      {state.status === 'idle' || (state.status === 'done' && editing) ? (
        <ul className="tc-scope" aria-label="检查范围">
          <li>统计颜色、文字样式、圆角、间距是否绑定了 HyperOS Design Token</li>
          <li>自动排除 MIUIX 组件实例、插图与矢量、标注和交互说明</li>
          <li>列出每一处没绑定的值，以及在 Figma 里的位置</li>
        </ul>
      ) : null}

      {loading ? (
        <div className="tc-report-slot">
          <LoadingPanel startedAt={state.startedAt} />
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div className="tc-report-slot tc-error" id="tc-error">
          <h2 ref={errorRef} tabIndex={-1} className="sr-only">
            {errorTitles[state.error.code] ?? '检查未完成'}
          </h2>
          <Alert tone="danger" title={errorTitles[state.error.code] ?? '检查未完成'}>
            {state.error.code === 'network'
              ? '网络中断或服务未启动，请稍后重试。'
              : errorMessages[state.error.code]}
          </Alert>
          {state.error.url || state.error.detail ? (
            <dl className="tc-error-detail">
              {state.error.url ? (
                <>
                  <dt>链接</dt>
                  <dd className="break-all">{state.error.url}</dd>
                </>
              ) : null}
              {state.error.detail ? (
                <>
                  <dt>详细信息</dt>
                  <dd className="break-all">{state.error.detail}</dd>
                </>
              ) : null}
            </dl>
          ) : null}
          {lastUrls.current.length > 0 ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => run(lastUrls.current)}>
              <RotateCw aria-hidden className="size-4" strokeWidth={1.5} />
              重新检查
            </Button>
          ) : null}
        </div>
      ) : null}

      {showReport ? <TokenCheckReportView ref={reportHeadingRef} report={state.report} /> : null}
    </div>
  );
}
