import { useState } from 'react';
import { SearchSelect } from '../../../components/search-select';
import { countries } from './data';

// Icons, a description line, and hidden keywords ("USA", "Deutschland") that also match.
export default function RichOptions() {
  const [country, setCountry] = useState<string | null>('lk');
  return (
    <SearchSelect
      aria-label="Country"
      placeholder="Choose a country"
      searchPlaceholder="Search by name, capital or code…"
      options={countries}
      value={country}
      onChange={setCountry}
      minWidth={280}
    />
  );
}
