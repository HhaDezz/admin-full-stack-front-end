# Theming

Every colour, font size, space, radius, shadow and duration is a CSS variable in `src/styles/tokens/`. Components read only these, so changing a token restyles everything.

| File | What's in it |
|---|---|
| `colors.css` | Surfaces, ink, brand, accent, status colours, sidebar, chart series; light and dark |
| `typography.css` | Font families, sizes, weights |
| `spacing.css` | The 4 px spacing scale |
| `radius.css`, `elevation.css` | Corners and shadows |
| `motion.css` | Durations and easings |
| `z-index.css` | Layers for menus, dialogs, toasts |

## The theme customizer

Open it from the palette icon in the top bar. People can pick one of six presets or their own brand colour, light, dark or system mode, left-to-right or right-to-left, density, corner radius, font pair, sidebar style and content width. Choices are saved per browser.

**Make your choice the default.** Set the theme you want, press **Copy CSS** and paste the result at the end of `src/styles/tokens/index.css`. To change the starting settings for everyone (for example dark mode or the light sidebar), edit `DEFAULT_THEME` in `src/lib/theme.tsx`.

## Dark mode

Dark values sit under `[data-theme='dark']` in `colors.css`. They are chosen separately rather than inverted, so contrast holds in both modes.

## Chart colours

Charts use `--chart-1` to `--chart-6` in a fixed order, checked for colour-blind separation against the light and dark surfaces. A series keeps its colour when others are hidden. If you change them, keep neighbouring colours clearly different in lightness as well as hue.

## Right-to-left

Switch direction in the customizer, or set `dir: 'rtl'` in `DEFAULT_THEME`. Layout uses logical properties (`inset-inline-start`, `padding-inline`), arrows flip with the `flip-rtl` class, and keyboard shortcuts swap Left and Right where it matters (sliders, trees, time pickers).

## Motion

Presets live in `src/lib/motion.tsx` (`fadeIn`, `rise`, `pop`, `slideFromRight`, `stagger`, `useCountUp`). With the system's reduced-motion setting on, or the customizer's *Reduce motion* switch, animations become simple fades.
