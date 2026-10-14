import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Providers } from '../../test/providers';
import {
  ChatPanel,
  CodeBlock,
  KanbanBoard,
  Lightbox,
  MentionInput,
  mentionedIn,
  NotificationCenter,
  RichTextEditor,
  Scheduler,
  Select,
  type ChatMessage,
  type NotificationItem,
} from './index';

const wrap = (ui: React.ReactElement) => render(<Providers>{ui}</Providers>);
const PEOPLE = [
  { id: 'a', name: 'Amara Perera' },
  { id: 'k', name: 'Kasun Silva' },
];

describe('Select', () => {
  it('reports the picked value and shows groups', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    wrap(
      <Select
        aria-label="Zone"
        placeholder="Pick one"
        onChange={onChange}
        options={[
          { label: 'Asia', options: [{ value: 'colombo', label: 'Colombo' }] },
          { value: 'utc', label: 'UTC' },
        ]}
      />,
    );
    const sel = screen.getByRole('combobox', { name: 'Zone' });
    await user.selectOptions(sel, 'colombo');
    expect(onChange).toHaveBeenCalledWith('colombo');
    expect(screen.getByRole('group', { name: 'Asia' })).toBeInTheDocument();
  });
});

describe('MentionInput', () => {
  function Harness({ onSubmit }: { onSubmit?: (v: string) => void }) {
    const [v, setV] = useState('');
    return <MentionInput value={v} onChange={setV} people={PEOPLE} submitOnEnter onSubmit={onSubmit} />;
  }
  it('suggests people after @ and inserts the picked name', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    wrap(<Harness onSubmit={onSubmit} />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    await user.type(box, 'Hi @ka');
    expect(screen.getByRole('option', { name: /Kasun Silva/ })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Enter}');
    expect(box).toHaveValue('Hi @Kasun Silva ');
    expect(onSubmit).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('Hi @Kasun Silva ', [PEOPLE[1]]);
  });
  it('finds who was mentioned', () => {
    expect(mentionedIn('ping @Amara Perera', PEOPLE).map((p) => p.id)).toEqual(['a']);
  });
});

describe('ChatPanel', () => {
  const ME = { id: 'me', name: 'Me' };
  const now = Date.now();
  const MSGS: ChatMessage[] = [
    { id: '1', author: { id: 'a', name: 'Amara Perera' }, text: 'Hello @Kasun Silva', at: new Date(now - 120_000).toISOString() },
    { id: '2', author: { id: 'a', name: 'Amara Perera' }, text: 'Second', at: new Date(now - 60_000).toISOString() },
    { id: '3', author: ME, text: 'Hi', at: new Date(now).toISOString(), status: 'read' },
  ];
  it('groups messages, marks mentions and sends', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    const { container } = wrap(<ChatPanel messages={MSGS} me="me" people={PEOPLE} onSend={onSend} typing={['Kasun Silva']} />);
    expect(container.querySelectorAll('.chat-msg.is-grouped')).toHaveLength(1);
    expect(container.querySelector('.chat-mention')).toHaveTextContent('@Kasun Silva');
    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(screen.getByText('Kasun Silva is typing…')).toBeInTheDocument();
    expect(screen.getByRole('log', { name: 'Messages' })).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Thanks{Enter}');
    expect(onSend).toHaveBeenCalledWith('Thanks', []);
  });
});

describe('NotificationCenter', () => {
  const ITEMS: NotificationItem[] = [
    { id: '1', title: 'Order shipped', at: new Date().toISOString() },
    { id: '2', title: 'Old news', at: '2020-01-01T10:00:00Z', read: true },
  ];
  it('shows the unread count and marks everything read', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [items, setItems] = useState(ITEMS);
      return <NotificationCenter items={items} onReadAll={() => setItems((l) => l.map((x) => ({ ...x, read: true })))} />;
    }
    wrap(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Notifications, 1 unread' }));
    const panel = screen.getByRole('dialog', { name: 'Notifications' });
    expect(within(panel).getByRole('region', { name: 'Today' })).toHaveTextContent('Order shipped');
    expect(within(panel).getByRole('region', { name: 'Earlier' })).toHaveTextContent('Old news');
    await user.click(within(panel).getByRole('button', { name: 'Unread 1' }));
    expect(within(panel).queryByText('Old news')).toBeNull();
    await user.click(within(panel).getByRole('button', { name: /Mark all read/ }));
    expect(within(panel).getByText('No unread notifications.')).toBeInTheDocument();
  });
});

