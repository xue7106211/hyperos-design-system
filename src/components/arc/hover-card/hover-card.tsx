"use client";

import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { FocusEvent, HTMLAttributes, PointerEvent, ReactElement, ReactNode } from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { AnimatePresence, animate, motion, useMotionValue, usePresence, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./hover-card.module.css";

const OPEN_DELAY = 500;
const CLOSE_DELAY = 140;
/** Moving to another trigger within this window opens its card almost at once. */
const SKIP_WINDOW = 300;
/** Even warm, a trigger waits this long, so a pointer crossing it on the way into an open card does not steal the card. */
const INTENT = 80;
/** 本地改动：卡片放在 alignTo 祖先右外侧时的间距、最小 / 最大宽度 */
const BESIDE_GAP = 24;
const BESIDE_MIN = 260;
const BESIDE_MAX = 336;
/** How far the card starts toward its trigger, in px. */
const TRAVEL = 4;
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];

type Snapshot = { id: string | null; instant: boolean };
const IDLE: Snapshot = { id: null, instant: false };
let snapshot = IDLE;
let closedAt = -Infinity;
const listeners = new Set<() => void>();
/** One hover card is open at a time on the page. While one is open, or just after it closes, the next one opens without waiting and only fades. */
const cards = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  get: () => snapshot,
  server: () => IDLE,
  warm: () => snapshot.id !== null || performance.now() - closedAt < SKIP_WINDOW,
  open(id: string) { if (snapshot.id === id) return; snapshot = { id, instant: cards.warm() }; listeners.forEach(listener => listener()); },
  close(id: string) { if (snapshot.id !== id) return; snapshot = IDLE; closedAt = performance.now(); listeners.forEach(listener => listener()); },
};

/**
 * A rich preview of a person or link that opens after a short hover or keyboard focus, for mentions, avatars, and references where a click should stay free for navigation.
 * It waits half a second, opens almost at once when moving between triggers, stays open while the pointer travels into it, and closes fast on leave or Escape.
 * On touch, a tap toggles it. Keep the content read only; anything actionable belongs behind the trigger itself.
 */
export interface HoverCardProps {
  /** The trigger, such as a mention button or a link. It must accept a ref and be focusable. */
  children: ReactElement;
  /** The preview. `HoverCardProfile` covers people; any read only content works. */
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  /** Milliseconds of hover before the first card opens. */
  openDelay?: number;
  /** Milliseconds of grace after the pointer leaves, so it can travel into the card. */
  closeDelay?: number;
  className?: string;
  /** 本地改动：触发器放在别的可点击控件里（如折叠行）时关掉点击打开，点击只交给外层控件 */
  clickToOpen?: boolean;
  /**
   * 本地改动：祖先元素的选择器。右侧放得下时，卡片出现在这个祖先的右外侧、与触发器顶部对齐；
   * 放不下（窄屏）时退回到触发器下方，左边缘对齐这个祖先。
   */
  alignTo?: string;
  /** 本地改动：祖先元素的选择器；指针进入这个祖先（如整行）就算悬停，卡片也和它的顶部对齐 */
  hoverArea?: string;
}

interface SurfaceProps extends Omit<HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> { instant: boolean; reduced: boolean }

/** Grows from the trigger edge: scale from .96 around the placed origin and a 4px offset toward the trigger on one smooth spring, with its own fade.
 *  Both retarget from where they are if the pointer comes back mid-exit, so the card turns around instead of jumping. */
