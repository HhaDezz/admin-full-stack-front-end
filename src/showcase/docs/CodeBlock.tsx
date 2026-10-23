import { CodeBlock } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './CodeBlock.tsx?raw';

const SAMPLE = `import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useUsers(page: number) {
  return useQuery({
    queryKey: ['users', page],
    queryFn: () => api.get(\`/users?page=\${page}\`),
    staleTime: 30_000,
  });
}`;

// #region basic
export function Basic() {
  return <CodeBlock code={SAMPLE} lang="ts" filename="src/lib/useUsers.ts" showLineNumbers highlightLines={[6, 7]} />;
}
// #endregion

// #region tabs
export function Tabs() {
  return (
    <CodeBlock
      files={[
        {
          name: 'UserController.java',
          lang: 'java',
          code: '@GetMapping("/users/{id}")\npublic UserDto get(@PathVariable Long id) {\n  return users.find(id);\n}',
        },
        { name: 'application.yml', lang: 'yaml', code: 'server:\n  port: 8080\nspring:\n  jpa:\n    open-in-view: false' },
        { name: 'terminal', lang: 'bash', code: 'npm install\nnpm run dev' },
      ]}
    />
  );
}
// #endregion

export default defineDoc({
  name: 'CodeBlock',
  group: 'Data display',
  status: 'new',
  description:
    'Code with syntax colours for light and dark themes, a copy button, file tabs, line numbers and marked lines. The highlighter (Shiki) and each language load only when a block is shown.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'lang', options: ['ts', 'tsx', 'json', 'css', 'bash', 'java', 'sql', 'text'], default: 'ts' },
      { type: 'boolean', name: 'showLineNumbers', default: false },
      { type: 'boolean', name: 'wrap', default: false },
      { type: 'boolean', name: 'copyable', default: true },
    ],
    render: (v) => (
      <CodeBlock
        key={String(v.wrap)}
        code={SAMPLE}
        lang={String(v.lang)}
        showLineNumbers={!!v.showLineNumbers}
        wrap={!!v.wrap}
        copyable={!!v.copyable}
      />
    ),
    code: (p) => jsx('CodeBlock', p, { lang: 'tsx', showLineNumbers: false, wrap: false, copyable: true }, undefined, ['code={source}']),
  },
  examples: [
    {
      id: 'basic',
      title: 'File name, numbers and marks',
      description: 'highlightLines marks lines by number, e.g. the ones a guide talks about.',
      Component: Basic,
    },
    { id: 'tabs', title: 'Several files', description: 'files shows tabs; each file has its own language.', Component: Tabs },
  ],
  keyboard: [
    ['Tab', 'The code area takes focus so it can scroll with the arrow keys'],
    ['Left / Right', 'Between file tabs'],
  ],
  a11y: [
    'Plain text shows straight away and is swapped for the coloured version when it’s ready, so nothing jumps and screen readers read the same text.',
    'Line numbers come from CSS, so they aren’t copied or read out.',
    'Copy announces “Copied”. File tabs follow the tabs pattern. Code is always left-to-right, even in right-to-left pages.',
    'Both colour themes meet contrast on their backgrounds (GitHub light and dark).',
  ],
  props: [
    { name: 'code', type: 'string', description: 'The source.' },
    {
      name: 'lang',
      type: 'string',
      defaultValue: "'tsx'",
      description: 'tsx, ts, jsx, js, json, css, html, bash, java, sql, yaml, properties or text.',
    },
    { name: 'filename', type: 'string', description: 'Shown above the code.' },
    { name: 'files', type: '{ name, code, lang? }[]', description: 'Tabs instead of one file.' },
    { name: 'showLineNumbers', type: 'boolean', defaultValue: 'false', description: 'Numbers down the side.' },
    { name: 'highlightLines', type: 'number[]', description: 'Lines to mark, from 1.' },
    { name: 'maxHeight', type: 'number', defaultValue: '480', description: 'Taller code scrolls.' },
    { name: 'wrap', type: 'boolean', defaultValue: 'false', description: 'Start with long lines wrapped.' },
    { name: 'copyable', type: 'boolean', defaultValue: 'true', description: 'Copy button.' },
  ],
});
