import { Kbd } from '@/components/kit';
import { defineDoc } from '../doc';
import raw from './Kbd.tsx?raw';

// #region combos
export function Combos() {
  return (
    <div className="ex-col" style={{ width: 'min(360px, 100%)' }}>
      {[
        [['mod', 'K'], 'Search'],
        [['mod', 'shift', 'P'], 'Command palette'],
        [['esc'], 'Close'],
        [['up', 'down'], 'Move'],
        [['enter'], 'Open'],
      ].map(([keys, what]) => (
        <div key={what as string} className="ex-row" style={{ justifyContent: 'space-between' }}>
          <span>{what as string}</span>
          <Kbd keys={keys as string[]} />
        </div>
      ))}
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Kbd',
  group: 'Data display',
  status: 'new',
  description: 'Keyboard keys. “mod” shows ⌘ on a Mac and Ctrl everywhere else, so one line of code is right on every computer.',
  raw,
  playground: {
    controls: [{ type: 'text', name: 'keys', default: 'mod shift K' }],
    render: (v) => <Kbd keys={String(v.keys).split(/\s+/).filter(Boolean)} />,
    code: ({ keys }) => `<Kbd keys={${JSON.stringify(String(keys).split(/\s+/).filter(Boolean)).replace(/,/g, ', ')}} />`,
  },
  examples: [
    { id: 'combos', title: 'Shortcuts', description: 'Arrow keys, Enter and Esc get their symbols automatically.', Component: Combos },
  ],
  props: [
    {
      name: 'keys',
      type: 'string[]',
      description: 'Keys in the combination; mod, cmd, ctrl, alt, shift, enter, esc, arrows, tab, space, backspace become symbols.',
    },
    { name: 'children', type: 'ReactNode', description: 'A single key, written as text.' },
  ],
});
