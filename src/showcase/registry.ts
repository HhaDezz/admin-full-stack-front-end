import type { ComponentType } from 'react';
import { lazy } from 'react';

export const GROUPS = [
  'Layout',
  'Buttons & actions',
  'Form inputs',
  'Forms',
  'Date & time',
  'Overlays',
  'Navigation',
  'Feedback',
  'Data display',
  'Charts',
  'Apps & advanced',
] as const;
export type Group = (typeof GROUPS)[number];

export interface ComponentEntry {
  slug: string;
  name: string;
  group: Group;
  description: string;
  status: 'new' | 'updated' | 'stable';
  /** The docs page (loaded on demand). */
  page: ComponentType;
}

interface Meta extends Omit<ComponentEntry, 'page'> {
  /** File in ./docs without .tsx (SearchSelect has its own folder). */
  file: string;
}

/* Metadata stays here, so the sidebar and search don't download any docs page. A test checks
 * every entry against the defineDoc() call in its file, and that every file is listed. */
const META: Meta[] = [
  {
    slug: 'divider',
    name: 'Divider',
    group: 'Layout',
    status: 'new',
    description: 'Horizontal or vertical rule, with an optional label in the middle.',
    file: 'Divider',
  },
  {
    slug: 'grid',
    name: 'Grid',
    group: 'Layout',
    status: 'new',
    description: 'CSS grid with a column count per breakpoint, or as many columns as fit a minimum width.',
    file: 'Grid',
  },
  {
    slug: 'page-header',
    name: 'PageHeader',
    group: 'Layout',
    status: 'new',
    description:
      'Title, description, breadcrumbs and actions for the top of a page. Can stick under the top bar with a shadow once the page scrolls.',
    file: 'PageHeader',
  },
  {
    slug: 'resizable-panels',
    name: 'ResizablePanels',
    group: 'Layout',
    status: 'new',
    description: 'Two panels with a draggable divider. Sizes can be saved per browser, and the divider works from the keyboard.',
    file: 'ResizablePanels',
  },
  {
    slug: 'scroll-area',
    name: 'ScrollArea',
    group: 'Layout',
    status: 'new',
    description: 'A scroll box with a slim scrollbar and soft shadows that show there is more above or below.',
    file: 'ScrollArea',
  },
  {
    slug: 'section',
    name: 'Section',
    group: 'Layout',
    status: 'new',
    description: 'A titled block within a page, optionally in a card. Ideal for settings screens.',
    file: 'Section',
  },
  {
    slug: 'stack',
    name: 'Stack',
    group: 'Layout',
    status: 'new',
    description: 'Flexbox row or column with gaps from the spacing scale. Direction and gap can change at each breakpoint.',
    file: 'Stack',
  },
  {
    slug: 'button',
    name: 'Button',
    group: 'Buttons & actions',
    status: 'new',
    description:
      'Six variants in three sizes, with icon slots, a loading state that keeps its width, and press feedback that doesn’t ripple.',
    file: 'Button',
  },
  {
    slug: 'button-group',
    name: 'ButtonGroup',
    group: 'Buttons & actions',
    status: 'new',
    description: 'Joins related buttons into one control, horizontally or vertically, or lays them out with a gap.',
    file: 'ButtonGroup',
  },
  {
    slug: 'copy-button',
    name: 'CopyButton',
    group: 'Buttons & actions',
    status: 'new',
    description: 'Copies text to the clipboard and confirms with a tick. Icon-only inside fields, or with a label.',
    file: 'CopyButton',
  },
  {
    slug: 'icon-button',
    name: 'IconButton',
    group: 'Buttons & actions',
    status: 'new',
    description:
      'A square button for a single icon. The label is required: it names the button for screen readers and doubles as its tooltip.',
    file: 'IconButton',
  },
  {
    slug: 'split-button',
    name: 'SplitButton',
    group: 'Buttons & actions',
    status: 'new',
    description: 'A main action with related alternatives tucked into a menu on the caret.',
    file: 'SplitButton',
  },
  {
    slug: 'toggle-group',
    name: 'ToggleGroup',
    group: 'Buttons & actions',
    status: 'new',
    description:
      'Segmented control for switching views or settings. Single choice slides a highlight between options; multiple choice toggles each one.',
    file: 'ToggleGroup',
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    group: 'Form inputs',
    status: 'updated',
    description: 'Tri-state checkbox with a label and description. hideLabel keeps the name for screen readers only, for table rows.',
    file: 'Checkbox',
  },
  {
    slug: 'input',
    name: 'Input',
    group: 'Form inputs',
    status: 'new',
    description: 'Text field with prefix and suffix slots (icons or text), a clear button, three sizes and every state.',
    file: 'Input',
  },
  {
    slug: 'number-input',
    name: 'NumberInput',
    group: 'Form inputs',
    status: 'new',
    description: 'Numeric field with − / + buttons, keyboard stepping, limits, decimals and currency or unit affixes.',
    file: 'NumberInput',
  },
  {
    slug: 'password-input',
    name: 'PasswordInput',
    group: 'Form inputs',
    status: 'new',
    description: 'Password field with a show / hide button, an optional strength meter and a live checklist of rules.',
    file: 'PasswordInput',
  },
  {
    slug: 'radio-group',
    name: 'RadioGroup',
    group: 'Form inputs',
    status: 'new',
    description: 'Choose one option from a short list, as plain radios, a row, or selectable cards (RadioCards).',
    file: 'RadioGroup',
  },
  {
    slug: 'search-select',
    name: 'SearchSelect',
    group: 'Form inputs',
    status: 'new',
    description: 'Searchable dropdown: single or multi-select, groups, icons, server search, create new, 10,000-row lists.',
    file: 'search-select',
  },
  {
    slug: 'slider',
    name: 'Slider',
    group: 'Form inputs',
    status: 'new',
    description: 'Pick a number or a range by dragging or with the keyboard. Marks, labels, value bubbles and right-to-left support.',
    file: 'Slider',
  },
  {
    slug: 'switch',
    name: 'Switch',
    group: 'Form inputs',
    status: 'new',
    description:
      'An on / off setting that takes effect straight away. Two sizes, with an optional description and label-first layout for settings rows.',
    file: 'Switch',
  },
  {
    slug: 'textarea',
    name: 'Textarea',
    group: 'Form inputs',
    status: 'new',
    description: 'Multi-line text that can grow with its content and count characters.',
    file: 'Textarea',
  },
  {
    slug: 'select',
    name: 'Select',
    group: 'Form inputs',
    status: 'new',
    description:
      'The browser’s own dropdown, styled to match the other inputs. Best for short fixed lists and on phones, where it opens the system picker; use SearchSelect when people need to search or pick several.',
    file: 'Select',
  },
  {
    slug: 'mention-input',
    name: 'MentionInput',
    group: 'Form inputs',
    status: 'new',
    description:
      'A text box that grows as you type, where @ suggests people to mention. Arrow keys pick, Enter or Tab inserts the name, and mentionedIn() tells you who to notify.',
    file: 'MentionInput',
  },
  {
    slug: 'field',
    name: 'Field',
    group: 'Forms',
    status: 'new',
    description: 'Wraps any control with a label, hint, error and required mark, and wires up the ids for you.',
    file: 'Field',
  },
  {
    slug: 'confirm-dialog',
    name: 'ConfirmDialog',
    group: 'Overlays',
    status: 'updated',
    description: 'A ready-made “are you sure?” dialog for destructive or important actions, with a busy state.',
    file: 'ConfirmDialog',
  },
  {
    slug: 'drawer',
    name: 'Drawer',
    group: 'Overlays',
    status: 'new',
    description: 'A panel that slides in from the edge for filters, details or quick edits, keeping the page in view behind it.',
    file: 'Drawer',
  },
  {
    slug: 'dropdown-menu',
    name: 'DropdownMenu',
    group: 'Overlays',
    status: 'new',
    description:
      'A menu of actions or options from a button: icons, shortcuts, descriptions, separators, labels, check items, disabled and danger items.',
    file: 'DropdownMenu',
  },
  {
    slug: 'modal',
    name: 'Modal',
    group: 'Overlays',
    status: 'updated',
    description:
      'Accessible dialog in five sizes with an icon, subtitle, sticky header and footer, and a locked state while saving. Animates in and out.',
    file: 'Modal',
  },
  {
    slug: 'popover',
    name: 'Popover',
    group: 'Overlays',
    status: 'new',
    description:
      'A small floating panel anchored to a button, for quick settings and sharing. Flips to stay on screen and follows the page as it scrolls.',
    file: 'Popover',
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    group: 'Overlays',
    status: 'new',
    description: 'Short help that appears on hover and keyboard focus. Positions itself on any side and flips at the screen edge.',
    file: 'Tooltip',
  },
  {
    slug: 'breadcrumbs',
    name: 'Breadcrumbs',
    group: 'Navigation',
    status: 'new',
    description: 'Shows where a page sits. Long trails collapse their middle into “…”, which expands on click.',
    file: 'Breadcrumbs',
  },
  {
    slug: 'nav-menu',
    name: 'NavMenu',
    group: 'Navigation',
    status: 'new',
    description:
      'The sidebar menu: sections, icons, badges, collapsible nested groups and items that hide when the user lacks a permission. The app’s own sidebar is built with it.',
    file: 'NavMenu',
  },
  {
    slug: 'pagination',
    name: 'Pagination',
    group: 'Navigation',
    status: 'new',
    description:
      'Page numbers with gaps (1 … 5 6 7 … 20), optional first / last buttons and a compact “Page 3 of 12” mode. The DataTable footer uses the same logic.',
    file: 'Pagination',
  },
  {
    slug: 'steps',
    name: 'Steps',
    group: 'Navigation',
    status: 'new',
    description: 'Progress through a multi-step flow, across or down. Completed steps can be clickable to go back.',
    file: 'Steps',
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    group: 'Navigation',
    status: 'new',
    description: 'Switch between views in the same place. Three styles; the indicator slides between tabs and panels fade in.',
    file: 'Tabs',
  },
  {
    slug: 'alert',
    name: 'Alert',
    group: 'Feedback',
    status: 'new',
    description:
      'An inline message about the page or a form: info, success, warning or danger, in soft, outline or solid style, with an action and a close button.',
    file: 'Alert',
  },
  {
    slug: 'banner',
    name: 'Banner',
    group: 'Feedback',
    status: 'new',
    description:
      'A full-width strip for announcements that apply to the whole app: releases, maintenance, demo mode. Can stick to the top.',
    file: 'Banner',
  },
  {
    slug: 'empty-state',
    name: 'EmptyState',
    group: 'Feedback',
    status: 'updated',
    description:
      'What to show when there’s nothing to show: a line illustration (or icon), a title, a hint and the next action. Illustrations follow the theme colours.',
    file: 'EmptyState',
  },
  {
    slug: 'progress',
    name: 'Progress',
    group: 'Feedback',
    status: 'new',
    description: 'Bars and rings for uploads, quotas and completion, plus an indeterminate bar when the end isn’t known.',
    file: 'Progress',
  },
  {
    slug: 'result-page',
    name: 'ResultPage',
    group: 'Feedback',
    status: 'new',
    description:
      'Full-page outcomes: success, errors (403, 404, 500), maintenance and coming soon. The template’s system pages are built with it.',
    file: 'ResultPage',
  },
  {
    slug: 'skeleton',
    name: 'Skeleton',
    group: 'Feedback',
    status: 'updated',
    description: 'Shimmering placeholders in the shape of the content, so the page doesn’t jump when data arrives.',
    file: 'Skeleton',
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    group: 'Feedback',
    status: 'updated',
    description: 'A small loading indicator. Prefer Skeleton when you know the shape of what’s loading.',
    file: 'Spinner',
  },
  {
    slug: 'toast',
    name: 'Toast',
    group: 'Feedback',
    status: 'updated',
    description:
      'Short notifications in the corner: four tones, a description, an action like Undo, and promise toasts that turn from loading into success or error. Up to four stack; hovering pauses them.',
    file: 'Toast',
  },
  {
    slug: 'accordion',
    name: 'Accordion',
    group: 'Data display',
    status: 'new',
    description: 'Sections that expand and collapse with a height animation. One open at a time, or several.',
    file: 'Accordion',
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    group: 'Data display',
    status: 'updated',
    description: 'A photo or initials with a stable colour per name, a presence dot, and stacked groups with a “+N” overflow.',
    file: 'Avatar',
  },
  {
    slug: 'badge',
    name: 'Badge',
    group: 'Data display',
    status: 'updated',
    description:
      'Short status labels in seven tones and three styles, with an optional dot. A seed gives any string its own stable colour.',
    file: 'Badge',
  },
  {
    slug: 'card',
    name: 'Card',
    group: 'Data display',
    status: 'new',
    description: 'The surface most content sits on: a title row with actions, a body, an optional footer and edge-to-edge media.',
    file: 'Card',
  },
  {
    slug: 'data-table',
    name: 'DataTable',
    group: 'Data display',
    status: 'updated',
    description:
      'Sorting, search, filters, a column picker, row selection with bulk actions, density, page sizes and CSV export. Pinned and resizable columns, expandable rows, server mode and virtual rows for 10,000+ rows. It remembers each user’s choices.',
    file: 'DataTable',
  },
  {
    slug: 'description-list',
    name: 'DescriptionList',
    group: 'Data display',
    status: 'new',
    description: 'Label and value pairs for detail views (a user, an order, an audit entry) in one to three columns.',
    file: 'DescriptionList',
  },
  {
    slug: 'kbd',
    name: 'Kbd',
    group: 'Data display',
    status: 'new',
    description: 'Keyboard keys. “mod” shows ⌘ on a Mac and Ctrl everywhere else, so one line of code is right on every computer.',
    file: 'Kbd',
  },
  {
    slug: 'list',
    name: 'List',
    group: 'Data display',
    status: 'new',
    description:
      'Rows of people, files or notifications: a leading avatar or icon, title and description, meta at the end and actions that stay clickable.',
    file: 'List',
  },
  {
    slug: 'stat-card',
    name: 'StatCard',
    group: 'Data display',
    status: 'new',
    description: 'A KPI tile: the number counts up on load, with a coloured change and a sparkline drawn in plain SVG (no chart library).',
    file: 'StatCard',
  },
  {
    slug: 'tag',
    name: 'Tag',
    group: 'Data display',
    status: 'new',
    description: 'Compact labels people can remove or toggle: keywords, filters, selected values.',
    file: 'Tag',
  },
  {
    slug: 'pin-input',
    name: 'PinInput',
    group: 'Form inputs',
    status: 'new',
    description:
      'One box per character for verification codes and PINs. Paste a whole code, autofill from SMS, and submit as the last box fills.',
    file: 'PinInput',
  },
  {
    slug: 'tag-input',
    name: 'TagInput',
    group: 'Form inputs',
    status: 'new',
    description:
      'Type values and they become removable tags: keywords, emails to invite, allowed domains. Validation, limits and pasting lists.',
    file: 'TagInput',
  },
  {
    slug: 'rating',
    name: 'Rating',
    group: 'Form inputs',
    status: 'new',
    description:
      'Stars (or any icon) to give a score, or to show an average with fractions. Labels for each value and full keyboard support.',
    file: 'Rating',
  },
  {
    slug: 'color-picker',
    name: 'ColorPicker',
    group: 'Form inputs',
    status: 'new',
    description: 'A colour field with preset swatches, a saturation area, hue slider and hex input. Works fully from the keyboard.',
    file: 'ColorPicker',
  },
  {
    slug: 'radio-cards',
    name: 'RadioCards',
    group: 'Form inputs',
    status: 'new',
    description:
      'A RadioGroup laid out as cards with an icon, title and description: plans, delivery options, templates. Wraps to fit the space.',
    file: 'RadioCards',
  },
  {
    slug: 'form',
    name: 'Form',
    group: 'Forms',
    status: 'new',
    description:
      'Schema forms with React Hook Form and Zod: one schema gives types and validation, the API’s field errors land under the right inputs, and guard asks before leaving with unsaved changes.',
    file: 'Form',
  },
  {
    slug: 'wizard',
    name: 'Wizard',
    group: 'Forms',
    status: 'new',
    description:
      'A multi-step form: a Steps header, sliding panels and Back/Next buttons. Each step validates only its own fields before moving on, and the last one submits the form.',
    file: 'Wizard',
  },
  {
    slug: 'file-upload',
    name: 'FileUpload',
    group: 'Forms',
    status: 'new',
    description:
      'Drop files or browse. Type and size checks, image previews, per-file progress with cancel and retry. Bring your own upload function (fetch, axios, S3 pre-signed URLs).',
    file: 'FileUpload',
  },
  {
    slug: 'calendar',
    name: 'Calendar',
    group: 'Date & time',
    status: 'new',
    description:
      'A month grid built on react-day-picker and styled by the theme. Single days, ranges or many days, rules for disabled dates, and month names in the user’s language.',
    file: 'Calendar',
  },
  {
    slug: 'date-picker',
    name: 'DatePicker',
    group: 'Date & time',
    status: 'new',
    description:
      'A date field that opens a Calendar. Earliest and latest dates, rules for unavailable days, month/year dropdowns and a clear button.',
    file: 'DatePicker',
  },
  {
    slug: 'date-range-picker',
    name: 'DateRangePicker',
    group: 'Date & time',
    status: 'new',
    description:
      'Pick a start and end date across two months, or in one click from presets such as “Last 30 days”. Limits and a longest-range rule.',
    file: 'DateRangePicker',
  },
  {
    slug: 'time-picker',
    name: 'TimePicker',
    group: 'Date & time',
    status: 'new',
    description:
      'Type hours and minutes or pick from a list. The value is always "HH:mm" (24-hour); what people see follows their language’s 12- or 24-hour clock.',
    file: 'TimePicker',
  },
  {
    slug: 'context-menu',
    name: 'ContextMenu',
    group: 'Overlays',
    status: 'new',
    description:
      'The right-click menu, for rows, cards and files. Also opens with a long press on touch screens and with the keyboard. Same items as DropdownMenu.',
    file: 'ContextMenu',
  },
  {
    slug: 'hover-card',
    name: 'HoverCard',
    group: 'Overlays',
    status: 'new',
    description:
      'A preview card that appears when the pointer rests on a link, or the link gets focus: people, records, URLs. Richer than a Tooltip, but never the only way to the information.',
    file: 'HoverCard',
  },
  {
    slug: 'command-palette',
    name: 'CommandPalette',
    group: 'Overlays',
    status: 'new',
    description:
      'Press ⌘K (Ctrl+K) to search pages, actions and records from anywhere. Fuzzy matching with highlights, grouped results, recent picks and results loaded from the API as you type.',
    file: 'CommandPalette',
  },
  {
    slug: 'qr-code',
    name: 'QrCode',
    group: 'Data display',
    status: 'new',
    description:
      'A crisp SVG QR code for links, invites and authenticator setup (it draws the two-step sign-in code). Always dark on a white quiet zone, so every camera reads it, even in dark mode.',
    file: 'QrCode',
  },
  {
    slug: 'timeline',
    name: 'Timeline',
    group: 'Data display',
    status: 'new',
    description:
      'Events in order with a line between them: order tracking, activity logs, histories and changelogs. Icons and tones per event, a pending last step and an alternating layout.',
    file: 'Timeline',
  },
  {
    slug: 'tree-view',
    name: 'TreeView',
    group: 'Data display',
    status: 'new',
    description:
      'Nested rows that open and close: files, categories, org charts, permission groups. Single or cascading checkbox selection, filtering, children loaded on demand and full arrow-key navigation.',
    file: 'TreeView',
  },
  {
    slug: 'code-block',
    name: 'CodeBlock',
    group: 'Data display',
    status: 'new',
    description:
      'Code with syntax colours for light and dark themes, a copy button, file tabs, line numbers and marked lines. The highlighter (Shiki) and each language load only when a block is shown.',
    file: 'CodeBlock',
  },
  {
    slug: 'lightbox',
    name: 'Lightbox',
    group: 'Data display',
    status: 'new',
    description:
      'Pictures (or any preview) full screen over the page, with next and previous, swipe on touch screens, click to zoom, a thumbnail strip and a download button.',
    file: 'Lightbox',
  },
  {
    slug: 'line-chart',
    name: 'LineChart',
    group: 'Charts',
    status: 'new',
    description:
      'Change over time for one or a few series. Themed axes and grid, a crosshair tooltip with every series, a legend that hides series, an optional target line, and a data table for screen readers.',
    file: 'LineChart',
  },
  {
    slug: 'area-chart',
    name: 'AreaChart',
    group: 'Charts',
    status: 'new',
    description:
      'A line with a soft fill to show volume over time, or stacked areas for parts of a whole. Same tooltip, legend and table view as LineChart.',
    file: 'AreaChart',
  },
  {
    slug: 'bar-chart',
    name: 'BarChart',
    group: 'Charts',
    status: 'new',
    description:
      'Compare amounts across categories: side by side, stacked, or horizontal for rankings and long names. Thin bars with a rounded end, a 2 px gap in stacks and a tooltip with the total.',
    file: 'BarChart',
  },
  {
    slug: 'donut-chart',
    name: 'DonutChart',
    group: 'Charts',
    status: 'new',
    description:
      'Parts of a whole with the total in the middle. Hover a slice or a row to see its value; more than six slices fold into “Other” so colours stay distinct.',
    file: 'DonutChart',
  },
  {
    slug: 'gauge',
    name: 'Gauge',
    group: 'Charts',
    status: 'new',
    description:
      'One number against its range: server load, quota used, progress to a target. Colour bands switch the fill from good to warning to critical. Pure SVG, no chart library.',
    file: 'Gauge',
  },
  {
    slug: 'heatmap',
    name: 'Heatmap',
    group: 'Charts',
    status: 'new',
    description:
      'A grid where a darker cell means more: busy hours, activity by weekday, cohort retention. One colour from light to dark, a scale under the grid, and a table underneath for screen readers.',
    file: 'Heatmap',
  },
  {
    slug: 'funnel-chart',
    name: 'FunnelChart',
    group: 'Charts',
    status: 'new',
    description:
      'How many people make it through each step of a flow, with the share of the start and the drop between steps. Plain HTML bars that grow in on load.',
    file: 'FunnelChart',
  },
  {
    slug: 'sparkline',
    name: 'Sparkline',
    group: 'Charts',
    status: 'new',
    description:
      'A word-sized trend line for tables, stat cards and lists. Plain SVG, no chart library, so it’s cheap enough to draw on every row.',
    file: 'Sparkline',
  },
  {
    slug: 'kanban-board',
    name: 'KanbanBoard',
    group: 'Apps & advanced',
    status: 'new',
    description:
      'Columns of cards you drag to reorder or move, with the mouse, a finger (press and hold) or the keyboard. The card lifts as you pick it up and settles where it lands; columns can have a work-in-progress limit.',
    file: 'KanbanBoard',
  },
  {
    slug: 'scheduler',
    name: 'Scheduler',
    group: 'Apps & advanced',
    status: 'new',
    description:
      'A calendar of events with month and week views. Overlapping events sit side by side, a red line marks the time now, and with a mouse you can drag events to another day or time.',
    file: 'Scheduler',
  },
  {
    slug: 'rich-text-editor',
    name: 'RichTextEditor',
    group: 'Apps & advanced',
    status: 'new',
    description:
      'Formatted text — headings, lists, links, quotes and code — saved as HTML. Built on Tiptap and loaded the first time an editor is shown. Markdown shortcuts work as you type (“## ”, “- ”, “> ”).',
    file: 'RichTextEditor',
  },
  {
    slug: 'notification-center',
    name: 'NotificationCenter',
    group: 'Apps & advanced',
    status: 'new',
    description:
      'A bell with an unread count that opens the latest notifications: All and Unread tabs, Today and Earlier groups, mark read, dismiss and inline actions. NotificationPanel is the same list for a page or drawer.',
    file: 'NotificationCenter',
  },
  {
    slug: 'chat-panel',
    name: 'ChatPanel',
    group: 'Apps & advanced',
    status: 'new',
    description:
      'A conversation: messages grouped by person and day, @mentions and links, files, typing dots, sent and read ticks, a “new messages” button when you’ve scrolled up, and a composer with mentions.',
    file: 'ChatPanel',
  },
];

const pages = import.meta.glob<{ default: ComponentType }>('./docs/*.tsx');

function loaderFor(file: string) {
  if (file === 'search-select') return () => import('./search-select/SearchSelectDoc');
  const load = pages[`./docs/${file}.tsx`];
  if (!load) throw new Error(`UI Kit: no docs file for ${file}`);
  return load;
}

/** Every component in the UI Kit. Routes, search and the overview grid all read from this list. */
export const registry: (ComponentEntry & { file: string })[] = META.map((m) => ({ ...m, page: lazy(loaderFor(m.file)) }));
