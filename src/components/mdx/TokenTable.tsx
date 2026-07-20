'use client';

import { useState } from 'react';
import {
  filterTokensByGroups,
  isColorToken,
  isPaintValue,
  type TokenEntry,
  type TokenMode,
} from './token-utils';

type TokenTableProps = {
  /** 筛选用路径前缀（不显示在名称列），如 `semantic.bg`、`component.navigation` */
  groups?: string[];
  /** 初始主题模式 */
  defaultMode?: TokenMode;
};

function ColorSwatch({ token }: { token: TokenEntry }) {
  const resolved = isPaintValue(token.value) ? token.value : 'transparent';

  return (
    <span
      className="inline-block size-6 shrink-0 rounded-md border border-fd-border"
      style={{ backgroundColor: resolved }}
      title={token.value}
    />
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: TokenMode;
  onChange: (mode: TokenMode) => void;
}) {
  const options: { id: TokenMode; label: string }[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
  ];

  return (
    <div
      className="inline-flex gap-1 rounded-lg border border-fd-border bg-fd-muted/30 p-1"
      role="group"
      aria-label="Token 主题模式"
    >
      {options.map((option) => {
        const active = mode === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={
              active
                ? 'rounded-md bg-fd-background px-3 py-1 text-xs font-medium text-fd-foreground shadow-sm'
                : 'rounded-md px-3 py-1 text-xs font-medium text-fd-muted-foreground hover:text-fd-foreground'
            }
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function TokenTable({
  groups = [],
  defaultMode = 'light',
}: TokenTableProps) {
  const [mode, setMode] = useState<TokenMode>(defaultMode);
  const tokens = filterTokensByGroups(groups, mode);

  if (tokens.length === 0) {
    return (
      <div className="my-6 rounded-xl border border-dashed p-6 text-sm text-fd-muted-foreground">
        未找到匹配的 Design Token。请检查 <code>groups</code> 配置或{' '}
        <code>tokens/*.json</code> 文件。
      </div>
    );
  }

  return (
    <div className="my-6 not-prose">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-fd-muted-foreground">
          {tokens.length} 个 Token · {mode === 'light' ? 'Light' : 'Dark'}
        </p>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-fd-border text-left">
              <th className="py-2 pr-4 font-medium">Token</th>
              <th className="py-2 pr-4 font-medium">类型</th>
              <th className="py-2 font-medium">值</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr key={`${mode}:${token.path}`} className="border-b border-fd-border/60">
                <td className="py-3 pr-4 font-mono text-xs">{token.name}</td>
                <td className="py-3 pr-4 text-fd-muted-foreground">
                  {token.type ?? '—'}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {isColorToken(token) && isPaintValue(token.value) ? (
                      <ColorSwatch token={token} />
                    ) : null}
                    <code className="text-xs">{token.value}</code>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
