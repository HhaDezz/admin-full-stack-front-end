import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '@/components/kit';
import { MotionProvider } from '../lib/motion';
import { ThemeProvider } from '../lib/theme';

/** The app's providers, for rendering pages and components in tests. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <MotionProvider>
          <ToastProvider>{children}</ToastProvider>
        </MotionProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}
