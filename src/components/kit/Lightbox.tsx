import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { ChevronLeft, ChevronRight, Download, X, ZoomIn, ZoomOut } from 'lucide-react';
import { duration, easing, useShouldReduceMotion } from '../../lib/motion';
import { cx, useFocusTrap, useOverlayLayer } from './utils';

/* ── Lightbox: images (or any preview) full screen, with arrows, zoom, thumbnails and download ── */

export interface LightboxItem {
  /** Image address. Leave out and pass `content` for non-image previews. */
  src?: string;
  /** Describes the image for screen readers. */
  alt: string;
  title?: string;
  caption?: ReactNode;
  /** Anything else to preview (a PDF frame, a video, a file card). */
  content?: ReactNode;
  /** Adds a download button. */
  downloadUrl?: string;
}

export interface LightboxProps {
  items: LightboxItem[];
  open: boolean;
  onClose: () => void;
  index?: number;
  onIndexChange?: (i: number) => void;
  /** Thumbnail strip along the bottom (images only). */
  thumbnails?: boolean;
}

export function Lightbox(props: LightboxProps) {
  return createPortal(<AnimatePresence>{props.open && props.items.length > 0 && <Viewer {...props} />}</AnimatePresence>, document.body);
}

function Viewer({ items, onClose, index: controlled, onIndexChange, thumbnails = true }: LightboxProps) {
  const [own, setOwn] = useState(controlled ?? 0);
  const index = Math.min(controlled ?? own, items.length - 1);
  const [dir, setDir] = useState(0);
  const [zoom, setZoom] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const reduce = useShouldReduceMotion();
  const it = items[index];
  useOverlayLayer(true, onClose);
  useFocusTrap(panel, true, '.lb-close');

  const go = (d: number) => {
    const next = (index + d + items.length) % items.length;
    setDir(d);
    setZoom(false);
    if (controlled === undefined) setOwn(next);
    onIndexChange?.(next);
  };
  const jump = (i: number) => go(i - index);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const rtl = document.documentElement.dir === 'rtl';
      if (e.key === 'ArrowRight') go(rtl ? -1 : 1);
      else if (e.key === 'ArrowLeft') go(rtl ? 1 : -1);
      else if (e.key === '+' || e.key === '=') setZoom(true);
      else if (e.key === '-') setZoom(false);
      else return;
      e.preventDefault();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  // Swipe on touch screens.
  const touch = useRef<number | null>(null);
  const slide = reduce ? 0 : 40;

  return (
    <m.div
      className="lb"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: duration.fast } }}
      exit={{ opacity: 0, transition: { duration: duration.fast } }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        className="lb-panel"
        role="dialog"
        aria-modal="true"
        aria-label={it.title ?? it.alt}
        aria-roledescription="image viewer"
      >
        <div className="lb-bar">
          <span className="lb-count" aria-live="polite">
            {index + 1} / {items.length}
            {it.title && <b>{it.title}</b>}
          </span>
          <span className="lb-actions">
            {it.src && (
              <button
                type="button"
                className="lb-btn"
                onClick={() => setZoom(!zoom)}
                aria-pressed={zoom}
                aria-label={zoom ? 'Zoom out' : 'Zoom in'}
              >
                {zoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              </button>
            )}
            {it.downloadUrl && (
              <a className="lb-btn" href={it.downloadUrl} download aria-label="Download">
                <Download size={18} />
              </a>
            )}
            <button type="button" className="lb-btn lb-close" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </span>
        </div>
        <div
          className="lb-stage"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current == null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            touch.current = null;
            if (Math.abs(dx) > 50 && !zoom) go(dx < 0 ? 1 : -1);
          }}
        >
          {items.length > 1 && (
            <button type="button" className="lb-btn lb-nav is-prev" onClick={() => go(-1)} aria-label="Previous">
              <ChevronLeft size={24} className="flip-rtl" />
            </button>
          )}
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <m.figure
              key={index}
              className={cx('lb-figure', zoom && 'is-zoomed')}
              custom={dir}
              initial={{ opacity: 0, x: dir * slide }}
              animate={{ opacity: 1, x: 0, transition: { duration: duration.base, ease: easing.enter } }}
              exit={{ opacity: 0, x: -dir * slide, transition: { duration: duration.fast } }}
            >
              {it.src ? (
                <img src={it.src} alt={it.alt} draggable={false} onClick={() => setZoom(!zoom)} />
              ) : (
                <div className="lb-content">{it.content}</div>
              )}
              {it.caption && <figcaption>{it.caption}</figcaption>}
            </m.figure>
          </AnimatePresence>
          {items.length > 1 && (
            <button type="button" className="lb-btn lb-nav is-next" onClick={() => go(1)} aria-label="Next">
              <ChevronRight size={24} className="flip-rtl" />
            </button>
          )}
        </div>
        {thumbnails && items.length > 1 && (
          <div className="lb-thumbs" role="group" aria-label="All images">
            {items.map((x, i) => (
              <button
                key={i}
                type="button"
                className={cx('lb-thumb', i === index && 'is-on')}
                aria-label={x.title ?? x.alt}
                aria-current={i === index || undefined}
                onClick={() => jump(i)}
              >
                {x.src ? <img src={x.src} alt="" /> : <span>{i + 1}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </m.div>
  );
}
