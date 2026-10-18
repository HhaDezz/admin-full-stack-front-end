import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, FilePlus2, Wallet } from 'lucide-react';
import {
  Badge,
  Button,
  DataTable,
  Grid,
  PageHeader,
  StatCard,
  ToggleGroup,
  useToast,
  type BadgeTone,
  type Column,
} from '../../components/kit';
import { subtotal, total, usd, type Invoice, type InvoiceStatus } from './data';
import { useInvoices } from './invoiceStore';
import { SampleBadge } from './shared';

/* Invoices: totals at the top, a filterable table, and a printable page per invoice. */

export const STATUS_TONE: Record<InvoiceStatus, BadgeTone> = { Paid: 'ok', Sent: 'info', Overdue: 'danger', Draft: 'neutral' };
export const longDate = (ymd: string) =>
  new Date(`${ymd}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export default function Invoices() {
  const toast = useToast();
  const navigate = useNavigate();
  const invoices = useInvoices();
  const [status, setStatus] = useState<'All' | InvoiceStatus>('All');
  const rows = useMemo(() => (status === 'All' ? invoices : invoices.filter((i) => i.status === status)), [invoices, status]);
  const sum = (s: InvoiceStatus[]) => invoices.filter((i) => s.includes(i.status)).reduce((a, i) => a + total(i), 0);
  const count = (s: InvoiceStatus) => invoices.filter((i) => i.status === s).length;
  const n = (k: number) => `${k} ${k === 1 ? 'invoice' : 'invoices'}`;

  const columns: Column<Invoice>[] = [
    {
      id: 'number',
      header: 'Invoice',
      cell: (i) => <b>{i.number}</b>,
      sortValue: (i) => i.number,
      searchValue: (i) => i.number,
      nowrap: true,
    },
    {
      id: 'client',
      header: 'Client',
      cell: (i) => i.client.name,
      sortValue: (i) => i.client.name,
      searchValue: (i) => `${i.client.name} ${i.client.email}`,
    },
    { id: 'issued', header: 'Issued', cell: (i) => longDate(i.issued), sortValue: (i) => i.issued, nowrap: true },
    { id: 'due', header: 'Due', cell: (i) => longDate(i.due), sortValue: (i) => i.due, nowrap: true },
    {
      id: 'amount',
      header: 'Amount',
      align: 'right',
      cell: (i) => <span className="tabular">{usd(total(i))}</span>,
      sortValue: (i) => total(i),
      exportValue: (i) => total(i).toFixed(2),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (i) => (
        <Badge tone={STATUS_TONE[i.status]} dot>
          {i.status}
        </Badge>
      ),
      sortValue: (i) => i.status,
      searchValue: (i) => i.status,
    },
  ];

  return (
    <>
      <PageHeader
        title="Invoices"
        description="What you’ve billed, what’s paid and what’s late."
        actions={
          <>
            <SampleBadge />
            <Button
              variant="primary"
              iconStart={<FilePlus2 size={16} />}
              onClick={() => toast.info('New invoice', 'Hook this button up to your invoice form.')}
            >
              New invoice
            </Button>
          </>
        }
      />
      <Grid columns={{ base: 1, sm: 2, xl: 4 }} gap={4} className="dash-row">
        <StatCard
          label="Outstanding"
          value={sum(['Sent', 'Overdue'])}
          format={usd}
          icon={<Wallet size={20} />}
          tone="blue"
          footnote={n(count('Sent') + count('Overdue'))}
        />
        <StatCard
          label="Overdue"
          value={sum(['Overdue'])}
          format={usd}
          icon={<AlertTriangle size={20} />}
          tone="red"
          footnote={n(count('Overdue'))}
        />
        <StatCard
          label="Paid"
          value={sum(['Paid'])}
          format={usd}
          icon={<CheckCircle2 size={20} />}
          tone="green"
          footnote={n(count('Paid'))}
        />
        <StatCard
          label="Drafts"
          value={sum(['Draft'])}
          format={usd}
          icon={<Clock size={20} />}
          tone="gold"
          footnote={`${count('Draft')} not sent yet`}
        />
      </Grid>
      <DataTable
        id="invoices"
        label="Invoices"
        data={rows}
        columns={columns}
        rowKey={(i) => i.id}
        searchPlaceholder="Search invoice, client or status"
        initialSort={{ id: 'issued', dir: 'desc' }}
        onRowClick={(i) => navigate(`/apps/invoices/${i.id}`)}
        exportFileName="invoices"
        filtered={status !== 'All'}
        toolbar={
          <ToggleGroup
            size="sm"
            aria-label="Status"
            value={status}
            onChange={setStatus}
            items={(['All', 'Paid', 'Sent', 'Overdue', 'Draft'] as const).map((s) => ({ value: s, label: s }))}
          />
        }
      />
      <p className="muted" style={{ fontSize: 13 }}>
        Totals include tax. Subtotal of everything listed: {usd(rows.reduce((a, i) => a + subtotal(i), 0))}.
      </p>
    </>
  );
}
