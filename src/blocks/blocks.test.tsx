import { Suspense, type ComponentType } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { Providers } from '../test/providers';
import { BLOCK_COUNT } from '../showcase/kitCount';
import { blockFiles, blocks } from './registry';

const files = import.meta.glob<{ default: ComponentType }>('./*/*.tsx', { eager: true });

describe('blocks registry', () => {
  it('lists every block file once, and the sidebar count matches', () => {
    expect(blocks.map((b) => b.file).sort()).toEqual([...blockFiles].sort());
    expect(new Set(blocks.map((b) => b.slug)).size).toBe(blocks.length);
    expect(BLOCK_COUNT).toBe(blocks.length);
  });
});

describe.each(Object.entries(files).map(([p, m]) => [p.slice(2, -4), m.default] as const))('%s block', (_name, Block) => {
  it('renders and passes axe', async () => {
    const { container } = render(
      <Providers>
        <main>
          <h1>Blocks</h1>
          <Suspense fallback={null}>
            <Block />
          </Suspense>
        </main>
      </Providers>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  }, 20_000);
});
