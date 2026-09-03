'use client';

import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  type ToolUIPart,
  isToolUIPart,
} from 'ai';
import {
  BookOpenIcon,
  ChevronDownIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createPortal, flushSync } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Suggestion,
  Suggestions,
} from '@/components/ai-elements/suggestion';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  getDocumentSources,
  type DocumentSource,
} from '@/lib/ai/document-sources';
import type { ChatUIMessage } from '@/lib/ai/types';
import { cn } from '@/lib/utils';

type AISearchContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<ChatUIMessage>;
};

const Context = createContext<AISearchContextValue | null>(null);

function useAISearchContext() {
  const ctx = use(Context);
  if (!ctx) throw new Error('AISearch components require <AISearch>');
  return ctx;
}

function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isDocsPath(pathname: string | null): boolean {
  return pathname === '/docs' || Boolean(pathname?.startsWith('/docs/'));
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQuery.matches);
    updateMatches();
    mediaQuery.addEventListener('change', updateMatches);
    return () => mediaQuery.removeEventListener('change', updateMatches);
  }, [query]);

  return matches;
}

const PANEL_SIZE_KEY = '__ai_assistant_panel_size';
const DEFAULT_PANEL_SIZE = { width: 384, height: 640 };
const MIN_PANEL_SIZE = { width: 320, height: 420 };
const DESKTOP_DOCK_MEDIA_QUERY = '(min-width: 1280px)';
const MAX_PROMPT_LENGTH = 1000;

/** 空状态可点预设问题，点击后直接发送 */
const SUGGESTED_PROMPTS = [
  '抽屉圆角是多少？',
  '按钮有哪些类型？',
  '抽屉浮窗的设计规格是什么？',
  '标题栏的遮罩有几种类型？',
] as const;

type PanelSize = { width: number; height: number };
type ResizeEdge = 'n' | 'w' | 'nw';

function isInternalAppLink(href: string | undefined): href is string {
  return Boolean(href?.startsWith('/') && !href.startsWith('//'));
}

/**
 * Streamdown 默认把 Markdown 链接设为新窗口打开。Ask AI 的文档引用是
 * 站内路径，改用 Next Link 才能软跳转并保留根布局中的聊天状态。
 */
function AskAiResponseLink({
  className,
  href,
  node: _node,
  rel: _rel,
  target: _target,
  ...props
}: ComponentProps<'a'> & { node?: unknown }) {
  const linkProps = {
    ...props,
    className: cn('wrap-anywhere font-medium text-primary underline', className),
    'data-incomplete': href === 'streamdown:incomplete-link' || undefined,
    'data-streamdown': 'link',
  };

  if (isInternalAppLink(href)) {
    return <Link href={href} {...linkProps} />;
  }

  return <a href={href} {...linkProps} />;
}

function DocumentSources({ citations }: { citations: DocumentSource[] }) {
  const router = useRouter();

  if (citations.length === 0) return null;

  return (
    <Sources>
      <SourcesTrigger count={citations.length}>
        <BookOpenIcon className="size-3.5" aria-hidden />
        <span>引用 {citations.length} 篇文档</span>
        <ChevronDownIcon className="size-3.5" aria-hidden />
      </SourcesTrigger>
      <SourcesContent>
        {citations.map(({ href, title }) => (
          <Source
            href={href}
            key={href}
            onClick={(event) => {
              event.preventDefault();
              router.push(href);
            }}
            target="_self"
            title={title}
          />
        ))}
      </SourcesContent>
    </Sources>
  );
}

function getSearchResultCount(output: unknown): number | null {
  if (!output || typeof output !== 'object') return null;

  const result = output as { hits?: unknown; status?: unknown };
  return result.status === 'ok' && Array.isArray(result.hits)
    ? result.hits.length
    : null;
}

