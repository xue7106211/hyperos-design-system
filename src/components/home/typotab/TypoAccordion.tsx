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
  value?: number | null;
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
      <div className={cn(className)}>{children}</div>
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
      <div className={cn('typo-faq-item', className)}>{children}</div>
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
      className={cn('typo-faq-trigger', className)}
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

/** Billow FAQ chip: 28² / 6px radius / #DBF3FF / #007FFF plus → rotate 45° open */
function TypoAccordionIndicator({ className }: IndicatorProps) {
  const { value } = useAccordion();
  const index = useAccordionItem();
  const isOpen = value === index;
  const reduce = useReducedMotion();

  return (
    <motion.span
      aria-hidden
      data-state={isOpen ? 'open' : 'closed'}
      className={cn('typo-faq-chip', className)}
      animate={{ rotate: isOpen ? 45 : 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : { type: 'spring', stiffness: 380, damping: 24 }
      }
    >
      <svg
        className="typo-faq-chip__icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
      >
        <path
          d="M12 6v12M6 12h12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
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
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={cn('typo-faq-content', className)}
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
