import { unstable_noStore as noStore } from 'next/cache';
import { getIconManifest } from '@/lib/icons';
import { IconGallery as IconGalleryClient } from './IconGallery';

type IconGalleryProps = {
  /** @deprecated SVG 分类；字体画廊忽略 */
  categories?: string[];
  variant?: 'embed' | 'app';
};

export function IconGallery({ variant = 'embed' }: IconGalleryProps) {
  noStore();
  const manifest = getIconManifest();
  return <IconGalleryClient variant={variant} manifest={manifest} />;
}
