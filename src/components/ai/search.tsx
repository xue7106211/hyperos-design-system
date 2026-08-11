'use client';

import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type SyntheticEvent,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { usePathname } from 'next/navigation';
import {
  Loader2,
  MessageCircleIcon,
  RefreshCw,
  SearchIcon,
  Send,
  X,
} from 'lucide-react';
import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  type Tool,
  type UIToolInvocation,
} from 'ai';
import { cn } from '@/lib/cn';
import type { ChatUIMessage } from '@/lib/ai/types';
import { Markdown } from './markdown';

export type SearchTool = Tool<{ query: string; limit: number }>;

const btnIconGhost =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground';
const btnSecondary =
  'inline-flex items-center justify-center gap-1.5 rounded-full border bg-fd-secondary px-3 py-1.5 text-sm font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent disabled:pointer-events-none disabled:opacity-50';
const btnPrimary =
  'inline-flex items-center justify-center rounded-full bg-fd-primary p-2 text-fd-primary-foreground transition-all hover:opacity-90 disabled:pointer-events-none disabled:opacity-50';

function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<ChatUIMessage>;
} | null>(null);

export function AISearchPanelHeader({
  className,
  ...props
}: ComponentProps<'div'>) {
  const { setOpen } = useAISearchContext();

  return (
    <div
      className={cn(
        'sticky top-0 flex items-start gap-2 rounded-xl border bg-fd-secondary text-fd-secondary-foreground shadow-sm',
        className,
      )}
      {...props}
    >
      <div className="flex-1 px-3 py-2">
        <p className="mb-2 text-sm font-medium">Ask AI</p>
        <p className="text-xs text-fd-muted-foreground">
          回答可能不准确，请以文档为准。
        </p>
      </div>

      <button
        type="button"
        aria-label="关闭"
        tabIndex={-1}
        className={cn(btnIconGhost, 'mt-1 me-1')}
        onClick={() => setOpen(false)}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function AISearchInputActions() {
  const { messages, status, setMessages, regenerate } = useChatContext();
  const isLoading = status === 'streaming';

  if (messages.length === 0) return null;

  return (
    <>
      {!isLoading && messages.at(-1)?.role === 'assistant' && (
        <button
          type="button"
          className={btnSecondary}
          onClick={() => regenerate()}
        >
          <RefreshCw className="size-4" />
          重试
        </button>
      )}
      <button
        type="button"
        className={cn(btnSecondary, 'rounded-full')}
        onClick={() => setMessages([])}
      >
        清空对话
      </button>
    </>
  );
}

const StorageKeyInput = '__ai_search_input';

export function AISearchInput(props: ComponentProps<'form'>) {
  const { status, sendMessage, stop } = useChatContext();
  const [input, setInput] = useState(() =>
    typeof window !== 'undefined'
      ? (localStorage.getItem(StorageKeyInput) ?? '')
      : '',
  );
  const isLoading = status === 'streaming' || status === 'submitted';
  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault();
    const message = input.trim();
    if (message.length === 0) return;

    void sendMessage({
      role: 'user',
      parts: [
        {
          type: 'data-client',
          data: {
            location: location.href,
          },
        },
        {
          type: 'text',
          text: message,
        },
      ],
    });
    setInput('');
    localStorage.removeItem(StorageKeyInput);
  };

  useEffect(() => {
    if (isLoading) document.getElementById('nd-ai-input')?.focus();
  }, [isLoading]);

  return (
    <form
      {...props}
      className={cn('flex items-start pe-2', props.className)}
      onSubmit={onStart}
    >
      <Input
        value={input}
        placeholder={isLoading ? '正在回答…' : '询问 OS4 设计规范…'}
        autoFocus
        className="p-3"
        disabled={status === 'streaming' || status === 'submitted'}
        onChange={(e) => {
          setInput(e.target.value);
          localStorage.setItem(StorageKeyInput, e.target.value);
        }}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === 'Enter') {
            onStart(event);
          }
        }}
      />
      {isLoading ? (
        <button
          key="bn"
          type="button"
          className={cn(btnSecondary, 'mt-2 gap-2 transition-all')}
          onClick={stop}
        >
          <Loader2 className="size-4 animate-spin text-fd-muted-foreground" />
          停止回答
        </button>
      ) : (
        <button
          key="bn"
          type="submit"
          className={cn(btnPrimary, 'mt-2 transition-all')}
          disabled={input.length === 0}
        >
          <Send className="size-4" />
        </button>
      )}
    </form>
  );
}