const Surface = forwardRef<HTMLDivElement, SurfaceProps>(function Surface({ instant, reduced, className, style, children, ...props }, forwardedRef) {
  const [isPresent, safeToRemove] = usePresence();
  const node = useRef<HTMLDivElement | null>(null);
  const progress = useMotionValue(0);
  const x = useMotionValue(0), y = useMotionValue(0), scale = useMotionValue(1), opacity = useMotionValue(0);
  // Decided when the card mounts: a card revived mid-exit keeps the path it came in on, even though the page is now warm.
  const [still] = useState(() => instant || reduced);
  const setRef = useCallback((element: HTMLDivElement | null) => {
    node.current = element;
    if (typeof forwardedRef === "function") forwardedRef(element); else if (forwardedRef) forwardedRef.current = element;
  }, [forwardedRef]);

  useEffect(() => {
    let cancelled = false;
    // The side is read from the placed card every frame, so a card that flips above its trigger still grows from the trigger edge.
    const apply = (value: number) => {
      const side = node.current?.dataset.side;
      const travel = still ? 0 : (1 - value) * TRAVEL;
      x.set(side === "left" ? travel : side === "right" ? -travel : 0);
      y.set(side === "top" ? travel : side === "bottom" ? -travel : 0);
      scale.set(still ? 1 : .96 + .04 * value);
    };
    const unsubscribe = progress.on("change", apply);
    apply(progress.get());
    const controls = isPresent
      ? animate(progress, 1, still ? { duration: .14, ease: enter } : motionTokens.spring.smooth)
      : animate(progress, 0, { duration: .12, ease: standard });
    // The fade leads the grow on the way in and runs alongside it on the way out; it starts from the current opacity either way.
    const fade = isPresent
      ? animate(opacity, 1, { duration: reduced ? .15 : still ? .09 : .16, ease: enter })
      : animate(opacity, 0, { duration: reduced ? .1 : .12, ease: standard });
    if (!isPresent) fade.then(() => { if (!cancelled) safeToRemove?.(); });
    return () => { cancelled = true; unsubscribe(); controls.stop(); fade.stop(); };
  }, [isPresent, still, reduced, progress, x, y, scale, opacity, safeToRemove]);

  return <motion.div {...props} ref={setRef} className={["arc-layer", styles.card, className].filter(Boolean).join(" ")} style={{ ...style, x, y, scale, opacity }}>
    {children}
  </motion.div>;
});

