import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export const TONE_ICON = {
  neutral: Info,
  brand: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
} as const;
