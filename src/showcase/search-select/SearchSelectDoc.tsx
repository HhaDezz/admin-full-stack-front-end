import { useState } from 'react';
import { Badge } from '../../components/ui';
import { SearchSelect } from '../../components/search-select';
import { DocSection, ExampleBlock, PropsTable, type Example, type PropRow } from '../DocParts';
import { countries } from './examples/data';
import AsyncSearch from './examples/AsyncSearch';
import asyncCode from './examples/AsyncSearch.tsx?raw';
import Basic from './examples/Basic';
import basicCode from './examples/Basic.tsx?raw';
import Creatable from './examples/Creatable';
import creatableCode from './examples/Creatable.tsx?raw';
import Grouped from './examples/Grouped';
import groupedCode from './examples/Grouped.tsx?raw';
import InModal from './examples/InModal';
import inModalCode from './examples/InModal.tsx?raw';
import LargeList from './examples/LargeList';
import largeCode from './examples/LargeList.tsx?raw';
import MultiChips from './examples/MultiChips';
import multiCode from './examples/MultiChips.tsx?raw';
import RichOptions from './examples/RichOptions';
import richCode from './examples/RichOptions.tsx?raw';
import States from './examples/States';
import statesCode from './examples/States.tsx?raw';

const examples: Example[] = [
  { id: 'basic', title: 'Basic', description: 'Single choice with a search box and a clear button.', Component: Basic, code: basicCode },
  {
    id: 'rich',
    title: 'Icons and descriptions',
    description: 'Flags, a second line and hidden keywords. Try “USA”, “Nippon” or “Colombo”.',
    Component: RichOptions,
    code: richCode,
  },
  { id: 'grouped', title: 'Grouped', description: 'Headings by region; one option disabled.', Component: Grouped, code: groupedCode },
  {
    id: 'multi',
    title: 'Multi-select with chips',
    description: 'Stays open while picking; chips, “+N”, Select all and Clear.',
    Component: MultiChips,
    code: multiCode,
  },
  {
    id: 'async',
    title: 'Server search',
    description: 'Debounced search against a (pretend) API of 10,000 people.',
    Component: AsyncSearch,
    code: asyncCode,
  },
  {
    id: 'creatable',
    title: 'Create new options',
    description: 'Type a tag that doesn’t exist yet and create it.',
    Component: Creatable,
    code: creatableCode,
  },
  {
    id: 'states',
    title: 'Sizes and states',
    description: 'Small, medium, disabled and error with a message.',
    Component: States,
    code: statesCode,
  },
  {
    id: 'modal',
    title: 'Inside a modal',
    description: 'The menu is rendered in a portal, so dialogs never clip it.',
    Component: InModal,
    code: inModalCode,
  },
  {
    id: 'large',
    title: '10,000 options',
    description: 'Virtual scrolling draws only the visible rows.',
    Component: LargeList,
    code: largeCode,
  },
];

