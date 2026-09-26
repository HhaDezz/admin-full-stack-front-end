import { useState } from 'react';
import { SearchSelect, type SelectOption } from '../../../components/search-select';

const starting: SelectOption[] = ['urgent', 'billing', 'bug', 'feature request', 'question'].map((t) => ({ value: t, label: t }));

// Type a tag that doesn't exist and pick "Create". onCreate could save it to your API first.
export default function Creatable() {
  const [options, setOptions] = useState(starting);
  const [tags, setTags] = useState<string[]>(['bug']);
  return (
    <SearchSelect
      aria-label="Tags"
      multiple
      creatable
      placeholder="Add tags"
      searchPlaceholder="Find or create a tag…"
      options={options}
      value={tags}
      onChange={setTags}
      onCreate={(text) => {
        const tag = { value: text.toLowerCase(), label: text.toLowerCase() };
        setOptions((list) => [...list, tag]);
        return tag;
      }}
      minWidth={300}
    />
  );
}
