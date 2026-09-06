import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Providers } from '../../test/providers';
import {
  Accordion,
  Button,
  DropdownMenu,
  Modal,
  NumberInput,
  pageList,
  passwordScore,
  RadioGroup,
  Slider,
  Switch,
  Tabs,
  Tag,
  Tooltip,
  useToast,
} from './index';

const wrap = (ui: React.ReactElement) => render(<Providers>{ui}</Providers>);

describe('Button', () => {
  it('is a non-submitting button that disables itself and announces busy while loading', async () => {
    const onClick = vi.fn();
    const { rerender } = wrap(<Button onClick={onClick}>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toHaveAttribute('type', 'button');
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <Providers>
        <Button onClick={onClick} loading loadingText="Saving…">
          Save
        </Button>
      </Providers>,
    );
    const busy = screen.getByRole('button', { name: /Saving/ });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute('aria-busy', 'true');
  });
});

describe('Tabs', () => {
  it('moves selection with the arrow keys and skips disabled tabs', async () => {
    wrap(
      <Tabs
        aria-label="Account"
        animated={false}
        items={[
          { value: 'a', label: 'Profile', content: 'Profile panel' },
          { value: 'b', label: 'Billing', disabled: true },
          { value: 'c', label: 'Security', content: 'Security panel' },
        ]}
      />,
    );
    const first = screen.getByRole('tab', { name: 'Profile' });
    expect(first).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Profile panel');
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    const third = screen.getByRole('tab', { name: 'Security' });
    expect(third).toHaveFocus();
    expect(third).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Security panel');
    await userEvent.keyboard('{Home}');
    expect(first).toHaveFocus();
  });
});

