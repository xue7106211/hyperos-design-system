'use client';

import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  type ToolUIPart,
  isToolUIPart,
} from 'ai';
import { MessageCircleIcon, XIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
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
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
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

const PANEL_SIZE_KEY = '__ai_assistant_panel_size';
const DEFAULT_PANEL_SIZE = { width: 384, height: 640 };
const MIN_PANEL_SIZE = { width: 320, height: 420 };

type PanelSize = { width: number; height: number };
type ResizeEdge = 'n' | 'w' | 'nw';

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

export function AISearchTrigger({
  position = 'default',
  className,
  ...props
}: ComponentProps<'button'> & { position?: 'default' | 'float' }) {
  const { open, setOpen } = useAISearchContext();
  const pathname = usePathname();
  if (isAdminPath(pathname)) return null;

  return (
    <Button
      type="button"
      variant={position === 'float' ? 'default' : 'secondary'}
      aria-expanded={open}
      className={cn(
        position === 'float' &&
          'fixed right-4 bottom-4 z-40 gap-2 rounded-full px-4 py-2.5 shadow-lg',
        className,
      )}
      onClick={() => setOpen(!open)}
      {...props}
    />
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
    if (e.key === '/' && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true);
      e.preventDefault();
    }
  });

  useEffect(() => {
    if (disabled) return;
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, [disabled]);
}

function MessageParts({ message }: { message: ChatUIMessage }) {
  return (
    <>
      {message.parts.map((part, i) => {
        if (part.type === 'text') {
          return (
            <MessageResponse key={`${message.id}-text-${i}`}>
              {part.text}
            </MessageResponse>
          );
        }

        if (isToolUIPart(part)) {
          const invocation = part as ToolUIPart;
          const toolName = invocation.type.replace(/^tool-/, '');

          return (
            <Tool key={invocation.toolCallId ?? `${message.id}-tool-${i}`} defaultOpen={false}>
              <ToolHeader
                title={toolName === 'search' ? '检索文档' : toolName}
                type={invocation.type}
                state={invocation.state}
              />
              <ToolContent>
                {invocation.input != null ? (
                  <ToolInput input={invocation.input} />
                ) : null}
                {invocation.state === 'output-available' ||
                invocation.state === 'output-error' ? (
                  <ToolOutput
                    output={
                      invocation.state === 'output-available'
                        ? invocation.output
                        : undefined
                    }
                    errorText={
                      invocation.state === 'output-error'
                        ? invocation.errorText
                        : undefined
                    }
                  />
                ) : null}
              </ToolContent>
            </Tool>
          );
        }

        return null;
      })}
    </>
  );
}

export function AISearchPanel() {
  const { open, setOpen, chat } = useAISearchContext();
  const pathname = usePathname();
  const disabled = isAdminPath(pathname);
  const [actualOpen, setActualOpen] = useState(false);
  const [text, setText] = useState('');
  const { size, resizing, startResize } = useResizablePanelSize();

  useHotKey(disabled);

  useEffect(() => {
    if (open) setActualOpen(true);
  }, [open]);

  if (disabled || !actualOpen) return null;

  const messages = chat.messages.filter((msg) => msg.role !== 'system');

  const handleSubmit = (message: PromptInputMessage) => {
    const value = message.text.trim();
    if (!value) return;

    void chat.sendMessage({
      role: 'user',
      parts: [
        {
          type: 'data-client',
          data: { location: location.href },
        },
        {
          type: 'text',
          text: value,
        },
      ],
    });
    setText('');
  };

  return createPortal(
    <>
      <button
        type="button"
        aria-label="关闭 Ask AI"
        className={cn(
          'fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setOpen(false)}
      />

      <aside
        className={cn(
          // 只用 fixed：勿再加 relative，否则 Tailwind 层叠可能覆盖 position
          'fixed z-40 flex flex-col overflow-hidden rounded-2xl border bg-background text-foreground shadow-xl',
          !resizing && open && 'animate-in fade-in slide-in-from-bottom-2 duration-200',
          !resizing && !open && 'animate-out fade-out slide-out-to-bottom-2 duration-150',
          resizing && 'transition-none',
        )}
        style={
          {
            position: 'fixed',
            right: 16,
            bottom: 80,
            left: 'auto',
            top: 'auto',
            width: size.width,
            height: size.height,
            maxWidth: 'calc(100vw - 2rem)',
            maxHeight: 'calc(100dvh - 6rem)',
          } satisfies CSSProperties
        }
        onAnimationEnd={() => {
          if (!open) flushSync(() => setActualOpen(false));
        }}
      >
        {/* 锚定右下角：左侧 / 顶部 / 左上角可拖拽调节大小 */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="调节面板宽度"
          className="absolute inset-y-3 left-0 z-20 w-1.5 cursor-ew-resize touch-none"
          onPointerDown={(event) => startResize('w', event)}
        />
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="调节面板高度"
          className="absolute inset-x-3 top-0 z-20 h-1.5 cursor-ns-resize touch-none"
          onPointerDown={(event) => startResize('n', event)}
        />
        <div
          role="separator"
          aria-label="调节面板大小"
          className="absolute top-0 left-0 z-30 size-4 cursor-nwse-resize touch-none"
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
          <ConversationContent className="gap-4">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageCircleIcon className="size-8" />}
                title="询问 OS4 设计规范"
                description="例如：抽屉圆角是多少？按钮有哪些类型？"
              />
            ) : (
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    <MessageParts message={message} />
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

        <div className="border-t p-3">
          <PromptInput onSubmit={handleSubmit} className="rounded-xl border">
            <PromptInputBody>
              <PromptInputTextarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="询问 OS4 设计规范…"
                className="min-h-12"
              />
            </PromptInputBody>
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                status={chat.status}
                disabled={!text.trim() && chat.status === 'ready'}
                onStop={() => chat.stop()}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </aside>
    </>,
    document.body,
  );
}
