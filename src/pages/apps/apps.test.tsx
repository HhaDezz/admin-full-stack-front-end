import type { ComponentType } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/components/kit';
import { MotionProvider } from '../../lib/motion';
import { ThemeProvider } from '../../lib/theme';
import { axeViolations } from '../../test/axe';
import Kanban from './Kanban';
import Calendar from './Calendar';
import Chat from './Chat';
import Mail from './Mail';
import Files from './Files';
import Invoices from './Invoices';
import InvoiceDetail from './InvoiceDetail';
import { INVOICES, total, usd } from './data';

const at = (path: string, route: string, Page: ComponentType) =>
  render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <MotionProvider>
          <ToastProvider>
            <main>
              <Routes>
                <Route path={route} element={<Page />} />
              </Routes>
            </main>
          </ToastProvider>
        </MotionProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );

const PAGES: [string, string, string, ComponentType][] = [
  ['Kanban', '/apps/kanban', '/apps/kanban', Kanban],
  ['Calendar', '/apps/calendar', '/apps/calendar', Calendar],
  ['Chat', '/apps/chat', '/apps/chat', Chat],
  ['Mail', '/apps/mail', '/apps/mail', Mail],
  ['Files', '/apps/files', '/apps/files', Files],
  ['Invoices', '/apps/invoices', '/apps/invoices', Invoices],
  ['INV-2041', '/apps/invoices/inv-2041', '/apps/invoices/:id', InvoiceDetail],
];

describe.each(PAGES)('%s page', (title, path, route, Page) => {
  it('renders with sample data and passes axe', async () => {
    const { container } = at(path, route, Page);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getAllByText('Sample data').length).toBeGreaterThan(0);
    expect(await axeViolations(container)).toEqual([]);
  }, 20_000);
});

describe('app pages', () => {
  it('Mail opens a message and moves it to the archive', async () => {
    const user = userEvent.setup();
    at('/apps/mail', '/apps/mail', Mail);
    await user.click(screen.getByRole('button', { name: /Northwind Fabrics/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Your linen order has shipped' })).toBeInTheDocument();
    await user.click(within(screen.getByRole('region', { name: 'Message' })).getByRole('button', { name: 'Archive' }));
    expect(screen.queryByRole('button', { name: /Northwind Fabrics/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Archive' }));
    expect(screen.getByRole('button', { name: /Northwind Fabrics/ })).toBeInTheDocument();
  });

  it('Files opens folders and filters across them', async () => {
    const user = userEvent.setup();
    at('/apps/files', '/apps/files', Files);
    await user.click(screen.getAllByRole('button', { name: /^Finance/ })[0]);
    expect(screen.getByRole('button', { name: /^Q4 budget\.xlsx/ })).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Search all files' }), 'banner');
    expect(screen.getAllByRole('button', { name: /^banner-/ })).toHaveLength(2);
  });

  it('An invoice adds up its lines with tax', () => {
    const inv = INVOICES[0];
    at(`/apps/invoices/${inv.id}`, '/apps/invoices/:id', InvoiceDetail);
    const table = screen.getByRole('table', { name: 'Items' });
    expect(within(table).getByRole('row', { name: /^Total/ })).toHaveTextContent(usd(total(inv)));
  });
});