const props: PropRow[] = [
  { name: 'options', type: 'SelectOption[]', description: 'Options: value, label, description?, group?, icon?, disabled?, keywords?' },
  { name: 'value', type: 'V | null  ·  V[]', description: 'Selected value (an array when multiple).' },
  { name: 'onChange', type: '(value, option) => void', description: 'Called with the new value and the matching option(s).' },
  { name: 'multiple', type: 'boolean', defaultValue: 'false', description: 'Allow several choices; shows chips and a footer.' },
  {
    name: 'loadOptions',
    type: '(query) => Promise<SelectOption[]>',
    description: 'Server search, called 250 ms after typing stops; out-of-date answers are ignored.',
  },
  { name: 'searchable', type: 'boolean', defaultValue: 'true', description: 'Show the search box in the menu.' },
  { name: 'clearable', type: 'boolean', defaultValue: 'false', description: 'Show a × button when something is selected.' },
  { name: 'creatable', type: 'boolean', defaultValue: 'false', description: 'Offer “Create …” when nothing matches exactly.' },
  { name: 'onCreate', type: '(text) => SelectOption | void | Promise', description: 'Save the new option; return it to select it.' },
  { name: 'maxSelected', type: 'number', description: 'Multi: the most options that can be chosen.' },
  { name: 'maxChips', type: 'number', defaultValue: '3', description: 'Multi: chips shown before “+N”.' },
  { name: 'size', type: "'sm' | 'md'", defaultValue: "'md'", description: 'Control height.' },
  { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Not interactive.' },
  {
    name: 'error',
    type: 'boolean | string',
    description: 'Red border; a string is shown under the field and linked with aria-describedby.',
  },
  { name: 'placeholder / searchPlaceholder', type: 'string', defaultValue: "'Select…' / 'Search…'", description: 'Empty-state texts.' },
  { name: 'emptyText', type: 'string', defaultValue: "'No matches'", description: 'Shown when nothing matches.' },
  { name: 'renderOption', type: '(option, state) => ReactNode', description: 'Custom option row.' },
  { name: 'minWidth / fullWidth', type: 'number / boolean', description: 'Sizing for toolbars and forms.' },
  { name: 'maxMenuHeight', type: 'number', defaultValue: '320', description: 'Tallest the list may grow.' },
  { name: 'name', type: 'string', description: 'Adds hidden inputs so the value posts with a normal form.' },
  { name: 'aria-label / aria-labelledby', type: 'string', description: 'Accessible name. One of them is required.' },
];

const keys: [string, string][] = [
  ['↓  Enter  Space (on the field)', 'Open the menu'],
  ['Any letter (on the field)', 'Open the menu and start searching'],
  ['↑ ↓  Page Up  Page Down', 'Move through options, skipping disabled ones'],
  ['Home  End', 'First / last option (when the search box is empty)'],
  ['Enter', 'Pick the highlighted option, or create'],
  ['Esc', 'Close and return focus to the field'],
  ['Backspace (on the closed field)', 'Remove the last chip, or clear a single value when clearable'],
  ['Tab', 'Close and move on'],
];

function Playground() {
  const [multiple, setMultiple] = useState(false);
  const [searchable, setSearchable] = useState(true);
  const [clearable, setClearable] = useState(true);
  const [creatable, setCreatable] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState(false);
  const [size, setSize] = useState<'sm' | 'md'>('md');
  const [one, setOne] = useState<string | null>('jp');
  const [many, setMany] = useState<string[]>(['jp', 'lk']);
  const common = {
    options: countries,
    searchable,
    clearable,
    creatable,
    disabled,
    size,
    error: error ? 'Something needs fixing' : false,
    minWidth: 300,
  } as const;
  const toggles: [string, boolean, (v: boolean) => void][] = [
    ['multiple', multiple, setMultiple],
    ['searchable', searchable, setSearchable],
    ['clearable', clearable, setClearable],
    ['creatable', creatable, setCreatable],
    ['disabled', disabled, setDisabled],
    ['error', error, setError],
  ];
  return (
    <div className="card playground">
      <div className="playground-stage">
        {multiple ? (
          <SearchSelect aria-label="Playground" multiple value={many} onChange={setMany} {...common} />
        ) : (
          <SearchSelect aria-label="Playground" value={one} onChange={setOne} {...common} />
        )}
      </div>
      <div className="playground-controls" role="group" aria-label="Playground options">
        {toggles.map(([label, on, set]) => (
          <button key={label} type="button" className="pick mono" aria-pressed={on} onClick={() => set(!on)}>
            {label}
          </button>
        ))}
        <button type="button" className="pick mono" aria-pressed={size === 'sm'} onClick={() => setSize(size === 'sm' ? 'md' : 'sm')}>
          size: {size}
        </button>
      </div>
    </div>
  );
}

export default function SearchSelectDoc() {
  return (
    <div className="doc">
      <div className="page-head">
        <div>
          <div className="chips" style={{ marginBottom: 10 }}>
            <Badge tone="ok">New</Badge>
            <Badge>Form inputs</Badge>
          </div>
          <h1>SearchSelect</h1>
          <p>
            A searchable dropdown for picking one or many options. It filters as you type, highlights matches, ignores case and accents, and
            handles server search, new options, groups and lists of 10,000.
          </p>
        </div>
      </div>

      <nav className="doc-toc" aria-label="On this page">
        {[
          ['playground', 'Playground'],
          ['examples', 'Examples'],
          ['keyboard', 'Keyboard'],
          ['accessibility', 'Accessibility'],
          ['props', 'Props'],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`}>
            {label}
          </a>
        ))}
      </nav>

      <DocSection id="playground" title="Playground">
        <Playground />
      </DocSection>

      <DocSection id="examples" title="Examples">
        <div className="ex-list">
          {examples.map((e) => (
            <ExampleBlock key={e.id} example={e} />
          ))}
        </div>
      </DocSection>

      <DocSection id="keyboard" title="Keyboard">
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(([k, a]) => (
                <tr key={k}>
                  <td>
                    {k.split('  ').map((part) => (
                      <kbd key={part} className="kbd">
                        {part}
                      </kbd>
                    ))}
                  </td>
                  <td>{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id="accessibility" title="Accessibility">
        <ul className="doc-list">
          <li>
            The field is an ARIA combobox (<code>aria-expanded</code>, <code>aria-controls</code>); the search box owns{' '}
            <code>aria-activedescendant</code>, so screen readers announce the highlighted option.
          </li>
          <li>
            Options use <code>role="option"</code> with <code>aria-selected</code>; the list sets <code>aria-multiselectable</code> in multi
            mode.
          </li>
          <li>The number of results is announced as you type through a polite live region.</li>
          <li>
            Clear and remove buttons have labels (“Clear selection”, “Remove Japan”); errors are linked with <code>aria-describedby</code>.
          </li>
          <li>Focus returns to the field after picking or pressing Esc. Motion is reduced to a fade when the user asks for less motion.</li>
        </ul>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={props} />
      </DocSection>
    </div>
  );
}
