import { useState } from 'react';
import { SearchSelect } from '../../../components/search-select';
import { fruits } from './data';

export default function Basic() {
  const [fruit, setFruit] = useState<string | null>('mango');
  return (
    <SearchSelect
      aria-label="Favourite fruit"
      placeholder="Pick a fruit"
      options={fruits}
      value={fruit}
      onChange={setFruit}
      clearable
      minWidth={240}
    />
  );
}
