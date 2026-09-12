import { Download } from 'lucide-react';
import { Alert, Button, CopyButton } from '../../components/kit';
import { config } from '../../lib/config';

/** The ten one-time codes, with copy and download. Shown once. */
export function RecoveryCodes({ codes, email }: { codes: string[]; email?: string }) {
  const text = `${config.appName} recovery codes${email ? ` for ${email}` : ''}\nEach code works once. Keep them somewhere safe.\n\n${codes.join('\n')}\n`;
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = `${config.appName.toLowerCase()}-recovery-codes.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  return (
    <div className="recovery">
      <Alert tone="warning" title="Save these now">
        If you lose your phone, each code lets you sign in once. You won’t see them again.
      </Alert>
      <ol className="recovery-codes mono" aria-label="Recovery codes">
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ol>
      <div className="recovery-actions">
        <CopyButton value={codes.join('\n')} label="Copy all codes" size="md">
          Copy all
        </CopyButton>
        <Button iconStart={<Download size={15} />} onClick={download}>
          Download .txt
        </Button>
      </div>
    </div>
  );
}
