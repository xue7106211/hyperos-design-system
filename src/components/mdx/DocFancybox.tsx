'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Fancybox, type FancyboxOptions } from '@fancyapps/ui/dist/fancybox/';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

const fancyboxOptions: Partial<FancyboxOptions> = {
  // 文档站已有 scrollbar-gutter，避免再藏滚动条导致布局跳动
  hideScrollbar: false,
  // 关掉 Hash，避免 #doc-gallery-N 污染文档锚点 / 分享链接
  Hash: false,
  Carousel: {
    infinite: false,
    // 只保留左上角计数；右上角缩放 / 幻灯片 / 全屏 / 缩略图 / 关闭一律隐藏
    // 关闭仍可用 ESC 或点击遮罩
    Toolbar: {
      display: {
        left: ['counter'],
        middle: [],
        right: [],
      },
    },
  },
};

/**
 * 官方推荐的 React 绑定方式：容器内 `[data-fancybox]` 自动成组切换。
 * @see https://fancyapps.com/fancybox/integration/react/
 */
function useFancybox(options: Partial<FancyboxOptions> = fancyboxOptions) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!root) return;
    Fancybox.bind(root, '[data-fancybox]', options);
    return () => {
      Fancybox.unbind(root);
      Fancybox.close();
    };
  }, [root, options]);

  return [setRoot] as const;
}

/** 文档页 Fancybox 容器：子树内 data-fancybox="doc-gallery" 的图片可前后切换 */
export function DocFancybox({ children }: { children: ReactNode }) {
  const [fancyboxRef] = useFancybox();

  return <div ref={fancyboxRef}>{children}</div>;
}
