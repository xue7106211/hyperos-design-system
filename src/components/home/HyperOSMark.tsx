import { cn } from '@/lib/cn';

/** Compact “H” monogram for pill nav (inherits currentColor). */
export function HyperOSMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn('size-5', className)}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M6.5 4.25a.75.75 0 0 1 .75.75v5.75h9.5V5a.75.75 0 0 1 1.5 0v14a.75.75 0 0 1-1.5 0v-5.75h-9.5V19a.75.75 0 0 1-1.5 0V5a.75.75 0 0 1 .75-.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
