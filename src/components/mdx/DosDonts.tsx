type DosDontsProps = {
  doTitle?: string;
  dontTitle?: string;
  doContent: React.ReactNode;
  dontContent: React.ReactNode;
};

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
        <div className="text-sm text-fd-foreground">{doContent}</div>
      </div>
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <p className="mb-2 text-sm font-semibold text-red-700 dark:text-red-400">{dontTitle}</p>
        <div className="text-sm text-fd-foreground">{dontContent}</div>
      </div>
    </div>
  );
}
