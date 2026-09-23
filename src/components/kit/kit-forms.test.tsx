import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { z } from 'zod';
import { Providers } from '../../test/providers';
import {
  Button,
  ColorPicker,
  CommandPalette,
  ContextMenu,
  DatePicker,
  DateRangePicker,
  FileUpload,
  Form,
  FormError,
  FormField,
  Input,
  PinInput,
  Rating,
  TagInput,
  TimePicker,
  useZodForm,
  Wizard,
  type UploadItem,
} from './index';

const wrap = (ui: React.ReactElement) => render(<Providers>{ui}</Providers>);

describe('PinInput', () => {
  it('moves along as you type, accepts a pasted code and reports completion', async () => {
    const done = vi.fn();
    wrap(<PinInput length={4} onComplete={done} aria-label="Code" />);
    const boxes = screen.getAllByRole('textbox');
    await userEvent.click(boxes[0]);
    await userEvent.keyboard('12');
    expect(boxes[2]).toHaveFocus();
    await userEvent.keyboard('{Backspace}');
    expect(boxes[1]).toHaveFocus();
    expect(boxes[1]).toHaveValue('');
    fireEvent.paste(boxes[1], { clipboardData: { getData: () => '9 8 7 6' } });
    expect(boxes.map((b) => (b as HTMLInputElement).value).join('')).toBe('9876');
    expect(done).toHaveBeenCalledWith('9876');
    expect(boxes[3]).toHaveAccessibleName('Digit 4 of 4');
  });

  it('ignores letters in numeric mode', async () => {
    wrap(<PinInput length={3} />);
    const boxes = screen.getAllByRole('textbox');
    await userEvent.click(boxes[0]);
    await userEvent.keyboard('a5');
    expect(boxes[0]).toHaveValue('5');
  });
});

