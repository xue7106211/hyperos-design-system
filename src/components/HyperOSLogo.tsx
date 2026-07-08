import Image from 'next/image';
import { cn } from '@/lib/cn';

type HyperOSLogoProps = {
  className?: string;
  priority?: boolean;
};

const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 144;

export function HyperOSLogo({ className, priority }: HyperOSLogoProps) {
  return (
    <span className={cn('inline-flex shrink-0', className)}>
      <Image
        src="/logo/hyperos-light.png"
        alt="Xiaomi HyperOS"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className="h-full w-auto dark:hidden"
        priority={priority}
      />
      <Image
        src="/logo/hyperos-dark.png"
        alt="Xiaomi HyperOS"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className="hidden h-full w-auto dark:block"
        priority={priority}
      />
    </span>
  );
}
