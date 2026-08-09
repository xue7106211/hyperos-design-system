'use client';

import {
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { TinaMarkdown, type TinaMarkdownContent } from 'tinacms/dist/rich-text';
import { tinaField, useTina } from 'tinacms/dist/react';

import { DocMeta } from '@/components/docs/DocMeta';
import {
  DocsModeShell,
} from '@/components/docs/DocsDesignCodePilot';
import {
  getDocumentFromPayload,
  type TinaDocPayload,
} from '@/lib/tina-docs';
import { fetchTinaDocClient } from '@/lib/tina-docs-client';
import { defaultDocMaintainer } from '@/lib/shared';
import { getTinaMarkdownComponents } from './tina-markdown-components';

type TinaDocsPageContentProps = {
  pagePath: string;
  initialPayload: TinaDocPayload | null;
  fallbackTitle: string;
  fallbackDescription?: string;
  fallbackMaintainer?: string;
  fallbackMaintainerOpenId?: string;
  updatedAt: string;
  fallbackBody: ReactNode;
  /** Left: e.g. Design / Code segmented control */
  leadingAction?: ReactNode;
  /** Right cluster: Copy Markdown, Open, etc. */
  actions?: ReactNode;
  figmaAction?: ReactNode;
  /** When set, show Design / Code segmented body (pilot pages only) */
  codePanel?: ReactNode;
};

function DocBodySlot({
  design,
  codePanel,
  tinaFieldAttr,
}: {
  design: ReactNode;
  codePanel?: ReactNode;
  tinaFieldAttr?: string | null;
}) {
  if (codePanel) {
    return <DocsModeShell design={design} code={codePanel} />;
  }

  return (
    <DocsBody className="pt-6" data-tina-field={tinaFieldAttr ?? undefined}>
      {design}
    </DocsBody>
  );
}

function resolveMaintainer(value: unknown, fallback?: string): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (fallback?.trim()) return fallback.trim();
  return defaultDocMaintainer;
}

function resolveOpenId(value: unknown, fallback?: string): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (fallback?.trim()) return fallback.trim();
  return undefined;
}

