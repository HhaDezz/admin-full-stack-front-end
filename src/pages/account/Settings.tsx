import './account.css';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Bell, Palette, Shield, User } from 'lucide-react';
import { PageHeader, Tabs } from '../../components/kit';
import AppearanceTab from './AppearanceTab';
import NotificationsTab from './NotificationsTab';
import ProfileTab from './ProfileTab';
import SecurityTab from './SecurityTab';

const TABS = ['profile', 'security', 'notifications', 'appearance'] as const;
type Tab = (typeof TABS)[number];

/** Account settings. The tab is in the URL (/settings/security), so it can be linked to. */
export default function Settings() {
  const { tab = 'profile' } = useParams();
  const navigate = useNavigate();
  if (!TABS.includes(tab as Tab)) return <Navigate to="/settings/profile" replace />;
  return (
    <>
      <PageHeader title="Settings" description="Your profile, sign-in security, notifications and how the app looks." />
      <Tabs<Tab>
        aria-label="Settings"
        value={tab as Tab}
        onChange={(t) => navigate(`/settings/${t}`)}
        items={[
          { value: 'profile', label: 'Profile', icon: <User size={15} />, content: <ProfileTab /> },
          { value: 'security', label: 'Security', icon: <Shield size={15} />, content: <SecurityTab /> },
          { value: 'notifications', label: 'Notifications', icon: <Bell size={15} />, content: <NotificationsTab /> },
          { value: 'appearance', label: 'Appearance', icon: <Palette size={15} />, content: <AppearanceTab /> },
        ]}
      />
    </>
  );
}
