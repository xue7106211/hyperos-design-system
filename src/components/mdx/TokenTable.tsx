import { filterTokensByGroups, isColorToken, type TokenEntry } from './token-utils';

type TokenTableProps = {
  groups?: string[];
};

function ColorSwatch({ token }: { token: TokenEntry }) {
  const resolved =
    token.value.startsWith('#') || token.value.startsWith('rgb')
      ? token.value
      : 'transparent';

  return (
    <span
      className="inline-block size-6 shrink-0 rounded-md border border-fd-border"
      style={{ backgroundColor: resolved }}
      title={token.value}
    />
  );
}

export function TokenTable({ groups = [] }: TokenTableProps) {
  const tokens = filterTokensByGroups(groups);

  if (tokens.length === 0) {
    return (
      <div className="my-6 rounded-xl border border-dashed p-6 text-sm text-fd-muted-foreground">
        未找到匹配的 Design Token。请检查 <code>groups</code> 配置或{' '}
        <code>tokens/tokens.json</code> 文件。
      </div>
    );
  }

  return (
    <div className="my-6 overflow-x-auto not-prose">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-fd-border text-left">
            <th className="py-2 pr-4 font-medium">Token</th>
            <th className="py-2 pr-4 font-medium">类型</th>
            <th className="py-2 pr-4 font-medium">值</th>
            <th className="py-2 font-medium">说明</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.name} className="border-b border-fd-border/60">
              <td className="py-3 pr-4 font-mono text-xs">{token.name}</td>
              <td className="py-3 pr-4 text-fd-muted-foreground">{token.type ?? '—'}</td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  {isColorToken(token) && token.value.startsWith('#') ? (
                    <ColorSwatch token={token} />
                  ) : null}
                  <code className="text-xs">{token.value}</code>
                </div>
              </td>
              <td className="py-3 text-fd-muted-foreground">{token.description ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
