import { useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  CircleCheck,
  CircleOff,
  KeyRound,
  LogIn,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  UserX,
} from 'lucide-react';
import { DataTable, type Column } from '../components/data-table';
import { SearchSelect } from '../components/search-select';
import { Avatar, Badge, ConfirmDialog, Modal, Notice, Skeleton, Spinner, useToast } from '../components/ui';
import { api, errorMessage, unwrap } from '../lib/api';
import { useAuth } from '../lib/auth';
import { relativeTime, shortDate, titleCase } from '../lib/format';
import { groupPermissions } from '../lib/permissions';
import { keys, useRoles, useUsers } from '../lib/queries';
import type { User, UserPayload } from '../lib/types';

/* ───────────── Create / edit ───────────── */

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  roleIds: number[];
  enabled: boolean;
}
const blank: FormState = { name: '', email: '', phone: '', address: '', password: '', roleIds: [], enabled: true };

function UserFormModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const { can } = useAuth();
  const roles = useRoles();
  const editing = !!user;
  const [f, setF] = useState<FormState>(
    user
      ? {
          name: user.name,
          email: user.email,
          phone: user.phone ?? '',
          address: user.address ?? '',
          password: '',
          roleIds: user.roles.map((r) => r.id),
          enabled: user.enabled,
        }
      : blank,
  );
  const { session } = useAuth();
  const [error, setError] = useState('');
  const isSelf = !!user && user.id === session?.id;
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  const save = useMutation({
    mutationFn: () => {
      const payload: UserPayload = {
        name: f.name.trim(),
        email: f.email.trim(),
        phone: f.phone.trim(),
        address: f.address.trim(),
        roleIds: f.roleIds,
        enabled: f.enabled,
      };
      if (f.password) payload.password = f.password;
      return unwrap<User>(editing ? api.put(`/users/${user!.id}`, payload) : api.post('/users', payload));
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.users });
      toast.ok(editing ? 'User updated' : 'User created');
      onClose();
    },
    onError: (e) => setError(errorMessage(e)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!f.name.trim()) return setError('Name is required.');
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setError('Enter a valid email address.');
    if (!editing && f.password.length < 8) return setError('Password must be at least 8 characters.');
    if (editing && f.password && f.password.length < 8) return setError('New password must be at least 8 characters.');
    save.mutate();
  };

  return (
    <Modal
      size="lg"
      icon={editing ? <UserCog size={20} /> : <UserPlus size={20} />}
      title={editing ? 'Edit user' : 'Add user'}
      subtitle={editing ? `Update ${user!.name}’s details and access.` : 'Create an account and choose what this person can do.'}
      locked={save.isPending}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose} disabled={save.isPending}>
            Cancel
          </button>
          <button type="submit" form="user-form" className="btn btn-primary" disabled={save.isPending}>
            {save.isPending && <Spinner />} {editing ? 'Save changes' : 'Create user'}
          </button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} noValidate className="form-cols">
        {error && (
          <div className="span-all">
            <Notice danger>{error}</Notice>
          </div>
        )}

        <fieldset className="form-sec">
          <legend>Profile</legend>
          <div className="field">
            <label htmlFor="u-name">Full name</label>
            <input id="u-name" className="input" value={f.name} onChange={(e) => set('name', e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label htmlFor="u-email">Email</label>
            <input id="u-email" className="input" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="u-phone">
              Phone{' '}
              <span className="muted" style={{ fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <input id="u-phone" className="input" value={f.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="u-addr">
              Address{' '}
              <span className="muted" style={{ fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <input id="u-addr" className="input" value={f.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="u-pass">{editing ? 'New password' : 'Password'}</label>
            <input
              id="u-pass"
              className="input"
              type="password"
              autoComplete="new-password"
              value={f.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder={editing ? 'Leave blank to keep the current one' : 'At least 8 characters'}
            />
          </div>
        </fieldset>

        <fieldset className="form-sec">
          <legend>Access</legend>
          <div className="field">
            <span className="label">Roles</span>
            {!can('admin-role-view') ? (
              <span className="hint">You can’t view roles, so they can’t be changed here.</span>
            ) : roles.isLoading ? (
              <Skeleton h={32} />
            ) : (
              <SearchSelect
                aria-label="Roles"
                multiple
                fullWidth
                placeholder="Choose roles"
                searchPlaceholder="Search roles…"
                value={f.roleIds}
                onChange={(ids) => set('roleIds', ids)}
                options={(roles.data ?? []).map((r) => ({
                  value: r.id,
                  label: titleCase(r.roleName),
                  description: r.description ?? undefined,
                  icon: <ShieldCheck size={15} />,
                }))}
              />
            )}
            <span className="hint">A person gets every permission from every role they hold.</span>
          </div>
          <div className="field">
            <span className="label">Account status</span>
            <label className={`switch ${isSelf ? 'is-disabled' : ''}`}>
              <input type="checkbox" checked={f.enabled} disabled={isSelf} onChange={(e) => set('enabled', e.target.checked)} />
              <span className="switch-track" aria-hidden="true">
                <span className="switch-thumb" />
              </span>
              <span>{f.enabled ? 'Enabled: can sign in' : 'Disabled: can’t sign in'}</span>
            </label>
            <span className="hint">
              {isSelf ? 'You can’t disable your own account.' : 'Disabling signs the person out everywhere straight away.'}
            </span>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

/* ───────────── Profile view ───────────── */

function Detail({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="detail">
      <span className="detail-ico">{icon}</span>
      <div>
        <div className="detail-l">{label}</div>
        <div className="detail-v">{children}</div>
      </div>
    </div>
  );
}

function UserDetailsModal({
  user,
  onClose,
  onEdit,
  onDelete,
  onResetTwoFactor,
}: {
  user: User;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Turns two-step sign-in off for someone who lost their phone. */
  onResetTwoFactor?: () => void;
}) {
  const superAdmin = user.roles.some((r) => r.system);
  const perms = useMemo(() => [...new Set(user.roles.flatMap((r) => r.permissions))], [user]);
  const groups = groupPermissions(perms);
  return (
    <Modal
      size="lg"
      title={user.name}
      subtitle={user.email}
      icon={<Avatar name={user.name} size={44} />}
      onClose={onClose}
      footer={
        <>
          {onDelete && !user.system && (
            <button className="btn" onClick={onDelete}>
              <Trash2 size={15} /> Delete
            </button>
          )}
          <span style={{ flex: 1 }} />
          <button className="btn" onClick={onClose}>
            Close
          </button>
          {onEdit && !user.system && (
            <button className="btn btn-primary" onClick={onEdit}>
              <Pencil size={15} /> Edit user
            </button>
          )}
        </>
      }
    >
      <div className="detail-grid">
        <Detail icon={<Mail size={16} />} label="Email">
          {user.email}
          {user.emailVerified === false && (
            <>
              {' '}
              <Badge tone="warn">Not confirmed</Badge>
            </>
          )}
        </Detail>
        <Detail icon={<Phone size={16} />} label="Phone">
          {user.phone || '—'}
        </Detail>
        <Detail icon={<MapPin size={16} />} label="Address">
          {user.address || '—'}
        </Detail>
        <Detail icon={<CalendarDays size={16} />} label="Added">
          {shortDate(user.createdAt)}
        </Detail>
        <Detail icon={<LogIn size={16} />} label="Last sign-in">
          {user.lastLoginAt ? relativeTime(user.lastLoginAt) : 'Never'}
        </Detail>
        <Detail icon={user.enabled ? <CircleCheck size={16} /> : <CircleOff size={16} />} label="Status">
          {user.enabled ? 'Enabled' : 'Disabled'}
          {user.system ? ' · built-in administrator' : ''}
        </Detail>
        <Detail icon={<ShieldCheck size={16} />} label="Two-step sign-in">
          {user.twoFactorEnabled ? 'On' : 'Off'}
          {user.twoFactorEnabled && onResetTwoFactor && !user.system && (
            <>
              {' · '}
              <button type="button" className="link" onClick={onResetTwoFactor}>
                Turn off (lost phone)
              </button>
            </>
          )}
        </Detail>
      </div>

      <div className="detail-block">
        <div className="label">Roles</div>
        <div className="chips">
          {user.roles.length ? (
            user.roles.map((r) => (
              <Badge key={r.id} seed={r.roleName}>
                {titleCase(r.roleName)}
              </Badge>
            ))
          ) : (
            <span className="muted">No roles</span>
          )}
        </div>
      </div>
      <div className="detail-block">
        <div className="label">
          <KeyRound size={13} style={{ verticalAlign: -2 }} /> Effective permissions · {superAdmin ? 'all' : perms.length}
        </div>
        {superAdmin ? (
          <span className="muted">Super admin: holds every permission, including ones added in future, and can see the audit log.</span>
        ) : groups.length === 0 ? (
          <span className="muted">This person can’t do anything yet. Give them a role.</span>
        ) : (
          <div className="perm-summary">
            {groups.map((g) => (
              <div key={g.module} className="perm-sum-row">
                <span className="perm-sum-mod">{titleCase(g.module)}</span>
                <div className="chips">
                  {g.rows.map((r) => (
                    <span key={r.resource} className="badge" title={Object.keys(r.byAction).join(', ')}>
                      <span style={{ textTransform: 'capitalize' }}>{r.resource}</span>
                      <span className="muted" style={{ fontWeight: 500 }}>
                        · {Object.keys(r.byAction).join('/')}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ───────────── Page ───────────── */

export default function Users() {
  const [params] = useSearchParams();
  const { can } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const users = useUsers();
  const roles = useRoles();
  const { session } = useAuth();
  const [role, setRole] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState<User | null | undefined>(undefined); // undefined = closed, null = new
  const [viewing, setViewing] = useState<User | null>(null);
  const [resetting, setResetting] = useState<User | null>(null);
  const resetTwoFactor = useMutation({
    mutationFn: (u: User) => unwrap<User>(api.post(`/users/${u.id}/2fa/reset`)),
    onSuccess: (u) => {
      toast.ok('Two-step sign-in turned off', `${u.name} can sign in with their password.`);
      setResetting(null);
      setViewing((v) => (v && v.id === u.id ? { ...v, twoFactorEnabled: false } : v));
      void qc.invalidateQueries({ queryKey: keys.users });
    },
    onError: (e) => toast.err(errorMessage(e)),
  });
  // "Add a user" from the command palette opens the form straight away.
  const [, setParams] = useSearchParams();
  useEffect(() => {
    if (params.get('new') && can('admin-user-create')) {
      setEditing(null);
      setParams(
        (p) => {
          p.delete('new');
          return p;
        },
        { replace: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);
  const [deleting, setDeleting] = useState<User[] | null>(null);
  const [afterDelete, setAfterDelete] = useState<() => void>(() => () => {});

  const remove = useMutation({
    mutationFn: async (list: User[]) => {
      const results = await Promise.allSettled(list.map((u) => api.delete(`/users/${u.id}`)));
      const failed = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      return { ok: list.length - failed.length, failed: failed.length, firstError: failed[0]?.reason };
    },
    onSuccess: ({ ok, failed, firstError }) => {
      void qc.invalidateQueries({ queryKey: keys.users });
      if (ok) toast.ok(ok === 1 ? 'User deleted' : `${ok} users deleted`);
      if (failed) toast.err(`${failed} couldn’t be deleted: ${errorMessage(firstError)}`);
      afterDelete();
      setDeleting(null);
      setViewing(null);
    },
  });

  const status = useMutation({
    mutationFn: async ({ list, enabled }: { list: User[]; enabled: boolean; done: () => void }) => {
      const results = await Promise.allSettled(list.map((u) => api.patch(`/users/${u.id}/status`, { enabled })));
      const failed = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      return { ok: list.length - failed.length, failed: failed.length, firstError: failed[0]?.reason, enabled };
    },
    onSuccess: ({ ok, failed, firstError, enabled }, vars) => {
      void qc.invalidateQueries({ queryKey: keys.users });
      if (ok) toast.ok(`${ok} user${ok === 1 ? '' : 's'} ${enabled ? 'enabled' : 'disabled'}`);
      if (failed) toast.err(`${failed} couldn’t be changed: ${errorMessage(firstError)}`);
      vars.done();
    },
  });

  const data = useMemo(
    () =>
      (users.data ?? []).filter(
        (u) =>
          (!role || u.roles.some((r) => r.roleName === role)) && (!statusFilter || (statusFilter === 'enabled' ? u.enabled : !u.enabled)),
      ),
    [users.data, role, statusFilter],
  );

  const columns: Column<User>[] = [
    {
      id: 'user',
      header: 'User',
      hideable: false,
      sortValue: (u) => u.name,
      searchValue: (u) => `${u.name} ${u.email}`,
      exportValue: (u) => u.name,
      cell: (u) => (
        <div className="cell-user">
          <Avatar name={u.name} />
          <div style={{ minWidth: 0 }}>
            <div className="n">
              {u.name}{' '}
              {u.system && (
                <span className="tag-system" title="Built-in administrator">
                  <ShieldCheck size={12} />
                </span>
              )}
              {u.id === session?.id && <span className="tag-you">You</span>}
            </div>
            <div className="e">{u.email}</div>
          </div>
        </div>
      ),
    },
    { id: 'email', header: 'Email', defaultHidden: true, sortValue: (u) => u.email, exportValue: (u) => u.email, cell: (u) => u.email },
    {
      id: 'roles',
      header: 'Roles',
      sortValue: (u) =>
        u.roles
          .map((r) => r.roleName)
          .sort()
          .join(','),
      searchValue: (u) => u.roles.map((r) => titleCase(r.roleName)).join(' '),
      exportValue: (u) => u.roles.map((r) => r.roleName).join('; '),
      cell: (u) => (
        <div className="chips">
          {u.roles.length ? (
            u.roles.map((r) => (
              <Badge key={r.id} seed={r.roleName}>
                {titleCase(r.roleName)}
              </Badge>
            ))
          ) : (
            <span className="muted">—</span>
          )}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      nowrap: true,
      sortValue: (u) => (u.enabled ? 1 : 0),
      searchValue: (u) => (u.enabled ? 'enabled active' : 'disabled'),
      exportValue: (u) => (u.enabled ? (u.emailVerified === false ? 'Enabled, email not confirmed' : 'Enabled') : 'Disabled'),
      cell: (u) => (
        <div className="chips">
          {u.enabled ? (
            <Badge tone="ok">
              <CircleCheck size={11} /> Enabled
            </Badge>
          ) : (
            <Badge tone="danger">
              <CircleOff size={11} /> Disabled
            </Badge>
          )}
          {u.emailVerified === false && <Badge tone="warn">Unconfirmed email</Badge>}
        </div>
      ),
    },
    {
      id: 'twoFactor',
      header: 'Two-step',
      nowrap: true,
      sortValue: (u) => (u.twoFactorEnabled ? 1 : 0),
      searchValue: (u) => (u.twoFactorEnabled ? 'two-step 2fa on' : ''),
      exportValue: (u) => (u.twoFactorEnabled ? 'On' : 'Off'),
      cell: (u) =>
        u.twoFactorEnabled ? (
          <Badge tone="ok" dot>
            On
          </Badge>
        ) : (
          <span className="muted">Off</span>
        ),
    },
    {
      id: 'lastLogin',
      header: 'Last sign-in',
      nowrap: true,
      sortValue: (u) => (u.lastLoginAt ? +new Date(u.lastLoginAt) : null),
      exportValue: (u) => u.lastLoginAt ?? '',
      cell: (u) => (
        <span className="muted" title={u.lastLoginAt ?? undefined}>
          {u.lastLoginAt ? relativeTime(u.lastLoginAt) : 'Never'}
        </span>
      ),
    },
    {
      id: 'phone',
      header: 'Phone',
      nowrap: true,
      defaultHidden: true,
      searchValue: (u) => u.phone ?? '',
      cell: (u) => <span className="muted">{u.phone || '—'}</span>,
    },
    {
      id: 'address',
      header: 'Address',
      defaultHidden: true,
      searchValue: (u) => u.address ?? '',
      cell: (u) => <span className="muted">{u.address || '—'}</span>,
    },
    {
      id: 'created',
      header: 'Added',
      nowrap: true,
      sortValue: (u) => (u.createdAt ? +new Date(u.createdAt) : null),
      exportValue: (u) => u.createdAt ?? '',
      cell: (u) => <span className="muted">{shortDate(u.createdAt)}</span>,
    },
    {
      id: 'updated',
      header: 'Updated',
      nowrap: true,
      defaultHidden: true,
      sortValue: (u) => (u.updatedAt ? +new Date(u.updatedAt) : null),
      exportValue: (u) => u.updatedAt ?? '',
      cell: (u) => <span className="muted">{shortDate(u.updatedAt)}</span>,
    },
  ];

  const askDelete = (list: User[], then: () => void = () => {}) => {
    setAfterDelete(() => then);
    setDeleting(list);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p>Everyone with access to the system, the roles they hold and whether their account is active.</p>
        </div>
        {can('admin-user-create') && (
          <button className="btn btn-primary" onClick={() => setEditing(null)}>
            <Plus size={17} /> Add user
          </button>
        )}
      </div>

      <DataTable
        id="users"
        defaultQuery={params.get('q') ?? undefined}
        data={data}
        columns={columns}
        rowKey={(u) => u.id}
        loading={users.isLoading}
        error={users.isError ? `Couldn’t load users. ${errorMessage(users.error)}` : null}
        searchPlaceholder="Search name, email, role or status"
        initialSort={{ id: 'created', dir: 'desc' }}
        filtered={!!role || !!statusFilter}
        toolbar={
          <>
            <SearchSelect
              aria-label="Filter by role"
              placeholder="All roles"
              searchPlaceholder="Search roles…"
              minWidth={170}
              clearable
              value={role || null}
              onChange={(v) => setRole(v ?? '')}
              options={(roles.data ?? []).map((r) => ({
                value: r.roleName,
                label: titleCase(r.roleName),
                description: r.description ?? undefined,
              }))}
            />
            <SearchSelect
              aria-label="Filter by status"
              placeholder="Any status"
              minWidth={150}
              searchable={false}
              clearable
              value={statusFilter || null}
              onChange={(v) => setStatusFilter(v ?? '')}
              options={[
                { value: 'enabled', label: 'Enabled', icon: <CircleCheck size={14} /> },
                { value: 'disabled', label: 'Disabled', icon: <CircleOff size={14} /> },
              ]}
            />
          </>
        }
        selectable
        bulkActions={(rows, clear) => {
          const targets = rows.filter((u) => !u.system && u.id !== session?.id);
          return (
            <>
              {can('admin-user-edit') && (
                <>
                  <button
                    className="btn btn-sm"
                    disabled={!targets.length || status.isPending}
                    onClick={() => status.mutate({ list: targets, enabled: true, done: clear })}
                  >
                    <CircleCheck size={14} /> Enable
                  </button>
                  <button
                    className="btn btn-sm"
                    disabled={!targets.length || status.isPending}
                    onClick={() => status.mutate({ list: targets, enabled: false, done: clear })}
                  >
                    <CircleOff size={14} /> Disable
                  </button>
                </>
              )}
              {can('admin-user-delete') && (
                <button className="btn btn-sm btn-danger" disabled={!targets.length} onClick={() => askDelete(targets, clear)}>
                  <Trash2 size={14} /> Delete {targets.length}
                </button>
              )}
            </>
          );
        }}
        onRowClick={setViewing}
        rowActions={(u) =>
          u.system ? (
            <span className="muted" style={{ fontSize: 12 }}>
              Built-in
            </span>
          ) : (
            <>
              {can('admin-user-edit') && (
                <button className="btn btn-ghost btn-icon" aria-label={`Edit ${u.name}`} title="Edit" onClick={() => setEditing(u)}>
                  <Pencil size={16} />
                </button>
              )}
              {can('admin-user-delete') && u.id !== session?.id && (
                <button className="btn btn-ghost btn-icon" aria-label={`Delete ${u.name}`} title="Delete" onClick={() => askDelete([u])}>
                  <Trash2 size={16} />
                </button>
              )}
            </>
          )
        }
        exportFileName="users"
        empty={{ icon: <UserX size={22} />, title: 'No users yet', description: 'Add the first person to get started.' }}
        emptyFiltered={{ icon: <UserX size={22} />, title: 'No users match', description: 'Try a different search or clear a filter.' }}
      />

      {viewing && !editing && !deleting && (
        <UserDetailsModal
          user={viewing}
          onClose={() => setViewing(null)}
          onEdit={
            can('admin-user-edit')
              ? () => {
                  setEditing(viewing);
                  setViewing(null);
                }
              : undefined
          }
          onDelete={can('admin-user-delete') && viewing.id !== session?.id ? () => askDelete([viewing]) : undefined}
          onResetTwoFactor={can('admin-user-edit') && viewing.id !== session?.id ? () => setResetting(viewing) : undefined}
        />
      )}
      {resetting && (
        <ConfirmDialog
          open
          title="Turn off two-step sign-in?"
          message={`${resetting.name} will be able to sign in with just their password, and they'll get an alert. Do this only after you've confirmed who's asking.`}
          confirmLabel="Turn off"
          busy={resetTwoFactor.isPending}
          onConfirm={() => resetTwoFactor.mutate(resetting)}
          onClose={() => setResetting(null)}
        />
      )}
      {editing !== undefined && <UserFormModal user={editing} onClose={() => setEditing(undefined)} />}
      {deleting && (
        <ConfirmDialog
          title={deleting.length === 1 ? 'Delete user?' : `Delete ${deleting.length} users?`}
          message={
            deleting.length === 1 ? (
              <>
                This permanently removes <b>{deleting[0].name}</b> and their access. This can’t be undone.
              </>
            ) : (
              <>
                This permanently removes <b>{deleting.length} people</b> and their access. This can’t be undone.
              </>
            )
          }
          confirmLabel={deleting.length === 1 ? 'Delete' : `Delete ${deleting.length}`}
          busy={remove.isPending}
          onClose={() => setDeleting(null)}
          onConfirm={() => remove.mutate(deleting)}
        />
      )}
    </>
  );
}
