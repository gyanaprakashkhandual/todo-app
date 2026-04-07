import type { Priority, TodoStatus } from '../types';

export const COLORS = {
  // Brand
  primary: '#111827',
  primaryLight: '#374151',

  // Status colors
  pending: '#94a3b8',
  inProgress: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#ef4444',

  // Priority accent colors
  low: '#6366f1',
  medium: '#d97706',
  high: '#ea580c',
  urgent: '#dc2626',

  // Neutral
  white: '#ffffff',
  background: '#f8fafc',
  backgroundDark: '#030712',
  surface: '#ffffff',
  surfaceDark: '#111827',
  border: '#e5e7eb',
  borderDark: '#1f2937',

  // Text
  text: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textDark: '#f9fafb',
  textSecondaryDark: '#9ca3af',
  textMutedDark: '#4b5563',
};

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bgColor: string; borderColor: string; bgColorDark: string }
> = {
  LOW: {
    label: 'Low',
    color: '#6366f1',
    bgColor: '#eef2ff',
    borderColor: '#c7d2fe',
    bgColorDark: 'rgba(99,102,241,0.15)',
  },
  MEDIUM: {
    label: 'Medium',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    bgColorDark: 'rgba(217,119,6,0.15)',
  },
  HIGH: {
    label: 'High',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    bgColorDark: 'rgba(234,88,12,0.15)',
  },
  URGENT: {
    label: 'Urgent',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    bgColorDark: 'rgba(220,38,38,0.15)',
  },
};

export const STATUS_CONFIG: Record<
  TodoStatus,
  { label: string; color: string; bgColor: string; bgColorDark: string; dotColor: string }
> = {
  PENDING: {
    label: 'Pending',
    color: '#64748b',
    bgColor: '#f1f5f9',
    bgColorDark: 'rgba(100,116,139,0.15)',
    dotColor: '#94a3b8',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: '#1d4ed8',
    bgColor: '#eff6ff',
    bgColorDark: 'rgba(59,130,246,0.15)',
    dotColor: '#3b82f6',
  },
  COMPLETED: {
    label: 'Completed',
    color: '#15803d',
    bgColor: '#f0fdf4',
    bgColorDark: 'rgba(34,197,94,0.15)',
    dotColor: '#22c55e',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#6b7280',
    bgColor: '#f9fafb',
    bgColorDark: 'rgba(107,114,128,0.15)',
    dotColor: '#9ca3af',
  },
};

export const COLUMN_CONFIG = [
  { id: 'PENDING' as TodoStatus, title: 'Pending', color: '#94a3b8' },
  { id: 'IN_PROGRESS' as TodoStatus, title: 'In Progress', color: '#3b82f6' },
  { id: 'COMPLETED' as TodoStatus, title: 'Completed', color: '#22c55e' },
  { id: 'CANCELLED' as TodoStatus, title: 'Cancelled', color: '#ef4444' },
];