describe('TagInput', () => {
  it('adds with Enter and comma, refuses duplicates and invalid tags, removes with Backspace', async () => {
    const isEmail = (t: string) => (/^\S+@\S+$/.test(t) ? null : `“${t}” isn't an email address.`);
    function Demo() {
      const [v, setV] = useState<string[]>([]);
      return <TagInput aria-label="Invite" value={v} onChange={setV} validate={isEmail} />;
    }
    wrap(<Demo />);
    const field = screen.getByRole('textbox', { name: 'Invite' });
    await userEvent.type(field, 'a@x.io{Enter}b@x.io,');
    expect(screen.getByRole('button', { name: 'Remove a@x.io' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove b@x.io' })).toBeInTheDocument();
    await userEvent.type(field, 'A@X.IO{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('already added');
    await userEvent.clear(field);
    await userEvent.type(field, 'nope{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent("isn't an email");
    await userEvent.clear(field);
    await userEvent.keyboard('{Backspace}');
    expect(screen.queryByRole('button', { name: 'Remove b@x.io' })).toBeNull();
  });
});

describe('Rating', () => {
  it('is a radio group with named stars, and clicking the chosen star clears it', async () => {
    const onChange = vi.fn();
    wrap(<Rating defaultValue={3} onChange={onChange} labels={['Poor', 'Fair', 'Good', 'Great', 'Excellent']} />);
    expect(screen.getByRole('radio', { name: 'Good' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Excellent' }));
    expect(onChange).toHaveBeenLastCalledWith(5);
    await userEvent.click(screen.getByRole('radio', { name: 'Excellent' }));
    expect(onChange).toHaveBeenLastCalledWith(0);
  });
  it('read-only shows the exact value', () => {
    render(<Rating readOnly value={4.3} aria-label="Average" />);
    expect(screen.getByRole('img', { name: 'Average: 4.3 out of 5' })).toBeInTheDocument();
  });
});

describe('ColorPicker', () => {
  it('picks a swatch, accepts a typed hex and moves with the keyboard', async () => {
    const onChange = vi.fn();
    function Demo() {
      const [c, setC] = useState('#1f4d45');
      return (
        <ColorPicker
          aria-label="Brand"
          value={c}
          onChange={(v) => {
            setC(v);
            onChange(v);
          }}
        />
      );
    }
    wrap(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Brand: #1f4d45' }));
    const dialog = await screen.findByRole('dialog', { name: 'Brand' });
    await userEvent.click(within(dialog).getByRole('button', { name: '#4f46e5' }));
    expect(onChange).toHaveBeenLastCalledWith('#4f46e5');
    const hex = within(dialog).getByRole('textbox', { name: 'Hex colour' });
    await userEvent.clear(hex);
    await userEvent.type(hex, 'ff0000');
    expect(onChange).toHaveBeenLastCalledWith('#ff0000');
    const area = within(dialog).getByRole('slider', { name: 'Saturation and brightness' });
    area.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(onChange.mock.lastCall?.[0]).not.toBe('#ff0000');
  });
});

describe('DatePicker', () => {
  it('opens on the selected day, picks a date and refuses dates before min', async () => {
    const onChange = vi.fn();
    const min = new Date(2026, 9, 10);
    wrap(<DatePicker aria-label="Due" defaultValue={new Date(2026, 9, 14)} min={min} onChange={onChange} lang="en-GB" />);
    await userEvent.click(screen.getByRole('button', { name: /^Due: 14 Oct 2026$/ }));
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(document.activeElement?.textContent).toBe('14'));
    expect(within(dialog).getByText('October 2026')).toBeInTheDocument();
    const nine = within(dialog)
      .getAllByRole('button')
      .find((b) => b.textContent === '9' && !b.closest('.rdp-outside'));
    expect(nine).toBeDisabled();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 9, 15));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: /^Due: 15 Oct 2026$/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear Due' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});

describe('DateRangePicker', () => {
  it('applies a preset and shows its name', async () => {
    const onChange = vi.fn();
    wrap(<DateRangePicker aria-label="Period" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /^Period: not set$/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Last 7 days' }));
    const r = onChange.mock.lastCall?.[0] as { from: Date; to: Date };
    expect(Math.round((r.to.getTime() - r.from.getTime()) / 86400000)).toBe(6);
    expect(screen.getByRole('button', { name: /^Period:/ })).toHaveTextContent('Last 7 days');
  });
});

describe('TimePicker', () => {
  it('takes typed digits and arrow keys (24-hour)', async () => {
    const onChange = vi.fn();
    wrap(<TimePicker aria-label="Start" hour12={false} onChange={onChange} listStep={0} step={15} />);
    const hours = screen.getByRole('spinbutton', { name: 'Hours' });
    hours.focus();
    await userEvent.keyboard('9');
    expect(screen.getByRole('spinbutton', { name: 'Minutes' })).toHaveFocus();
    await userEvent.keyboard('30');
    expect(onChange).toHaveBeenLastCalledWith('09:30');
    await userEvent.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith('09:45');
    screen.getByRole('spinbutton', { name: 'Hours' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('08:45');
  });

  it('has an AM/PM segment on a 12-hour clock', async () => {
    const onChange = vi.fn();
    wrap(<TimePicker aria-label="Start" hour12 defaultValue="09:00" onChange={onChange} listStep={0} />);
    const period = screen.getByRole('spinbutton', { name: 'AM or PM' });
    expect(period).toHaveTextContent('AM');
    period.focus();
    await userEvent.keyboard('p');
    expect(onChange).toHaveBeenLastCalledWith('21:00');
  });
});

describe('Form', () => {
  const schema = z.object({
    name: z.string().min(2, 'Enter your name'),
    email: z.string().email('Enter a valid email address'),
  });
  function Demo({ submit }: { submit: (v: z.output<typeof schema>) => Promise<void> }) {
    const form = useZodForm(schema, { defaultValues: { name: '', email: '' } });
    return (
      <Form form={form} onSubmit={submit} aria-label="Profile">
        <FormError />
        <FormField name="name" label="Name">
          <Input />
        </FormField>
        <FormField name="email" label="Email">
          <Input type="email" />
        </FormField>
        <Button type="submit">Save</Button>
      </Form>
    );
  }

  it('shows schema errors on submit and links them to the fields', async () => {
    const submit = vi.fn(async () => {});
    wrap(<Demo submit={submit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Enter your name')).toBeInTheDocument();
    const name = screen.getByRole('textbox', { name: 'Name' });
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Enter your name');
    expect(submit).not.toHaveBeenCalled();
  });

  it('puts API field errors under their inputs and other errors at the top', async () => {
    const apiError = (status: number, data: unknown, message: string) =>
      Object.assign(new axios.AxiosError(message), { response: { status, data: { success: false, message, data } } });
    const submit = vi
      .fn()
      .mockRejectedValueOnce(apiError(409, { email: 'That email is already in use.' }, 'That email is already in use.'))
      .mockRejectedValueOnce(apiError(500, null, 'The server is having a moment.'));
    wrap(<Demo submit={submit} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Ada');
    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'ada@x.io');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('That email is already in use.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'm');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('The server is having a moment.');
  });
});

describe('Wizard', () => {
  it('validates each step before moving on', async () => {
    const schema = z.object({ company: z.string().min(1, 'Company is required'), seats: z.string().min(1, 'Choose seats') });
    const done = vi.fn();
    function Demo() {
      const form = useZodForm(schema, { defaultValues: { company: '', seats: '' } });
      return (
        <Form form={form} onSubmit={done}>
          <Wizard
            steps={[
              {
                id: 'a',
                title: 'Company',
                fields: ['company'],
                content: (
                  <FormField name="company" label="Company">
                    <Input />
                  </FormField>
                ),
              },
              {
                id: 'b',
                title: 'Seats',
                fields: ['seats'],
                content: (
                  <FormField name="seats" label="Seats">
                    <Input />
                  </FormField>
                ),
              },
            ]}
          />
        </Form>
      );
    }
    wrap(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Company is required')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: 'Company' }), 'Acme');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByRole('heading', { name: /Step 2 of 2\s*Seats/ })).toHaveFocus();
    await userEvent.type(screen.getByRole('textbox', { name: 'Seats' }), '10');
    await userEvent.click(screen.getByRole('button', { name: 'Finish' }));
    await waitFor(() => expect(done).toHaveBeenCalledWith({ company: 'Acme', seats: '10' }));
  });
});

describe('ContextMenu', () => {
  it('opens on right-click and from the keyboard, and closes with Escape', async () => {
    const onOpen = vi.fn();
    wrap(
      <ContextMenu
        label="File actions"
        items={[{ label: 'Open', onSelect: onOpen }, { type: 'separator' }, { label: 'Delete', danger: true }]}
      >
        <div tabIndex={0}>Report.pdf</div>
      </ContextMenu>,
    );
    const target = screen.getByText('Report.pdf');
    fireEvent.contextMenu(target, { clientX: 20, clientY: 20 });
    const menu = await screen.findByRole('menu', { name: 'File actions' });
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Open' })).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    target.focus();
    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
    await screen.findByRole('menu');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Open' })).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalled();
  });
});

describe('CommandPalette', () => {
  it('filters as you type and runs the active item', async () => {
    const go = vi.fn();
    const toggle = vi.fn();
    function Demo() {
      const [open, setOpen] = useState(true);
      return (
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          onNavigate={go}
          items={[
            { id: 'users', label: 'Users', group: 'Pages', href: '/users' },
            { id: 'roles', label: 'Roles', group: 'Pages', href: '/roles' },
            { id: 'dark', label: 'Toggle dark mode', group: 'Actions', keywords: ['theme'], onSelect: toggle },
          ]}
        />
      );
    }
    wrap(<Demo />);
    const input = await screen.findByRole('combobox', { name: 'Search commands' });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.type(input, 'theme');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(toggle).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});

describe('FileUpload', () => {
  it('refuses files that are too big and uploads the rest', async () => {
    const upload = vi.fn(async (_f: File, ctx: { onProgress: (n: number) => void }) => {
      ctx.onProgress(50);
      return { url: 'https://x/y' };
    });
    let items: UploadItem[] = [];
    function Demo() {
      const [v, setV] = useState<UploadItem[]>([]);
      items = v;
      return <FileUpload value={v} onChange={setV} upload={upload} maxSize={1000} />;
    }
    const { container } = wrap(<Demo />);
    const input = container.querySelector('input[type=file]') as HTMLInputElement;
    const small = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    const big = new File([new Uint8Array(5000)], 'huge.bin', { type: 'application/octet-stream' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [small, big] } });
    });
    await waitFor(() => expect(items.find((i) => i.file.name === 'notes.txt')?.status).toBe('done'));
    expect(items.find((i) => i.file.name === 'huge.bin')?.error).toMatch(/Larger than/);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('1 file added, 1 refused.');
    await userEvent.click(screen.getByRole('button', { name: 'Remove huge.bin' }));
    expect(screen.queryByText('huge.bin')).toBeNull();
  });
});
