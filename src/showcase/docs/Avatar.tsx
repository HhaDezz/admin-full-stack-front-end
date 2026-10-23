import { Avatar, AvatarGroup } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Avatar.tsx?raw';

const TEAM = [
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Katherine Johnson',
  'Linus Torvalds',
  'Margaret Hamilton',
  'Dennis Ritchie',
].map((name) => ({ name }));

// #region sizes
export function Sizes() {
  return (
    <div className="ex-row">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Avatar key={s} name="Grace Hopper" size={s} />
      ))}
      <Avatar name="Grace Hopper" size="lg" shape="square" />
    </div>
  );
}
// #endregion

// #region status
export function Status() {
  return (
    <div className="ex-row">
      <Avatar name="Ada Lovelace" size="lg" status="online" labelled />
      <Avatar name="Alan Turing" size="lg" status="away" labelled />
      <Avatar name="Katherine Johnson" size="lg" status="busy" labelled />
      <Avatar name="Linus Torvalds" size="lg" status="offline" labelled />
      <Avatar name="Broken Image" size="lg" src="/does-not-exist.png" labelled />
    </div>
  );
}
// #endregion

// #region group
export function Group() {
  return (
    <div className="ex-col" style={{ alignItems: 'center' }}>
      <AvatarGroup people={TEAM} max={4} aria-label="Project team" />
      <AvatarGroup people={TEAM.slice(0, 3)} size="md" aria-label="Reviewers" />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Avatar',
  group: 'Data display',
  status: 'updated',
  imports: ['Avatar', 'AvatarGroup'],
  description: 'A photo or initials with a stable colour per name, a presence dot, and stacked groups with a “+N” overflow.',
  raw,
  playground: {
    controls: [
      { type: 'text', name: 'name', default: 'Grace Hopper' },
      { type: 'select', name: 'size', options: ['xs', 'sm', 'md', 'lg', 'xl'], default: 'xl' },
      { type: 'select', name: 'status', options: ['none', 'online', 'away', 'busy', 'offline'], default: 'online' },
      { type: 'select', name: 'shape', options: ['circle', 'square'], default: 'circle' },
    ],
    render: (v) => (
      <Avatar
        name={String(v.name) || '?'}
        size={v.size as 'md'}
        status={v.status === 'none' ? undefined : (v.status as 'online')}
        shape={v.shape as 'circle'}
        labelled
      />
    ),
    code: (p) => jsx('Avatar', p, { size: 'md', status: 'none', shape: 'circle' }),
  },
  examples: [
    { id: 'sizes', title: 'Sizes and shapes', description: 'Five sizes or any pixel number.', Component: Sizes },
    {
      id: 'status',
      title: 'Presence and fallback',
      description: 'If the image fails to load, initials take its place.',
      Component: Status,
    },
    { id: 'group', title: 'Group', description: 'Shows the first few and counts the rest.', Component: Group },
  ],
  a11y: [
    'Decorative by default, because a name usually sits beside it. Pass labelled when it stands alone; the presence is then read as well (“Ada Lovelace, online”).',
    'AvatarGroup is a labelled group. Without an aria-label it names everyone, including the people hidden behind +N.',
  ],
  props: [
    { name: 'name', type: 'string', description: 'Used for initials, colour and the label.' },
    { name: 'src', type: 'string', description: 'Photo URL.' },
    { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | number", defaultValue: "'md'", description: 'Size.' },
    { name: 'status', type: "'online' | 'away' | 'busy' | 'offline'", description: 'Presence dot.' },
    { name: 'shape', type: "'circle' | 'square'", defaultValue: "'circle'", description: 'Shape.' },
    { name: 'labelled', type: 'boolean', defaultValue: 'false', description: 'Announce the name.' },
  ],
});
