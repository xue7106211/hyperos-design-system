'use client';

import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { EasterEggPanel } from './EasterEggPanel';
import { recordRapidClick } from './rapid-click';

function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export function EasterEggProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const disabled = isAdminPath(pathname);
  const [open, setOpen] = useState(false);
  const timestampsRef = useRef<number[]>([]);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (disabled || open) return;

    const onClick = () => {
      const result = recordRapidClick(timestampsRef.current, Date.now());
      timestampsRef.current = result.timestamps;
      if (result.shouldOpen) {
        setOpen(true);
      }
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
    };
  }, [disabled, open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      {children}
      {!disabled ? <EasterEggPanel open={open} onClose={close} /> : null}
    </>
  );
}
