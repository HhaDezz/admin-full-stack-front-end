import { useState } from 'react';
import { SearchSelect } from '../../../components/search-select';
import { fruits } from './data';

export default function States() {
  const [a, setA] = useState<string | null>('kiwi');
  const [b, setB] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, width: '100%' }}>
      <SearchSelect aria-label="Small" size="sm" options={fruits} value={a} onChange={setA} />
      <SearchSelect aria-label="Medium" options={fruits} value={a} onChange={setA} />
      <SearchSelect aria-label="Disabled" options={fruits} value="pear" onChange={() => {}} disabled />
      <SearchSelect
        aria-label="With error"
        options={fruits}
        value={b}
        onChange={setB}
        placeholder="Required"
        error={b ? false : 'Pick a fruit to continue'}
      />
    </div>
  );
}
