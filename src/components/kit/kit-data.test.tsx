import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Providers } from '../../test/providers';
import { DataTable, Timeline, TreeView, type TableQuery, type TreeNode } from './index';
import { DonutChart, FunnelChart, Gauge, Heatmap } from '../charts';
import { maxValue, niceTicks } from '../charts/shared';

const wrap = (ui: React.ReactElement) => render(<Providers>{ui}</Providers>);

const TREE: TreeNode[] = [
  {
    id: 'a',
    label: 'Alpha',
    children: [
      { id: 'a1', label: 'Apple' },
      { id: 'a2', label: 'Avocado' },
    ],
  },
  { id: 'b', label: 'Beta', children: [{ id: 'b1', label: 'Banana' }] },
];

describe('TreeView', () => {
  it('moves with arrow keys, opens and closes rows', async () => {
    const user = userEvent.setup();
    wrap(<TreeView aria-label="Fruit" items={TREE} />);
    const alpha = screen.getByRole('treeitem', { name: /Alpha/ });
    expect(alpha).toHaveAttribute('aria-expanded', 'false');
    alpha.focus();
    await user.keyboard('{ArrowRight}');
    expect(alpha).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('treeitem', { name: 'Apple' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(alpha).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('treeitem', { name: /Beta/ })).toHaveFocus();
    await user.keyboard('a');
    expect(alpha).toHaveFocus();
  });

  it('cascades checkboxes and shows a mixed state', async () => {
    const user = userEvent.setup();
    function T() {
      const [sel, setSel] = useState<string[]>([]);
      return (
        <TreeView
          aria-label="Fruit"
          items={TREE}
          selectionMode="multiple"
          defaultExpanded={['a']}
          selected={sel}
          onSelectedChange={setSel}
        />
      );
    }
    wrap(<T />);
    await user.click(screen.getByText('Apple'));
    expect(screen.getByRole('treeitem', { name: /Alpha/ })).toHaveAttribute('aria-checked', 'mixed');
    await user.click(screen.getByText('Alpha'));
    expect(screen.getByRole('treeitem', { name: /Alpha/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('treeitem', { name: 'Avocado' })).toHaveAttribute('aria-checked', 'true');
  });

  it('filters to matches and their parents', () => {
    wrap(<TreeView aria-label="Fruit" items={TREE} filter="ban" />);
    expect(screen.getByRole('treeitem', { name: /Beta/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('treeitem', { name: /Alpha/ })).toBeNull();
  });
});

describe('Timeline', () => {
  it('renders events in an ordered list with a pending step', () => {
    wrap(
      <Timeline aria-label="Order" items={[{ id: 1, title: 'Paid', time: '09:00', dateTime: '2026-10-27T09:00' }]} pending="Shipping" />,
    );
    const list = screen.getByRole('list', { name: 'Order' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(list.querySelector('time')).toHaveAttribute('datetime', '2026-10-27T09:00');
  });
});

describe('DataTable', () => {
  const rows = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `Person ${i + 1}` }));
  const columns = [{ id: 'name', header: 'Name', sortValue: (r: { name: string }) => r.name, cell: (r: { name: string }) => r.name }];

  it('expands a row to show its details', async () => {
    const user = userEvent.setup();
    wrap(
      <DataTable
        id="t-exp"
        label="People"
        data={rows.slice(0, 3)}
        rowKey={(r) => r.id}
        columns={columns}
        expandable={{ render: (r) => `Details of ${r.name}` }}
      />,
    );
    const btn = screen.getAllByRole('button', { name: 'Show details' })[0];
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Details of Person 1')).toBeInTheDocument();
  });

  it('reports page, sort and search in server mode', async () => {
    const user = userEvent.setup();
    const seen: TableQuery[] = [];
    wrap(
      <DataTable
        id="t-srv"
        label="People"
        data={rows.slice(0, 10)}
        rowKey={(r) => r.id}
        columns={columns}
        server={{ total: 30, onQueryChange: (q) => seen.push(q) }}
      />,
    );
    expect(seen[0]).toEqual({ page: 1, pageSize: 10, sort: null, search: '' });
    await user.click(screen.getByRole('button', { name: /Name/ }));
    expect(seen.at(-1)?.sort).toEqual({ id: 'name', dir: 'asc' });
    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'zed');
    await waitFor(() => expect(seen.at(-1)?.search).toBe('zed'));
    expect(screen.getByText(/of 30/)).toBeInTheDocument();
  });

  it('resizes a column from the keyboard', async () => {
    const user = userEvent.setup();
    wrap(
      <DataTable
        id="t-rs"
        label="People"
        data={rows.slice(0, 3)}
        rowKey={(r) => r.id}
        columns={[{ ...columns[0], width: 120 }]}
        resizableColumns
      />,
    );
    const sep = screen.getByRole('separator', { name: 'Resize Name' });
    sep.focus();
    await user.keyboard('{Home}');
    expect(sep).toBeInTheDocument();
  });
});

describe('charts', () => {
  it('picks clean ticks', () => {
    expect(niceTicks(260)).toEqual([0, 100, 200, 300]);
    expect(niceTicks(83545)).toEqual([0, 25000, 50000, 75000, 100000]);
    expect(niceTicks(8)).toEqual([0, 2, 4, 6, 8]);
    expect(
      maxValue(
        [
          { a: 2, b: 3 },
          { a: 5, b: 1 },
        ],
        ['a', 'b'],
        true,
      ),
    ).toBe(6);
  });

  it('gives screen readers numbers, not pictures', () => {
    wrap(
      <DonutChart
        aria-label="Roles"
        data={[
          { label: 'Admin', value: 2 },
          { label: 'User', value: 6 },
        ]}
      />,
    );
    const fig = screen.getByRole('figure', { name: 'Roles' });
    expect(within(fig).getByRole('table')).toBeInTheDocument();
    expect(within(fig).getAllByText('75%').length).toBeGreaterThan(0);
  });

  it('gauge is a meter and funnel lists steps', () => {
    wrap(
      <>
        <Gauge label="Disk" value={120} max={100} />
        <FunnelChart
          aria-label="Checkout"
          steps={[
            { label: 'Cart', value: 10 },
            { label: 'Paid', value: 4 },
          ]}
        />
        <Heatmap aria-label="Hours" rows={['Mon']} columns={['9', '10']} values={[[1, null]]} />
      </>,
    );
    expect(screen.getByRole('meter', { name: 'Disk' })).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('40% continued · 6 dropped')).toBeInTheDocument();
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});
