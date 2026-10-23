import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { Providers } from '../test/providers';
import type { DocComponent } from './doc';

const docs = import.meta.glob<{ default: DocComponent }>('./docs/*.tsx', { eager: true });

describe.each(Object.entries(docs).map(([p, m]) => [p.replace('./docs/', '').replace('.tsx', ''), m.default] as const))(
  '%s docs page',
  (_name, Page) => {
    it('renders every example and passes axe', async () => {
      const { container } = render(
        <Providers>
          <Page />
        </Providers>,
      );
      expect(screen.getByRole('heading', { level: 1, name: Page.spec.name })).toBeInTheDocument();
      for (const e of Page.spec.examples) expect(container.querySelector(`#${e.id}`), e.id).not.toBeNull();
      expect(await axeViolations(container)).toEqual([]);
    }, 20_000);
  },
);
