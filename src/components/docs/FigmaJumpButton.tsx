import { SiFigma } from '@icons-pack/react-simple-icons';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@/lib/cn';

type FigmaJumpButtonProps = {
  href: string;
  className?: string;
};

export function FigmaJumpButton({ href, className }: FigmaJumpButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        buttonVariants({
          color: 'primary',
          size: 'sm',
          className: 'gap-2 [&_svg]:size-3.5',
        }),
        className,
      )}
    >
      <SiFigma aria-hidden />
      跳转 Figma
    </a>
  );
}
