'use client';

import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '@/components/arc/button/button';
import { Textarea } from '@/components/arc/textarea/textarea';
import { cn } from '@/lib/cn';
import { MAX_URLS, parseUrlInput, type ParsedInput } from './parse-input';

const PLACEHOLDER = [
  'https://www.figma.com/design/xxxx/文件名?node-id=12-345',
  'https://www.figma.com/design/xxxx/文件名?node-id=67-890',
].join('\n');

const HINT = `一行一个，最多 ${MAX_URLS} 个。在 Figma 中选中 Section 或 Frame，右键 Copy link，不要贴整个文件或页面`;

/** 阻断提交的问题合成一句，交给 Textarea 的 error（role=alert） */
function errorText(parsed: ParsedInput, empty: boolean) {
  if (empty) return '请先贴入 Figma 链接';
  if (parsed.overLimit) return `超过 ${MAX_URLS} 个链接，请分批检查`;
  const errors = parsed.lines.filter((l) => l.status.kind === 'error');
  if (errors.length === 0) return undefined;
  return errors
    .map((l) => `第 ${l.line} 行：${l.status.kind === 'error' ? l.status.message : ''}`)
    .join('；');
}

/** 不阻断的状态：格式正确的数量、忽略的重复链接 */
function statusText(parsed: ParsedInput) {
  const dupes = parsed.lines.filter((l) => l.status.kind === 'duplicate').length;
  const ok = parsed.urls.length > 0 ? `${parsed.urls.length} 个链接格式正确` : '';
  return [ok, dupes > 0 ? `已忽略 ${dupes} 个重复链接` : ''].filter(Boolean).join('，');
}

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
  const parsed = useMemo(() => parseUrlInput(value), [value]);
  const [touched, setTouched] = useState(false);
  const empty = parsed.lines.length === 0;
  const blocked = empty || parsed.errorCount > 0 || parsed.overLimit || parsed.urls.length === 0;
  // 输入一行后先不打扰，失焦、提交或贴入多行时再提示
  const showProblems = touched || parsed.lines.length > 1;
  const error = showProblems ? errorText(parsed, empty && touched) : undefined;
  const status = showProblems && !error ? statusText(parsed) : '';

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

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={loading} className="tc-panel" aria-label="检查输入">
      <div className="tc-panel-body tc-input">
        <span className={cn('tc-input-counter', parsed.overLimit && 'tc-text-danger')} aria-hidden>
          {parsed.urls.length} / {MAX_URLS}
        </span>
        <Textarea
          label="Figma 链接"
          description={status ? `${HINT}。${status}` : HINT}
          error={error}
          name="urls"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => !empty && setTouched(true)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER}
          rows={4}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          readOnly={loading}
          aria-keyshortcuts="Meta+Enter Control+Enter"
        />
      </div>
      <div className="tc-panel-foot tc-input-foot">
        <Button type="submit" loading={loading}>
          {loading ? '检查中' : '开始检查'}
        </Button>
        {loading ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            取消
          </Button>
        ) : null}
        <span className="tc-input-note">只读取文件，不会修改设计稿</span>
      </div>
    </form>
  );
}
