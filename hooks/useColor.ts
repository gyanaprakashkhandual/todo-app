import { useTheme } from '../context/Theme.context';

export function useColors() {
  const { isDark } = useTheme();

  return {
    isDark,
    background: isDark ? '#030712' : '#f8fafc',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceElevated: isDark ? '#1f2937' : '#ffffff',
    border: isDark ? '#1f2937' : '#e5e7eb',
    borderLight: isDark ? '#374151' : '#f3f4f6',
    text: isDark ? '#f9fafb' : '#111827',
    textSecondary: isDark ? '#9ca3af' : '#6b7280',
    textMuted: isDark ? '#4b5563' : '#9ca3af',
    primary: isDark ? '#f9fafb' : '#111827',
    primaryFg: isDark ? '#111827' : '#ffffff',
    danger: '#dc2626',
    dangerBg: isDark ? 'rgba(220,38,38,0.1)' : '#fef2f2',
    dangerBorder: isDark ? 'rgba(220,38,38,0.3)' : '#fecaca',
  };
}