import { useState } from 'react';
import { SearchSelect } from '../../../components/search-select';
import { people } from './data';

// 10,000 options in the browser. Only the visible rows are drawn, so it stays smooth.
export default function LargeList() {
  const [person, setPerson] = useState<number | null>(null);
  return (
    <SearchSelect aria-label="Person" placeholder="10,000 options" options={people} value={person} onChange={setPerson} minWidth={300} />
  );
}
