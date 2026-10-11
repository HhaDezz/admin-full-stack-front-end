# Motion

Every animation in Anjana Admin is listed, live, at **/ui/motion**: sixteen tiles from route changes to the theme switch, each with its duration and curve and a Replay button.

## Tokens

Durations and curves are CSS variables in `src/styles/tokens/motion.css`, mirrored for JavaScript in `src/lib/motion.tsx`:

| Token | Value | Used for |
| --- | --- | --- |
| `--dur-instant` | 100 ms | Button press, hover colours |
| `--dur-fast` | 160 ms | Menus, tooltips, exits |
| `--dur-base` | 240 ms | Route change, toasts, row changes |
| `--dur-slow` | 360 ms | Modals, drawers, sidebar |
| `--ease-enter` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Things arriving |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Things leaving |

```tsx
import * as m from 'motion/react-m';
import { duration, easing } from '@/lib/motion';

<m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: easing.enter } }} />
```

## Reduce motion

Everything respects the system's “reduce motion” setting and the app's own switch (Settings → Appearance, or the switch on /ui/motion). Use `useShouldReduceMotion()` for your own animations; the CSS tokens drop to 0 ms automatically.

## Utilities you can reuse

- **Row highlight**: add `row-new` to a table row (or list item) that just arrived; it flashes gold for 1.6 s.
- **Form errors**: a `Field` that gets an `error` shakes its control once and slides the message in. Nothing to add.
- **Theme reveal**: `revealChange(fn, { x, y })` from `src/lib/theme.tsx` runs any change as a View Transition with a circle growing from a point. Browsers without View Transitions just apply the change.
- **Toasts** can be swiped toward the screen edge to dismiss.
