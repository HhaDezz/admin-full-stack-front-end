import { Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code2, Eye } from 'lucide-react';
import { PageHeader, Skeleton, ToggleGroup } from '@/components/kit';
import { BLOCK_CATEGORIES, blocks, type BlockCategory, type BlockEntry } from '../blocks/registry';
import { CodeView, PreviewFrame, PreviewToolbar, useFrame } from './DocParts';
import './showcase.css';

/** /ui/blocks: every block live, with its source one tab away. */
export default function BlocksPage() {
  const [cat, setCat] = useState<'All' | BlockCategory>(() => {
    try {
      return (sessionStorage.getItem('atelier.blocks.cat') as BlockCategory) || 'All';
    } catch {
      return 'All';
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem('atelier.blocks.cat', cat);
    } catch {
      /* storage blocked */
    }
  }, [cat]);
  const shown = cat === 'All' ? blocks : blocks.filter((b) => b.category === cat);
  return (
    <>
      <Link to="/ui" className="kit-back">
        <ArrowLeft size={15} /> UI Kit
      </Link>
      <PageHeader
        title="Blocks"
        description={`${blocks.length} ready-made sections built from the kit: stats, chart cards, lists, forms, pricing, sign-in cards and more. Each one is a single file in src/blocks; copy it into a page and swap the sample data for your query.`}
      />
      <div className="blocks-filter">
        <ToggleGroup
          size="sm"
          aria-label="Category"
          value={cat}
          onChange={setCat}
          items={[
            { value: 'All', label: `All ${blocks.length}` },
            ...BLOCK_CATEGORIES.map((c) => ({ value: c, label: `${c} ${blocks.filter((b) => b.category === c).length}` })),
          ]}
        />
      </div>
      <div className="blocks-grid">
        {shown.map((b) => (
          <BlockCard key={b.file} block={b} />
        ))}
      </div>
    </>
  );
}

function BlockCard({ block }: { block: BlockEntry }) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [code, setCode] = useState<string | null>(null);
  const [frame, setFrame] = useFrame();
  const { Component } = block;
  useEffect(() => {
    if (tab === 'code' && code == null) void block.source().then(setCode);
  }, [tab, code, block]);
  return (
    <section className={`ex card blocks-item is-${block.width}`} id={block.slug} aria-labelledby={`${block.slug}-title`}>
      <header className="ex-head">
        <div>
          <h2 id={`${block.slug}-title`}>
            <a href={`#${block.slug}`}>{block.name}</a>
          </h2>
          <p>
            {block.description} <span className="mono blocks-file">src/blocks/{block.file}.tsx</span>
          </p>
        </div>
        <div className="seg" role="tablist" aria-label={`${block.name} view`}>
          <button role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>
            <Eye size={15} /> Preview
          </button>
          <button role="tab" aria-selected={tab === 'code'} onClick={() => setTab('code')}>
            <Code2 size={15} /> Code
          </button>
        </div>
      </header>
      {tab === 'preview' ? (
        <>
          <PreviewToolbar state={frame} onChange={setFrame} label={block.name} />
          <PreviewFrame state={frame} className="ex-stage blocks-stage">
            <Suspense fallback={<Skeleton h={180} />}>
              <Component />
            </Suspense>
          </PreviewFrame>
        </>
      ) : code == null ? (
        <div className="card-pad">
          <Skeleton h={160} />
        </div>
      ) : (
        <CodeView code={code} />
      )}
    </section>
  );
}
