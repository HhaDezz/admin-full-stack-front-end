import type { SelectOption } from '../../../components/search-select';

export const fruits: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape' },
  { value: 'kiwi', label: 'Kiwi' },
  { value: 'mango', label: 'Mango' },
  { value: 'orange', label: 'Orange' },
  { value: 'papaya', label: 'Papaya' },
  { value: 'pear', label: 'Pear' },
  { value: 'pineapple', label: 'Pineapple' },
];

export const countries: SelectOption[] = [
  { value: 'au', label: 'Australia', description: 'Canberra', icon: '🇦🇺', keywords: ['AU'] },
  { value: 'br', label: 'Brazil', description: 'Brasília', icon: '🇧🇷', keywords: ['BR'] },
  { value: 'ca', label: 'Canada', description: 'Ottawa', icon: '🇨🇦', keywords: ['CA'] },
  { value: 'fr', label: 'France', description: 'Paris', icon: '🇫🇷', keywords: ['FR'] },
  { value: 'de', label: 'Germany', description: 'Berlin', icon: '🇩🇪', keywords: ['DE', 'Deutschland'] },
  { value: 'in', label: 'India', description: 'New Delhi', icon: '🇮🇳', keywords: ['IN'] },
  { value: 'jp', label: 'Japan', description: 'Tokyo', icon: '🇯🇵', keywords: ['JP', 'Nippon'] },
  { value: 'ke', label: 'Kenya', description: 'Nairobi', icon: '🇰🇪', keywords: ['KE'] },
  { value: 'mx', label: 'Mexico', description: 'Mexico City', icon: '🇲🇽', keywords: ['MX'] },
  { value: 'nz', label: 'New Zealand', description: 'Wellington', icon: '🇳🇿', keywords: ['NZ', 'Aotearoa'] },
  { value: 'lk', label: 'Sri Lanka', description: 'Sri Jayawardenepura Kotte', icon: '🇱🇰', keywords: ['LK', 'Colombo'] },
  { value: 'se', label: 'Sweden', description: 'Stockholm', icon: '🇸🇪', keywords: ['SE', 'Sverige'] },
  { value: 'ch', label: 'Switzerland', description: 'Bern', icon: '🇨🇭', keywords: ['CH', 'Schweiz', 'Suisse'] },
  { value: 'gb', label: 'United Kingdom', description: 'London', icon: '🇬🇧', keywords: ['UK', 'GB', 'Britain'] },
  { value: 'us', label: 'United States', description: 'Washington, D.C.', icon: '🇺🇸', keywords: ['US', 'USA', 'America'] },
];

export const timeZones: SelectOption[] = [
  { value: 'America/Los_Angeles', label: 'Los Angeles', description: 'UTC−08:00', group: 'Americas' },
  { value: 'America/New_York', label: 'New York', description: 'UTC−05:00', group: 'Americas' },
  { value: 'America/Sao_Paulo', label: 'São Paulo', description: 'UTC−03:00', group: 'Americas' },
  { value: 'Europe/London', label: 'London', description: 'UTC+00:00', group: 'Europe & Africa' },
  { value: 'Europe/Berlin', label: 'Berlin', description: 'UTC+01:00', group: 'Europe & Africa' },
  { value: 'Africa/Nairobi', label: 'Nairobi', description: 'UTC+03:00', group: 'Europe & Africa' },
  { value: 'Asia/Dubai', label: 'Dubai', description: 'UTC+04:00', group: 'Asia & Pacific' },
  { value: 'Asia/Colombo', label: 'Colombo', description: 'UTC+05:30', group: 'Asia & Pacific' },
  { value: 'Asia/Singapore', label: 'Singapore', description: 'UTC+08:00', group: 'Asia & Pacific' },
  { value: 'Asia/Tokyo', label: 'Tokyo', description: 'UTC+09:00', group: 'Asia & Pacific' },
  { value: 'Australia/Sydney', label: 'Sydney', description: 'UTC+10:00', group: 'Asia & Pacific' },
  { value: 'Pacific/Auckland', label: 'Auckland', description: 'UTC+12:00', group: 'Asia & Pacific', disabled: true },
];

export const skills: SelectOption[] = [
  'React',
  'TypeScript',
  'Node.js',
  'Java',
  'Spring Boot',
  'PostgreSQL',
  'Docker',
  'Kubernetes',
  'GraphQL',
  'Figma',
  'Python',
  'AWS',
].map((s) => ({ value: s.toLowerCase().replace(/\W+/g, '-'), label: s }));

const first = [
  'Ava',
  'Ben',
  'Chloe',
  'Dev',
  'Elena',
  'Farid',
  'Grace',
  'Hiro',
  'Isla',
  'Jonas',
  'Kavya',
  'Liam',
  'Maya',
  'Noah',
  'Omar',
  'Priya',
  'Quinn',
  'Rosa',
  'Sven',
  'Tara',
];
const last = [
  'Adams',
  'Bose',
  'Chen',
  'Diaz',
  'Evans',
  'Fischer',
  'Garcia',
  'Haddad',
  'Ito',
  'Jensen',
  'Kumar',
  'Lopez',
  'Moreau',
  'Nakamura',
  'Okafor',
  'Perera',
  'Rossi',
  'Silva',
  'Tanaka',
  'Weber',
];
const teams = ['Design', 'Engineering', 'Finance', 'Operations', 'Sales', 'Support'];

/** 10,000 people, generated the same way every time. */
export const people: SelectOption<number>[] = Array.from({ length: 10_000 }, (_, i) => {
  const name = `${first[i % first.length]} ${last[(i * 7) % last.length]}`;
  return {
    value: i + 1,
    label: `${name} #${i + 1}`,
    description: `${teams[(i * 3) % teams.length]} · ${name.toLowerCase().replace(' ', '.')}@example.com`,
  };
});
