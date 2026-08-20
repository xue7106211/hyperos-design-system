import type { Metadata } from 'next';
import { IconGallery } from '@/components/mdx/IconGalleryServer';

export const metadata: Metadata = {
  title: 'HyperOS Symbols',
  description: 'HyperOS Symbols 字体图标：套件浏览、复制字符、Unicode 与 Glyph Index',
};

export default function IconsPage() {
  return <IconGallery variant="app" />;
}
