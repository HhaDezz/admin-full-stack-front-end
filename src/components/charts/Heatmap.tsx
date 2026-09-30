import { useState, type CSSProperties, type ReactNode } from 'react';
import { plainNumber } from './shared';
import { cx } from '../kit/utils';

/* ── Heatmap: a grid where darker means more (busy hours, activity by day, cohorts) ── */

export interface HeatmapProps {
  /** Row names, top to bottom. */
  rows: string[];
  /** Column names, left to right. */
  columns: string[];
  /** values[row][column]; null for no data. */
  values: (number | null)[][];
  'aria-label': string;
  valueFormat?: (n: number) => string;
  /** Show only every nth column label (for long ranges like 24 hours). */
  columnLabelEvery?: number;
  /** Cell height in px; cells share the width. */
  cellHeight?: number;
  /** Text of the scale under the grid. */
  scaleLabels?: [ReactNode, ReactNode];
  className?: string;
}

export function Heatmap({
  rows,
  columns,
  values,
  'aria-label': label,
  valueFormat = plainNumber,
  columnLabelEvery = 1,
  cellHeight = 28,
  scaleLabels = ['Less', 'More'],
  className,
}: HeatmapProps) {
  const flat = values.flat().filter((v): v is number => v != null);
  const min = Math.min(...flat, 0);
  const max = Math.max(...flat, 1);
  const [tip, setTip] = useState<{ r: number; c: number; x: number; y: number } | null>(null);
  // One hue, light to dark: mix the scale colour into the surface.
  const fill = (v: number | null): CSSProperties =>
    v == null
      ? { background: 'var(--surface-2)' }
      : { background: `color-mix(in oklab, var(--chart-seq) ${Math.round(8 + ((v - min) / (max - min || 1)) * 92)}%, var(--surface))` };

  return (
    <figure className={cx('heatmap', className)} aria-label={label}>
      <div className="heatmap-scroll" tabIndex={0} role="group" aria-label={`${label} (scrolls sideways)`}>
        <table className="heatmap-grid" style={{ '--cell-h': `${cellHeight}px` } as CSSProperties} onMouseLeave={() => setTip(null)}>
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr>
              <td />
              {columns.map((c, i) => (
                <th key={c} scope="col">
                  <span className={i % columnLabelEvery ? 'sr-only' : undefined}>{c}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={r}>
                <th scope="row">{r}</th>
                {columns.map((c, ci) => {
                  const v = values[ri]?.[ci] ?? null;
                  return (
                    <td
                      key={c}
                      onMouseEnter={(e) => {
                        const box = e.currentTarget.getBoundingClientRect();
                        const host = e.currentTarget.closest('.heatmap')!.getBoundingClientRect();
                        setTip({ r: ri, c: ci, x: box.left - host.left + box.width / 2, y: box.top - host.top });
                      }}
                    >
                      <span className={cx('heatmap-cell', tip?.r === ri && tip.c === ci && 'is-active')} style={fill(v)} />
                      <span className="sr-only">{v == null ? 'No data' : valueFormat(v)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tip && (
        <div className="chart-tip heatmap-tip" style={{ left: tip.x, top: tip.y }} aria-hidden="true">
          <div className="chart-tip-label">
            {rows[tip.r]} · {columns[tip.c]}
          </div>
          <div className="chart-tip-row">
            <b>{values[tip.r]?.[tip.c] == null ? 'No data' : valueFormat(values[tip.r][tip.c] as number)}</b>
          </div>
        </div>
      )}
      <div className="heatmap-scale" aria-hidden="true">
        <span>{scaleLabels[0]}</span>
        {[0, 0.25, 0.5, 0.75, 1].map((s) => (
          <i key={s} style={fill(min + s * (max - min))} />
        ))}
        <span>{scaleLabels[1]}</span>
      </div>
    </figure>
  );
}
