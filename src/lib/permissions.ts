export interface ParsedPermission {
  name: string;
  module: string;
  resource: string;
  action: string;
}

/** `admin-user-view` → module `admin`, resource `user`, action `view`. */
export function parsePermission(name: string): ParsedPermission {
  const parts = name.split('-');
  if (parts.length >= 3) {
    return { name, module: parts[0], resource: parts.slice(1, -1).join(' '), action: parts[parts.length - 1] };
  }
  if (parts.length === 2) return { name, module: 'general', resource: parts[0], action: parts[1] };
  return { name, module: 'general', resource: name, action: 'access' };
}

const ACTION_ORDER = ['view', 'create', 'edit', 'delete'];

export function sortActions(actions: string[]): string[] {
  return [...actions].sort((a, b) => {
    const ia = ACTION_ORDER.indexOf(a);
    const ib = ACTION_ORDER.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b);
  });
}

export interface ResourceRow {
  resource: string;
  byAction: Record<string, ParsedPermission>;
}
export interface ModuleGroup {
  module: string;
  actions: string[];
  rows: ResourceRow[];
}

export function groupPermissions(names: string[]): ModuleGroup[] {
  const modules = new Map<string, Map<string, ResourceRow>>();
  for (const n of names) {
    const p = parsePermission(n);
    if (!modules.has(p.module)) modules.set(p.module, new Map());
    const rows = modules.get(p.module)!;
    if (!rows.has(p.resource)) rows.set(p.resource, { resource: p.resource, byAction: {} });
    rows.get(p.resource)!.byAction[p.action] = p;
  }
  return [...modules.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([module, rows]) => {
      const list = [...rows.values()].sort((a, b) => a.resource.localeCompare(b.resource));
      const actions = sortActions([...new Set(list.flatMap((r) => Object.keys(r.byAction)))]);
      return { module, actions, rows: list };
    });
}
