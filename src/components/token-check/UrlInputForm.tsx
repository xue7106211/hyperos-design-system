'use client';

import { AlertCircle, Check, CornerDownLeft, Loader2 } from 'lucide-react';
import { useEffect, useId, useMemo, useState, type FormEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import { MAX_URLS, parseUrlInput } from './parse-input';
import { Panel } from './primitives';

const PLACEHOLDER = [
  'https://www.figma.com/design/xxxx/文件名?node-id=12-345',
  'https://www.figma.com/design/xxxx/文件名?node-id=67-890',
].join('\n');

export function UrlInputForm({
  value,
  onChange,
  loading,
  onSubmit,
  onCancel,
}: {
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  onSubmit: (urls: string[]) => void;
  onCancel: () => void;
}) {
  const inputId = useId();
  const hintId = useId();
  const statusId = useId();
  const parsed = useMemo(() => parseUrlInput(value), [value]);
  const [touched, setTouched] = useState(false);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  const hasLines = parsed.lines.length > 0;
  const blocked = parsed.errorCount > 0 || parsed.overLimit || parsed.urls.length === 0;
  const showProblems = touched || parsed.lines.length > 1;
  const invalid = showProblems && (parsed.errorCount > 0 || parsed.overLimit);

  function submit() {
    setTouched(true);
    if (loading || blocked) return;
    onSubmit(parsed.urls);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submit();
    }
  }

  const counter = (
    <span
      className={cn(
        'text-xs tabular-nums text-fd-muted-foreground',
        parsed.overLimit && 'tc-text-danger',
      )}
    >
      {parsed.urls.length} / {MAX_URLS}
    </span>
  );

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
      <Panel
        id="tc-input"
        title="Figma 链接"
        description={
          <span id={hintId}>
            一行一个，最多 {MAX_URLS} 个。在 Figma 中选中 Section 或 Frame，右键 Copy link。不要贴整个文件或页面的链接。
          </span>
        }
        actions={counter}
        footer={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading || !hasLines || ((touched || showProblems) && blocked)}
              data-loading={loading || undefined}
              className="tc-button tc-button--primary"
            >
              {loading ? (
                <>
                  <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" strokeWidth={1.5} />
                  检查中
                </>
              ) : (
                '开始检查'
              )}
            </button>
            {loading ? (
              <button type="button" onClick={onCancel} className="tc-button tc-button--secondary">
                取消
              </button>
            ) : (
              <span className="hidden items-center gap-1 text-xs text-fd-muted-foreground sm:inline-flex">
                <kbd className="tc-kbd">{isMac ? '⌘' : 'Ctrl'}</kbd>
                <kbd className="tc-kbd">
                  <CornerDownLeft aria-hidden className="size-3" />
                  <span className="sr-only">Enter</span>
                </kbd>
                快速提交
              </span>
            )}
            <span className="ml-auto hidden text-xs text-fd-muted-foreground md:inline">
              只读取文件，不会修改设计稿
            </span>
          </div>
        }
      >
        <textarea
          id={inputId}
          name="urls"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => hasLines && setTouched(true)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER}
          rows={4}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          readOnly={loading}
          aria-labelledby="tc-input-title"
          aria-describedby={`${hintId} ${statusId}`}
          aria-invalid={invalid || undefined}
          className="tc-textarea"
        />

        <div id={statusId} aria-live="polite">
          {showProblems && hasLines ? (
            <ul className="mt-2 space-y-1 text-xs">
              {parsed.overLimit ? (
                <li className="tc-text-danger flex items-start gap-1.5">
                  <AlertCircle aria-hidden className="mt-px size-3.5 shrink-0" />
                  超过 {MAX_URLS} 个链接，请分批检查。
                </li>
              ) : null}
              {parsed.lines.map((line) =>
                line.status.kind === 'ok' ? null : (
                  <li
                    key={line.line}
                    className={cn(
                      'flex items-start gap-1.5',
                      line.status.kind === 'error' ? 'tc-text-danger' : 'text-fd-muted-foreground',
                    )}
                  >
                    <AlertCircle aria-hidden className="mt-px size-3.5 shrink-0" />
                    <span className="min-w-0">
                      第 {line.line} 行：
                      {line.status.kind === 'error' ? line.status.message : '重复链接，已忽略'}
                    </span>
                  </li>
                ),
              )}
              {parsed.errorCount === 0 && !parsed.overLimit && parsed.urls.length > 0 ? (
                <li className="flex items-center gap-1.5 text-fd-muted-foreground">
                  <Check aria-hidden className="size-3.5" />
                  {parsed.urls.length} 个链接格式正确
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </Panel>
    </form>
  );
}
