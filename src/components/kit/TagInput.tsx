import { useRef, useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { useControlProps } from './_form';
import { cx, useControllable } from './utils';

/* ── TagInput: type and press Enter or comma; paste a list to add many ── */

export interface TagInputProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  /** Up to this many tags. */
  max?: number;
  /** Return an error message to refuse a tag (e.g. not an email). */
  validate?: (tag: string) => string | null | undefined;
  /** Characters that finish a tag, besides Enter. Default: comma and semicolon. */
  separators?: string[];
  /** Keep letter case as typed (default) or lower-case everything. */
  lowercase?: boolean;
  allowDuplicates?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  size?: 'sm' | 'md';
  id?: string;
  name?: string;
  'aria-label'?: string;
  onBlur?: () => void;
}

export function TagInput({
  value,
  defaultValue = [],
  onChange,
  placeholder = 'Add…',
  max,
  validate,
  separators = [',', ';'],
  lowercase,
  allowDuplicates,
  disabled,
  invalid,
  size = 'md',
  id,
  name,
  'aria-label': label,
  onBlur,
}: TagInputProps) {
  const c = useControlProps({ id, disabled, invalid });
  const [tags, setTags] = useControllable(value, defaultValue, onChange);
  const [text, setText] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const full = max != null && tags.length >= max;

  const add = (raw: string) => {
    const parts = raw
      .split(new RegExp(`[${separators.map((s) => '\\' + s).join('')}\\n]`))
      .map((p) => (lowercase ? p.trim().toLowerCase() : p.trim()))
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...tags];
    let err: string | null = null;
    for (const p of parts) {
      if (max != null && next.length >= max) {
        err = `Up to ${max} allowed.`;
        break;
      }
      if (!allowDuplicates && next.some((t) => t.toLowerCase() === p.toLowerCase())) {
        err = `“${p}” is already added.`;
        continue;
      }
      const v = validate?.(p);
      if (v) {
        err = v;
        continue;
      }
      next.push(p);
    }
    setProblem(err);
    if (next.length !== tags.length) setTags(next);
    setText(err && parts.length === 1 ? raw.trim() : '');
  };

  const remove = (i: number) => {
    setTags(tags.filter((_, k) => k !== i));
    setProblem(null);
    input.current?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || separators.includes(e.key)) {
      if (text.trim()) {
        e.preventDefault();
        add(text);
      } else if (e.key !== 'Enter') e.preventDefault();
    } else if (e.key === 'Backspace' && !text && tags.length) {
      e.preventDefault();
      remove(tags.length - 1);
    }
  };

  return (
    <div className="tag-input-wrap">
      <div
        className={cx(
          'control',
          'tag-input',
          `control-${size === 'sm' ? 'sm' : 'md'}`,
          c.invalid && 'is-invalid',
          c.disabled && 'is-disabled',
        )}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            input.current?.focus();
          }
        }}
      >
        <ul className="tag-input-list" aria-label={label ? `${label}: ${tags.length} added` : `${tags.length} added`}>
          {tags.map((t, i) => (
            <li key={`${t}-${i}`} className="tag tag-neutral">
              <span className="tag-main">
                <span>{t}</span>
              </span>
              {!c.disabled && (
                <button type="button" className="tag-x" aria-label={`Remove ${t}`} onClick={() => remove(i)}>
                  <X size={12} />
                </button>
              )}
            </li>
          ))}
        </ul>
        <input
          ref={input}
          id={c.id}
          className="control-input tag-input-field"
          value={text}
          placeholder={full ? '' : placeholder}
          disabled={c.disabled || full}
          aria-label={label}
          aria-invalid={c['aria-invalid'] || !!problem || undefined}
          aria-describedby={[c['aria-describedby'], problem ? `${c.id ?? name}-tag-err` : null].filter(Boolean).join(' ') || undefined}
          onChange={(e) => {
            setText(e.target.value);
            if (problem) setProblem(null);
          }}
          onKeyDown={onKey}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text');
            if (/[,;\n]/.test(pasted)) {
              e.preventDefault();
              add(text + pasted);
            }
          }}
          onBlur={() => {
            if (text.trim()) add(text);
            onBlur?.();
          }}
        />
      </div>
      {problem && (
        <div className="tag-input-problem" id={`${c.id ?? name}-tag-err`} role="alert">
          {problem}
        </div>
      )}
      {max != null && (
        <div className="tag-input-count" aria-hidden="true">
          {tags.length} / {max}
        </div>
      )}
      {name && tags.map((t, i) => <input key={i} type="hidden" name={name} value={t} />)}
    </div>
  );
}
