import { useMemo, useState, type ReactNode } from 'react';
import {
  ChevronRight,
  Download,
  Eye,
  FileArchive,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  FolderPlus,
  Grid2X2,
  List,
  MoreHorizontal,
  Pencil,
  Search,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  Avatar,
  Button,
  DropdownMenu,
  EmptyState,
  Field,
  FileUpload,
  formatBytes,
  Input,
  Lightbox,
  Modal,
  PageHeader,
  Progress,
  ToggleGroup,
  TreeView,
  useToast,
  type LightboxItem,
  type TreeNode,
  type UploadItem,
  useScrollFocus,
} from '../../components/kit';
import { cx } from '../../components/kit/utils';
import { FILES, person, STORAGE_LIMIT, type FileEntry, type FileKind } from './data';
import { SampleBadge } from './shared';

/* File manager: folders in a tree, files as a grid or a list, breadcrumbs, upload, rename,
 * star, delete, and images that open in the Lightbox. */

const ICON: Record<FileKind, ReactNode> = {
  folder: <Folder size={22} />,
  image: <FileImage size={22} />,
  pdf: <FileText size={22} />,
  doc: <FileText size={22} />,
  sheet: <FileSpreadsheet size={22} />,
  video: <FileVideo size={22} />,
  zip: <FileArchive size={22} />,
  code: <FileCode2 size={22} />,
};
const KIND_LABEL: Record<FileKind, string> = {
  folder: 'Folder',
  image: 'Image',
  pdf: 'PDF',
  doc: 'Document',
  sheet: 'Spreadsheet',
  video: 'Video',
  zip: 'Archive',
  code: 'Code',
};
const kindOf = (name: string): FileKind => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'txt', 'md'].includes(ext)) return 'doc';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet';
  if (['mp4', 'mov', 'webm'].includes(ext)) return 'video';
  if (['zip', 'gz', 'tgz'].includes(ext)) return 'zip';
  return 'code';
};
/** A drawn stand-in for a photo, so the demo needs no image files. */
const thumb = (hue = 160, w = 600, h = 400) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 42% 70%)"/><stop offset="1" stop-color="hsl(${hue + 30} 38% 38%)"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><path d="M220 90 l60 -30 h40 l60 30 l50 70 l-40 25 l-30 -35 v200 h-160 v-200 l-30 35 l-40 -25z" fill="hsl(${hue} 30% 96% / .85)"/></svg>`,
  )}`;
const date = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export default function Files() {
  const scrollRef = useScrollFocus();
  const toast = useToast();
  const [files, setFiles] = useState(FILES);
  const [folder, setFolder] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState<number | null>(null);
  const [renaming, setRenaming] = useState<FileEntry | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newFolder, setNewFolder] = useState(false);

  const children = (id: string | null) => files.filter((f) => f.parent === id);
  const sizeOf = (f: FileEntry): number => (f.kind === 'folder' ? children(f.id).reduce((a, c) => a + sizeOf(c), 0) : (f.size ?? 0));
  const used = files.filter((f) => f.kind !== 'folder').reduce((a, f) => a + (f.size ?? 0), 0);

  const path = useMemo(() => {
    const out: FileEntry[] = [];
    let cur = files.find((f) => f.id === folder);
    while (cur) {
      out.unshift(cur);
      const parent = cur.parent;
      cur = files.find((f) => f.id === parent);
    }
    return out;
  }, [files, folder]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? files.filter((f) => f.name.toLowerCase().includes(q)) : children(folder);
    return [...base].sort((a, b) => Number(b.kind === 'folder') - Number(a.kind === 'folder') || a.name.localeCompare(b.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, folder, query]);
  const images = shown.filter((f) => f.kind === 'image');
  const lightbox: LightboxItem[] = images.map((f) => ({
    src: thumb(f.hue, 1200, 800),
    alt: f.name,
    title: f.name,
    caption: `${formatBytes(f.size ?? 0)} · ${date(f.modified)}`,
    downloadUrl: '#',
  }));

  const tree = useMemo(() => {
    const build = (parent: string | null): TreeNode[] =>
      files
        .filter((f) => f.parent === parent && f.kind === 'folder')
        .map((f) => ({ id: f.id, label: f.name, icon: <Folder size={16} />, children: build(f.id).length ? build(f.id) : undefined }));
    return [{ id: 'root', label: 'All files', icon: <Folder size={16} />, children: build(null) }];
  }, [files]);

  const openEntry = (f: FileEntry) => {
    if (f.kind === 'folder') {
      setFolder(f.id);
      setQuery('');
    } else if (f.kind === 'image') setPreview(images.findIndex((i) => i.id === f.id));
    else toast.info(`${f.name}`, 'Opening files needs your storage API (see src/pages/apps/data.ts).');
  };
  const remove = (f: FileEntry) => {
    const ids = new Set([f.id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const x of files)
        if (x.parent && ids.has(x.parent) && !ids.has(x.id)) {
          ids.add(x.id);
          grew = true;
        }
    }
    setFiles((l) => l.filter((x) => !ids.has(x.id)));
    toast.ok(`${f.name} deleted`);
  };
  const menu = (f: FileEntry) => [
    {
      label: f.kind === 'folder' ? 'Open' : f.kind === 'image' ? 'Preview' : 'Open',
      icon: <Eye size={15} />,
      onSelect: () => openEntry(f),
    },
    ...(f.kind !== 'folder'
      ? [{ label: 'Download', icon: <Download size={15} />, onSelect: () => toast.info(`Downloading ${f.name}`) }]
      : []),
    { label: 'Rename', icon: <Pencil size={15} />, onSelect: () => setRenaming(f) },
    {
      label: f.starred ? 'Remove star' : 'Star',
      icon: <Star size={15} />,
      onSelect: () => setFiles((l) => l.map((x) => (x.id === f.id ? { ...x, starred: !x.starred } : x))),
    },
    { type: 'separator' as const },
    { label: 'Delete', icon: <Trash2 size={15} />, danger: true, onSelect: () => remove(f) },
  ];
  const more = (f: FileEntry) => (
    <DropdownMenu
      label={`Actions for ${f.name}`}
      align="end"
      items={menu(f)}
      trigger={
        <button type="button" className="fm-more" aria-label={`Actions for ${f.name}`}>
          <MoreHorizontal size={16} />
        </button>
      }
    />
  );

  return (
    <>
      <PageHeader
        title="Files"
        description="Shared files for the whole team."
        actions={
          <>
            <SampleBadge />
            <Button iconStart={<FolderPlus size={16} />} onClick={() => setNewFolder(true)}>
              New folder
            </Button>
            <Button variant="primary" iconStart={<Upload size={16} />} onClick={() => setUploading(true)}>
              Upload
            </Button>
          </>
        }
      />
      <div className="fm-app">
        <aside className="card fm-side" aria-label="Folders">
          <TreeView
            aria-label="Folders"
            items={tree}
            size="sm"
            expanded={['root', ...path.map((p) => p.id)]}
            selected={[folder ?? 'root']}
            onSelectedChange={(ids) => {
              setFolder(ids[0] === 'root' || !ids[0] ? null : ids[0]);
              setQuery('');
            }}
          />
          <div className="fm-storage">
            <Progress
              value={used}
              max={STORAGE_LIMIT}
              size="sm"
              label="Storage"
              aria-label="Storage used"
              tone={used / STORAGE_LIMIT > 0.85 ? 'danger' : 'brand'}
            />
            <small className="muted">
              {formatBytes(used)} of {formatBytes(STORAGE_LIMIT)} used
            </small>
          </div>
        </aside>
        <section className="card fm-main" aria-label={path.at(-1)?.name ?? 'All files'}>
          <div className="fm-bar">
            <nav aria-label="Folder path" className="fm-path">
              <ol>
                <li>
                  {folder ? (
                    <button type="button" onClick={() => setFolder(null)}>
                      All files
                    </button>
                  ) : (
                    <span aria-current="page">All files</span>
                  )}
                </li>
                {path.map((p, i) => (
                  <li key={p.id}>
                    <ChevronRight size={14} className="flip-rtl" aria-hidden="true" />
                    {i === path.length - 1 ? (
                      <span aria-current="page">{p.name}</span>
                    ) : (
                      <button type="button" onClick={() => setFolder(p.id)}>
                        {p.name}
                      </button>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            <Input
              size="sm"
              aria-label="Search all files"
              placeholder="Search all files"
              prefix={<Search size={15} />}
              clearable
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="fm-search"
            />
            <ToggleGroup
              size="sm"
              aria-label="View"
              value={view}
              onChange={setView}
              items={[
                { value: 'grid', label: <span className="sr-only">Grid</span>, icon: <Grid2X2 size={15} /> },
                { value: 'list', label: <span className="sr-only">List</span>, icon: <List size={15} /> },
              ]}
            />
          </div>
          {query && (
            <p className="muted fm-note" aria-live="polite">
              {shown.length} {shown.length === 1 ? 'result' : 'results'} for “{query}” in all folders
            </p>
          )}
          {shown.length === 0 ? (
            <EmptyState
              headingLevel={2}
              icon={<Folder size={22} />}
              title={query ? 'No files match' : 'This folder is empty'}
              description={query ? 'Try another name.' : 'Upload files or make a folder to get started.'}
              actions={
                !query && (
                  <Button iconStart={<Upload size={15} />} onClick={() => setUploading(true)}>
                    Upload files
                  </Button>
                )
              }
            />
          ) : view === 'grid' ? (
            <ul className="fm-grid">
              {shown.map((f) => (
                <li key={f.id} className={cx('fm-tile', `is-${f.kind}`)}>
                  <button type="button" className="fm-tile-open" onClick={() => openEntry(f)} onDoubleClick={() => openEntry(f)}>
                    <span className="fm-thumb" aria-hidden="true">
                      {f.kind === 'image' ? <img src={thumb(f.hue, 300, 200)} alt="" /> : ICON[f.kind]}
                    </span>
                    <span className="fm-name">{f.name}</span>
                    <small className="muted">{f.kind === 'folder' ? `${children(f.id).length} items` : formatBytes(f.size ?? 0)}</small>
                  </button>
                  {f.starred && <Star size={13} className="fm-star" aria-label="Starred" />}
                  {more(f)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="table-wrap" ref={scrollRef}>
              <table className="table fm-table">
                <caption className="sr-only">Files in {path.at(-1)?.name ?? 'All files'}</caption>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col" className="fm-hide-sm">
                      Owner
                    </th>
                    <th scope="col" className="fm-hide-sm">
                      Modified
                    </th>
                    <th scope="col" style={{ textAlign: 'end' }}>
                      Size
                    </th>
                    <th scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <button type="button" className="fm-row-open" onClick={() => openEntry(f)}>
                          <span className={cx('fm-ico', `is-${f.kind}`)} aria-hidden="true">
                            {ICON[f.kind]}
                          </span>
                          <span>
                            {f.name}
                            <small className="muted"> · {KIND_LABEL[f.kind]}</small>
                          </span>
                          {f.starred && <Star size={13} className="fm-star-inline" aria-label="Starred" />}
                        </button>
                      </td>
                      <td className="fm-hide-sm">
                        <span className="fm-owner">
                          <Avatar name={person(f.owner).name} size="xs" /> {person(f.owner).name}
                        </span>
                      </td>
                      <td className="fm-hide-sm">{date(f.modified)}</td>
                      <td style={{ textAlign: 'end' }} className="tabular">
                        {formatBytes(sizeOf(f))}
                      </td>
                      <td style={{ width: 40 }}>{more(f)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <Lightbox items={lightbox} open={preview !== null} index={preview ?? 0} onIndexChange={setPreview} onClose={() => setPreview(null)} />
      {renaming && (
        <NameDialog
          title={`Rename ${renaming.kind === 'folder' ? 'folder' : 'file'}`}
          initial={renaming.name}
          action="Rename"
          onClose={() => setRenaming(null)}
          onSave={(name) => {
            setFiles((l) => l.map((x) => (x.id === renaming.id ? { ...x, name } : x)));
            setRenaming(null);
          }}
        />
      )}
      {newFolder && (
        <NameDialog
          title="New folder"
          initial=""
          action="Create"
          onClose={() => setNewFolder(false)}
          onSave={(name) => {
            setFiles((l) => [
              ...l,
              { id: `f${Date.now()}`, parent: folder, name, kind: 'folder', modified: new Date().toISOString(), owner: 'me' },
            ]);
            setNewFolder(false);
          }}
        />
      )}
      {uploading && (
        <UploadDialog
          into={path.at(-1)?.name ?? 'All files'}
          onClose={() => setUploading(false)}
          onDone={(items) => {
            setFiles((l) => [
              ...l,
              ...items.map((u, i) => ({
                id: `u${Date.now()}${i}`,
                parent: folder,
                name: u.file.name,
                kind: kindOf(u.file.name),
                size: u.file.size,
                modified: new Date().toISOString(),
                owner: 'me',
                hue: (i * 67) % 360,
              })),
            ]);
            setUploading(false);
            toast.ok(`${items.length} ${items.length === 1 ? 'file' : 'files'} uploaded`);
          }}
        />
      )}
    </>
  );
}

function NameDialog({
  title,
  initial,
  action,
  onClose,
  onSave,
}: {
  title: string;
  initial: string;
  action: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(initial);
  const [error, setError] = useState('');
  const submit = () => (name.trim() ? onSave(name.trim()) : setError('Enter a name.'));
  return (
    <Modal
      open
      size="sm"
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>
            {action}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field label="Name" required error={error}>
          <Input
            value={name}
            onChange={(e) => (setName(e.target.value), setError(''))}
            autoFocus
            onFocus={(e) =>
              e.target.setSelectionRange(0, e.target.value.lastIndexOf('.') > 0 ? e.target.value.lastIndexOf('.') : e.target.value.length)
            }
          />
        </Field>
      </form>
    </Modal>
  );
}

/** Uploads are simulated with a short delay per file; pass your own `upload` to FileUpload. */
const fakeUpload = (file: File, { onProgress, signal }: { onProgress: (p: number) => void; signal: AbortSignal }) =>
  new Promise<void>((resolve, reject) => {
    let p = 0;
    const t = setInterval(
      () => {
        p += 20 + Math.random() * 25;
        onProgress(Math.min(100, Math.round(p)));
        if (p >= 100) {
          clearInterval(t);
          resolve();
        }
      },
      180 + (file.size % 120),
    );
    signal.addEventListener('abort', () => {
      clearInterval(t);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

function UploadDialog({ into, onClose, onDone }: { into: string; onClose: () => void; onDone: (items: UploadItem[]) => void }) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const done = items.filter((i) => i.status === 'done');
  const busy = items.some((i) => i.status === 'uploading' || i.status === 'queued');
  return (
    <Modal
      open
      title="Upload files"
      subtitle={`Into ${into}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!done.length || busy} onClick={() => onDone(done)}>
            {done.length ? `Add ${done.length} ${done.length === 1 ? 'file' : 'files'}` : 'Add files'}
          </Button>
        </>
      }
    >
      <FileUpload
        value={items}
        onChange={setItems}
        upload={fakeUpload}
        multiple
        maxSize={50 * 1024 * 1024}
        hint="Any file up to 50 MB"
        aria-label="Files to upload"
      />
    </Modal>
  );
}
