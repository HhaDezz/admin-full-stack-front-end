import { Accordion, Badge } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Accordion.tsx?raw';

const FAQ = [
  {
    value: 'licence',
    title: 'Can I use this for a client project?',
    content:
      'Yes. The single licence covers one end product for you or one client. Use the extended licence when the end users pay for it.',
  },
  {
    value: 'backend',
    title: 'Do I need the Spring Boot back end?',
    content: 'No. Demo mode runs entirely in the browser, and the API layer is one file you can point at any back end.',
  },
  {
    value: 'updates',
    title: 'How do updates work?',
    content: 'Every release is a tagged version with a changelog. Download the new zip from your purchase email.',
    meta: (
      <Badge tone="info" size="sm">
        New
      </Badge>
    ),
  },
  { value: 'refunds', title: 'Refunds', content: 'Not available for downloaded source code.', disabled: true },
];

// #region single
export function Single() {
  return (
    <div className="ex-wide" style={{ maxWidth: 640 }}>
      <Accordion items={FAQ} defaultOpen={['licence']} />
    </div>
  );
}
// #endregion

// #region separated
export function Separated() {
  return (
    <div className="ex-wide" style={{ maxWidth: 640 }}>
      <Accordion items={FAQ.slice(0, 3)} multiple variant="separated" />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Accordion',
  group: 'Data display',
  status: 'new',
  description: 'Sections that expand and collapse with a height animation. One open at a time, or several.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'variant', options: ['separated', 'joined'], default: 'separated' },
      { type: 'boolean', name: 'multiple', default: false },
      { type: 'select', name: 'headingLevel', options: ['2', '3', '4'], default: '3' },
    ],
    render: (v) => (
      <div style={{ width: 'min(560px, 100%)' }}>
        <Accordion
          key={String(v.multiple)}
          variant={v.variant as 'joined'}
          multiple={!!v.multiple}
          headingLevel={Number(v.headingLevel) as 3}
          defaultOpen={['a']}
          items={[
            { value: 'a', title: 'Who can see audit logs?', content: 'Anyone with the audit-view permission.' },
            { value: 'b', title: 'Can I export users?', content: 'Yes, as CSV from the Users table.' },
            { value: 'c', title: 'Is two-step sign-in required?', content: 'Admins can make it required for their team.' },
          ]}
        />
      </div>
    ),
    code: ({ headingLevel, ...p }) =>
      jsx(
        'Accordion',
        { ...p, headingLevel: Number(headingLevel) },
        { variant: 'separated', multiple: false, headingLevel: 3 },
        undefined,
        ['items={items}'],
      ),
  },
  examples: [
    {
      id: 'single',
      title: 'Joined, one at a time',
      description: 'Opening one closes the others. The last item is disabled.',
      Component: Single,
    },
    { id: 'separated', title: 'Separated, several open', description: 'multiple lets any number stay open.', Component: Separated },
  ],
  keyboard: [
    ['Enter', 'Open or close the focused section'],
    ['Space', 'Open or close the focused section'],
    ['Down', 'Next header'],
    ['Up', 'Previous header'],
    ['Home', 'First header'],
    ['End', 'Last header'],
  ],
  a11y: [
    'Each header is a button inside a heading (level set by headingLevel), with aria-expanded and aria-controls pointing at its region.',
  ],
  props: [
    { name: 'items', type: 'AccordionItem[]', description: '{ value, title, content, meta?, disabled? }' },
    { name: 'multiple', type: 'boolean', defaultValue: 'false', description: 'Allow several open.' },
    { name: 'defaultOpen', type: 'string[]', defaultValue: '[]', description: 'Values open at first.' },
    { name: 'variant', type: "'joined' | 'separated'", defaultValue: "'joined'", description: 'One box, or one card per item.' },
    { name: 'headingLevel', type: '2 | 3 | 4', defaultValue: '3', description: 'Heading level of each header.' },
  ],
});
