type FigmaEmbedProps = {
  fileKey?: string;
  nodeId?: string;
  type?: 'design' | 'proto';
  height?: number;
  theme?: 'light' | 'dark' | 'system';
};

export function FigmaEmbed({
  fileKey,
  nodeId,
  type = 'design',
  height = 480,
  theme = 'system',
}: FigmaEmbedProps) {
  if (!fileKey) {
    return (
      <div className="my-6 flex min-h-[240px] items-center justify-center rounded-xl border border-dashed bg-fd-muted/30 p-8 text-center text-sm text-fd-muted-foreground">
        <div>
          <p className="font-medium text-fd-foreground">Figma 设计稿占位</p>
          <p className="mt-2">
            请在 MDX 中传入 <code className="text-xs">fileKey</code>，或在前置 matter 中配置{' '}
            <code className="text-xs">figmaFileKey</code>。
          </p>
        </div>
      </div>
    );
  }

  const params = new URLSearchParams({
    'embed-host': 'hyperos-ds',
    theme,
  });

  if (nodeId) {
    params.set('node-id', nodeId);
  }

  const src = `https://embed.figma.com/${type}/${fileKey}?${params.toString()}`;

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-fd-border">
      <iframe
        src={src}
        width="100%"
        height={height}
        allowFullScreen
        loading="lazy"
        title="Figma design embed"
        className="border-0"
      />
    </div>
  );
}
