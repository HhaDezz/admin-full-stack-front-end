import type { DemoEmail } from './mock-account';

/**
 * The newest email "sent" to this address in demo mode (null otherwise). Pages use it to show
 * the confirmation or reset link on screen, since there's no real inbox. The literal env check
 * lets production builds drop the demo code entirely.
 */
export async function latestDemoEmail(to: string, subject?: string): Promise<DemoEmail | null> {
  if (import.meta.env.VITE_DEMO_MODE !== 'true') return null;
  const { inbox } = await import('./mock-account');
  const email = to.trim().toLowerCase();
  return inbox.find((m) => m.to === email && (!subject || m.subject === subject)) ?? null;
}
