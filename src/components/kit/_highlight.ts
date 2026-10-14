/* Syntax highlighting with Shiki, loaded on first use. Only the languages a page asks for are fetched. */
import type { HighlighterCore } from 'shiki/core';

const LANGS = {
  tsx: () => import('shiki/langs/tsx.mjs'),
  ts: () => import('shiki/langs/typescript.mjs'),
  jsx: () => import('shiki/langs/jsx.mjs'),
  js: () => import('shiki/langs/javascript.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  css: () => import('shiki/langs/css.mjs'),
  html: () => import('shiki/langs/html.mjs'),
  bash: () => import('shiki/langs/bash.mjs'),
  java: () => import('shiki/langs/java.mjs'),
  sql: () => import('shiki/langs/sql.mjs'),
  yaml: () => import('shiki/langs/yaml.mjs'),
  properties: () => import('shiki/langs/ini.mjs'),
} as const;

export type CodeLanguage = keyof typeof LANGS | 'text';
const ALIAS: Record<string, CodeLanguage> = {
  typescript: 'ts',
  javascript: 'js',
  shell: 'bash',
  sh: 'bash',
  yml: 'yaml',
  ini: 'properties',
  env: 'properties',
  plaintext: 'text',
  txt: 'text',
};
export const normaliseLang = (l: string): CodeLanguage => (l in LANGS ? (l as CodeLanguage) : (ALIAS[l] ?? 'text'));

let core: Promise<HighlighterCore> | null = null;
const loaded = new Set<string>();

function highlighter() {
  core ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, light, dark] = await Promise.all([
      import('shiki/core'),
      import('shiki/engine/javascript'),
      import('shiki/themes/github-light.mjs'),
      import('shiki/themes/github-dark.mjs'),
    ]);
    return createHighlighterCore({ themes: [light.default, dark.default], langs: [], engine: createJavaScriptRegexEngine() });
  })();
  return core;
}

/**
 * HTML for the code, with colours as CSS variables (--shiki-light / --shiki-dark) so it
 * follows the app theme. Shiki escapes the code, so the result is safe to insert.
 */
export async function highlight(code: string, lang: string): Promise<string | null> {
  const l = normaliseLang(lang);
  if (l === 'text') return null;
  const h = await highlighter();
  if (!loaded.has(l)) {
    await h.loadLanguage((await LANGS[l]()).default);
    loaded.add(l);
  }
  const name =
    h
      .getLoadedLanguages()
      .find(
        (x) => x === l || (l === 'ts' && x === 'typescript') || (l === 'js' && x === 'javascript') || (l === 'properties' && x === 'ini'),
      ) ?? l;
  return h.codeToHtml(code, { lang: name, themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false });
}
