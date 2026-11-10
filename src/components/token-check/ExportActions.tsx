'use client';

import { Download } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/arc/button/button';
import { CopyButton } from '@/components/arc/copy-button/copy-button';
import { reportToMarkdown } from '@/lib/token-check/report-markdown';
import type { BindableProperty, TokenCheckReport } from '@/lib/token-check/types';

function fileName(report: TokenCheckReport) {
  const d = new Date(report.generatedAt);
  const safe = Number.isNaN(d.getTime()) ? new Date() : d;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `token-check-${safe.getFullYear()}${pad(safe.getMonth() + 1)}${pad(safe.getDate())}-${pad(safe.getHours())}${pad(safe.getMinutes())}.md`;
}

export function ExportActions({ report, waived }: { report: TokenCheckReport; waived?: BindableProperty[] }) {
  const markdown = useMemo(() => reportToMarkdown(report, { waived }), [report, waived]);

  function download() {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName(report);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyButton value={markdown} label="复制 Markdown" />
      <Button type="button" variant="secondary" size="sm" onClick={download}>
        <Download aria-hidden className="size-4" strokeWidth={1.5} />
        下载
      </Button>
    </div>
  );
}
