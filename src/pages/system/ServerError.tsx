import { Home, RefreshCw } from 'lucide-react';
import { config } from '../../lib/config';
import { Button, ResultPage } from '../../components/kit';

/** The 500 page, also shown by the error boundary when a page crashes. */
export function ServerError({ fullScreen, onRetry, detail }: { fullScreen?: boolean; onRetry?: () => void; detail?: string }) {
  return (
    <ResultPage
      status="500"
      fullScreen={fullScreen}
      title="Something went wrong on our side"
      description="It isn’t you. The error has been noted; try again in a moment."
      actions={
        <>
          <Button variant="primary" iconStart={<RefreshCw size={16} />} onClick={onRetry ?? (() => window.location.reload())}>
            Try again
          </Button>
          <a href={config.standalone ? '#/' : '/'} className="btn">
            <Home size={16} /> Dashboard
          </a>
        </>
      }
    >
      {detail && <pre className="result-detail">{detail}</pre>}
    </ResultPage>
  );
}
