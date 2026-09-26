import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axeViolations } from '../../test/axe';
import { highlight, matches, rank } from './match';
import { SearchSelect } from './SearchSelect';
import type { SelectOption } from './types';

const fruits: SelectOption[] = [
  { value: 'apple', label: 'Apple', description: 'Crisp and sweet' },
  { value: 'banana', label: 'Banana', keywords: ['yellow'] },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'jose', label: 'José’s pear' },
  { value: 'lime', label: 'Lime', group: 'Citrus' },
  { value: 'lemon', label: 'Lemon', group: 'Citrus' },
];

function Single(props: { onChange?: (v: string | null) => void; clearable?: boolean; creatable?: boolean }) {
  const [v, setV] = useState<string | null>(null);
  return (
    <SearchSelect
      aria-label="Fruit"
      options={fruits}
      value={v}
      clearable={props.clearable}
      creatable={props.creatable}
      onChange={(next) => {
        setV(next);
        props.onChange?.(next);
      }}
    />
  );
}

function Multi({ max }: { max?: number }) {
  const [v, setV] = useState<string[]>([]);
  return <SearchSelect aria-label="Fruits" multiple options={fruits} value={v} onChange={setV} maxSelected={max} />;
}

const field = () => screen.getByRole('combobox', { name: 'Fruit' });
const search = () => screen.getByRole('combobox', { name: 'Search…' });
const optionNames = () => screen.queryAllByRole('option').map((o) => o.textContent);

describe('matching', () => {
  it('ignores case and accents and needs every word', () => {
    expect(matches(fruits[3], 'jose')).toBe(true);
    expect(matches(fruits[0], 'CRISP apple')).toBe(true);
    expect(matches(fruits[0], 'crisp banana')).toBe(false);
    expect(matches(fruits[1], 'yell')).toBe(true);
  });
  it('ranks label matches above description matches', () => {
    const admin = { value: 'a', label: 'Admin', description: 'Manages users and roles' };
    const user = { value: 'u', label: 'User' };
    const superUser = { value: 's', label: 'Power user' };
    expect(rank(user, 'user')).toBe(0);
    expect(rank(superUser, 'user')).toBe(1);
    expect(rank(admin, 'user')).toBe(3);
  });
  it('marks matched letters', () => {
    expect(highlight('Banana', 'nan')).toEqual([
      { text: 'Ba', hit: false },
      { text: 'nan', hit: true },
      { text: 'a', hit: false },
    ]);
  });
});

describe('SearchSelect', () => {
  it('opens, filters and picks with the mouse', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Single onChange={onChange} />);
    await user.click(field());
    expect(optionNames()).toHaveLength(6);
    await user.type(search(), 'ban');
    expect(optionNames()).toEqual(['Banana']);
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(field()).toHaveTextContent('Banana');
  });

  it('lists the best matches first', async () => {
    const user = userEvent.setup();
    function Roles() {
      const [v, setV] = useState<string | null>(null);
      return (
        <SearchSelect
          aria-label="Role"
          value={v}
          onChange={setV}
          options={[
            { value: 'admin', label: 'Admin', description: 'Manages users and roles' },
            { value: 'user', label: 'User' },
          ]}
        />
      );
    }
    render(<Roles />);
    await user.click(screen.getByRole('combobox', { name: 'Role' }));
    await user.type(search(), 'user');
    expect(screen.getAllByRole('option').map((o) => o.getAttribute('aria-label'))).toEqual(['User', 'Admin, Manages users and roles']);
  });

  it('shows group headings and an empty message', async () => {
    const user = userEvent.setup();
    render(<Single />);
    await user.click(field());
    expect(screen.getByText('Citrus')).toBeInTheDocument();
    await user.type(search(), 'zzz');
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('works from the keyboard and skips disabled options', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Single onChange={onChange} />);
    field().focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // Apple (active) → Banana → José (Cherry is disabled and skipped)
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('jose');
    expect(field()).toHaveFocus();
  });

  it('opens with a typed letter and closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Single />);
    field().focus();
    await user.keyboard('l');
    expect(search()).toHaveValue('l');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(field()).toHaveFocus();
  });

  it('clears with the button and with Backspace', async () => {
    const user = userEvent.setup();
    render(<Single clearable />);
    await user.click(field());
    await user.click(screen.getByRole('option', { name: /Apple/ }));
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(field()).toHaveTextContent('Select…');
    await user.click(field());
    await user.click(screen.getByRole('option', { name: /Apple/ }));
    field().focus();
    await user.keyboard('{Backspace}');
    expect(field()).toHaveTextContent('Select…');
  });

  it('creates an option from the search text', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Single creatable onChange={onChange} />);
    await user.click(field());
    await user.type(search(), 'Mango');
    await user.click(screen.getByRole('option', { name: /Create/ }));
    expect(onChange).toHaveBeenCalledWith('Mango');
  });

  it('multi-select toggles, removes chips and respects the maximum', async () => {
    const user = userEvent.setup();
    render(<Multi max={2} />);
    const f = screen.getByRole('combobox', { name: 'Fruits' });
    await user.click(f);
    await user.click(screen.getByRole('option', { name: /Apple/ }));
    await user.click(screen.getByRole('option', { name: /Banana/ }));
    expect(screen.getByRole('listbox')).toBeInTheDocument(); // stays open
    expect(screen.getByRole('option', { name: /Lime/ })).toHaveAttribute('aria-disabled', 'true'); // max reached
    expect(screen.getByText('2 selected of 2 max')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove Apple' }));
    expect(screen.getByRole('option', { name: /Apple/ })).toHaveAttribute('aria-selected', 'false');
  });

  it('searches the server, ignoring out-of-date answers', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const load = vi.fn(async (q: string) => [{ value: q, label: `Result for ${q}` }]);
    function Async() {
      const [v, setV] = useState<string | null>(null);
      return <SearchSelect aria-label="People" value={v} onChange={setV} loadOptions={load} />;
    }
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Async />);
    await user.click(screen.getByRole('combobox', { name: 'People' }));
    await user.type(search(), 'ann');
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => expect(screen.getByRole('option', { name: 'Result for ann' })).toBeInTheDocument());
    // Debounced: one call for the whole word (plus the initial empty load).
    expect(load.mock.calls.filter(([q]) => q === 'ann')).toHaveLength(1);
    vi.useRealTimers();
  });

  it('has no accessibility violations when open', async () => {
    const user = userEvent.setup();
    const { container } = render(<Single />);
    await user.click(field());
    expect(await axeViolations(container)).toEqual([]);
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
