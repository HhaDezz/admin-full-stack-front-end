import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { ArrowLeft, BarChart3, Home, Moon, RotateCcw, Settings, Sun, Trash2, Users } from 'lucide-react';
import {
  Button,
  Checkbox,
  Drawer,
  DropdownMenu,
  Field,
  Input,
  KanbanBoard,
  Modal,
  PageHeader,
  Popover,
  Skeleton,
  StatCard,
  Switch,
  Tabs,
  Tooltip,
  useToast,
} from '@/components/kit';
import { cx } from '@/components/kit/utils';
import { LineChart } from '@/components/charts';
import { duration, easing, useMotionPreference, useShouldReduceMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import './showcase.css';

/* /ui/motion: every named animation in the app, live, with the token it uses. Replay re-runs
 * the ones that play on arrival. All of them respect "Reduce motion". */

function Tile({ n, title, spec, children, replay }: { n: number; title: string; spec: string; children: ReactNode; replay?: () => void }) {
  const id = `motion-${n}`;
  return (
    <section className="mo-tile" aria-labelledby={id}>
      <header className="mo-head">
        <span className="mo-n" aria-hidden="true">
          {n}
        </span>
        <div>
          <h2 id={id}>{title}</h2>
          <p>{spec}</p>
        </div>
        {replay && (
          <Button size="sm" variant="ghost" iconStart={<RotateCcw size={14} />} onClick={replay} aria-label={`Replay: ${title}`}>
            Replay
          </Button>
        )}
      </header>
      <div className="mo-stage">{children}</div>
    </section>
  );
}

const useReplay = () => {
  const [k, setK] = useState(0);
  return [k, () => setK((x) => x + 1)] as const;
};

const POINTS = Array.from({ length: 14 }, (_, i) => ({ day: i + 1, visits: Math.round(220 + Math.sin(i / 2) * 60 + i * 9) }));

export default function MotionPage() {
  const toast = useToast();
  const reduce = useShouldReduceMotion();
  const { pref, setPref } = useMotionPreference();
  const { theme, toggle } = useTheme();
  const [routeK, replayRoute] = useReplay();
  const [route, setRoute] = useState('Overview');
  const [countK, replayCount] = useReplay();
  const [chartK, replayChart] = useReplay();
  const [collapsed, setCollapsed] = useState(false);
  const [navOn, setNavOn] = useState('Home');
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [rows, setRows] = useState([
    { id: 1, name: 'Order #1046', isNew: false },
    { id: 2, name: 'Order #1045', isNew: false },
    { id: 3, name: 'Order #1044', isNew: false },
  ]);
  const [picked, setPicked] = useState<number[]>([]);
  const [checks, setChecks] = useState({ a: true, b: false });
  const [sw, setSw] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [errorK, setErrorK] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([
    { id: 'k1', column: 'a', title: 'Draft the brief' },
    { id: 'k2', column: 'a', title: 'Pick photos' },
    { id: 'k3', column: 'b', title: 'Review copy' },
  ]);

  return (
    <>
      <Link to="/ui" className="kit-back">
        <ArrowLeft size={15} /> UI Kit
      </Link>
      <PageHeader
        title="Motion"
        description="Every animation in the app, live. Durations and curves come from the motion tokens (--dur-fast 160 ms, --dur-base 240 ms, --dur-slow 360 ms; --ease-enter, --ease-exit), and everything turns off with Reduce motion."
        actions={<Switch checked={pref === 'reduce'} onChange={(v) => setPref(v ? 'reduce' : 'system')} label="Reduce motion" />}
      />
      {reduce && (
        <p className="mo-note" role="status">
          Reduce motion is on (here or in your system settings), so these show their end state without moving.
        </p>
      )}
      <div className="mo-grid">
        <Tile n={1} title="Route change" spec="Content fades and rises 8 px · 240 ms · ease-enter" replay={replayRoute}>
          <div className="mo-route">
            <div className="mo-route-tabs">
              {['Overview', 'Orders', 'People'].map((r) => (
                <button key={r} type="button" className={cx(route === r && 'is-on')} aria-pressed={route === r} onClick={() => setRoute(r)}>
                  {r}
                </button>
              ))}
            </div>
            <m.div
              key={route + routeK}
              className="mo-route-page"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: easing.enter } }}
            >
              <b>{route}</b>
              <span className="pv-line" style={{ width: '80%', height: 7 }} />
              <span className="pv-line" style={{ width: '60%', height: 7 }} />
            </m.div>
          </div>
        </Tile>

        <Tile n={2} title="Dashboard count-up" spec="Numbers count from 0 · 900 ms · ease-out cubic" replay={replayCount}>
          <div style={{ width: 'min(240px, 100%)' }} key={countK}>
            <StatCard
              label="Revenue"
              value={48230}
              format={(v) => `$${Math.round(v).toLocaleString()}`}
              delta={12.4}
              trend={[3, 5, 4, 7, 6, 9]}
            />
          </div>
        </Tile>

        <Tile n={3} title="Charts draw in" spec="Lines draw left to right, bars grow · 600 ms · ease-out" replay={replayChart}>
          <div style={{ width: '100%' }} key={chartK}>
            <LineChart
              aria-label="Visits over two weeks"
              data={POINTS}
              index="day"
              series={[{ key: 'visits', label: 'Visits' }]}
              height={150}
              legend={false}
            />
          </div>
        </Tile>

        <Tile n={4} title="Sidebar collapse" spec="Width eases, the active marker slides between items · spring">
          <div className="mo-side-wrap">
            <m.nav
              className="mo-side"
              aria-label="Sample sidebar"
              animate={{ width: collapsed ? 52 : 168 }}
              transition={{ duration: duration.slow, ease: easing.standard }}
            >
              {[
                ['Home', <Home size={16} key="h" />],
                ['People', <Users size={16} key="u" />],
                ['Reports', <BarChart3 size={16} key="r" />],
                ['Settings', <Settings size={16} key="s" />],
              ].map(([label, icon]) => (
                <button
                  key={label as string}
                  type="button"
                  className={cx('mo-side-item', navOn === label && 'is-on')}
                  onClick={() => setNavOn(label as string)}
                  aria-current={navOn === label || undefined}
                  aria-label={collapsed ? (label as string) : undefined}
                >
                  {navOn === label && (
                    <m.span layoutId="mo-side-ind" className="mo-side-ind" transition={{ type: 'spring', stiffness: 520, damping: 40 }} />
                  )}
                  {icon}
                  {!collapsed && <span>{label}</span>}
                </button>
              ))}
            </m.nav>
            <Button size="sm" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? 'Expand' : 'Collapse'}
            </Button>
          </div>
        </Tile>

        <Tile n={5} title="Tabs indicator glide" spec="The underline glides to the new tab · spring">
          <Tabs
            aria-label="Sample tabs"
            items={[
              { value: 'a', label: 'Details', content: <p className="muted">Name, email and role.</p> },
              { value: 'b', label: 'Activity', content: <p className="muted">What they did recently.</p> },
              { value: 'c', label: 'Billing', content: <p className="muted">Plan and invoices.</p> },
            ]}
          />
        </Tile>

        <Tile n={6} title="Modal and drawer" spec="Modal scales from 96 % and fades; drawer slides from the edge · 360 ms in, 240 ms out">
          <div className="mo-row">
            <Button onClick={() => setModal(true)}>Open modal</Button>
            <Button onClick={() => setDrawer(true)}>Open drawer</Button>
          </div>
          <Modal
            open={modal}
            onClose={() => setModal(false)}
            title="A modal"
            footer={<Button onClick={() => setModal(false)}>Close</Button>}
          >
            <p>Scale and fade in; Escape or the backdrop closes it.</p>
          </Modal>
          <Drawer open={drawer} onClose={() => setDrawer(false)} title="A drawer">
            <p>Slides in from the side and back out.</p>
          </Drawer>
        </Tile>

        <Tile n={7} title="Menus, popovers, tooltips" spec="Scale from the side they open from · 160 ms · ease-enter">
          <div className="mo-row">
            <DropdownMenu
              trigger={<Button>Menu</Button>}
              items={[{ label: 'Edit' }, { label: 'Duplicate' }, { type: 'separator' }, { label: 'Delete', danger: true }]}
            />
            <Popover trigger={<Button>Popover</Button>} title="Popover">
              <p className="muted" style={{ margin: 0 }}>
                Grows from the button.
              </p>
            </Popover>
            <Tooltip content="Grows from its target">
              <Button>Tooltip</Button>
            </Tooltip>
          </div>
        </Tile>

        <Tile n={8} title="Toasts" spec="Slide up and stack; swipe one sideways (or wait) to dismiss · 240 ms">
          <div className="mo-row">
            <Button onClick={() => toast.ok('Saved', 'Swipe me toward the edge')}>Show a toast</Button>
            <Button
              onClick={() => {
                toast.info('First');
                setTimeout(() => toast.info('Second'), 180);
                setTimeout(() => toast.ok('Third'), 360);
              }}
            >
              Show three
            </Button>
          </div>
        </Tile>

        <Tile n={9} title="Table rows" spec="New rows flash gold for 1.6 s; deleted rows fold their height · 240 ms">
          <div className="mo-table">
            <ul>
              <AnimatePresence initial={false}>
                {rows.map((r) => (
                  <m.li
                    key={r.id}
                    layout={!reduce}
                    className={cx(r.isNew && 'row-new')}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, transition: { duration: duration.base, ease: easing.exit } }}
                  >
                    <span>{r.name}</span>
                    <button
                      type="button"
                      className="mo-icon-btn"
                      aria-label={`Delete ${r.name}`}
                      onClick={() => setRows((l) => l.filter((x) => x.id !== r.id))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </m.li>
                ))}
              </AnimatePresence>
            </ul>
            <Button
              size="sm"
              onClick={() =>
                setRows((l) => [
                  { id: Date.now(), name: `Order #${1047 + l.length}`, isNew: true },
                  ...l.map((x) => ({ ...x, isNew: false })),
                ])
              }
            >
              Add a row
            </Button>
          </div>
        </Tile>

        <Tile n={10} title="Bulk-action bar" spec="Slides up when rows are picked · spring">
          <div className="mo-bulk">
            {[1, 2, 3].map((i) => (
              <Checkbox
                key={i}
                label={`Invoice INV-20${40 + i}`}
                checked={picked.includes(i)}
                onChange={(v) => setPicked((p) => (v ? [...p, i] : p.filter((x) => x !== i)))}
              />
            ))}
            <AnimatePresence>
              {picked.length > 0 && (
                <m.div
                  className="mo-bulk-bar"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 520, damping: 40 } }}
                  exit={{ y: 40, opacity: 0, transition: { duration: duration.fast } }}
                >
                  <b>{picked.length} selected</b>
                  <Button size="sm" variant="ghost" onClick={() => setPicked([])}>
                    Clear
                  </Button>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </Tile>

        <Tile n={11} title="Button press" spec="Scales to 0.97 while held · 100 ms">
          <div className="mo-row">
            <Button variant="primary">Press and hold</Button>
            <Button>Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </Tile>

        <Tile n={12} title="Switch and checkbox" spec="The tick draws itself, the thumb slides · 220 ms">
          <div className="mo-col">
            <Checkbox label="Email me a receipt" checked={checks.a} onChange={(v) => setChecks((c) => ({ ...c, a: v }))} />
            <Checkbox label="Remember this device" checked={checks.b} onChange={(v) => setChecks((c) => ({ ...c, b: v }))} />
            <Switch label="Notifications" checked={sw} onChange={setSw} />
          </div>
        </Tile>

        <Tile n={13} title="Form error" spec="The field shakes 4 px once and the message slides down · 360 ms">
          <form
            className="mo-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const err = /^\S+@\S+\.\S+$/.test(email) ? '' : 'Enter an email address like name@example.com.';
              setError(err);
              if (err) setErrorK((k) => k + 1);
              else toast.ok('Looks good');
            }}
          >
            <Field label="Email" error={error} key={errorK}>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </Field>
            <Button type="submit" size="sm">
              Submit
            </Button>
          </form>
        </Tile>

        <Tile n={14} title="Skeleton to content" spec="Placeholders cross-fade into the loaded content · 240 ms">
          <div className="mo-skel">
            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <m.div key="s" className="mo-skel-in" exit={{ opacity: 0, transition: { duration: duration.fast } }}>
                  <Skeleton h={14} w="60%" />
                  <Skeleton h={10} />
                  <Skeleton h={10} w="80%" />
                </m.div>
              ) : (
                <m.div
                  key="c"
                  className="mo-skel-in"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: duration.base } }}
                >
                  <b>Spring collection</b>
                  <span className="muted">Six new colours in washed linen, landing Friday.</span>
                </m.div>
              )}
            </AnimatePresence>
            <Button size="sm" onClick={() => setLoading(!loading)}>
              {loading ? 'Finish loading' : 'Load again'}
            </Button>
          </div>
        </Tile>

        <Tile n={15} title="Kanban: lift and settle" spec="Picked-up cards tilt and lift; dropped cards settle · 220 ms">
          <KanbanBoard
            aria-label="Sample board"
            headingLevel={3}
            columns={[
              { id: 'a', title: 'To do' },
              { id: 'b', title: 'Done' },
            ]}
            items={cards}
            getLabel={(c) => c.title}
            onChange={setCards}
            renderCard={(c) => <span style={{ fontSize: 13, fontWeight: 600 }}>{c.title}</span>}
            className="mo-kanban"
          />
        </Tile>

        <Tile n={16} title="Theme switch" spec="The new theme grows as a circle from the button (View Transitions) · 480 ms">
          <div className="mo-row">
            <Button
              iconStart={theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
              }}
            >
              Switch to {theme === 'dark' ? 'light' : 'dark'}
            </Button>
            <span className="muted" style={{ fontSize: 13 }}>
              Browsers without View Transitions switch instantly.
            </span>
          </div>
        </Tile>
      </div>
    </>
  );
}
