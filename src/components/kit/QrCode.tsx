import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

/* ── QrCode: crisp SVG, coloured with the theme's ink so it works in light and dark ── */

export interface QrCodeProps {
  value: string;
  /** Rendered size in px. */
  size?: number;
  /** Error correction: L 7%, M 15%, Q 25%, H 30%. */
  level?: 'L' | 'M' | 'Q' | 'H';
  /** Describes what scanning it does. */
  'aria-label'?: string;
}

export function QrCode({ value, size = 180, level = 'M', 'aria-label': label = 'QR code' }: QrCodeProps) {
  const { n, path } = useMemo(() => {
    const qr = qrcode(0, level);
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    let d = '';
    for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) if (qr.isDark(r, c)) d += `M${c + 2} ${r + 2}h1v1h-1z`;
    return { n: count + 4, path: d };
  }, [value, level]);
  return (
    <svg className="qr" width={size} height={size} viewBox={`0 0 ${n} ${n}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={n} height={n} fill="#fff" rx={1} />
      <path d={path} fill="#111" />
    </svg>
  );
}
