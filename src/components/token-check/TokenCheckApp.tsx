'use client';

import { FileSearch, RotateCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Alert } from '@/components/arc/alert/alert';
import { Button } from '@/components/arc/button/button';
import { EmptyState } from '@/components/arc/empty-state/empty-state';
import { Skeleton } from '@/components/arc/skeleton/skeleton';
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
        <div className="tc-report-slot">
          <EmptyState
            className="tc-empty-report"
            icon={<FileSearch width={24} height={24} strokeWidth={1.5} />}
            title="还没有报告"
            description="贴入链接并开始检查，这里会列出 Token 覆盖率、需要处理的图层，以及被排除的组件实例、插图和标注"
          />
        </div>
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

      {state.status === 'done' ? (
        <TokenCheckReportView ref={reportHeadingRef} report={state.report} />
      ) : null}
    </>
  );
}
