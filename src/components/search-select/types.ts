import type { ReactNode } from 'react';

export type OptionValue = string | number;

export interface SelectOption<V extends OptionValue = string> {
  value: V;
  label: string;
  /** Second line under the label. Also searched. */
  description?: string;
  /** Options sharing a group are listed together under a heading, in first-seen order. */
  group?: string;
  /** Icon, avatar or flag shown before the label. */
  icon?: ReactNode;
  disabled?: boolean;
  /** Extra words that match the search (synonyms, codes). Not shown. */
  keywords?: string[];
}

interface BaseProps<V extends OptionValue> {
  /** Options to choose from. With `loadOptions`, these show before the user types. */
  options?: SelectOption<V>[];
  /** Server-side search, called 250 ms after typing stops. Return the matching options. */
  loadOptions?: (query: string) => Promise<SelectOption<V>[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Show the search box in the menu. Default true. */
  searchable?: boolean;
  /** Show a clear (×) button when something is selected. */
  clearable?: boolean;
  /** Offer "Create “…”" when no option matches the search exactly. */
  creatable?: boolean;
  /** Called with the typed text when "Create" is picked. Return the new option to select it. */
  onCreate?: (text: string) => SelectOption<V> | void | Promise<SelectOption<V> | void>;
  disabled?: boolean;
  /** true, or a message shown under the field. Sets aria-invalid. */
  error?: boolean | string;
  size?: 'sm' | 'md';
  /** Message when nothing matches. */
  emptyText?: string;
  /** Replace the default option row. */
  renderOption?: (option: SelectOption<V>, state: { selected: boolean; active: boolean; query: string }) => ReactNode;
  /** Minimum trigger width in px (handy in toolbars). */
  minWidth?: number;
  /** Fill the container's width. */
  fullWidth?: boolean;
  /** Tallest the menu list may grow, in px. Default 320. */
  maxMenuHeight?: number;
  id?: string;
  /** Adds a hidden input so the value is posted with a regular form. */
  name?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
}

export interface SingleSelectProps<V extends OptionValue> extends BaseProps<V> {
  multiple?: false;
  value: V | null;
  onChange: (value: V | null, option: SelectOption<V> | null) => void;
}

export interface MultiSelectProps<V extends OptionValue> extends BaseProps<V> {
  multiple: true;
  value: V[];
  onChange: (value: V[], options: SelectOption<V>[]) => void;
  /** Chips shown in the field before "+N". Default 3. */
  maxChips?: number;
  /** The most options that can be picked. */
  maxSelected?: number;
}

export type SearchSelectProps<V extends OptionValue> = SingleSelectProps<V> | MultiSelectProps<V>;
