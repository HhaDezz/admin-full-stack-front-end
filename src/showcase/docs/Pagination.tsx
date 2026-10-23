import { useState } from 'react';
import { Pagination } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Pagination.tsx?raw';

// #region basic
export function Basic() {
  const [page, setPage] = useState(6);
  return (
    <div className="ex-col" style={{ alignItems: 'center' }}>
      <Pagination page={page} pages={20} onChange={setPage} showEdges aria-label="Results, numbered" />
      <Pagination page={page} pages={20} onChange={setPage} simple aria-label="Results, compact" />
    </div>
  );
}
// #endregion

function PaginationPlayground(v: Record<string, string | number | boolean>) {
  const [page, setPage] = useState(5);
  const pages = Number(v.pages);
  return (
    <Pagination
      page={Math.min(page, pages)}
      pages={pages}
      onChange={setPage}
      siblings={Number(v.siblings)}
      showEdges={!!v.showEdges}
      simple={!!v.simple}
      size={v.size as 'md'}
    />
  );
}

export default defineDoc({
  name: 'Pagination',
  group: 'Navigation',
  status: 'new',
  imports: ['Pagination', 'pageList'],
  description:
    'Page numbers with gaps (1 … 5 6 7 … 20), optional first / last buttons and a compact “Page 3 of 12” mode. The DataTable footer uses the same logic.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'pages', default: 20, min: 1, max: 50 },
      { type: 'number', name: 'siblings', default: 1, min: 0, max: 3 },
      { type: 'boolean', name: 'showEdges', default: true },
      { type: 'boolean', name: 'simple', default: false },
      { type: 'select', name: 'size', options: ['sm', 'md'], default: 'md' },
    ],
    render: (v) => <PaginationPlayground {...v} />,
    code: (p) =>
      jsx('Pagination', p, { siblings: 1, showEdges: true, simple: false, size: 'md' }, undefined, ['page={page}', 'onChange={setPage}']),
  },
  examples: [{ id: 'basic', title: 'Full and simple', description: 'Both control the same page.', Component: Basic }],
  a11y: ['A labelled nav; each page button says “Page n” and the current one has aria-current="page".'],
  props: [
    { name: 'page / pages', type: 'number', description: 'Current page (1-based) and total.' },
    { name: 'onChange', type: '(page) => void', description: 'Called with the new page.' },
    { name: 'siblings', type: 'number', defaultValue: '1', description: 'Pages either side of the current one.' },
    { name: 'showEdges', type: 'boolean', defaultValue: 'false', description: 'First and last buttons.' },
    { name: 'simple', type: 'boolean', defaultValue: 'false', description: '“Page x of y” instead of numbers.' },
    { name: 'size', type: "'sm' | 'md'", defaultValue: "'sm'", description: 'Button size.' },
  ],
});
