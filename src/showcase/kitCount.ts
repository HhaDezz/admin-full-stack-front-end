/**
 * How many components the UI Kit documents, for the sidebar badge. Kept here (not read from the
 * registry) so the first screen doesn't download the registry; a test keeps it in sync.
 */
export const KIT_COUNT = 87;
/** Blocks in the gallery at /ui/blocks (checked against src/blocks/registry.ts by a test). */
export const BLOCK_COUNT = 30;

/** "date-range-picker" → "DateRangePicker" (component names and slugs map one to one). */
export const nameFromSlug = (slug: string) => slug.replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase());
