import { type ReactNode, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cx } from './utils';
import { Button, type ButtonSize, type ButtonVariant } from './Button';
import { IconButton } from './IconButton';

/* ── Copy button ── */

export interface CopyButtonProps {
  value: string;
  /** Visible text; omit for an icon-only button. */
  children?: ReactNode;
  label?: string;
  copiedLabel?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  onCopied?: () => void;
}

export function CopyButton({
  value,
  children,
  label = 'Copy',
  copiedLabel = 'Copied',
  size = 'sm',
  variant = 'secondary',
  onCopied,
}: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'done' | 'fail'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('done');
      onCopied?.();
    } catch {
      setState('fail');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 1600);
  };
  const icon = state === 'done' ? <Check size={15} /> : <Copy size={15} />;
  const text = state === 'done' ? copiedLabel : state === 'fail' ? 'Press Ctrl+C' : label;
  return (
    <>
      {children == null ? (
        <IconButton
          label={text}
          icon={icon}
          size={size}
          variant={variant === 'secondary' ? 'ghost' : variant}
          onClick={copy}
          className={cx(state === 'done' && 'is-copied')}
        />
      ) : (
        <Button size={size} variant={variant} iconStart={icon} onClick={copy} className={cx(state === 'done' && 'is-copied')}>
          {state === 'idle' ? children : text}
        </Button>
      )}
      <span className="sr-only" aria-live="polite">
        {state === 'done' ? copiedLabel : ''}
      </span>
    </>
  );
}
