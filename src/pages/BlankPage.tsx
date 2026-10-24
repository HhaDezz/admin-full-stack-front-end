import { FilePlus2, Plus } from 'lucide-react';
import { Button, Card, EmptyState, PageHeader } from '../components/kit';
import { useAuth } from '../lib/auth';
import { Forbidden } from './system/SystemPages';

/**
 * Starter page: copy this file to begin a new feature.
 *
 * 1. Copy it to src/pages/<YourPage>.tsx and rename the component.
 * 2. Add a <Route> in src/App.tsx (wrap it in <RequirePerm perm="…"> to guard the route too).
 * 3. Add it to SECTIONS in src/components/Layout.tsx with the same permission, so the menu hides it,
 *    and to TITLES there, so the breadcrumb in the top bar names it.
 * 4. Replace the empty state with your content, built from the kit (src/components/kit) and blocks (src/blocks).
 */

// The permission this page needs. Create it in the API with a migration (see the API README).
const PERMISSION = 'dashboard-view';

export default function BlankPage() {
  const { can } = useAuth();
  if (!can(PERMISSION)) return <Forbidden permission={PERMISSION} />;
  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Starter page"
        description="A page with a header, a permission check and an empty state, ready for your feature."
        actions={
          <Button variant="primary" iconStart={<Plus size={16} />}>
            Primary action
          </Button>
        }
      />
      <Card>
        <EmptyState
          icon={<FilePlus2 size={22} />}
          headingLevel={2}
          title="Nothing here yet"
          description="This is src/pages/BlankPage.tsx. Copy it, give it a route and a menu entry, and replace this empty state with your feature."
        />
      </Card>
    </>
  );
}
