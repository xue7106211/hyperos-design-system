type FigmaPrototypeEmbedProps = {
  url?: string;
  fileKey?: string;
  nodeId?: string;
  startingPointNodeId?: string;
  height?: number;
  theme?: 'light' | 'dark' | 'system';
};

export function FigmaPrototypeEmbed({
  url,
  fileKey,
  nodeId,
  startingPointNodeId,
  height = 640,
  theme = 'system',
}: FigmaPrototypeEmbedProps) {
  let src = url;

  if (!src && fileKey) {
    const params = new URLSearchParams({
      'embed-host': 'hyperos-ds',
      theme,
    });

    if (nodeId) params.set('node-id', nodeId);
    if (startingPointNodeId) params.set('starting-point-node-id', startingPointNodeId);

    src = `https://embed.figma.com/proto/${fileKey}?${params.toString()}`;
  }

  if (!src) {
    return (
      <div className="my-6 flex min-h-[320px] items-center justify-center rounded-xl border border-dashed bg-fd-muted/30 p-8 text-center text-sm text-fd-muted-foreground">
        <div>
          <p className="font-medium text-fd-foreground">Figma 原型占位</p>
          <p className="mt-2">
            传入 <code className="text-xs">url</code> 或{' '}
            <code className="text-xs">fileKey</code> 以嵌入移动端交互原型。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-fd-border">
      <iframe
        src={src}
        width="100%"
        height={height}
        allowFullScreen
        loading="lazy"
        title="Figma prototype embed"
        className="border-0"
      />
    </div>
  );
}
