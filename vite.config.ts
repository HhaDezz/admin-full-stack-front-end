import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  // `@/components/kit` → src/components/kit
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5173, host: true },
  build: {
    rollupOptions: {
      output: {
        // React and the charts library get their own long-cached chunks; everything else
        // is split by where it is used (pages load with React.lazy).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/](recharts|d3-[a-z-]+|victory-vendor|decimal\.js-light)[\\/]/.test(id)) return 'charts';
          if (/node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run[\\/][^\\/]+)[\\/]/.test(id)) return 'react';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
