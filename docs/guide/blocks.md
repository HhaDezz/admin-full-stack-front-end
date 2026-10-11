# Blocks

Blocks are ready-made sections built from the kit: stat rows, chart cards, recent orders, team lists, profile and billing forms, pricing tables, sign-in cards, filter bars and more. There are 30, listed in the [blocks reference](/reference/blocks).

Browse them live at **/ui/blocks**. Each one has the same preview switches as the UI Kit (dark, right-to-left, phone width) and a Code tab with its whole file.

## Using a block

Each block is one file in `src/blocks/<category>/`. Either import it as it is:

```tsx
import RecentOrders from '@/blocks/lists/RecentOrders';
```

or copy the file next to your page and change it. Blocks import their sample numbers from `src/blocks/_data.ts`; swap those for your own queries.

Blocks are page sections, so their card titles are `<h2>`s, ready to sit under a page's `<h1>`. Every block is rendered and checked with axe by the test suite.