export function HoverCard({ children, content, side = "bottom", align = "start", openDelay = OPEN_DELAY, closeDelay = CLOSE_DELAY, className, clickToOpen = true, alignTo, hoverArea }: HoverCardProps) {
  const id = useId();
  const cardId = `${id}-card`;
  const state = useSyncExternalStore(cards.subscribe, cards.get, cards.server);
  const open = state.id === id;
  const reduced = useReducedMotion() ?? false;
  const triggerRef = useRef<HTMLDivElement>(null);
  const timers = useRef({ open: 0, close: 0 });
  const inside = useRef({ trigger: false, card: false, focus: false });
  /** Set by Escape, so a pointer resting on the trigger does not reopen what was just dismissed. */
  const dismissed = useRef(false);
  const pointerType = useRef("");
  type Placement = { beside: boolean; sideOffset: number; alignOffset: number; width?: number };
  const [placement, setPlacement] = useState<Placement>({ beside: false, sideOffset: 8, alignOffset: 0 });
  useLayoutEffect(() => {
    if (!open || !alignTo) return;
    const trigger = triggerRef.current;
    const box = trigger?.closest(alignTo);
    if (!trigger || !box) return;
    const t = trigger.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    const row = hoverArea ? trigger.closest(hoverArea)?.getBoundingClientRect() : undefined;
    const room = window.innerWidth - b.right - BESIDE_GAP - 12;
    if (room >= BESIDE_MIN) {
      setPlacement({ beside: true, sideOffset: b.right - t.right + BESIDE_GAP, alignOffset: row ? row.top - t.top : 0, width: Math.min(BESIDE_MAX, room) });
    } else {
      setPlacement({ beside: false, sideOffset: 8 + (row ? row.bottom - t.bottom : 0), alignOffset: b.left - t.left });
    }
  }, [open, alignTo, hoverArea]);
  // 卡片在列表外侧时离触发器较远，给指针多一点时间移过去
  const effectiveCloseDelay = placement.beside ? Math.max(closeDelay, 400) : closeDelay;

  useEffect(() => {
    const pending = timers.current;
    return () => { window.clearTimeout(pending.open); window.clearTimeout(pending.close); cards.close(id); };
  }, [id]);

  const clearTimers = () => { window.clearTimeout(timers.current.open); window.clearTimeout(timers.current.close); };
  const show = () => { clearTimers(); dismissed.current = false; cards.open(id); };
  const hide = () => { clearTimers(); cards.close(id); };
  const scheduleOpen = () => {
    window.clearTimeout(timers.current.close);
    if (dismissed.current || cards.get().id === id) return;
    window.clearTimeout(timers.current.open);
    timers.current.open = window.setTimeout(() => cards.open(id), cards.warm() ? INTENT : openDelay);
  };
  const scheduleClose = () => {
    window.clearTimeout(timers.current.open);
    const { trigger, card, focus } = inside.current;
    if (trigger || card || focus) return;
    window.clearTimeout(timers.current.close);
    timers.current.close = window.setTimeout(() => cards.close(id), effectiveCloseDelay);
  };
  const mouse = (event: PointerEvent) => event.pointerType !== "touch";

  // 整行做热区：监听 hoverArea 祖先的进出，代替触发器自身的进出
  const handlers = useRef({ scheduleOpen, scheduleClose });
  handlers.current = { scheduleOpen, scheduleClose };
  useEffect(() => {
    if (!hoverArea) return;
    const area = triggerRef.current?.closest(hoverArea);
    if (!(area instanceof HTMLElement)) return;
    const enter = (event: globalThis.PointerEvent) => { if (event.pointerType === "touch") return; inside.current.trigger = true; handlers.current.scheduleOpen(); };
    const leave = (event: globalThis.PointerEvent) => { if (event.pointerType === "touch") return; inside.current.trigger = false; dismissed.current = false; handlers.current.scheduleClose(); };
    area.addEventListener("pointerenter", enter);
    area.addEventListener("pointerleave", leave);
    return () => { area.removeEventListener("pointerenter", enter); area.removeEventListener("pointerleave", leave); };
  }, [hoverArea]);

  return <PopoverPrimitive.Root open={open} onOpenChange={next => { if (!next) hide(); }}>
    <PopoverPrimitive.Anchor asChild ref={triggerRef} aria-describedby={open ? cardId : undefined} data-hover-card={open ? "open" : "closed"}
      onPointerEnter={(event: PointerEvent) => { if (hoverArea || !mouse(event)) return; inside.current.trigger = true; scheduleOpen(); }}
      onPointerLeave={(event: PointerEvent) => { if (hoverArea || !mouse(event)) return; inside.current.trigger = false; dismissed.current = false; scheduleClose(); }}
      onPointerDown={(event: PointerEvent) => { pointerType.current = event.pointerType; }}
      onClick={() => {
        if (!clickToOpen) return;
        // A tap toggles the card on touch; a click or Enter opens it without the wait.
        const isOpen = cards.get().id === id;
        if (pointerType.current === "touch") { if (isOpen) hide(); else show(); } else if (!isOpen) show();
        pointerType.current = "";
      }}
      onFocus={(event: FocusEvent<HTMLElement>) => { if (!event.currentTarget.matches(":focus-visible")) return; inside.current.focus = true; show(); }}
      onBlur={() => { inside.current.focus = false; dismissed.current = false; scheduleClose(); }}>
      {children}
    </PopoverPrimitive.Anchor>
    <AnimatePresence>
      {open && <PopoverPrimitive.Portal forceMount key="card">
        <PopoverPrimitive.Content forceMount asChild id={cardId} role="tooltip" side={placement.beside ? "right" : side} align={placement.beside ? "start" : align} alignOffset={alignTo ? placement.alignOffset : 0} sideOffset={alignTo ? placement.sideOffset : 8} collisionPadding={12}
          style={placement.beside && placement.width ? { width: placement.width } : undefined}
          onOpenAutoFocus={event => event.preventDefault()} onCloseAutoFocus={event => event.preventDefault()}
          onEscapeKeyDown={() => { dismissed.current = true; }}
          onInteractOutside={event => { if (triggerRef.current?.contains(event.target as Node)) event.preventDefault(); }}
          onPointerEnter={(event: PointerEvent) => { if (!mouse(event)) return; inside.current.card = true; window.clearTimeout(timers.current.close); }}
          onPointerLeave={(event: PointerEvent) => { if (!mouse(event)) return; inside.current.card = false; scheduleClose(); }}>
          <Surface instant={state.instant} reduced={reduced} className={className}>{content}</Surface>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>}
    </AnimatePresence>
  </PopoverPrimitive.Root>;
}

export default HoverCard;
