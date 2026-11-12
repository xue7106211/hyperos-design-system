"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Variants } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./accordion.module.css";

export interface AccordionItem {
  /** 稳定 key；省略时用 index */
  id?: string;
  title: ReactNode;
  /** 标题右侧的次要信息（计数等），与标题同在触发区内 */
  meta?: ReactNode;
  content: ReactNode;
}
export interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number;
  /** 受控模式：当前展开项的下标，-1 表示全部收起（本地扩展） */
  value?: number;
  onValueChange?: (index: number) => void;
  /** 本地扩展：程序或键盘触发的展开不播放动画（键盘逐条浏览、跳转定位） */
  instant?: boolean;
  /** "lg" suits page-level FAQs: questions at the large text size, answers at body size. */
  size?: "md" | "lg";
  className?: string;
}

/** Height follows the content on a spring that never overshoots; closed panels leave the accessibility tree once they finish collapsing. */
const panelOpen: TargetAndTransition = { height: "auto", opacity: 1, visibility: "visible" };
const panelClosed: TargetAndTransition = { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" } };
/** The answer settles down into place with a brief focus pull as the panel opens. */
const contentOpen: TargetAndTransition = { y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } };
const contentClosed: TargetAndTransition = { y: -6, filter: `blur(${motionTokens.blur.subtle}px)` };
const panelMotion: Variants = {
  open: { ...panelOpen, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } } },
  closed: { ...panelClosed, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } } },
};
const contentMotion: Variants = {
  open: { ...contentOpen, transition: { y: motionTokens.spring.smooth, filter: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } } },
  closed: { ...contentClosed, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } },
};
/** Reduced motion: same end states in one step, so server and client render identical styles. */
const panelStill: Variants = { open: { ...panelOpen, transition: { duration: 0 } }, closed: { ...panelClosed, transition: { duration: 0 } } };
const contentStill: Variants = { open: { ...contentOpen, transition: { duration: 0 } }, closed: { ...contentClosed, transition: { duration: 0 } } };

export function Accordion({ items, defaultOpen = 0, value, onValueChange, instant = false, size = "md", className }: AccordionProps) {
  const initialValue = defaultOpen >= 0 && defaultOpen < items.length ? String(defaultOpen) : "";
  const [innerValue, setInnerValue] = useState(initialValue);
  const controlled = value !== undefined;
  const openValue = controlled ? (value >= 0 ? String(value) : "") : innerValue;
  const setOpenValue = (next: string) => {
    if (!controlled) setInnerValue(next);
    onValueChange?.(next === "" ? -1 : Number(next));
  };
  const reduced = useReducedMotion() || instant;
  return <AccordionPrimitive.Root className={[styles.accordion, size === "lg" ? styles.lg : "", className].filter(Boolean).join(" ")} type="single" collapsible value={openValue} onValueChange={setOpenValue}>
    {items.map((item, index) => { const open = openValue === String(index); return <AccordionPrimitive.Item className={styles.item} value={String(index)} key={item.id ?? index}>
      <AccordionPrimitive.Header className={styles.header}>
        <AccordionPrimitive.Trigger className={styles.trigger}>
          <span className={styles.title}>{item.title}</span>{item.meta ? <span className={styles.meta}>{item.meta}</span> : null}<motion.span className={styles.icon} initial={false} animate={{ rotate: open ? 180 : 0 }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}><ChevronDown width={17} height={17} aria-hidden="true" /></motion.span>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      {/* Radix keeps semantics and ids; motion owns the height so a toggle mid-flight retargets instead of restarting. */}
      <AccordionPrimitive.Content forceMount asChild>
        <motion.div className={styles.panel} initial={false} animate={open ? "open" : "closed"} variants={reduced ? panelStill : panelMotion}>
          <motion.div className={styles.panelInner} variants={reduced ? contentStill : contentMotion}>{item.content}</motion.div>
        </motion.div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>; })}
  </AccordionPrimitive.Root>;
}

export default Accordion;