describe('KanbanBoard', () => {
  it('renders columns with counts and flags a passed limit', () => {
    wrap(
      <KanbanBoard
        aria-label="Board"
        columns={[
          { id: 'a', title: 'To do' },
          { id: 'b', title: 'Doing', limit: 1 },
        ]}
        items={[
          { id: '1', column: 'a', title: 'One' },
          { id: '2', column: 'b', title: 'Two' },
          { id: '3', column: 'b', title: 'Three' },
        ]}
        getLabel={(i) => i.title}
        renderCard={(i) => i.title}
        onChange={() => {}}
        onAdd={() => {}}
      />,
    );
    const doing = screen.getByRole('group', { name: 'Doing' });
    expect(within(doing).getByText('(over the limit)', { exact: false })).toBeInTheDocument();
    expect(within(doing).getAllByRole('button', { name: /Two|Three/ })).toHaveLength(2);
    expect(within(screen.getByRole('group', { name: 'To do' })).getByRole('button', { name: 'One' })).toHaveAttribute(
      'aria-roledescription',
      'draggable card',
    );
    expect(screen.getAllByRole('button', { name: 'Add card' })).toHaveLength(2);
  });
});

describe('Scheduler', () => {
  const day = new Date(2026, 2, 11); // Wed 11 March 2026
  const events = [
    { id: 'e1', title: 'Review', start: new Date(2026, 2, 11, 10).toISOString(), end: new Date(2026, 2, 11, 11).toISOString() },
    { id: 'e2', title: 'Fair', start: '2026-03-12', end: '2026-03-14', allDay: true },
  ];
  it('shows a month, moves between months and switches to the week', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    wrap(<Scheduler events={events} defaultDate={day} onEventClick={onEventClick} />);
    expect(screen.getByRole('heading', { name: 'March 2026' })).toBeInTheDocument();
    // The all-day event covers the 12th and 13th, not the 14th (it ends at midnight).
    expect(screen.getAllByRole('button', { name: 'Fair, all day' })).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: /^Review, / }));
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
    await user.click(screen.getByRole('button', { name: 'Week' }));
    expect(screen.getByRole('button', { name: 'Week' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^Review, / })).toHaveStyle({ top: `${3 * 48}px` });
    await user.click(screen.getByRole('button', { name: 'Month' }));
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('heading', { name: 'April 2026' })).toBeInTheDocument();
  });
});

describe('CodeBlock', () => {
  it('shows the code and copies it', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    wrap(<CodeBlock code={'const a = 1;\n'} lang="ts" filename="a.ts" />);
    expect(screen.getByText('a.ts')).toBeInTheDocument();
    expect(screen.getByText('const a = 1;', { exact: false })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(writeText).toHaveBeenCalledWith('const a = 1;');
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });
});

describe('Lightbox', () => {
  it('moves between items with the arrow keys and closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    wrap(
      <Lightbox
        open
        onClose={onClose}
        items={[
          { src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', alt: 'First picture', title: 'One' },
          { src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', alt: 'Second picture', title: 'Two' },
        ]}
      />,
    );
    const dialog = screen.getByRole('dialog', { name: 'One' });
    expect(within(dialog).getByText('1 / 2', { exact: false })).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Two' })).toBeInTheDocument());
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('RichTextEditor', () => {
  it('loads the editor with its toolbar and content', async () => {
    const onChange = vi.fn();
    wrap(<RichTextEditor aria-label="Body" value="<p>Hello <strong>world</strong></p>" onChange={onChange} />);
    const toolbar = await screen.findByRole('toolbar', { name: 'Formatting' }, { timeout: 5000 });
    expect(within(toolbar).getByRole('button', { name: 'Bold' })).toBeInTheDocument();
    expect(
      within(toolbar)
        .getAllByRole('button')
        .filter((b) => b.tabIndex === 0),
    ).toHaveLength(1);
    await act(async () => {});
    expect(screen.getByRole('textbox', { name: 'Body' })).toHaveTextContent('Hello world');
  });
});
