export type Tone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

/**
 * Responsive values: a single value, or one per breakpoint (min-width).
 * sm 640 px · md 768 px · lg 1024 px · xl 1280 px.
 */
export type Responsive<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T };

/** Gap in steps of the 4 px spacing scale (2 = 8 px), or any CSS length. */
export type Space = number | string;
