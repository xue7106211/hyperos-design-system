'use client';

import { Check, Copy, Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { reportToMarkdown } from '@/lib/token-check/report-markdown';
import type { TokenCheckReport } from '@/lib/token-check/types';

function fileName(report: TokenCheckReport) {
  const d = new Date(report.generatedAt);
  const safe = Number.isNaN(d.getTime()) ? new Date() : d;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `token-check-${safe.getFullYear()}${pad(safe.getMonth() + 1)}${pad(safe.getDate())}-${pad(safe.getHours())}${pad(safe.getMinutes())}.md`;
}

export function ExportActions({ report }: { report: TokenCheckReport }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function flash(next: 'copied' | 'failed') {
    setStatus(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2000);
  }

  function download() {
    const blob = new Blob([reportToMarkdown(report)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName(report);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(reportToMarkdown(report));
      flash('copied');
    } catch {
      flash('failed');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="tc-button tc-button--secondary tc-button--sm" onClick={download}>
        <Download aria-hidden className="size-4" strokeWidth={1.5} />
        下载 Markdown
      </button>
      <button type="button" className="tc-button tc-button--secondary tc-button--sm" onClick={copy}>
        {status === 'copied' ? (
          <Check aria-hidden className="size-4" strokeWidth={1.5} />
        ) : (
          <Copy aria-hidden className="size-4" strokeWidth={1.5} />
        )}
        {status === 'copied' ? '已复制' : '复制 Markdown'}
      </button>
      <span className="sr-only" aria-live="polite">
        {status === 'copied' ? '已复制到剪贴板' : status === 'failed' ? '复制失败，请改用下载' : ''}
      </span>
      {status === 'failed' ? (
        <span className="tc-text-danger text-xs">复制失败，请改用下载</span>
      ) : null}
    </div>
  );
}