function DocHeader({
  title,
  description,
  updatedAt,
  maintainer,
  maintainerOpenId,
  maintainerField,
  leadingAction,
  actions,
  figmaAction,
  titleField,
  descriptionField,
}: {
  title: string;
  description?: string;
  updatedAt: string;
  maintainer: string;
  maintainerOpenId?: string;
  maintainerField?: string | null;
  leadingAction?: ReactNode;
  actions?: ReactNode;
  figmaAction?: ReactNode;
  titleField?: string | null;
  descriptionField?: string | null;
}) {
  const hasTrailing = Boolean(actions || figmaAction);

  return (
    <>
      <DocsTitle
        className="text-2xl font-semibold tracking-tight"
        data-tina-field={titleField ?? undefined}
      >
        {title}
      </DocsTitle>
      {description ? (
        <DocsDescription
          className="mb-0 text-[15px] leading-relaxed sm:text-base"
          data-tina-field={descriptionField ?? undefined}
        >
          {description}
        </DocsDescription>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-b pb-6">
        {leadingAction}
        <DocMeta
          updatedAt={updatedAt}
          maintainer={maintainer}
          maintainerOpenId={maintainerOpenId}
          maintainerField={maintainerField ?? undefined}
        />
        {hasTrailing ? (
          <div className="ms-auto flex flex-wrap items-center gap-x-2 gap-y-2">
            {actions}
            {figmaAction}
          </div>
        ) : null}
      </div>
    </>
  );
}

function useTinaPayload(pagePath: string, initialPayload: TinaDocPayload | null) {
  const [payload, setPayload] = useState(initialPayload);

  useEffect(() => {
    if (payload) return;
    if (typeof window === 'undefined' || window.self === window.top) return;

    let cancelled = false;
    fetchTinaDocClient(pagePath).then((next) => {
      if (!cancelled && next) setPayload(next);
    });

    return () => {
      cancelled = true;
    };
  }, [pagePath, payload]);

  return payload;
}

function TinaEditableContent({
  payload,
  fallbackTitle,
  fallbackDescription,
  fallbackMaintainer,
  fallbackMaintainerOpenId,
  updatedAt,
  fallbackBody,
  leadingAction,
  actions,
  figmaAction,
  codePanel,
}: {
  payload: TinaDocPayload;
  fallbackTitle: string;
  fallbackDescription?: string;
  fallbackMaintainer?: string;
  fallbackMaintainerOpenId?: string;
  updatedAt: string;
  fallbackBody: ReactNode;
  leadingAction?: ReactNode;
  actions?: ReactNode;
  figmaAction?: ReactNode;
  codePanel?: ReactNode;
}) {
  const { data } = useTina({
    query: payload.query,
    variables: payload.variables,
    data: payload.data,
    experimental___selectFormByFormId: () => payload.collection,
  });

  const livePayload = useMemo(
    (): TinaDocPayload => ({
      ...payload,
      data: data as Record<string, unknown>,
    }),
    [payload, data],
  );

  const doc = getDocumentFromPayload(livePayload);
  const components = useMemo(() => getTinaMarkdownComponents(), []);

  if (!doc) {
    return (
      <>
        <DocHeader
          title={fallbackTitle}
          description={fallbackDescription}
          updatedAt={updatedAt}
          maintainer={resolveMaintainer(undefined, fallbackMaintainer)}
          maintainerOpenId={resolveOpenId(undefined, fallbackMaintainerOpenId)}
          leadingAction={leadingAction}
          actions={actions}
          figmaAction={figmaAction}
        />
        <DocBodySlot design={fallbackBody} codePanel={codePanel} />
      </>
    );
  }

  const title = String(doc.title ?? fallbackTitle);
  const description = doc.description ? String(doc.description) : fallbackDescription;
  const maintainer = resolveMaintainer(doc.maintainer, fallbackMaintainer);
  const maintainerOpenId = resolveOpenId(
    doc.maintainerOpenId,
    fallbackMaintainerOpenId,
  );

  const design = doc.body ? (
    <TinaMarkdown
      content={doc.body as TinaMarkdownContent}
      components={components}
    />
  ) : (
    fallbackBody
  );

  return (
    <>
      <DocHeader
        title={title}
        description={description}
        updatedAt={updatedAt}
        maintainer={maintainer}
        maintainerOpenId={maintainerOpenId}
        titleField={tinaField(doc, 'title')}
        descriptionField={tinaField(doc, 'description')}
        maintainerField={tinaField(doc, 'maintainer')}
        leadingAction={leadingAction}
        actions={actions}
        figmaAction={figmaAction}
      />
      <DocBodySlot
        design={design}
        codePanel={codePanel}
        tinaFieldAttr={tinaField(doc, 'body')}
      />
    </>
  );
}

export function TinaDocsPageContent({
  pagePath,
  initialPayload,
  fallbackTitle,
  fallbackDescription,
  fallbackMaintainer,
  fallbackMaintainerOpenId,
  updatedAt,
  fallbackBody,
  leadingAction,
  actions,
  figmaAction,
  codePanel,
}: TinaDocsPageContentProps) {
  const payload = useTinaPayload(pagePath, initialPayload);

  if (!payload) {
    return (
      <>
        <DocHeader
          title={fallbackTitle}
          description={fallbackDescription}
          updatedAt={updatedAt}
          maintainer={resolveMaintainer(undefined, fallbackMaintainer)}
          maintainerOpenId={resolveOpenId(undefined, fallbackMaintainerOpenId)}
          leadingAction={leadingAction}
          actions={actions}
          figmaAction={figmaAction}
        />
        <DocBodySlot design={fallbackBody} codePanel={codePanel} />
      </>
    );
  }

  return (
    <TinaEditableContent
      payload={payload}
      fallbackTitle={fallbackTitle}
      fallbackDescription={fallbackDescription}
      fallbackMaintainer={fallbackMaintainer}
      fallbackMaintainerOpenId={fallbackMaintainerOpenId}
      updatedAt={updatedAt}
      fallbackBody={fallbackBody}
      leadingAction={leadingAction}
      actions={actions}
      figmaAction={figmaAction}
      codePanel={codePanel}
    />
  );
}
