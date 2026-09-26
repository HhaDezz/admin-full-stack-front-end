import { useState } from 'react';
import { SearchSelect } from '../../../components/search-select';
import { timeZones } from './data';

// Options with a `group` are listed under a heading. Auckland is disabled.
export default function Grouped() {
  const [zone, setZone] = useState<string | null>('Asia/Colombo');
  return <SearchSelect aria-label="Time zone" placeholder="Time zone" options={timeZones} value={zone} onChange={setZone} minWidth={260} />;
}
