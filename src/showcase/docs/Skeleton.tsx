import { useState } from 'react';
import { Avatar, Button, Skeleton, SkeletonText } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Skeleton.tsx?raw';

// #region card
export function CardSkeleton() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="ex-col">
      <div className="card card-pad" style={{ display: 'flex', gap: 14 }} aria-busy={loading}>
        {loading ? <Skeleton circle h={44} /> : <Avatar name="Amara Perera" size="lg" />}
        <div style={{ flex: 1, display: 'grid', gap: 8 }}>
          {loading ? (
            <>
              <Skeleton h={16} w="45%" />
              <SkeletonText lines={2} />
            </>
          ) : (
            <>
              <b>Amara Perera</b>
              <span className="muted">Head of production. Joined in March; manages 14 people across two sites.</span>
            </>
          )}
        </div>
      </div>
      <Button onClick={() => setLoading(!loading)}>{loading ? 'Finish loading' : 'Load again'}</Button>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Skeleton',
  group: 'Feedback',
  status: 'updated',
  imports: ['Skeleton', 'SkeletonText'],
  description: 'Shimmering placeholders in the shape of the content, so the page doesn’t jump when data arrives.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'h', default: 16, min: 6, max: 120, step: 2 },
      { type: 'number', name: 'w', label: 'w (%)', default: 100, min: 10, max: 100, step: 5 },
      { type: 'number', name: 'r', default: 6, min: 0, max: 24 },
      { type: 'boolean', name: 'circle', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(360px, 100%)' }}>
        <Skeleton h={Number(v.h)} w={v.circle ? Number(v.h) : `${v.w}%`} r={Number(v.r)} circle={!!v.circle} />
      </div>
    ),
    code: ({ w, ...p }) => jsx('Skeleton', { ...p, w: w === 100 ? '' : `${w}%` }, { h: 16, r: 6, circle: false, w: '' }),
  },
  examples: [
    { id: 'card', title: 'Profile card', description: 'Circle, line and paragraph shapes. Toggle to compare.', Component: CardSkeleton },
  ],
  a11y: [
    'Placeholders are hidden from screen readers; mark the container aria-busy while loading.',
    'The shimmer stops when reduced motion is on.',
  ],
  props: [
    { name: 'h / w / r', type: 'number | string', defaultValue: "16 / '100%' / —", description: 'Height, width, radius.' },
    { name: 'circle', type: 'boolean', description: 'Round, h × h.' },
    { name: 'lines (SkeletonText)', type: 'number', defaultValue: '3', description: 'Paragraph lines; the last is shorter.' },
  ],
});
