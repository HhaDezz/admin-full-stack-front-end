# Charts and dashboards

The charts kit wraps Recharts in components that follow your theme in light and dark mode. Import it separately so pages without charts don't download the chart library:

```tsx
import { AreaChart, BarChart, DonutChart, FunnelChart, Gauge, Heatmap, LineChart, Sparkline } from '@/components/charts';
```

```tsx
<AreaChart
  aria-label="Revenue per day"
  data={days}              // [{ date: '2026-10-01', revenue: 1240, refunds: 30 }, …]
  index="date"
  series={[{ key: 'revenue', label: 'Revenue' }, { key: 'refunds', label: 'Refunds' }]}
  valueFormat={(n) => `$${n.toLocaleString()}`}
  indexFormat={(d) => new Date(String(d)).toLocaleDateString()}
/>
```

Built in:

- **Colours that stay put.** Series take `--chart-1` to `--chart-6` in order, checked for colour-blind separation. Hiding a series from the legend never repaints the others.
- **A tooltip that lists every series** at the hovered point, value first.
- **Clean axes.** Value ticks land on round numbers (0, 25K, 50K…).
- **Accessible by default.** Each chart is a named figure. Screen readers get a table of the numbers instead of the drawing, and `tableView` shows that table on screen.
- **States.** `loading` shows a skeleton the same size as the chart; an empty dataset shows an empty state.
- **Motion.** Lines draw, bars grow and the donut sweeps in, and all of it turns off with reduced motion.

| Chart | Use it for |
|---|---|
| `LineChart` | Change over time, one to a few series, optional target line |
| `AreaChart` | Volume over time, or stacked parts of a whole |
| `BarChart` | Comparing categories; grouped, stacked or horizontal |
| `DonutChart` | Parts of a whole (up to six; the rest fold into “Other”) |
| `Gauge` | One value against its range, with good / warning / critical bands |
| `Heatmap` | Busy hours, activity by weekday, cohort retention |
| `FunnelChart` | Steps of a flow with conversion and drop-off |
| `Sparkline` | A word-sized trend beside a number |

## Dashboards

Three sample dashboards show the pieces together: **Analytics**, **Sales** and **Projects** (under *Dashboards* in the sidebar). Each has a date-range filter that scopes every chart on the page, KPI cards with change against the previous period, and blocks for the rest.

They run on generated sample data from `src/blocks/_data.ts`, marked with a *Sample data* badge. To make one real, replace the data hooks at the top of the page with queries to your API; the components don't change.
