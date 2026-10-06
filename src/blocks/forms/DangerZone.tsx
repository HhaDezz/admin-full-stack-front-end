/**
 * Danger zone: actions that can't be undone, each behind a confirmation.
 * Uses: Card, Button, ConfirmDialog, Input.
 */
import { useState } from 'react';
import { Button, Card, ConfirmDialog, Field, Input, useToast } from '@/components/kit';

const WORKSPACE = 'atelier';

export default function DangerZone() {
  const toast = useToast();
  const [transfer, setTransfer] = useState(false);
  const [del, setDel] = useState(false);
  const [typed, setTyped] = useState('');
  return (
    <Card headingLevel={2} title="Danger zone" description="These can’t be undone." className="blk-danger">
      <div className="blk-danger-rows">
        <div>
          <div>
            <b>Transfer ownership</b>
            <p className="muted">Make someone else the owner. You become an admin.</p>
          </div>
          <Button variant="secondary" onClick={() => setTransfer(true)}>
            Transfer
          </Button>
        </div>
        <div>
          <div>
            <b>Delete workspace</b>
            <p className="muted">Removes every user, role, file and the audit log.</p>
          </div>
          <Button variant="danger" onClick={() => setDel(true)}>
            Delete workspace
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={transfer}
        tone="brand"
        title="Transfer ownership?"
        message="Grace Hopper will become the owner of this workspace."
        confirmLabel="Transfer"
        onConfirm={() => {
          setTransfer(false);
          toast.ok('Ownership transferred');
        }}
        onClose={() => setTransfer(false)}
      />
      <ConfirmDialog
        open={del}
        title="Delete this workspace?"
        message={
          <>
            <p>Everything in it is deleted for good. Type the workspace name to confirm.</p>
            <Field label={`Type “${WORKSPACE}”`}>
              <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
            </Field>
          </>
        }
        confirmLabel="Delete for good"
        busy={false}
        onConfirm={() => {
          if (typed !== WORKSPACE) return toast.err('The name doesn’t match');
          setDel(false);
          setTyped('');
          toast.ok('Workspace deleted (not really, this is a demo)');
        }}
        onClose={() => {
          setDel(false);
          setTyped('');
        }}
      />
    </Card>
  );
}
