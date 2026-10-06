/**
 * First-run empty state: what goes here, how to start, and a template shortcut.
 * Uses: EmptyState, Button.
 */
import { FileUp, Plus } from 'lucide-react';
import { Button, Card, EmptyState } from '@/components/kit';

export default function EmptyProjects() {
  return (
    <Card>
      <EmptyState
        illustration="folder"
        headingLevel={2}
        title="No projects yet"
        description="Projects group tasks, files and people. Start from scratch or import from a spreadsheet."
        actions={
          <>
            <Button variant="primary" iconStart={<Plus size={16} />}>
              New project
            </Button>
            <Button variant="secondary" iconStart={<FileUp size={16} />}>
              Import CSV
            </Button>
          </>
        }
      />
    </Card>
  );
}
