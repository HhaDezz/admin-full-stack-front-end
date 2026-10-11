# FAQ

**Can I use it without the Spring Boot API?**
Yes. The web app talks to the API through `src/lib/api.ts` and expects `{ success, message, data }` responses. Any back end that returns that shape works; the endpoints are listed in the [API reference](/reference/api). Demo mode runs with no back end at all.

**Which browsers are supported?**
The last two versions of Chrome, Edge, Firefox and Safari, iOS Safari 16+ and Android Chrome.

**How do I remove the sample pages?**
Build with `VITE_SHOWCASE=false`, or delete `src/pages/dashboards`, `src/pages/content`, `src/showcase` and their routes in `src/App.tsx` and sections in `src/components/Layout.tsx`.

**How do I change the logo and name?**
Set `VITE_APP_NAME` and replace `public/favicon.svg`. The sidebar shows the name's first letter as a mark; swap it for an image in the `brand` block of `src/components/Layout.tsx`.

**Can people sign up on their own?**
Yes, with `REGISTRATION_ENABLED=true` (the default in the example settings). Set it to `false` to allow only accounts an admin creates.

**Where do emails go in development?**
To the API log, link included. See [Email](./email).

**Is it accessible?**
Components follow WCAG 2.2 AA: keyboard support, visible focus, correct roles and labels, reduced motion. Every docs page and every block is checked with axe in the test suite. Run your own checks on what you build.

**How do I run the tests?**
`npm test` in the web app (Vitest, Testing Library and axe) and `./mvnw test` in the API (integration tests against PostgreSQL).

**What's the licence of the libraries?**
All third-party packages are permissively licensed (MIT, ISC, BSD, Apache 2.0, and the SIL OFL for the fonts). The list is in the README.
