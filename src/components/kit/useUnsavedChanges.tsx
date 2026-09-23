import { useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';
import { ConfirmDialog } from './ConfirmDialog';

type Navigator = { push: (...args: unknown[]) => void; replace: (...args: unknown[]) => void };

/**
 * Asks before leaving a page with unsaved changes: in-app navigation (links, navigate())
 * shows a confirm dialog, and closing or reloading the tab shows the browser's own prompt.
 * Render the returned element anywhere in the page.
 */
export function useUnsavedChanges(when: boolean, message = 'You have unsaved changes. Leave this page and lose them?'): ReactNode {
  const nav = useContext(UNSAFE_NavigationContext)?.navigator as unknown as Navigator | undefined;
  const [pending, setPending] = useState<(() => void) | null>(null);
  const bypass = useRef(false);

  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [when]);

  useEffect(() => {
    if (!when || !nav) return;
    const push = nav.push;
    const replace = nav.replace;
    const wrap =
      (fn: (...a: unknown[]) => void) =>
      (...args: unknown[]) => {
        if (bypass.current) return fn.apply(nav, args);
        setPending(() => () => fn.apply(nav, args));
      };
    nav.push = wrap(push);
    nav.replace = wrap(replace);
    return () => {
      nav.push = push;
      nav.replace = replace;
    };
  }, [when, nav]);

  const leave = useCallback(() => {
    const go = pending;
    setPending(null);
    bypass.current = true;
    go?.();
    bypass.current = false;
  }, [pending]);

  return (
    <ConfirmDialog
      open={!!pending}
      title="Leave without saving?"
      message={message}
      confirmLabel="Leave page"
      cancelLabel="Stay"
      tone="danger"
      onConfirm={leave}
      onClose={() => setPending(null)}
    />
  );
}
