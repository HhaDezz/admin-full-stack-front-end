const env = import.meta.env;

export const config = {
  apiBaseUrl: (env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8089',
  appName: (env.VITE_APP_NAME as string | undefined) ?? 'Anjana',
  demo: String(env.VITE_DEMO_MODE ?? 'false') === 'true',
  /** The one-file demo (anjana-admin-demo.html) opened straight from disk: routes live after "#". */
  standalone: String(env.VITE_STANDALONE ?? 'false') === 'true',
  /** The UI Kit gallery at /ui. On by default; set VITE_SHOWCASE=false to leave it out of a production build. */
  showcase: String(env.VITE_SHOWCASE ?? 'true') !== 'false',
};

export const DEMO_LOGIN = { email: 'demo@anjana.test', password: 'demo1234' };
