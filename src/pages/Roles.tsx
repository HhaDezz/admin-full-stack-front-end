import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock, Pencil, Plus, Search, ShieldCheck, ShieldPlus, Trash2 } from 'lucide-react';
import PermissionMatrix from '../components/PermissionMatrix';
import { ConfirmDialog, Empty, Modal, Notice, Skeleton, Spinner, useToast } from '../components/ui';
import { api, errorMessage, unwrap } from '../lib/api';
import { useAuth } from '../lib/auth';
import { hue, titleCase } from '../lib/format';
import { keys, usePermissionCatalog, useRoles } from '../lib/queries';
import type { Role, RolePayload } from '../lib/types';

function RoleForm({ role, onClose, onSaved }: { role: Role | null; onClose: () => void; onSaved: (r: Role) => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [name, setName] = useState(role?.roleName ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [error, setError] = useState('');

  const save = useMutation({
    mutationFn: () => {
      const payload: RolePayload = {
        roleName: name.trim(),
        description: description.trim(),
        // Keep existing permissions when renaming – the API replaces them whenever this list is sent.
        permissions: role?.permissions ?? [],
      };
      return unwrap<Role>(role ? api.put(`/roles/${role.id}`, payload) : api.post('/roles', payload));
    },
    onSuccess: (saved) => {
      void qc.invalidateQueries({ queryKey: keys.roles });
      void qc.invalidateQueries({ queryKey: keys.users });
      toast.ok(role ? 'Role updated' : 'Role created');
      onSaved(saved);
    },
    onError: (e) => setError(errorMessage(e)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[A-Z][A-Z0-9_]*$/.test(name.trim()))
      return setError('Start with a capital letter; use capitals, digits and underscores, e.g. SALES_MANAGER.');
    save.mutate();
  };

  return (
    <Modal
      title={role ? 'Edit role' : 'New role'}
      subtitle={
        role
          ? 'Rename the role or change its description. Permissions stay as they are.'
          : 'Name the role, then choose its permissions in the grid.'
      }
      icon={<ShieldPlus size={20} />}
      tone="gold"
      locked={save.isPending}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose} disabled={save.isPending}>
            Cancel
          </button>
          <button type="submit" form="role-form" className="btn btn-primary" disabled={save.isPending}>
            {save.isPending && <Spinner />} {role ? 'Save' : 'Create role'}
          </button>
        </>
      }
    >
      <form id="role-form" onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <Notice danger>{error}</Notice>}
        <div className="field">
          <label htmlFor="r-name">Role name</label>
          <input
            id="r-name"
            className="input mono"
            value={name}
            autoFocus
            placeholder="SALES_MANAGER"
            onChange={(e) => setName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
          />
          <span className="hint">Capitals, digits and underscores. Shown to people as “Sales Manager”.</span>
        </div>
        <div className="field">
          <label htmlFor="r-desc">Description</label>
          <textarea
            id="r-desc"
            className="textarea"
            value={description}
            placeholder="What is this role for?"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}

export default function Roles() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const roles = useRoles();
  const catalog = usePermissionCatalog();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [form, setForm] = useState<Role | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const [draft, setDraft] = useState<Set<string>>(new Set());

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (roles.data ?? []).filter((r) => !needle || r.roleName.toLowerCase().includes(needle));
  }, [roles.data, q]);

  const selected = roles.data?.find((r) => r.id === selectedId) ?? null;
  // Select the first role automatically once data arrives.
  useEffect(() => {
    if (roles.data?.length && !roles.data.some((r) => r.id === selectedId)) setSelectedId(roles.data[0].id);
  }, [roles.data, selectedId]);
  // Reset the working copy whenever the chosen role (or its saved permissions) changes.
  useEffect(() => {
    setDraft(new Set(selected?.permissions ?? []));
  }, [selected?.id, selected?.permissions]);

  const allNames = useMemo(() => (catalog.data ?? []).map((p) => p.permissionName), [catalog.data]);
  const descriptions = useMemo(() => new Map((catalog.data ?? []).map((p) => [p.permissionName, p.description ?? ''])), [catalog.data]);
  const idByName = useMemo(() => new Map((catalog.data ?? []).map((p) => [p.permissionName, p.id])), [catalog.data]);
  const userCount = (r: Role) => r.userCount ?? 0;

  const saved = new Set(selected?.permissions ?? []);
  const dirty = !!selected && (draft.size !== saved.size || [...draft].some((n) => !saved.has(n)));
  const canEdit = can('admin-role-edit') && !selected?.system;

  const savePerms = useMutation({
    mutationFn: () => {
      const ids = [...draft].map((n) => idByName.get(n)).filter((x): x is number => x !== undefined);
      return unwrap<Role>(api.put(`/roles/${selected!.id}/permissions`, ids));
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.roles });
      void qc.invalidateQueries({ queryKey: keys.users });
      toast.ok('Permissions saved');
    },
    onError: (e) => toast.err(errorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/roles/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.roles });
      void qc.invalidateQueries({ queryKey: keys.users });
      toast.ok('Role deleted');
      setDeleting(null);
      setSelectedId(null);
    },
    onError: (e) => {
      toast.err(errorMessage(e));
      setDeleting(null);
    },
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Roles</h1>
          <p>A role is a bundle of permissions. Give people roles, and change a role once to update everyone who holds it.</p>
        </div>
        {can('admin-role-create') && (
          <button className="btn btn-primary" onClick={() => setForm(null)}>
            <Plus size={17} /> New role
          </button>
        )}
      </div>

      {roles.isError && (
        <div style={{ marginBottom: 14 }}>
          <Notice danger>Couldn’t load roles. {errorMessage(roles.error)}</Notice>
        </div>
      )}

      <div className="split">
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="toolbar">
            <div className="input-wrap grow">
              <Search size={17} />
              <input
                className="input"
                placeholder="Find a role"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Find a role"
              />
            </div>
          </div>
          {roles.isLoading ? (
            <div className="card-pad" style={{ display: 'grid', gap: 12 }}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} h={46} />
              ))}
            </div>
          ) : list.length === 0 ? (
            <Empty icon={<ShieldCheck size={22} />} title="No roles found" />
          ) : (
            list.map((r) => (
              <button key={r.id} className="role-item" aria-current={r.id === selectedId} onClick={() => setSelectedId(r.id)}>
                <div className="role-glyph" style={{ '--h': hue(r.roleName) } as CSSProperties}>
                  <ShieldCheck size={19} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="rn">
                    {titleCase(r.roleName)} {r.system && <Lock size={12} style={{ verticalAlign: -1, opacity: 0.6 }} />}
                  </div>
                  <div className="rs">
                    {r.system ? 'All permissions' : `${r.permissions.length} permission${r.permissions.length === 1 ? '' : 's'}`} ·{' '}
                    {userCount(r)} user{userCount(r) === 1 ? '' : 's'}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="card" style={{ minHeight: 320 }}>
          {!selected ? (
            roles.isLoading ? (
              <div className="card-pad">
                <Skeleton h={200} />
              </div>
            ) : (
              <Empty icon={<ShieldCheck size={22} />} title="Select a role">
                Pick a role on the left to see what it can do.
              </Empty>
            )
          ) : (
            <>
              <div className="card-head" style={{ paddingBottom: 14, borderBottom: '1px solid var(--line)' }}>
                <div style={{ minWidth: 0 }}>
                  <h2 className="display" style={{ fontSize: 22 }}>
                    {titleCase(selected.roleName)}
                  </h2>
                  <div className="sub">{selected.description || 'No description'}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {selected.system ? (
                    <span className="badge badge-gold">
                      <Lock size={11} /> Built in
                    </span>
                  ) : (
                    <>
                      {can('admin-role-edit') && (
                        <button className="btn btn-sm" onClick={() => setForm(selected)}>
                          <Pencil size={14} /> Edit
                        </button>
                      )}
                      {can('admin-role-delete') && (
                        <button className="btn btn-sm" onClick={() => setDeleting(selected)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {selected.system && (
                <div style={{ padding: '14px 20px 0' }}>
                  <Notice>
                    This role is built in. It always holds every permission, including ones you add later, and its holders can see the audit
                    log.
                  </Notice>
                </div>
              )}
              {catalog.isLoading ? (
                <div className="card-pad">
                  <Skeleton h={240} />
                </div>
              ) : (
                <PermissionMatrix
                  all={allNames}
                  selected={selected.system ? new Set(allNames) : draft}
                  onChange={setDraft}
                  readOnly={!canEdit}
                  descriptions={descriptions}
                />
              )}
              {dirty && canEdit && (
                <div className="savebar">
                  <span className="grow">
                    {draft.size} of {allNames.length} permissions selected · unsaved changes
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setDraft(new Set(selected.permissions))}
                    disabled={savePerms.isPending}
                  >
                    Discard
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => savePerms.mutate()} disabled={savePerms.isPending}>
                    {savePerms.isPending && <Spinner />} Save permissions
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {form !== undefined && (
        <RoleForm
          role={form}
          onClose={() => setForm(undefined)}
          onSaved={(r) => {
            setForm(undefined);
            setSelectedId(r.id);
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete role?"
          message={
            <>
              Deleting <b>{titleCase(deleting.roleName)}</b> removes it from {userCount(deleting)} user
              {userCount(deleting) === 1 ? '' : 's'}. This can’t be undone.
            </>
          }
          busy={remove.isPending}
          onClose={() => setDeleting(null)}
          onConfirm={() => remove.mutate(deleting.id)}
        />
      )}
    </>
  );
}