function List(props: Omit<ComponentProps<'div'>, 'dir'>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    function callback() {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'instant',
      });
    }

    const observer = new ResizeObserver(callback);
    callback();

    const element = containerRef.current?.firstElementChild;

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn(
        'fd-scroll-container flex min-w-0 flex-col overflow-y-auto',
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

function Input(props: ComponentProps<'textarea'>) {
  const ref = useRef<HTMLDivElement>(null);
  const shared = cn('col-start-1 row-start-1', props.className);

  return (
    <div className="grid flex-1">
      <textarea
        id="nd-ai-input"
        {...props}
        className={cn(
          'resize-none bg-transparent placeholder:text-fd-muted-foreground focus-visible:outline-none',
          shared,
        )}
      />
      <div ref={ref} className={cn(shared, 'invisible break-all')}>
        {`${props.value?.toString() ?? ''}\n`}
      </div>
    </div>
  );
}

const roleName: Record<string, string> = {
  user: '你',
  assistant: 'HyperOS',
};

function Message({
  message,
  ...props
}: { message: ChatUIMessage } & ComponentProps<'div'>) {
  let markdown = '';
  const searchCalls: UIToolInvocation<SearchTool>[] = [];

  for (const part of message.parts ?? []) {
    if (part.type === 'text') {
      markdown += part.text;
      continue;
    }

    if (part.type.startsWith('tool-')) {
      const toolName = part.type.slice('tool-'.length);
      const p = part as UIToolInvocation<Tool>;

      if (toolName !== 'search' || !p.toolCallId) continue;
      searchCalls.push(p as UIToolInvocation<SearchTool>);
    }
  }

  return (
    <div onClick={(e) => e.stopPropagation()} {...props}>
      <p
        className={cn(
          'mb-1 text-sm font-medium text-fd-muted-foreground',
          message.role === 'assistant' && 'text-fd-primary',
        )}
      >
        {roleName[message.role] ?? 'unknown'}
      </p>
      <div className="prose text-sm">
        <Markdown text={markdown} />
      </div>

      {searchCalls.map((call) => {
        const output = call.state === 'output-available' ? call.output : undefined;
        const resultCount = Array.isArray(output) ? output.length : undefined;

        return (
          <div
            key={call.toolCallId}
            className="mt-3 flex flex-row items-center gap-2 rounded-lg border bg-fd-secondary p-2 text-xs text-fd-muted-foreground"
          >
            <SearchIcon className="size-4" />
            {call.state === 'output-error' || call.state === 'output-denied' ? (
              <p className="text-fd-error">
                {call.errorText ?? '检索失败'}
              </p>
            ) : (
              <p>
                {resultCount === undefined
                  ? '检索中…'
                  : `${resultCount} 条检索结果`}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const chat = useChat<ChatUIMessage>({
    id: 'search',
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  return (
    <Context
      value={useMemo(() => ({ chat, open, setOpen }), [chat, open])}
    >
      {children}
    </Context>
  );
}

export function AISearchTrigger({
  position = 'default',
  className,
  ...props
}: ComponentProps<'button'> & { position?: 'default' | 'float' }) {
  const pathname = usePathname();
  const { open, setOpen } = useAISearchContext();

  if (isAdminPath(pathname)) return null;

  return (
    <button
      type="button"
      data-state={open ? 'open' : 'closed'}
      className={cn(
        position === 'float' && [
          'fixed right-4 bottom-4 z-40 flex w-auto items-center gap-2 rounded-full border bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground shadow-lg transition-[translate,opacity]',
          open && 'translate-y-10 opacity-0',
        ],
        className,
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function AISearchPanel() {
  const pathname = usePathname();
  const { open, setOpen } = useAISearchContext();
  const [actualOpen, setActualOpen] = useState(open);
  useHotKey();

  useEffect(() => {
    if (open) setActualOpen(true);
  }, [open]);

  if (isAdminPath(pathname)) return null;

  return (
    <>
      {actualOpen && (
        <div
          className={cn(
            'fixed inset-0 z-30 bg-fd-overlay backdrop-blur-xs lg:hidden',
            open ? 'animate-fd-fade-in' : 'animate-fd-fade-out',
          )}
          onClick={() => setOpen(false)}
          onAnimationEnd={() => {
            if (!open) flushSync(() => setActualOpen(false));
          }}
        />
      )}
      {actualOpen && (
        <div
          className={cn(
            'fixed right-4 bottom-20 z-40 flex h-[min(80dvh,640px)] w-(--ai-chat-width) max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-fd-card text-fd-card-foreground shadow-xl [--ai-chat-width:400px] 2xl:[--ai-chat-width:460px]',
            'max-sm:inset-x-2 max-sm:inset-y-4 max-sm:right-auto max-sm:bottom-auto max-sm:h-auto max-sm:w-auto max-sm:max-w-none',
            open ? 'animate-fd-dialog-in' : 'animate-fd-dialog-out',
          )}
          onAnimationEnd={() => {
            if (!open) flushSync(() => setActualOpen(false));
          }}
        >
          <div className="flex size-full min-h-0 flex-col p-2 sm:p-3">
            <AISearchPanelHeader />
            <AISearchPanelList className="min-h-0 flex-1" />
            <div className="rounded-xl border bg-fd-secondary text-fd-secondary-foreground shadow-sm has-focus-visible:shadow-md">
              <AISearchInput />
              <div className="flex items-center gap-1.5 p-1 empty:hidden">
                <AISearchInputActions />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AISearchPanelList({
  className,
  style,
  ...props
}: ComponentProps<'div'>) {
  const chat = useChatContext();
  const messages = chat.messages.filter((msg) => msg.role !== 'system');

  return (
    <List
      className={cn('overscroll-contain py-4', className)}
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)',
        ...style,
      }}
      {...props}
    >
      {messages.length === 0 ? (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-center text-sm text-fd-muted-foreground/80">
          <MessageCircleIcon fill="currentColor" stroke="none" />
          <p onClick={(e) => e.stopPropagation()}>在下方开始提问。</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-3">
          {chat.error && (
            <div className="rounded-lg border bg-fd-secondary p-2 text-fd-secondary-foreground">
              <p className="text-sm">模型服务暂时不可用，请稍后重试</p>
              {chat.error.message ? (
                <p className="mt-1 text-xs text-fd-muted-foreground">
                  {chat.error.message}
                </p>
              ) : null}
            </div>
          )}
          {messages.map((item) => (
            <Message key={item.id} message={item} />
          ))}
        </div>
      )}
    </List>
  );
}

export function useHotKey() {
  const pathname = usePathname();
  const { open, setOpen } = useAISearchContext();

  const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (isAdminPath(pathname)) return;

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
    if (isAdminPath(pathname)) return;

    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, [pathname]);
}

export function useAISearchContext() {
  return use(Context)!;
}

function useChatContext() {
  return use(Context)!.chat;
}