describe('Modal', () => {
  function Demo({ onClose }: { onClose: () => void }) {
    return (
      <Modal title="Invite user" onClose={onClose}>
        <input aria-label="Email" />
      </Modal>
    );
  }
  it('is a labelled dialog that traps focus and closes on Escape', async () => {
    const onClose = vi.fn();
    wrap(<Demo onClose={onClose} />);
    const dialog = await screen.findByRole('dialog', { name: 'Invite user' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    for (let i = 0; i < 4; i++) {
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Tooltip', () => {
  it('appears on keyboard focus and describes its trigger', async () => {
    wrap(
      <Tooltip content="Copy link">
        <button>Copy</button>
      </Tooltip>,
    );
    await userEvent.tab();
    const tip = await screen.findByRole('tooltip');
    expect(tip).toHaveTextContent('Copy link');
    expect(screen.getByRole('button', { name: 'Copy' })).toHaveAccessibleDescription('Copy link');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });
});

describe('DropdownMenu', () => {
  it('opens from the keyboard, skips disabled items and runs the chosen one', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    wrap(
      <DropdownMenu
        label="Row actions"
        trigger={<button>Actions</button>}
        items={[
          { label: 'Edit', onSelect: onEdit },
          { label: 'Archive', disabled: true },
          { type: 'separator' },
          { label: 'Delete', onSelect: onDelete, danger: true },
        ]}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const menu = await screen.findByRole('menu', { name: 'Row actions' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Edit' })).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    expect(within(menu).getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onEdit).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(trigger).toHaveFocus();
  });
});

describe('RadioGroup', () => {
  it('selects with arrow keys', async () => {
    const onChange = vi.fn();
    wrap(
      <RadioGroup
        label="Plan"
        defaultValue="month"
        onChange={onChange}
        options={[
          { value: 'month', label: 'Monthly' },
          { value: 'year', label: 'Yearly' },
        ]}
      />,
    );
    expect(screen.getByRole('group', { name: 'Plan' })).toBeInTheDocument();
    const monthly = screen.getByRole('radio', { name: 'Monthly' });
    expect(monthly).toBeChecked();
    monthly.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Yearly' })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('year');
  });
});

describe('NumberInput', () => {
  it('steps with the keyboard and the buttons, and stays within min and max', async () => {
    function Demo() {
      const [v, setV] = useState<number | null>(8);
      return <NumberInput aria-label="Seats" value={v} onChange={setV} min={1} max={10} step={1} />;
    }
    wrap(<Demo />);
    const field = screen.getByRole('spinbutton', { name: 'Seats' });
    field.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(field).toHaveValue('9');
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(field).toHaveValue('10');
    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled();
    field.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(field).toHaveValue('10');
    expect(field).toHaveAttribute('aria-valuemax', '10');
  });
});

describe('Slider', () => {
  it('moves with arrows, Page keys, Home and End, and reports the end value', async () => {
    const onEnd = vi.fn();
    wrap(<Slider aria-label="Volume" defaultValue={40} step={5} onChangeEnd={onEnd} formatValue={(v) => `${v}%`} />);
    const thumb = screen.getByRole('slider', { name: 'Volume' });
    thumb.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '45');
    expect(thumb).toHaveAttribute('aria-valuetext', '45%');
    await userEvent.keyboard('{PageUp}');
    expect(thumb).toHaveAttribute('aria-valuenow', '55');
    await userEvent.keyboard('{End}');
    expect(thumb).toHaveAttribute('aria-valuenow', '100');
    await userEvent.keyboard('{Home}');
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
    expect(onEnd).toHaveBeenLastCalledWith(0);
  });

  it('keeps range thumbs from crossing', async () => {
    wrap(<Slider aria-label="Price" defaultValue={[20, 30]} step={10} />);
    const [lo, hi] = screen.getAllByRole('slider');
    expect(lo).toHaveAccessibleName('Price Minimum');
    lo.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(lo).toHaveAttribute('aria-valuenow', '30');
    expect(hi).toHaveAttribute('aria-valuemin', '30');
  });

  it('reverses the horizontal arrows in right-to-left', async () => {
    render(
      <div dir="rtl">
        <Slider aria-label="Volume" defaultValue={50} step={10} />
      </div>,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(thumb).toHaveAttribute('aria-valuenow', '60');
  });
});

describe('Switch', () => {
  it('is a labelled switch that toggles with Space', async () => {
    function Demo() {
      const [on, setOn] = useState(false);
      return <Switch checked={on} onChange={setOn} label="Dark mode" />;
    }
    wrap(<Demo />);
    const sw = screen.getByRole('switch', { name: 'Dark mode' });
    sw.focus();
    await userEvent.keyboard(' ');
    expect(sw).toBeChecked();
  });
});

describe('Accordion', () => {
  it('opens one section at a time and moves between headers with arrows', async () => {
    wrap(
      <Accordion
        items={[
          { value: 'a', title: 'Shipping', content: 'Two to four days' },
          { value: 'b', title: 'Returns', content: 'Within 30 days' },
        ]}
      />,
    );
    const shipping = screen.getByRole('button', { name: 'Shipping' });
    const returns = screen.getByRole('button', { name: 'Returns' });
    await userEvent.click(shipping);
    expect(shipping).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(returns);
    expect(returns).toHaveAttribute('aria-expanded', 'true');
    expect(shipping).toHaveAttribute('aria-expanded', 'false');
    returns.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(shipping).toHaveFocus();
  });
});

describe('Tag', () => {
  it('has a named remove button', async () => {
    const onRemove = vi.fn();
    wrap(<Tag onRemove={onRemove}>React</Tag>);
    await userEvent.click(screen.getByRole('button', { name: 'Remove React' }));
    expect(onRemove).toHaveBeenCalled();
  });
});

describe('Toast', () => {
  it('turns a loading toast into success when the promise resolves, and runs actions', async () => {
    const undo = vi.fn();
    let api!: ReturnType<typeof useToast>;
    function Grab() {
      api = useToast();
      return null;
    }
    wrap(<Grab />);
    let resolve!: (v: string) => void;
    act(() => {
      void api.promise(new Promise<string>((r) => (resolve = r)), { loading: 'Saving…', success: (v) => `Saved ${v}`, error: 'Failed' });
    });
    expect(await screen.findByText('Saving…')).toBeInTheDocument();
    await act(async () => resolve('report'));
    expect(await screen.findByText('Saved report')).toBeInTheDocument();
    act(() => {
      api.show({ title: 'User deleted', action: { label: 'Undo', onClick: undo } });
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(undo).toHaveBeenCalled();
  });
});

describe('helpers', () => {
  it('pageList collapses long ranges', () => {
    expect(pageList(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageList(10, 20)).toEqual([1, '…', 9, 10, 11, '…', 20]);
  });
  it('passwordScore rewards length and variety', () => {
    expect(passwordScore('')).toBe(0);
    expect(passwordScore('abc')).toBeLessThan(passwordScore('Abcdef12!'));
    expect(passwordScore('Corr3ct-Horse-Battery')).toBe(4);
  });
});
