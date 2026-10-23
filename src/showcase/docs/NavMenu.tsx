import { Boxes, FileText, LayoutDashboard, Settings, Users } from 'lucide-react';
import { NavMenu } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './NavMenu.tsx?raw';

// #region basic
export function Basic() {
  const can = (perm: string) => perm !== 'billing-view';
  return (
    <div className="sidebar demo-sidebar">
      <NavMenu
        aria-label="Demo"
        can={can}
        sections={[
          {
            label: 'Workspace',
            items: [
              { to: '/ui/nav-menu', label: 'Overview', icon: <LayoutDashboard size={19} /> },
              { to: '/ui', label: 'Customers', icon: <Users size={19} />, badge: 12 },
              {
                label: 'Catalogue',
                icon: <Boxes size={19} />,
                children: [
                  { to: '/ui/tabs', label: 'Products' },
                  { to: '/ui/steps', label: 'Collections', badge: 'New' },
                  { to: '/ui/badge', label: 'Inventory' },
                ],
              },
              { to: '/ui/card', label: 'Invoices', icon: <FileText size={19} />, perm: 'billing-view' },
            ],
          },
          { label: 'Admin', items: [{ to: '/ui/switch', label: 'Settings', icon: <Settings size={19} /> }] },
        ]}
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'NavMenu',
  group: 'Navigation',
  status: 'new',
  imports: ['NavMenu', 'type NavMenuSection'],
  description:
    'The sidebar menu: sections, icons, badges, collapsible nested groups and items that hide when the user lacks a permission. The app’s own sidebar is built with it.',
  raw,
  playground: {
    controls: [
      { type: 'boolean', name: 'collapsed', default: false },
      { type: 'boolean', name: 'sectionLabels', default: true },
      { type: 'boolean', name: 'badges', default: true },
    ],
    render: (v) => (
      <div className={`sidebar demo-sidebar ${v.collapsed ? 'is-collapsed' : ''}`} style={{ width: v.collapsed ? 76 : 240 }}>
        <NavMenu
          collapsed={!!v.collapsed}
          aria-label="Playground navigation"
          sections={[
            {
              label: v.sectionLabels ? 'Workspace' : undefined,
              items: [
                { to: '/ui/nav-menu#a', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
                { to: '/ui/nav-menu#b', label: 'Users', icon: <Users size={19} />, badge: v.badges ? 12 : undefined },
                { to: '/ui/nav-menu#c', label: 'Products', icon: <Boxes size={19} /> },
              ],
            },
            {
              label: v.sectionLabels ? 'Account' : undefined,
              items: [{ to: '/ui/nav-menu#d', label: 'Settings', icon: <Settings size={19} /> }],
            },
          ]}
        />
      </div>
    ),
    code: ({ collapsed }) => jsx('NavMenu', { collapsed }, { collapsed: false }, undefined, ['sections={sections}', 'can={can}']),
  },
  examples: [
    {
      id: 'basic',
      title: 'Sections, badges and a nested group',
      description:
        '“Invoices” is hidden because can("billing-view") is false. Groups open automatically when one of their pages is active.',
      Component: Basic,
    },
  ],
  a11y: [
    'A labelled nav of links (NavLink sets aria-current="page"); group toggles are buttons with aria-expanded.',
    'In collapsed mode labels move into title tooltips.',
  ],
  props: [
    {
      name: 'sections',
      type: 'NavMenuSection[]',
      description: '{ label?, items: { label, to?, icon?, badge?, end?, perm?, children? }[] }',
    },
    { name: 'can', type: '(perm) => boolean', description: 'Hides items whose perm fails; empty groups disappear.' },
    { name: 'collapsed', type: 'boolean', defaultValue: 'false', description: 'Icon-only mode.' },
    { name: 'onNavigate', type: '() => void', description: 'Called on click (e.g. close the mobile drawer).' },
  ],
});
