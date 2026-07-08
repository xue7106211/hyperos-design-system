'use client';

import {
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { TinaMarkdown, type TinaMarkdownContent } from 'tinacms/dist/rich-text';
import { tinaField, useTina } from 'tinacms/dist/react';

import {
  getDocumentFromPayload,
  type TinaDocPayload,
} from '@/lib/tina-docs';
import { fetchTinaDocClient } from '@/lib/tina-docs-client';
import { getTinaMarkdownComponents } from './tina-markdown-components';

type TinaDocsPageContentProps = {
  pagePath: string;
  initialPayload: TinaDocPayload | null;
  fallbackTitle: string;
  fallbackDescription?: string;
  fallbackBody: ReactNode;
  actions?: ReactNode;
};

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
  fallbackBody,
  actions,
}: {
  payload: TinaDocPayload;
  fallbackTitle: string;
  fallbackDescription?: string;
  fallbackBody: ReactNode;
  actions?: ReactNode;
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
        <DocsTitle className="text-2xl font-semibold tracking-tight">{fallbackTitle}</DocsTitle>
        {fallbackDescription ? (
          <DocsDescription className="mb-0 text-[15px] leading-relaxed sm:text-base">
            {fallbackDescription}
          </DocsDescription>
        ) : null}
        {actions}
        <DocsBody>{fallbackBody}</DocsBody>
      </>
    );
  }

  const title = String(doc.title ?? fallbackTitle);
  const description = doc.description ? String(doc.description) : fallbackDescription;

  return (
    <>
      <DocsTitle
        className="text-2xl font-semibold tracking-tight"
        data-tina-field={tinaField(doc, 'title')}
      >
        {title}
      </DocsTitle>
      {description ? (
        <DocsDescription
          className="mb-0 text-[15px] leading-relaxed sm:text-base"
          data-tina-field={tinaField(doc, 'description')}
        >
          {description}
        </DocsDescription>
      ) : null}
      {actions}
      <DocsBody data-tina-field={tinaField(doc, 'body')}>
        {doc.body ? (
          <TinaMarkdown
            content={doc.body as TinaMarkdownContent}
            components={components}
          />
        ) : (
          fallbackBody
        )}
      </DocsBody>
    </>
  );
}

export function TinaDocsPageContent({
  pagePath,
  initialPayload,
  fallbackTitle,
  fallbackDescription,
  fallbackBody,
  actions,
}: TinaDocsPageContentProps) {
  const payload = useTinaPayload(pagePath, initialPayload);

  if (!payload) {
    return (
      <>
        <DocsTitle className="text-2xl font-semibold tracking-tight">{fallbackTitle}</DocsTitle>
        {fallbackDescription ? (
          <DocsDescription className="mb-0 text-[15px] leading-relaxed sm:text-base">
            {fallbackDescription}
          </DocsDescription>
        ) : null}
        {actions}
        <DocsBody>{fallbackBody}</DocsBody>
      </>
    );
  }

  return (
    <TinaEditableContent
      payload={payload}
      fallbackTitle={fallbackTitle}
      fallbackDescription={fallbackDescription}
      fallbackBody={fallbackBody}
      actions={actions}
    />
  );
}
