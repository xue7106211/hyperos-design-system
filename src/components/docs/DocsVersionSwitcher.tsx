'use client';

import Link from 'fumadocs-core/link';
import { usePathname } from 'fumadocs-core/framework';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';
import {
  isLayoutTabActive,
  type LayoutTab,
} from 'fumadocs-ui/layouts/shared';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';

type DocsVersionSwitcherProps = {
  tabs: LayoutTab[];
};

export function DocsVersionSwitcher({ tabs }: DocsVersionSwitcherProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const selected = useMemo(
    () => tabs.findLast((tab) => isLayoutTabActive(tab, pathname)),
    [tabs, pathname],
  );

  if (tabs.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'flex w-full items-center gap-2 rounded-lg border bg-fd-secondary/50 p-1.5 text-start text-fd-secondary-foreground transition-colors',
          'hover:bg-fd-accent data-[popup-open]:bg-fd-accent data-[popup-open]:text-fd-accent-foreground',
        )}
      >
        {selected ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.8125rem] font-normal leading-tight">
              {selected.title}
            </p>
            {selected.description ? (
              <p className="mt-0.5 truncate text-xs font-normal text-fd-muted-foreground md:hidden">
                {selected.description}
              </p>
            ) : null}
          </div>
        ) : null}
        <ChevronsUpDown className="ms-auto size-3.5 shrink-0 text-fd-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="flex w-(--anchor-width) flex-col gap-0.5 p-1">
        {tabs.map((tab) => {
          const isActive = selected?.url === tab.url;
          if (!isActive && tab.unlisted) return null;

          return (
            <Link
              key={tab.url}
              href={tab.url}
              onClick={() => setOpen(false)}
              {...tab.props}
              className={cn(
                'flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-fd-accent hover:text-fd-accent-foreground',
                tab.props?.className,
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[0.8125rem] font-normal leading-tight">{tab.title}</p>
                {tab.description ? (
                  <p className="mt-0.5 text-xs font-normal text-fd-muted-foreground">
                    {tab.description}
                  </p>
                ) : null}
              </div>
              <Check
                className={cn(
                  'mt-0.5 size-3 shrink-0 text-fd-primary',
                  !isActive && 'invisible',
                )}
              />
            </Link>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
