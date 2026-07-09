import { Minus } from 'lucide-react';
import type { ReactNode } from 'react';
import { Checkbox } from './ui';
import { useScrollFocus } from './kit';
import { groupPermissions } from '../lib/permissions';
import { titleCase } from '../lib/format';

/** Editable (or read-only) grid of module → resource → action permissions. */
export default function PermissionMatrix({
  all,
  selected,
  onChange,
  readOnly,
  descriptions,
}: {
  all: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  readOnly?: boolean;
  /** Optional permission name → description, shown as a tooltip. */
  descriptions?: Map<string, string>;
}) {
  const groups = groupPermissions(all);

  const setMany = (names: string[], on: boolean) => {
    const next = new Set(selected);
    names.forEach((n) => (on ? next.add(n) : next.delete(n)));
    onChange(next);
  };

  return (
    <div>
      {groups.map((g) => {
        const names = g.rows.flatMap((r) => Object.values(r.byAction).map((p) => p.name));
        const on = names.filter((n) => selected.has(n)).length;
        return (
          <section className="matrix-mod" key={g.module}>
            <div className="matrix-mod-head">
              <h3>{titleCase(g.module)}</h3>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--muted)' }}>
                {on}/{names.length}
                <Checkbox
                  hideLabel
                  label={`Select all ${g.module}`}
                  checked={on === names.length}
                  indeterminate={on > 0}
                  onChange={(v) => setMany(names, v)}
                  disabled={readOnly}
                />
              </label>
            </div>
            <ScrollWrap>
              <table className="matrix">
                <thead>
                  <tr>
                    <th>Resource</th>
                    {g.actions.map((a) => (
                      <th key={a}>{a}</th>
                    ))}
                    <th>All</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r) => {
                    const rowNames = Object.values(r.byAction).map((p) => p.name);
                    const rowOn = rowNames.filter((n) => selected.has(n)).length;
                    return (
                      <tr key={r.resource}>
                        <td>{r.resource}</td>
                        {g.actions.map((a) => {
                          const p = r.byAction[a];
                          return (
                            <td key={a}>
                              {p ? (
                                <span title={descriptions?.get(p.name) || p.name}>
                                  <Checkbox
                                    hideLabel
                                    label={p.name}
                                    checked={selected.has(p.name)}
                                    disabled={readOnly}
                                    onChange={(v) => setMany([p.name], v)}
                                  />
                                </span>
                              ) : (
                                <Minus size={14} className="na" aria-hidden="true" />
                              )}
                            </td>
                          );
                        })}
                        <td>
                          <Checkbox
                            hideLabel
                            label={`All ${r.resource} permissions`}
                            checked={rowOn === rowNames.length}
                            indeterminate={rowOn > 0}
                            disabled={readOnly}
                            onChange={(v) => setMany(rowNames, v)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollWrap>
          </section>
        );
      })}
    </div>
  );
}

/** The matrix scrolls sideways on narrow screens; it takes focus then, so the keyboard can scroll it. */
function ScrollWrap({ children }: { children: ReactNode }) {
  const ref = useScrollFocus();
  return (
    <div className="table-wrap" ref={ref}>
      {children}
    </div>
  );
}
