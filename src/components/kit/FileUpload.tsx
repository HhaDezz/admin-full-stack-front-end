import { useEffect, useId, useRef, useState, type DragEvent } from 'react';
import { File as FileIcon, FileImage, FileSpreadsheet, FileText, RotateCcw, UploadCloud, X } from 'lucide-react';
import { useControlProps } from './_form';
import { Progress } from './Progress';
import { cx, useControllable } from './utils';

/* ── FileUpload: drag and drop or browse, with previews, progress, retry and limits ── */

export type UploadStatus = 'queued' | 'uploading' | 'done' | 'error';

export interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  /** 0–100 while uploading. */
  progress: number;
  error?: string;
  /** Object URL for image thumbnails. */
  preview?: string;
  /** Whatever your upload function returned (e.g. the stored file's URL). */
  result?: unknown;
}

export type UploadFn = (file: File, ctx: { onProgress: (pct: number) => void; signal: AbortSignal }) => Promise<unknown>;

export interface FileUploadProps {
  value?: UploadItem[];
  defaultValue?: UploadItem[];
  onChange?: (items: UploadItem[]) => void;
  /** Like the input's accept: "image/*,.pdf". */
  accept?: string;
  /** Largest file in bytes. */
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  /** Sends one file; report progress and honour the abort signal. Leave out to only collect files. */
  upload?: UploadFn;
  /** Text under the main prompt, e.g. "PNG or JPG, up to 5 MB". */
  hint?: string;
  compact?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  'aria-label'?: string;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB'];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

function accepts(file: File, accept?: string): boolean {
  if (!accept) return true;
  return accept
    .split(',')
    .map((a) => a.trim().toLowerCase())
    .some((a) =>
      a.startsWith('.') ? file.name.toLowerCase().endsWith(a) : a.endsWith('/*') ? file.type.startsWith(a.slice(0, -1)) : file.type === a,
    );
}

function iconFor(f: File) {
  if (f.type.startsWith('image/')) return <FileImage size={20} />;
  if (/sheet|csv|excel/.test(f.type) || /\.(csv|xlsx?)$/i.test(f.name)) return <FileSpreadsheet size={20} />;
  if (/pdf|text|word|document/.test(f.type)) return <FileText size={20} />;
  return <FileIcon size={20} />;
}

let seq = 0;

export function FileUpload({
  value,
  defaultValue = [],
  onChange,
  accept,
  maxSize,
  maxFiles,
  multiple = true,
  upload,
  hint,
  compact,
  disabled,
  invalid,
  id,
  'aria-label': label = 'Upload files',
}: FileUploadProps) {
  const c = useControlProps({ id, disabled, invalid });
  const [items, setItems] = useControllable(value, defaultValue, onChange);
  const [over, setOver] = useState(false);
  const [notice, setNotice] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const latest = useRef(items);
  latest.current = items;
  const controllers = useRef(new Map<string, AbortController>());
  const hintId = useId();

  // Release thumbnails and abort uploads when unmounted.
  useEffect(
    () => () => {
      controllers.current.forEach((ctl) => ctl.abort());
      latest.current.forEach((i) => i.preview && URL.revokeObjectURL(i.preview));
    },
    [],
  );

  const patch = (itemId: string, p: Partial<UploadItem>) => {
    const next = latest.current.map((i) => (i.id === itemId ? { ...i, ...p } : i));
    latest.current = next;
    setItems(next);
  };

  const start = (item: UploadItem) => {
    if (!upload) return;
    const ctl = new AbortController();
    controllers.current.set(item.id, ctl);
    patch(item.id, { status: 'uploading', progress: 0, error: undefined });
    upload(item.file, {
      onProgress: (pct) => patch(item.id, { progress: Math.max(0, Math.min(100, Math.round(pct))) }),
      signal: ctl.signal,
    })
      .then((result) => patch(item.id, { status: 'done', progress: 100, result }))
      .catch((e: unknown) => {
        if (ctl.signal.aborted) return;
        patch(item.id, { status: 'error', error: e instanceof Error ? e.message : 'Upload failed' });
      })
      .finally(() => controllers.current.delete(item.id));
  };

  const add = (list: FileList | File[]) => {
    const files = [...list];
    if (!files.length || c.disabled) return;
    const room = maxFiles == null ? Infinity : maxFiles - latest.current.filter((i) => i.status !== 'error').length;
    const added: UploadItem[] = [];
    let refused = 0;
    for (const f of multiple ? files : files.slice(0, 1)) {
      let error: string | undefined;
      if (!accepts(f, accept)) error = 'This type of file isn’t allowed.';
      else if (maxSize != null && f.size > maxSize) error = `Larger than ${formatBytes(maxSize)}.`;
      else if (added.filter((a) => !a.error).length >= room) error = `Only ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed.`;
      if (error) refused++;
      added.push({
        id: `up-${++seq}`,
        file: f,
        status: error ? 'error' : upload ? 'queued' : 'done',
        progress: error ? 0 : upload ? 0 : 100,
        error,
        preview: !error && f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
      });
    }
    const next = multiple ? [...latest.current, ...added] : added;
    if (!multiple) latest.current.forEach((i) => i.preview && URL.revokeObjectURL(i.preview));
    latest.current = next;
    setItems(next);
    const ok = added.length - refused;
    setNotice(`${ok} file${ok === 1 ? '' : 's'} added${refused ? `, ${refused} refused` : ''}.`);
    added.filter((a) => a.status === 'queued').forEach(start);
  };

  const remove = (it: UploadItem) => {
    controllers.current.get(it.id)?.abort();
    if (it.preview) URL.revokeObjectURL(it.preview);
    const next = latest.current.filter((i) => i.id !== it.id);
    latest.current = next;
    setItems(next);
    setNotice(`${it.file.name} removed.`);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    add(e.dataTransfer.files);
  };

  const describe = [hint && hintId, c['aria-describedby']].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cx('upload', compact && 'is-compact', c.invalid && 'is-invalid', c.disabled && 'is-disabled')}>
      <div
        className={cx('upload-drop', over && 'is-over')}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!c.disabled) setOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false);
        }}
        onDrop={onDrop}
        onClick={() => !c.disabled && input.current?.click()}
      >
        <span className="upload-icon" aria-hidden="true">
          <UploadCloud size={compact ? 20 : 26} />
        </span>
        <span className="upload-text">
          <span>
            <button
              type="button"
              className="link upload-browse"
              id={c.id}
              disabled={c.disabled}
              aria-describedby={describe}
              aria-invalid={c['aria-invalid']}
              onClick={(e) => {
                e.stopPropagation();
                input.current?.click();
              }}
            >
              {multiple ? 'Choose files' : 'Choose a file'}
            </button>{' '}
            or drag {multiple ? 'them' : 'it'} here
          </span>
          {hint && (
            <span className="upload-hint" id={hintId}>
              {hint}
            </span>
          )}
        </span>
        <input
          ref={input}
          type="file"
          hidden
          accept={accept}
          multiple={multiple}
          aria-label={label}
          onChange={(e) => {
            if (e.target.files) add(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {notice}
      </p>
      {items.length > 0 && (
        <ul className="upload-list" aria-label="Files">
          {items.map((it) => (
            <li key={it.id} className={cx('upload-item', `is-${it.status}`)}>
              <span className="upload-thumb" aria-hidden="true">
                {it.preview ? <img src={it.preview} alt="" /> : iconFor(it.file)}
              </span>
              <span className="upload-meta">
                <span className="upload-name" title={it.file.name}>
                  {it.file.name}
                </span>
                <span className="upload-sub">
                  {it.status === 'error' ? (
                    <span className="upload-err">{it.error}</span>
                  ) : it.status === 'uploading' || it.status === 'queued' ? (
                    <>
                      {formatBytes(it.file.size)} · {it.progress}%
                    </>
                  ) : (
                    <>{formatBytes(it.file.size)} · Ready</>
                  )}
                </span>
                {(it.status === 'uploading' || it.status === 'queued') && (
                  <Progress value={it.progress} size="sm" aria-label={`Uploading ${it.file.name}`} />
                )}
              </span>
              <span className="upload-actions">
                {it.status === 'error' &&
                  upload &&
                  !it.error?.startsWith('Larger') &&
                  !it.error?.startsWith('This type') &&
                  !it.error?.startsWith('Only') && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon btn-sm"
                      aria-label={`Retry ${it.file.name}`}
                      onClick={() => start(it)}
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                <button
                  type="button"
                  className="btn btn-ghost btn-icon btn-sm"
                  aria-label={it.status === 'uploading' ? `Cancel ${it.file.name}` : `Remove ${it.file.name}`}
                  onClick={() => remove(it)}
                >
                  <X size={15} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** A pretend upload for demos and tests: progress over about two seconds. */
export const demoUpload: UploadFn = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    let pct = 0;
    const t = setInterval(() => {
      pct += 8 + Math.random() * 18;
      onProgress(Math.min(100, pct));
      if (pct >= 100) {
        clearInterval(t);
        if (/fail/i.test(file.name)) reject(new Error('The server refused this file.'));
        else resolve({ url: `https://files.example.com/${encodeURIComponent(file.name)}` });
      }
    }, 180);
    signal.addEventListener('abort', () => {
      clearInterval(t);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
