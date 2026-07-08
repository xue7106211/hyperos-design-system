'use client';

import { Children, isValidElement, useMemo, useState, type ReactElement, type ReactNode } from 'react';

type Platform = 'android' | 'ios';

export type PlatformTabProps = {
  platform: Platform;
  title?: string;
  children: ReactNode;
};

export function PlatformTab(_props: PlatformTabProps) {
  return null;
}

const platformLabels: Record<Platform, string> = {
  android: 'Android',
  ios: 'iOS',
};

export function PlatformTabs({ children }: { children: ReactNode }) {
  const tabs = useMemo(() => {
    return Children.toArray(children).filter((child): child is ReactElement<PlatformTabProps> => {
      if (!isValidElement(child)) return false;
      const props = child.props as PlatformTabProps;
      return props.platform !== undefined;
    });
  }, [children]);

  const [active, setActive] = useState<Platform>(tabs[0]?.props.platform ?? 'android');

  const activeTab = tabs.find((tab) => tab.props.platform === active) ?? tabs[0];

  if (tabs.length === 0) return null;

  return (
    <div className="my-6 not-prose">
      <div className="flex gap-1 rounded-lg border border-fd-border bg-fd-muted/30 p-1">
        {tabs.map((tab) => {
          const platform = tab.props.platform;
          const label = tab.props.title ?? platformLabels[platform];

          return (
            <button
              key={platform}
              type="button"
              onClick={() => setActive(platform)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active === platform
                  ? 'bg-fd-background text-fd-foreground shadow-sm'
                  : 'text-fd-muted-foreground hover:text-fd-foreground'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="mt-3 overflow-x-auto rounded-xl border border-fd-border bg-fd-muted/20 p-4">
        <pre className="m-0 overflow-x-auto text-sm leading-relaxed">
          <code>{String(activeTab?.props.children).trim()}</code>
        </pre>
      </div>
    </div>
  );
}
