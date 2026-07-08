import type { ReactNode } from 'react';

type DosDontsProps = {
  doTitle?: string;
  dontTitle?: string;
  doContent?: ReactNode | string;
  dontContent?: ReactNode | string;
};

function renderContent(content: ReactNode | string | undefined) {
  if (!content) return null;

  if (typeof content === 'string') {
    const items = content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (items.length === 0) return null;

    return (
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return content;
}

export function DosDonts({
  doTitle = '推荐',
  dontTitle = '避免',
  doContent,
  dontContent,
}: DosDontsProps) {
  return (
    <div className="my-6 grid gap-4 md:grid-cols-2 not-prose">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <p className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {doTitle}
        </p>
        <div className="text-sm text-fd-foreground">{renderContent(doContent)}</div>
      </div>
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <p className="mb-2 text-sm font-semibold text-red-700 dark:text-red-400">{dontTitle}</p>
        <div className="text-sm text-fd-foreground">{renderContent(dontContent)}</div>
      </div>
    </div>
  );
}
