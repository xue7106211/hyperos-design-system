'use client';

import type { ComponentType } from 'react';
import { DosDonts } from '@/components/mdx/DosDonts';
import { FigmaEmbed } from '@/components/mdx/FigmaEmbed';
import { FigmaPrototypeEmbed } from '@/components/mdx/FigmaPrototypeEmbed';
import { PlatformCodeBlock } from '@/components/mdx/PlatformCodeBlock';
import { StatusBadge } from '@/components/mdx/StatusBadge';
import { TokenTable } from '@/components/mdx/TokenTable';

type TinaComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

export function getTinaMarkdownComponents(): TinaComponentMap {
  return {
    StatusBadge: (props) => (
      <StatusBadge status={(props.status as 'stable' | 'beta' | 'deprecated') ?? 'stable'} />
    ),
    FigmaEmbed: (props) => (
      <FigmaEmbed
        fileKey={props.fileKey as string | undefined}
        nodeId={props.nodeId as string | undefined}
        mode={(props.mode as 'design' | 'dev') ?? 'design'}
        height={props.height as number | undefined}
        theme={(props.theme as 'light' | 'dark' | 'system') ?? 'system'}
      />
    ),
    FigmaPrototypeEmbed: (props) => (
      <FigmaPrototypeEmbed
        url={props.url as string | undefined}
        fileKey={props.fileKey as string | undefined}
        nodeId={props.nodeId as string | undefined}
        height={props.height as number | undefined}
      />
    ),
    TokenTable: (props) => <TokenTable groups={(props.groups as string[]) ?? []} />,
    DosDonts: (props) => (
      <DosDonts
        doTitle={props.doTitle as string | undefined}
        dontTitle={props.dontTitle as string | undefined}
        doContent={props.doContent as string | undefined}
        dontContent={props.dontContent as string | undefined}
      />
    ),
    PlatformCodeBlock: (props) => (
      <PlatformCodeBlock
        androidTitle={props.androidTitle as string | undefined}
        androidCode={props.androidCode as string | undefined}
        iosTitle={props.iosTitle as string | undefined}
        iosCode={props.iosCode as string | undefined}
      />
    ),
  };
}
