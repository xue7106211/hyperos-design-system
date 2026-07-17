import { getIconManifest } from '@/lib/icons';
import { IconGallery as IconGalleryClient } from './IconGallery';

type IconGalleryProps = {
  /** Limit to these category ids; empty = all */
  categories?: string[];
};

/** Server wrapper: loads manifest once and hydrates the client gallery. */
export function IconGallery({ categories }: IconGalleryProps) {
  const manifest = getIconManifest();
  return <IconGalleryClient categories={categories} manifest={manifest} />;
}
