import axe from 'axe-core';

/** Runs axe on an element and returns the violations (empty = accessible). */
export async function axeViolations(el: Element) {
  const result = await axe.run(el, { rules: { region: { enabled: false }, 'color-contrast': { enabled: false } } });
  return result.violations.map((v) => `${v.id}: ${v.help}`);
}
