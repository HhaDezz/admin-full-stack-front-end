/**
 * Feature grid: six features with an icon, title and one line each.
 * Uses: Grid. Good for an onboarding page or a product tour.
 */
import { BarChart3, History, KeyRound, Palette, ShieldCheck, Users } from 'lucide-react';
import { Grid } from '@/components/kit';

const FEATURES = [
  { icon: <Users size={20} />, title: 'People and roles', text: 'Invite your team and decide exactly what each role can see and do.' },
  { icon: <ShieldCheck size={20} />, title: 'Two-step sign-in', text: 'Authenticator codes and recovery codes keep accounts safe.' },
  { icon: <History size={20} />, title: 'Full audit trail', text: 'Every sign-in and change, with who, when, where and what changed.' },
  { icon: <BarChart3 size={20} />, title: 'Dashboards', text: 'Charts and KPIs that follow your theme in light and dark mode.' },
  { icon: <KeyRound size={20} />, title: 'Device control', text: 'See every signed-in device and sign any of them out remotely.' },
  { icon: <Palette size={20} />, title: 'Your brand', text: 'Pick a colour, font and density; export the theme as CSS.' },
];

export default function FeatureGrid() {
  return (
    <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap={5} as="ul" className="blk-featgrid">
      {FEATURES.map((f) => (
        <li key={f.title}>
          <span className="blk-feat-icon" aria-hidden="true">
            {f.icon}
          </span>
          <h2>{f.title}</h2>
          <p className="muted">{f.text}</p>
        </li>
      ))}
    </Grid>
  );
}
