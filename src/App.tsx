import { lazy, Suspense, type ReactElement } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './lib/auth';
import { config } from './lib/config';

// Each page is its own chunk, downloaded when first opened.
const AuditLog = lazy(() => import('./pages/AuditLog'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const LockScreen = lazy(() => import('./pages/auth/LockScreen'));
const Settings = lazy(() => import('./pages/account/Settings'));
const Notifications = lazy(() => import('./pages/account/Notifications'));
const Activity = lazy(() => import('./pages/account/Activity'));
const Permissions = lazy(() => import('./pages/Permissions'));
const Roles = lazy(() => import('./pages/Roles'));
const Users = lazy(() => import('./pages/Users'));
const UiKitOverview = lazy(() => import('./showcase/UiKitOverview'));
const BlocksPage = lazy(() => import('./showcase/BlocksPage'));
const MotionPage = lazy(() => import('./showcase/MotionPage'));
const Analytics = lazy(() => import('./pages/dashboards/Analytics'));
const Sales = lazy(() => import('./pages/dashboards/Sales'));
const Projects = lazy(() => import('./pages/dashboards/Projects'));
const Pricing = lazy(() => import('./pages/content/Pricing'));
const HelpCentre = lazy(() => import('./pages/content/HelpCentre'));
const Changelog = lazy(() => import('./pages/content/Changelog'));
const KanbanApp = lazy(() => import('./pages/apps/Kanban'));
const CalendarApp = lazy(() => import('./pages/apps/Calendar'));
const ChatApp = lazy(() => import('./pages/apps/Chat'));
const MailApp = lazy(() => import('./pages/apps/Mail'));
const FilesApp = lazy(() => import('./pages/apps/Files'));
const InvoicesApp = lazy(() => import('./pages/apps/Invoices'));
const InvoiceDetail = lazy(() => import('./pages/apps/InvoiceDetail'));
const BlankPage = lazy(() => import('./pages/BlankPage'));
const ComponentPage = lazy(() => import('./showcase/ComponentPage'));
const system = () => import('./pages/system/SystemPages');
const NotFound = lazy(() => system().then((m) => ({ default: m.NotFound })));
const Forbidden = lazy(() => system().then((m) => ({ default: m.Forbidden })));
const ServerError = lazy(() => system().then((m) => ({ default: m.ServerError })));
const Maintenance = lazy(() => system().then((m) => ({ default: m.Maintenance })));
const ComingSoon = lazy(() => system().then((m) => ({ default: m.ComingSoon })));

function RequireAuth() {
  const { session, locked } = useAuth();
  const { pathname } = useLocation();
  if (!session) return <Navigate to="/login" replace />;
  if (locked) return <Navigate to="/lock" replace state={{ from: pathname }} />;
  return <Outlet />;
}

/** Sign-in and sign-up pages: send signed-in users to the app. */
function GuestOnly({ children }: { children: ReactElement }) {
  const { session } = useAuth();
  return session ? <Navigate to="/" replace /> : <Suspense fallback={null}>{children}</Suspense>;
}

function RequirePerm({ perm, children }: { perm: string; children: ReactElement }) {
  const { can, session } = useAuth();
  if (perm === 'SUPER_ADMIN' ? session?.superAdmin : can(perm)) return children;
  return <Forbidden permission={perm} />;
}

const Bare = ({ children }: { children: ReactElement }) => <Suspense fallback={null}>{children}</Suspense>;

export default function App() {
  const { session, locked } = useAuth();
  const location = useLocation();
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <Register />
          </GuestOnly>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestOnly>
            <ForgotPassword />
          </GuestOnly>
        }
      />
      {/* Opened from emails, signed in or not. */}
      <Route
        path="/reset-password"
        element={
          <Bare>
            <ResetPassword />
          </Bare>
        }
      />
      <Route
        path="/verify-email"
        element={
          <Bare>
            <VerifyEmail />
          </Bare>
        }
      />
      <Route
        path="/lock"
        element={
          !session ? (
            <Navigate to="/login" replace />
          ) : !locked ? (
            <Navigate to={(location.state as { from?: string } | null)?.from ?? '/'} replace />
          ) : (
            <Bare>
              <LockScreen />
            </Bare>
          )
        }
      />
      {/* Stand-alone system pages (no sign-in needed), e.g. for a status page or a launch teaser. */}
      <Route
        path="/maintenance"
        element={
          <Bare>
            <Maintenance />
          </Bare>
        }
      />
      <Route
        path="/coming-soon"
        element={
          <Bare>
            <ComingSoon />
          </Bare>
        }
      />
      <Route
        path="/404"
        element={
          <Bare>
            <NotFound fullScreen />
          </Bare>
        }
      />
      <Route
        path="/403"
        element={
          <Bare>
            <Forbidden fullScreen />
          </Bare>
        }
      />
      <Route
        path="/500"
        element={
          <Bare>
            <ServerError fullScreen />
          </Bare>
        }
      />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route
            path="users"
            element={
              <RequirePerm perm="admin-user-view">
                <Users />
              </RequirePerm>
            }
          />
          <Route
            path="roles"
            element={
              <RequirePerm perm="admin-role-view">
                <Roles />
              </RequirePerm>
            }
          />
          <Route
            path="permissions"
            element={
              <RequirePerm perm="admin-role-view">
                <Permissions />
              </RequirePerm>
            }
          />
          <Route
            path="audit"
            element={
              <RequirePerm perm="SUPER_ADMIN">
                <AuditLog />
              </RequirePerm>
            }
          />
          <Route path="settings" element={<Navigate to="/settings/profile" replace />} />
          <Route path="settings/:tab" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="activity" element={<Activity />} />
          <Route path="starter" element={<BlankPage />} />
          {config.showcase && (
            <>
              <Route path="dashboards/analytics" element={<Analytics />} />
              <Route path="dashboards/sales" element={<Sales />} />
              <Route path="dashboards/projects" element={<Projects />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="help" element={<HelpCentre />} />
              <Route path="changelog" element={<Changelog />} />
              <Route path="apps/kanban" element={<KanbanApp />} />
              <Route path="apps/calendar" element={<CalendarApp />} />
              <Route path="apps/chat" element={<ChatApp />} />
              <Route path="apps/mail" element={<MailApp />} />
              <Route path="apps/files" element={<FilesApp />} />
              <Route path="apps/invoices" element={<InvoicesApp />} />
              <Route path="apps/invoices/:id" element={<InvoiceDetail />} />
            </>
          )}
          {config.showcase && <Route path="ui" element={<UiKitOverview />} />}
          {config.showcase && <Route path="ui/blocks" element={<BlocksPage />} />}
          {config.showcase && <Route path="ui/motion" element={<MotionPage />} />}
          {config.showcase && <Route path="ui/:slug" element={<ComponentPage />} />}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
