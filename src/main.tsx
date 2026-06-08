import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './styles/global.css';
import './styles/kit.css';
import './styles/kit-forms.css';
import './styles/kit-data.css';
import './styles/kit-apps.css';
import './styles/blocks.css';
import App from './App';
import { ToastProvider } from './components/ui';
import { AuthProvider } from './lib/auth';
import { config } from './lib/config';
import { MotionProvider } from './lib/motion';
import { applyTheme, loadTheme, ThemeProvider } from './lib/theme';

document.title = `${config.appName} Admin`;

// The one-file demo runs from disk (file://), where only the part after "#" can change.
const Router = config.standalone ? HashRouter : BrowserRouter;
applyTheme(loadTheme()); // themed from the very first paint

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 } },
});

function Root() {
  return (
    <ThemeProvider>
      <MotionProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </MotionProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Root />
      </Router>
    </QueryClientProvider>
  </React.StrictMode>,
);
