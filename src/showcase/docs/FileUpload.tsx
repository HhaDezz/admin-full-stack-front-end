import { useState } from 'react';
import { Field, FileUpload, demoUpload, type UploadItem } from '@/components/kit';
import { CodeView } from '../DocParts';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './FileUpload.tsx?raw';

// #region upload
export function Upload() {
  const [files, setFiles] = useState<UploadItem[]>([]);
  const done = files.filter((f) => f.status === 'done').length;
  return (
    <div className="ex-col">
      <Field label="Attachments" hint={`${done} of ${files.length} uploaded. Name a file “fail…” to see an error.`}>
        <FileUpload
          value={files}
          onChange={setFiles}
          upload={demoUpload}
          multiple
          maxFiles={5}
          maxSize={10 * 1024 * 1024}
          hint="Any file up to 10 MB, five at most"
        />
      </Field>
    </div>
  );
}
// #endregion

// #region avatar
export function Avatar() {
  return (
    <div className="ex-col">
      <Field label="Profile photo">
        <FileUpload compact accept="image/png,image/jpeg" maxSize={2 * 1024 * 1024} hint="PNG or JPG, up to 2 MB" />
      </Field>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'FileUpload',
  group: 'Forms',
  status: 'new',
  description:
    'Drop files or browse. Type and size checks, image previews, per-file progress with cancel and retry. Bring your own upload function (fetch, axios, S3 pre-signed URLs).',
  imports: ['FileUpload', 'demoUpload'],
  raw,
  playground: {
    controls: [
      { type: 'boolean', name: 'multiple', default: true },
      { type: 'boolean', name: 'compact', default: false },
      { type: 'boolean', name: 'upload', label: 'upload (demo)', default: true },
      { type: 'text', name: 'accept', default: '' },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(480px, 100%)' }}>
        <FileUpload
          aria-label="Playground files"
          multiple={!!v.multiple}
          compact={!!v.compact}
          upload={v.upload ? demoUpload : undefined}
          accept={String(v.accept) || undefined}
          disabled={!!v.disabled}
        />
      </div>
    ),
    code: ({ upload, ...p }) =>
      jsx('FileUpload', p, { multiple: true, compact: false, accept: '', disabled: false }, undefined, [
        ...(upload ? ['upload={uploadFile}'] : []),
        'value={files}',
        'onChange={setFiles}',
      ]),
  },
  examples: [
    {
      id: 'upload',
      title: 'Upload as files arrive',
      description: 'upload gets each file, a progress callback and an abort signal. Failed files can be retried.',
      Component: Upload,
    },
    {
      id: 'avatar',
      title: 'Collect only, compact',
      description: 'Leave out upload to just collect files and send them with the form.',
      Component: Avatar,
    },
  ],
  keyboard: [
    ['Tab', 'To “Choose files”, then each file’s buttons'],
    ['Enter / Space', 'Open the file browser'],
  ],
  a11y: [
    'Inside the drop zone is a real “Choose files” button, so keyboard and screen-reader users browse instead of dragging.',
    'Progress, success and errors are announced in a polite live region.',
    'Each file has “Cancel”, “Retry” or “Remove <file name>” buttons.',
  ],
  props: [
    { name: 'value / defaultValue', type: 'UploadItem[]', description: '{ id, file, status, progress, error?, result? } per file.' },
    { name: 'onChange', type: '(items) => void', description: 'Every add, progress step or removal.' },
    { name: 'upload', type: '(file, { onProgress, signal }) => Promise', description: 'Sends one file. Leave out to only collect.' },
    { name: 'accept', type: 'string', description: 'Like the input’s accept: "image/*,.pdf".' },
    { name: 'maxSize / maxFiles', type: 'number', description: 'Limits; bigger or extra files are refused with a reason.' },
    { name: 'multiple', type: 'boolean', defaultValue: 'true', description: 'More than one file.' },
    { name: 'hint', type: 'string', description: 'Text under the prompt.' },
    { name: 'compact', type: 'boolean', defaultValue: 'false', description: 'A one-line drop zone.' },
    { name: 'disabled / invalid', type: 'boolean', description: 'States.' },
  ],
  extra: [
    {
      id: 'real-upload',
      title: 'Uploading with axios',
      content: (
        <CodeView
          code={`const uploadFile: UploadFn = (file, { onProgress, signal }) => {
  const body = new FormData();
  body.append('file', file);
  return api.post('/files', body, {
    signal,
    onUploadProgress: (e) => onProgress(Math.round((e.loaded / (e.total ?? file.size)) * 100)),
  });
};`}
        />
      ),
    },
  ],
});
