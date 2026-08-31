import { Suspense } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageFallback } from '../components/ui';
import { registry } from './registry';

/** /ui/:slug → the component's docs page from the registry. */
export default function ComponentPage() {
  const { slug } = useParams();
  const entry = registry.find((c) => c.slug === slug);
  if (!entry?.page) return <Navigate to="/ui" replace />;
  const Page = entry.page;
  return (
    <>
      <Link to="/ui" className="kit-back">
        <ArrowLeft size={15} /> UI Kit
      </Link>
      <Suspense fallback={<PageFallback />}>
        <Page />
      </Suspense>
    </>
  );
}
