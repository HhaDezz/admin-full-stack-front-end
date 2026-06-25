/**
 * Compatibility entry point. New code should import from './kit'; existing screens keep
 * working through these re-exports.
 */
import { Skeleton } from './kit';

export {
  Avatar,
  Badge,
  Checkbox,
  ConfirmDialog,
  Empty,
  EmptyState,
  Modal,
  Notice,
  Skeleton,
  Spinner,
  ToastProvider,
  useToast,
} from './kit';
export type { ModalProps } from './kit';

/** Shown while a lazily loaded page downloads. */
export function PageFallback() {
  return (
    <div aria-busy="true" aria-label="Loading page" role="status" style={{ display: 'grid', gap: 14 }}>
      <Skeleton h={34} w="40%" />
      <Skeleton h={18} w="60%" />
      <Skeleton h={320} r={14} />
    </div>
  );
}
