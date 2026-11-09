'use client';

import { AlertCircle, RotateCw } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type {
  TokenCheckErrorCode,
  TokenCheckReport,
  TokenCheckResponse,
} from '@/lib/token-check/types';
import { errorMessages } from './labels';
import { Panel } from './primitives';
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

const reportOutline = [
  { title: '总览', detail: '总覆盖率、四档绑定状态和每个检查目标的覆盖率' },
  { title: '分类覆盖率', detail: '填充、文字颜色、描边、文字样式、圆角、间距分别统计' },
  { title: '问题清单', detail: '未绑定、旧版 Kit 变量和非 HyperOS 库的图层，可直接跳到 Figma' },
  { title: '准确性检查', detail: '已绑定但层级不当的 Token，例如直接使用 Reference 层' },
  { title: '排除与待确认', detail: 'MIUIX 组件实例、插图、标注、隐藏图层，以及规则拿不准的图层' },
];

function ReportSegment({ children }: { children: ReactNode }) {
  return (
    <div className="mt-12">
      <p className="tc-segment-title mb-3">检查报告</p>
      {children}
    </div>
  );
}

function LoadingPanel({ startedAt }: { startedAt: number }) {
  return (
    <Panel
      id="tc-loading"
      title="正在检查"
      description={
        <span className="tabular-nums" aria-hidden>
          正在读取 Figma 图层并统计，已用 <ElapsedTime startedAt={startedAt} /> 秒。通常需要 10–30
          秒，图层多时会更久。
        </span>
      }
      flush
    >
      <div aria-hidden className="tc-kpis">
        <div className="tc-kpi-main space-y-3">
          <span className="tc-skeleton w-24" />
          <span className="tc-skeleton !h-12 w-32" />
          <span className="tc-skeleton w-full" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <span className="tc-skeleton w-16" />
            <span className="tc-skeleton !h-8 w-12" />
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function TokenCheckApp({ initialReport }: { initialReport?: TokenCheckReport }) {
  const [input, setInput] = useState('');
  const [state, setState] = useState<State>(
    initialReport ? { status: 'done', report: initialReport } : { status: 'idle' },
  );
  const abortRef = useRef<AbortController | null>(null);
  const reportHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLHeadingElement>(null);
  const lastUrls = useRef<string[]>([]);
  const focusAfterRun = useRef(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (!focusAfterRun.current) return;
    focusAfterRun.current = false;
    if (state.status === 'done') {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      reportHeadingRef.current?.focus({ preventScroll: true });
      // 标题在 sticky 报告头里，滚动到整份报告的起点
      reportHeadingRef.current
        ?.closest('article')
        ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    } else if (state.status === 'error') {
      errorRef.current?.focus();
    }
  }, [state.status]);

  async function run(urls: string[]) {
    if (abortRef.current) return;
    const controller = new AbortController();
    abortRef.current = controller;
    lastUrls.current = urls;
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
    setState(next);
  }

  function cancel() {
    abortRef.current?.abort();
  }

  const loading = state.status === 'loading';

  return (
    <>
      <p className="tc-segment-title mb-3">检查输入</p>
      <UrlInputForm
        value={input}
        onChange={setInput}
        loading={loading}
        onSubmit={run}
        onCancel={cancel}
      />

      <div aria-live="polite" className="sr-only">
        {loading ? '正在检查，通常需要 10 到 30 秒' : ''}
        {state.status === 'done' && state.report !== initialReport ? '检查完成' : ''}
      </div>

      {state.status === 'idle' ? (
        <ReportSegment>
          <Panel
            id="tc-report-empty"
            title="还没有报告"
            description="贴入链接并开始检查后，报告会显示在这里，包含以下内容。"
            flush
          >
            <ul className="tc-rows">
              {reportOutline.map((item) => (
                <li key={item.title} className="tc-row flex flex-col gap-1 sm:flex-row sm:gap-6">
                  <span className="w-28 shrink-0 text-sm text-fd-foreground">{item.title}</span>
                  <span className="text-sm text-fd-muted-foreground">{item.detail}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </ReportSegment>
      ) : null}

      {loading ? (
        <ReportSegment>
          <LoadingPanel startedAt={state.startedAt} />
        </ReportSegment>
      ) : null}

      {state.status === 'error' ? (
        <ReportSegment>
          <Panel
            id="tc-error"
            role="alert"
            headingRef={errorRef}
            icon={<AlertCircle aria-hidden className="tc-text-danger mt-0.5 size-5 shrink-0" strokeWidth={1.5} />}
            title={errorTitles[state.error.code] ?? '检查未完成'}
            description={
              state.error.code === 'network'
                ? '网络中断或服务未启动，请稍后重试。'
                : errorMessages[state.error.code]
            }
            footer={
              lastUrls.current.length > 0 ? (
                <button
                  type="button"
                  className="tc-button tc-button--secondary tc-button--sm"
                  onClick={() => run(lastUrls.current)}
                >
                  <RotateCw aria-hidden className="size-4" strokeWidth={1.5} />
                  重新检查
                </button>
              ) : undefined
            }
          >
            {state.error.url || state.error.detail ? (
              <dl className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
                {state.error.url ? (
                  <>
                    <dt className="text-fd-muted-foreground">链接</dt>
                    <dd className="break-all font-mono text-fd-foreground">{state.error.url}</dd>
                  </>
                ) : null}
                {state.error.detail ? (
                  <>
                    <dt className="text-fd-muted-foreground">详细信息</dt>
                    <dd className="break-all text-fd-foreground">{state.error.detail}</dd>
                  </>
                ) : null}
              </dl>
            ) : null}
          </Panel>
        </ReportSegment>
      ) : null}

      {state.status === 'done' ? (
        <TokenCheckReportView ref={reportHeadingRef} report={state.report} />
      ) : null}
    </>
  );
}
