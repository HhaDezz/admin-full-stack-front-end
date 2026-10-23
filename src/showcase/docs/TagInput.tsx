import { useState } from 'react';
import { Field, TagInput } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './TagInput.tsx?raw';

// #region keywords
export function Keywords() {
  const [tags, setTags] = useState(['linen', 'summer', 'new-in']);
  return (
    <div className="ex-col">
      <Field label="Keywords" hint={`${tags.length} of 8. Press Enter or a comma to add.`}>
        <TagInput value={tags} onChange={setTags} max={8} lowercase placeholder="Add a keyword" />
      </Field>
    </div>
  );
}
// #endregion

// #region emails
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Emails() {
  return (
    <div className="ex-col">
      <Field label="Invite people" hint="Paste a list: commas, semicolons and new lines all split it.">
        <TagInput
          defaultValue={['alex@example.com']}
          validate={(t) => (EMAIL.test(t) ? null : `“${t}” isn’t an email address`)}
          placeholder="name@company.com"
        />
      </Field>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'TagInput',
  group: 'Form inputs',
  status: 'new',
  description:
    'Type values and they become removable tags: keywords, emails to invite, allowed domains. Validation, limits and pasting lists.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'max', default: 0, min: 0, max: 10 },
      { type: 'select', name: 'size', options: ['sm', 'md'], default: 'md' },
      { type: 'boolean', name: 'lowercase', default: false },
      { type: 'boolean', name: 'allowDuplicates', default: false },
      { type: 'boolean', name: 'invalid', default: false },
      { type: 'boolean', name: 'disabled', default: false },
      { type: 'text', name: 'placeholder', default: 'Add…' },
    ],
    render: (v) => (
      <div style={{ width: 'min(420px, 100%)' }}>
        <TagInput
          aria-label="Playground tags"
          defaultValue={['design', 'react']}
          max={Number(v.max) || undefined}
          size={v.size as 'md'}
          lowercase={!!v.lowercase}
          allowDuplicates={!!v.allowDuplicates}
          invalid={!!v.invalid}
          disabled={!!v.disabled}
          placeholder={String(v.placeholder)}
        />
      </div>
    ),
    code: (p) =>
      jsx(
        'TagInput',
        p,
        { max: 0, size: 'md', lowercase: false, allowDuplicates: false, invalid: false, disabled: false, placeholder: 'Add…' },
        undefined,
        ['value={tags}', 'onChange={setTags}'],
      ),
  },
  examples: [
    {
      id: 'keywords',
      title: 'Keywords with a limit',
      description: 'max stops adding at the limit; lowercase keeps tags tidy.',
      Component: Keywords,
    },
    {
      id: 'emails',
      title: 'Validated emails',
      description: 'validate returns a message to refuse a tag; the text stays so it can be fixed.',
      Component: Emails,
    },
  ],
  keyboard: [
    ['Enter / , / ;', 'Add the typed text as a tag'],
    ['Backspace', 'In an empty box: remove the last tag'],
    ['Tab', 'Reach each tag’s remove button'],
  ],
  a11y: [
    'Each tag’s remove button is named “Remove <tag>”.',
    'The list is named with the count, e.g. “Keywords: 3 added”.',
    'A refused tag’s reason appears under the input as an alert, and the text stays so it can be fixed.',
  ],
  props: [
    { name: 'value / defaultValue', type: 'string[]', description: 'The tags.' },
    { name: 'onChange', type: '(tags: string[]) => void', description: 'Every add or remove.' },
    { name: 'validate', type: '(tag) => string | null', description: 'Return a message to refuse a tag.' },
    { name: 'max', type: 'number', description: 'Most tags allowed.' },
    { name: 'separators', type: 'string[]', defaultValue: "[',', ';']", description: 'Keys that finish a tag besides Enter.' },
    { name: 'lowercase', type: 'boolean', defaultValue: 'false', description: 'Lower-case every tag.' },
    { name: 'allowDuplicates', type: 'boolean', defaultValue: 'false', description: 'Allow the same tag twice.' },
    { name: 'size', type: "'sm' | 'md'", defaultValue: "'md'", description: 'Height.' },
    { name: 'placeholder / disabled / invalid', type: '…', description: 'As on Input.' },
  ],
});
