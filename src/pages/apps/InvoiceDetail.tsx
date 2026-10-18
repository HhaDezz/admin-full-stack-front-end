import { useParams } from 'react-router-dom';
import { Bell, CheckCircle2, Download, Printer } from 'lucide-react';
import { Badge, Button, EmptyState, PageHeader, useToast } from '../../components/kit';
import { subtotal, total, usd } from './data';
import { updateInvoice, useInvoices } from './invoiceStore';
import { longDate, STATUS_TONE } from './Invoices';
import { SampleBadge } from './shared';

/* One invoice as a printable page. Printing (or "Save as PDF" in the print dialog) shows only
 * the sheet: the app around it is hidden by @media print rules in apps.css. */

export default function InvoiceDetail() {
  const { id } = useParams();
  const toast = useToast();
  const inv = useInvoices().find((i) => i.id === id);
  if (!inv)
    return (
      <>
        <PageHeader title="Invoice not found" back={{ to: '/apps/invoices', label: 'Invoices' }} />
        <EmptyState headingLevel={2} title="No invoice with that number" description="It may have been deleted." />
      </>
    );
  const sub = subtotal(inv);
  const tax = sub * inv.taxRate;
  return (
    <>
      <PageHeader
        title={inv.number}
        description={`${inv.client.name} · ${usd(total(inv))}`}
        back={{ to: '/apps/invoices', label: 'Invoices' }}
        actions={
          <>
            <SampleBadge />
            {inv.status !== 'Paid' && inv.status !== 'Draft' && (
              <Button iconStart={<Bell size={15} />} onClick={() => toast.ok(`Reminder sent to ${inv.client.email}`)}>
                Send reminder
              </Button>
            )}
            {inv.status !== 'Paid' && (
              <Button
                iconStart={<CheckCircle2 size={15} />}
                onClick={() => {
                  updateInvoice(inv.id, { status: 'Paid' });
                  toast.ok(`${inv.number} marked as paid`);
                }}
              >
                Mark as paid
              </Button>
            )}
            <Button iconStart={<Download size={15} />} onClick={() => window.print()} title="Choose “Save as PDF” in the print dialog">
              PDF
            </Button>
            <Button variant="primary" iconStart={<Printer size={15} />} onClick={() => window.print()}>
              Print
            </Button>
          </>
        }
      />
      <article className="invoice-sheet" aria-label={`Invoice ${inv.number}`}>
        <header className="inv-head">
          <div>
            <div className="inv-brand">
              <span className="inv-logo" aria-hidden="true">
                A
              </span>
              <b>Anjana Clothing Co.</b>
            </div>
            <address>
              21 Flower Road, Colombo 07
              <br />
              Sri Lanka · billing@anjana.example
            </address>
          </div>
          <div className="inv-title">
            <h2>Invoice</h2>
            <span className="inv-number">{inv.number}</span>
            <Badge tone={STATUS_TONE[inv.status]}>{inv.status}</Badge>
          </div>
        </header>
        <div className="inv-parties">
          <div>
            <h3>Bill to</h3>
            <b>{inv.client.name}</b>
            <address>
              {inv.client.address.map((l) => (
                <span key={l}>
                  {l}
                  <br />
                </span>
              ))}
              {inv.client.email}
            </address>
          </div>
          <dl className="inv-dates">
            <div>
              <dt>Issued</dt>
              <dd>{longDate(inv.issued)}</dd>
            </div>
            <div>
              <dt>Due</dt>
              <dd>{longDate(inv.due)}</dd>
            </div>
            <div>
              <dt>Amount due</dt>
              <dd className="inv-due">{inv.status === 'Paid' ? usd(0) : usd(total(inv))}</dd>
            </div>
          </dl>
        </div>
        <table className="inv-lines">
          <caption className="sr-only">Items</caption>
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col">Qty</th>
              <th scope="col">Price</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.lines.map((l, i) => (
              <tr key={i}>
                <td>{l.description}</td>
                <td>{l.qty}</td>
                <td>{usd(l.price)}</td>
                <td>{usd(l.qty * l.price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3}>
                Subtotal
              </th>
              <td>{usd(sub)}</td>
            </tr>
            <tr>
              <th scope="row" colSpan={3}>
                Tax ({Math.round(inv.taxRate * 100)}%)
              </th>
              <td>{usd(tax)}</td>
            </tr>
            <tr className="inv-total">
              <th scope="row" colSpan={3}>
                Total
              </th>
              <td>{usd(sub + tax)}</td>
            </tr>
          </tfoot>
        </table>
        {inv.notes && (
          <footer className="inv-notes">
            <h3>Notes</h3>
            <p>{inv.notes}</p>
            <p className="muted">Bank: Example Bank · Account 0012 3456 7890 · SWIFT EXMPLKLX</p>
          </footer>
        )}
      </article>
    </>
  );
}
