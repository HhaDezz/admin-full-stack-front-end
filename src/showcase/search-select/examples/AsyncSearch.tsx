import { useState } from 'react';
import { SearchSelect, type SelectOption } from '../../../components/search-select';
import { matches } from '../../../components/search-select/match';
import { people } from './data';

// Pretend server: 400 ms round trip, at most 50 results. In your app, call your API here.
async function searchPeople(query: string): Promise<SelectOption<number>[]> {
  await new Promise((r) => setTimeout(r, 400));
  return people.filter((p) => matches(p, query)).slice(0, 50);
}

export default function AsyncSearch() {
  const [assignee, setAssignee] = useState<number | null>(null);
  return (
    <SearchSelect
      aria-label="Assign to"
      placeholder="Search 10,000 people"
      searchPlaceholder="Type a name or team…"
      loadOptions={searchPeople}
      value={assignee}
      onChange={setAssignee}
      clearable
      minWidth={300}
    />
  );
}
