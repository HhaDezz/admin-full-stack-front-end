import { useMemo, useState } from 'react';
import { KeyRound, Layers, ShieldAlert } from 'lucide-react';
import { DataTable, type Column } from '../components/data-table';
import { SearchSelect } from '../components/search-select';
import { Badge } from '../components/ui';
import { errorMessage } from '../lib/api';
import { titleCase } from '../lib/format';
import { parsePermission, type ParsedPermission } from '../lib/permissions';
import { usePermissionCatalog, useRoles } from '../lib/queries';

type Row = ParsedPermission & { id: number; roles: string[]; description: string };

const ACTION_TONE: Record<string, 'ok' | 'gold' | 'danger' | undefined> = { view: 'ok', create: 'gold', delete: 'danger' };

export default function Permissions() {
  const catalog = usePermissionCatalog();
  const roles = useRoles();
  const [module, setModule] = useState('');
  const [onlyUnused, setOnlyUnused] = useState(false);

  const rows = useMemo<Row[]>(() => {
    const holders = new Map<string, string[]>();
    (roles.data ?? [])
      .filter((r) => !r.system)
      .forEach((r) => r.permissions.forEach((p) => holders.set(p, [...(holders.get(p) ?? []), r.roleName])));
    return (catalog.data ?? []).map((p) => ({
      ...parsePermission(p.permissionName),
      id: p.id,
      description: p.description ?? '',
      roles: holders.get(p.permissionName) ?? [],
    }));
  }, [catalog.data, roles.data]);

  const modules = useMemo(() => [...new Set(rows.map((r) => r.module))].sort(), [rows]);
  const unused = rows.filter((r) => r.roles.length === 0).length;
  const data = rows.filter((r) => (!module || r.module === module) && (!onlyUnused || r.roles.length === 0));
  const loading = catalog.isLoading || roles.isLoading;
  const err = catalog.error ?? roles.error;

  const columns: Column<Row>[] = [
    {
      id: 'name',
      header: 'Permission',
      hideable: false,
      sortValue: (p) => p.name,
      searchValue: (p) => p.name,
      cell: (p) => <span className="mono">{p.name}</span>,
    },
    {
      id: 'description',
      header: 'What it allows',
      sortValue: (p) => p.description,
      searchValue: (p) => p.description,
      cell: (p) => <span className="muted">{p.description || '—'}</span>,
    },
    {
      id: 'module',
      header: 'Module',
      defaultHidden: true,
      sortValue: (p) => p.module,
      exportValue: (p) => p.module,
      cell: (p) => (
        <Badge>
          <Layers size={11} /> {titleCase(p.module)}
        </Badge>
      ),
    },
    {
      id: 'resource',
      header: 'Resource',
      defaultHidden: true,
      sortValue: (p) => p.resource,
      searchValue: (p) => p.resource,
      cell: (p) => <span style={{ textTransform: 'capitalize' }}>{p.resource}</span>,
    },
    {
      id: 'action',
      header: 'Action',
      sortValue: (p) => p.action,
      exportValue: (p) => p.action,
      cell: (p) => <Badge tone={ACTION_TONE[p.action]}>{p.action}</Badge>,
    },
    {
      id: 'roles',
      header: 'Held by',
      sortValue: (p) => p.roles.length,
      searchValue: (p) => p.roles.map(titleCase).join(' '),
      exportValue: (p) => p.roles.join('; '),
      cell: (p) => (
        <div className="chips">
          {p.roles.length === 0 ? (
            <span className="muted">No roles</span>
          ) : (
            p.roles.map((r) => (
              <Badge key={r} seed={r}>
                {titleCase(r)}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      id: 'id',
      header: 'ID',
      defaultHidden: true,
      align: 'right',
      sortValue: (p) => p.id,
      cell: (p) => <span className="muted">{p.id}</span>,
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Permissions</h1>
          <p>
            Every action the system can check, and which roles currently hold it. Permissions are defined by the back end (add new ones with
            a database migration); assign them to roles on the Roles page.
          </p>
        </div>
      </div>

      <div className="stat-strip">
        <div className="card">
          <b>{loading ? '–' : rows.length}</b>
          <span>Permissions</span>
        </div>
        <div className="card">
          <b>{loading ? '–' : modules.length}</b>
          <span>Modules</span>
        </div>
        <div className="card">
          <b>{loading ? '–' : unused}</b>
          <span>Not assigned to any role</span>
        </div>
      </div>

      <DataTable
        id="permissions"
        data={data}
        columns={columns}
        rowKey={(p) => p.id}
        loading={loading}
        error={err ? `Couldn’t load permissions. ${errorMessage(err)}` : null}
        searchPlaceholder="Search permissions, e.g. user-edit"
        initialSort={{ id: 'name', dir: 'asc' }}
        pageSizes={[25, 50, 100]}
        filtered={!!module || onlyUnused}
        toolbar={
          <>
            <SearchSelect
              aria-label="Filter by module"
              placeholder="All modules"
              searchPlaceholder="Search modules…"
              minWidth={170}
              clearable
              value={module || null}
              onChange={(v) => setModule(v ?? '')}
              options={modules.map((m) => ({
                value: m,
                label: titleCase(m),
                description: `${rows.filter((r) => r.module === m).length} permissions`,
              }))}
            />
            <button type="button" className="pick" aria-pressed={onlyUnused} onClick={() => setOnlyUnused((v) => !v)}>
              <ShieldAlert size={14} /> Unassigned only
            </button>
          </>
        }
        exportFileName="permissions"
        empty={{
          icon: <KeyRound size={22} />,
          title: 'No permissions found',
          description: 'The back end returned an empty permission list.',
        }}
      />
    </>
  );
}
