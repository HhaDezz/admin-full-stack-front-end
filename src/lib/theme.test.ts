import { beforeEach, describe, expect, it } from 'vitest';
import { applyTheme, DEFAULT_THEME, exportCss, loadTheme } from './theme';

describe('theme settings', () => {
  beforeEach(() => localStorage.clear());

  it('falls back to defaults on bad stored data and keeps the old light/dark choice', () => {
    localStorage.setItem('atelier.theme.v2', '{not json');
    expect(loadTheme()).toEqual(DEFAULT_THEME);
    localStorage.clear();
    localStorage.setItem('atelier.theme', 'dark');
    expect(loadTheme().mode).toBe('dark');
    localStorage.setItem('atelier.theme.v2', JSON.stringify({ preset: 'nope', brand: 'red', radius: 9 }));
    const s = loadTheme();
    expect(s.preset).toBe('atelier');
    expect(s.brand).toBeNull();
    expect(s.radius).toBe(1.6);
  });

  it('writes attributes, radius, fonts and preset colours to <html>', () => {
    applyTheme({
      ...DEFAULT_THEME,
      preset: 'indigo',
      mode: 'dark',
      dir: 'rtl',
      density: 'compact',
      radius: 0.5,
      sidebar: 'glass',
      width: 'boxed',
      font: 'modern',
    });
    const html = document.documentElement;
    expect(html.dataset.theme).toBe('dark');
    expect(html.dir).toBe('rtl');
    expect(html.dataset.density).toBe('compact');
    expect(html.dataset.sidebar).toBe('glass');
    expect(html.dataset.width).toBe('boxed');
    expect(html.style.getPropertyValue('--radius-scale')).toBe('0.5');
    expect(html.style.getPropertyValue('--font-display')).toContain('Inter');
    const css = document.getElementById('atelier-theme')!.textContent!;
    expect(css).toContain('--brand: #4f46e5');
    expect(css).toContain("[data-theme='dark']");
  });

  it('exports paste-ready CSS with a custom brand colour', () => {
    const css = exportCss({ ...DEFAULT_THEME, brand: '#ff5500' });
    expect(css).toContain(':root {');
    expect(css).toContain('--brand: #ff5500');
    expect(css).toContain('color-mix(in srgb, #ff5500 62%, #ffffff)');
  });
});
