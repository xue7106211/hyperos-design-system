'use client';

import {
  createContext,
  useContext,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';

type AccordionContextValue = {
  value: number | null;
  setValue: (next: number | null) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<number | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error('TypoAccordion parts must be used within TypoAccordion');
  }
  return ctx;
}

function useAccordionItem() {
  const index = useContext(AccordionItemContext);
  if (index === null) {
    throw new Error('TypoAccordion.Item parts must be used within Item');
  }
  return index;
}

type AccordionProps = {
  children: ReactNode;
  className?: string;
  /** Controlled open index (`null` = all closed). */
  value?: number | null;
  /** Uncontrolled initial open index. */
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
};

function TypoAccordionRoot({
  children,
  className,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
}: AccordionProps) {
  const [internal, setInternal] = useState<number | null>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internal;

  const setValue = (next: number | null) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <AccordionContext.Provider value={{ value, setValue }}>
      <div className={cn('w-full', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

type ItemProps = {
  children: ReactNode;
  value: number;
  className?: string;
};

function TypoAccordionItem({ children, value, className }: ItemProps) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div
        className={cn('border-b border-[var(--typo-divider)]', className)}
        style={{ borderBottomWidth: 'var(--typo-border-hairline)' }}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

type TriggerProps = ComponentPropsWithoutRef<'button'> & {
  children: ReactNode;
};

function TypoAccordionTrigger({
  children,
  className,
  type = 'button',
  onClick,
  ...props
}: TriggerProps) {
  const { value, setValue } = useAccordion();
  const index = useAccordionItem();
  const isOpen = value === index;

  return (
    <button
      type={type}
      aria-expanded={isOpen}
      data-state={isOpen ? 'open' : 'closed'}
      className={cn(
        'flex w-full min-h-11 cursor-pointer items-center justify-between gap-6 py-6 text-left',
        className,
      )}
      onClick={(e) => {
        setValue(isOpen ? null : index);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

type IndicatorProps = {
  className?: string;
};

/** Rotating “+” — open state comes from accordion context. */
function TypoAccordionIndicator({ className }: IndicatorProps) {
  const { value } = useAccordion();
  const index = useAccordionItem();
  const isOpen = value === index;
  const reduce = useReducedMotion();

  return (
    <motion.span
      aria-hidden
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center text-[28px] leading-none text-[#262626] before:absolute before:-inset-3 before:content-['']",
        className,
      )}
      animate={{ rotate: isOpen ? 45 : 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : { type: 'spring', stiffness: 320, damping: 22 }
      }
    >
      +
    </motion.span>
  );
}

type ContentProps = {
  children: ReactNode;
  className?: string;
};

function TypoAccordionContent({ children, className }: ContentProps) {
  const { value } = useAccordion();
  const index = useAccordionItem();
  const isOpen = value === index;
  const reduce = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          key="content"
          initial={reduce ? false : { height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={reduce ? undefined : { height: 0, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className={cn('overflow-hidden', className)}
          data-state="open"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export const TypoAccordion = Object.assign(TypoAccordionRoot, {
  Item: TypoAccordionItem,
  Trigger: TypoAccordionTrigger,
  Indicator: TypoAccordionIndicator,
  Content: TypoAccordionContent,
});