function SearchChain({ invocation }: { invocation: ToolUIPart }) {
  const isRunning =
    invocation.state === 'input-streaming' ||
    invocation.state === 'input-available' ||
    invocation.state === 'approval-requested' ||
    invocation.state === 'approval-responded';
  const [open, setOpen] = useState(isRunning);
  const wasRunning = useRef(isRunning);
  const isCompleted = invocation.state === 'output-available';
  const resultCount = isCompleted ? getSearchResultCount(invocation.output) : null;
  const statusLabel = isCompleted ? '已完成' : isRunning ? '检索中' : '未完成';
  const detail = isCompleted
    ? resultCount === null
      ? '文档检索已完成。'
      : resultCount === 0
        ? '未找到相关文档。'
        : `已检索到 ${resultCount} 篇相关文档。`
    : invocation.state === 'output-error'
      ? '文档检索暂时不可用，请稍后重试。'
      : invocation.state === 'output-denied'
        ? '此次文档检索未执行。'
        : '正在检索 OS4 设计规范…';

  useEffect(() => {
    if (wasRunning.current && !isRunning) setOpen(false);
    wasRunning.current = isRunning;
  }, [isRunning]);

  return (
    <ChainOfThought
      className="not-prose mb-4 w-full"
      onOpenChange={setOpen}
      open={open}
    >
      <ChainOfThoughtHeader>文档检索 · {statusLabel}</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        <ChainOfThoughtStep
          description={detail}
          icon={SearchIcon}
          label={isRunning ? '正在检索 OS4 设计规范' : '检索 OS4 设计规范'}
          status={isCompleted ? 'complete' : isRunning ? 'active' : 'pending'}
        />
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}

function clampPanelSize(width: number, height: number): PanelSize {
  if (typeof window === 'undefined') {
    return {
      width: Math.max(MIN_PANEL_SIZE.width, width),
      height: Math.max(MIN_PANEL_SIZE.height, height),
    };
  }
  const maxWidth = Math.min(window.innerWidth - 32, window.innerWidth * 0.92);
  const maxHeight = Math.min(window.innerHeight - 96, window.innerHeight * 0.85);
  return {
    width: Math.round(
      Math.min(maxWidth, Math.max(MIN_PANEL_SIZE.width, width)),
    ),
    height: Math.round(
      Math.min(maxHeight, Math.max(MIN_PANEL_SIZE.height, height)),
    ),
  };
}

function readStoredPanelSize(): PanelSize {
  if (typeof window === 'undefined') return DEFAULT_PANEL_SIZE;
  try {
    const raw = localStorage.getItem(PANEL_SIZE_KEY);
    if (!raw) return DEFAULT_PANEL_SIZE;
    const parsed = JSON.parse(raw) as Partial<PanelSize>;
    if (
      typeof parsed.width !== 'number' ||
      typeof parsed.height !== 'number'
    ) {
      return DEFAULT_PANEL_SIZE;
    }
    return clampPanelSize(parsed.width, parsed.height);
  } catch {
    return DEFAULT_PANEL_SIZE;
  }
}

function useResizablePanelSize() {
  const [size, setSize] = useState<PanelSize>(DEFAULT_PANEL_SIZE);
  const [resizing, setResizing] = useState(false);
  const dragRef = useRef<{
    edge: ResizeEdge;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  useEffect(() => {
    setSize(readStoredPanelSize());
  }, []);

  useEffect(() => {
    const onResize = () => {
      setSize((prev) => clampPanelSize(prev.width, prev.height));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onPointerMove = useEffectEvent((event: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    // 面板锚定右下角：向左/上拖动时增大尺寸
    const nextWidth =
      drag.edge === 'n' ? drag.startWidth : drag.startWidth - dx;
    const nextHeight =
      drag.edge === 'w' ? drag.startHeight : drag.startHeight - dy;
    setSize(clampPanelSize(nextWidth, nextHeight));
  });

  const stopDragging = useEffectEvent(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setResizing(false);
    setSize((prev) => {
      const next = clampPanelSize(prev.width, prev.height);
      try {
        localStorage.setItem(PANEL_SIZE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota / private mode
      }
      return next;
    });
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  useEffect(() => {
    if (!resizing) return;
    const onMove = (event: PointerEvent) => onPointerMove(event);
    const onUp = () => stopDragging();
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [resizing]);

  const startResize = useCallback(
    (edge: ResizeEdge, event: ReactPointerEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current = {
        edge,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: size.width,
        startHeight: size.height,
      };
      setResizing(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor =
        edge === 'nw' ? 'nwse-resize' : edge === 'n' ? 'ns-resize' : 'ew-resize';
    },
    [size.height, size.width],
  );

  return { size, resizing, startResize };
}

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const chat = useChat<ChatUIMessage>({
    id: 'ask-ai',
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const value = useMemo(
    () => ({ open, setOpen, chat }),
    [open, chat],
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Context value={value}>{children}</Context>
    </TooltipProvider>
  );
}

const ASK_MOTION_EASE = [0.32, 0.72, 0, 1] as const;

export function AISearchTrigger({
  position = 'default',
  className,
  ...props
}: ComponentProps<'button'> & { position?: 'default' | 'float' }) {
  const { open, setOpen } = useAISearchContext();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  if (isAdminPath(pathname)) return null;

  const button = (
    <Button
      type="button"
      variant={position === 'float' ? 'default' : 'secondary'}
      aria-expanded={open}
      aria-controls="ai-ask-panel"
      className={cn(
        position === 'float' &&
          'ai-ask-trigger h-9 gap-2 rounded-full px-4 shadow-none transition-[box-shadow] active:scale-[0.96]',
        className,
      )}
      onClick={() => setOpen(true)}
      {...props}
    />
  );

  if (position !== 'float') return button;

  return (
    <AnimatePresence>
      {!open ? (
        <motion.div
          key="ai-ask-trigger"
          className="fixed right-6 bottom-6 z-40 origin-bottom-right"
          initial={false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.96, y: 8 }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.16, ease: ASK_MOTION_EASE }
          }
        >
          {button}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function useHotKey(disabled: boolean) {
  const { open, setOpen } = useAISearchContext();

  const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape' && open) {
      setOpen(false);
      e.preventDefault();
    }
    if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
      setOpen(!open);
      e.preventDefault();
    }
  });

  useEffect(() => {
    if (disabled) return;
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, [disabled]);
}

function MessageParts({
  message,
  showSources = true,
}: {
  message: ChatUIMessage;
  showSources?: boolean;
}) {
  const citations = getDocumentSources(message);
  const hasText = message.parts.some(
    (part) => part.type === 'text' && part.text.trim().length > 0,
  );

  return (
    <>
      {message.parts.map((part, i) => {
        if (part.type === 'text') {
          return (
            <MessageResponse
              components={{ a: AskAiResponseLink }}
              key={`${message.id}-text-${i}`}
            >
              {part.text}
            </MessageResponse>
          );
        }

        if (isToolUIPart(part)) {
          const invocation = part as ToolUIPart;
          if (invocation.type !== 'tool-search') return null;

          return (
            <SearchChain
              invocation={invocation}
              key={invocation.toolCallId ?? `${message.id}-tool-${i}`}
            />
          );
        }

        return null;
      })}
      {showSources && !hasText && citations.length > 0 ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-muted-foreground text-sm">
          文档已检索完成，但未能生成文字回答。请重新提问。
        </p>
      ) : null}
      {showSources ? <DocumentSources citations={citations} /> : null}
    </>
  );
}

export function AISearchPanel() {
  const { open, setOpen, chat } = useAISearchContext();
  const pathname = usePathname();
  const disabled = isAdminPath(pathname);
  const supportsDesktopDock = isDocsPath(pathname);
  const isDesktop = useMediaQuery(DESKTOP_DOCK_MEDIA_QUERY);
  const isDocked = supportsDesktopDock && isDesktop;
  const [actualOpen, setActualOpen] = useState(false);
  const [text, setText] = useState('');
  const { size, resizing, startResize } = useResizablePanelSize();
  const reduceMotion = useReducedMotion();

  useHotKey(disabled);

  useEffect(() => {
    if (!actualOpen || !supportsDesktopDock) return;

    document.body.dataset.aiAskDock = 'true';
    return () => {
      delete document.body.dataset.aiAskDock;
    };
  }, [actualOpen, supportsDesktopDock]);

  // 打开时同步挂载，避免入口已退出、面板晚一帧才出现
  if (open && !actualOpen) {
    setActualOpen(true);
  }

  if (disabled || !actualOpen) return null;

  const messages = chat.messages.filter((msg) => msg.role !== 'system');
  const canSend = chat.status === 'ready';
  const latestAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant')?.id;

  const sendUserText = (value: string) => {
    const textValue = value.trim().slice(0, MAX_PROMPT_LENGTH);
    if (!textValue || !canSend) return;

    void chat.sendMessage({
      role: 'user',
      parts: [
        {
          type: 'data-client',
          data: { location: location.href },
        },
        {
          type: 'text',
          text: textValue,
        },
      ],
    });
    setText('');
  };

  const handleSubmit = (message: PromptInputMessage) => {
    sendUserText(message.text);
  };

  return createPortal(
    <AnimatePresence
      onExitComplete={() => {
        if (!open) flushSync(() => setActualOpen(false));
      }}
    >
      {open ? (
        <motion.aside
          key="ai-ask-panel"
          id="ai-ask-panel"
          role="dialog"
          aria-label="Ask AI"
          className={cn(
            // 只用 fixed：勿再加 relative，否则 Tailwind 层叠可能覆盖 position
            'ai-ask-panel fixed z-40 flex flex-col overflow-hidden border bg-background text-foreground',
            isDocked
              ? 'ai-ask-panel--dock origin-right rounded-none border-y-0 border-e-0 shadow-none'
              : 'origin-bottom-right rounded-2xl shadow-xl',
            resizing && 'transition-none',
          )}
          initial={
            reduceMotion
              ? false
              : isDocked
                ? { opacity: 0, x: 24 }
                : { opacity: 0, scale: 0.97, y: 12 }
          }
          animate={isDocked ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1, y: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : isDocked
                ? { opacity: 0, x: 24 }
                : { opacity: 0, scale: 0.97, y: 8 }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: open ? 0.22 : 0.16,
                  ease: ASK_MOTION_EASE,
                }
          }
          style={
            isDocked
              ? ({
                  position: 'fixed',
                  right: 0,
                  bottom: 0,
                  left: 'auto',
                  top: 0,
                  width: 'var(--ai-ask-dock-width)',
                  height: '100dvh',
                  maxWidth: 'none',
                  maxHeight: 'none',
                } satisfies CSSProperties)
              : ({
                  position: 'fixed',
                  // 入口隐藏后，面板落在同一角落，形成空间连续感
                  right: 24,
                  bottom: 24,
                  left: 'auto',
                  top: 'auto',
                  width: size.width,
                  height: size.height,
                  maxWidth: 'calc(100vw - 2rem)',
                  maxHeight: 'calc(100dvh - 6rem)',
                } satisfies CSSProperties)
          }
        >
        {/* 锚定右下角：左侧 / 顶部 / 左上角可拖拽调节大小 */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="调节面板宽度"
          className="ai-ask-resize-handle absolute inset-y-3 left-0 z-20 w-1.5 cursor-ew-resize touch-none"
          onPointerDown={(event) => startResize('w', event)}
        />
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="调节面板高度"
          className="ai-ask-resize-handle absolute inset-x-3 top-0 z-20 h-1.5 cursor-ns-resize touch-none"
          onPointerDown={(event) => startResize('n', event)}
        />
        <div
          role="separator"
          aria-label="调节面板大小"
          className="ai-ask-resize-handle absolute top-0 left-0 z-30 size-4 cursor-nwse-resize touch-none"
          onPointerDown={(event) => startResize('nw', event)}
        />

        <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <p className="font-medium text-sm">Ask AI</p>
            <p className="text-muted-foreground text-xs">
              回答可能不准确，请以文档为准。
            </p>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="关闭"
            onClick={() => setOpen(false)}
          >
            <XIcon className="size-4" />
          </Button>
        </header>

        <Conversation className="min-h-0 flex-1">
          <ConversationContent
            className={cn(
              'gap-4',
              messages.length === 0 && 'min-h-full p-0',
            )}
          >
            {messages.length === 0 ? (
              <ConversationEmptyState className="min-h-0 flex-1 items-stretch justify-end gap-0 px-4 pt-4 pb-1 text-left">
                <Suggestions className="w-full flex-col items-start gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <Suggestion
                      key={prompt}
                      disabled={!canSend}
                      onClick={sendUserText}
                      suggestion={prompt}
                    />
                  ))}
                </Suggestions>
                <p className="mt-6 flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs">
                  <span>Tips：按</span>
                  <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px] text-foreground">
                    ⌘
                  </kbd>
                  <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px] text-foreground">
                    /
                  </kbd>
                  <span>打开或关闭 Ask AI</span>
                </p>
              </ConversationEmptyState>
            ) : (
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    <MessageParts
                      message={message}
                      showSources={
                        chat.status !== 'streaming' ||
                        message.id !== latestAssistantMessageId
                      }
                    />
                  </MessageContent>
                </Message>
              ))
            )}

            {chat.error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
                <p className="font-medium">模型服务暂时不可用，请稍后重试</p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {chat.error.message}
                </p>
              </div>
            ) : null}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className={cn('p-3', messages.length > 0 && 'border-t')}>
          <PromptInput onSubmit={handleSubmit} className="ai-ask-prompt rounded-xl border">
            <PromptInputBody>
              <PromptInputTextarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
                maxLength={MAX_PROMPT_LENGTH}
                placeholder="输入 OS4 设计规范问题…"
                className="min-h-20 max-h-40 text-sm"
              />
            </PromptInputBody>
            <PromptInputFooter className="justify-between gap-3">
              <span aria-live="polite" className="text-muted-foreground text-xs">
                {text.length} / {MAX_PROMPT_LENGTH}
              </span>
              <PromptInputSubmit
                className="ai-ask-submit shrink-0 rounded-lg disabled:opacity-100"
                status={chat.status}
                disabled={!text.trim() && chat.status === 'ready'}
                onStop={() => chat.stop()}
                style={{
                  backgroundColor: 'var(--ai-ask-accent, #0082fb)',
                  color: 'white',
                }}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
