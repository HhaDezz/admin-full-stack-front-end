import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/kit';
import { api, errorMessage } from './api';

/** Read/unread, delete and mark-all, refreshing the bell and every list. */
export function useNotificationActions() {
  const qc = useQueryClient();
  const toast = useToast();
  const refresh = () => void qc.invalidateQueries({ queryKey: ['me', 'notifications'] });
  const onError = (e: unknown) => toast.err(errorMessage(e));
  return {
    mutateRead: useMutation({
      mutationFn: ({ id, read }: { id: number; read: boolean }) => api.post(`/me/notifications/${id}/${read ? 'read' : 'unread'}`),
      onSuccess: refresh,
      onError,
    }),
    mutateDelete: useMutation({ mutationFn: (id: number) => api.delete(`/me/notifications/${id}`), onSuccess: refresh, onError }),
    readAll: useMutation({ mutationFn: () => api.post('/me/notifications/read-all'), onSuccess: refresh, onError }),
  };
}
