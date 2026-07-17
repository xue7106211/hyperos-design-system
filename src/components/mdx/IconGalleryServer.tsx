import { unstable_noStore as noStore } from 'next/cache';
import { getIconManifest } from '@/lib/icons';
import { IconGallery as IconGalleryClient } from './IconGallery';

type IconGalleryProps = {
  /** Limit to these category ids; empty = all */
  categories?: string[];
};

/** Server wrapper: loads manifest once and hydrates the client gallery. */
export function IconGallery({ categories }: IconGalleryProps) {
  noStore();
  const manifest = getIconManifest();
  return <IconGalleryClient categories={categories} manifest={manifest} />;
}
