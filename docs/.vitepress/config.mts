import { defineConfig } from 'vitepress';

// Set DOCS_DEMO_URL to your hosted demo so component pages link to their live examples.
const demo = process.env.DOCS_DEMO_URL ?? 'http://localhost:5173';

export default defineConfig({
  title: 'Anjana Admin',
  description: 'React 19 + Spring Boot admin template: users, roles, permissions, audit log, dashboards and a 78-component UI kit.',
  cleanUrls: true,
  // Component pages link to the live demo, which is localhost until DOCS_DEMO_URL is set.
  ignoreDeadLinks: 'localhostLinks',
  lastUpdated: false,
  head: [['link', { rel: 'icon', href: '/favicon.svg' }]],
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Components', link: '/reference/components' },
      { text: 'API', link: '/reference/api' },
      { text: 'Live demo', link: demo },
    ],
    sidebar: [
      {
        text: 'Start here',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Project structure', link: '/guide/project-structure' },
          { text: 'Configuration', link: '/guide/configuration' },
        ],
      },
      {
        text: 'Build with it',
        items: [
          { text: 'Adding a page', link: '/guide/adding-a-page' },
          { text: 'Adding a permission', link: '/guide/adding-a-permission' },
          { text: 'Theming', link: '/guide/theming' },
          { text: 'Forms', link: '/guide/forms' },
          { text: 'Tables', link: '/guide/tables' },
          { text: 'Charts and dashboards', link: '/guide/charts' },
          { text: 'Blocks', link: '/guide/blocks' },
          { text: 'App pages', link: '/guide/apps' },
          { text: 'Motion', link: '/guide/motion' },
        ],
      },
      {
        text: 'Accounts and security',
        items: [
          { text: 'Sign-in and sign-up', link: '/guide/authentication' },
          { text: 'Email', link: '/guide/email' },
          { text: 'Audit log', link: '/guide/audit-log' },
        ],
      },
      {
        text: 'Ship it',
        items: [
          { text: 'Deployment', link: '/guide/deployment' },
          { text: 'FAQ', link: '/guide/faq' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Components', link: '/reference/components' },
          { text: 'Blocks', link: '/reference/blocks' },
          { text: 'API endpoints', link: '/reference/api' },
        ],
      },
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3] },
    footer: { message: 'Anjana Admin · a ready-made admin for startups, by Anjana Ariyasinghe' },
  },
  vite: { define: { __DEMO_URL__: JSON.stringify(demo) } },
});
