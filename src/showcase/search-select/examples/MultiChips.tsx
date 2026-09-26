import { useState } from 'react';
import { SearchSelect } from '../../../components/search-select';
import { skills } from './data';

// Multi-select: stays open while picking, shows chips, "+N" after 3, Select all / Clear in the footer.
export default function MultiChips() {
  const [picked, setPicked] = useState<string[]>(['react', 'typescript', 'spring-boot', 'postgresql']);
  return (
    <SearchSelect
      aria-label="Skills"
      multiple
      placeholder="Add skills"
      options={skills}
      value={picked}
      onChange={setPicked}
      maxChips={3}
      clearable
      minWidth={320}
    />
  );
}
