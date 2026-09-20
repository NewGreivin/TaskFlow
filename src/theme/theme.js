import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { lightColors, darkColors } from './colors';

export const makeTheme = (isDark) => {
  const c = isDark ? darkColors : lightColors;
  const base = isDark ? MD3DarkTheme : MD3LightTheme;

  return {
    ...base,
    roundness: 4,
    colors: {
      ...base.colors,
      primary: c.primary,
      primaryContainer: c.primarySoft,
      background: c.background,
      surface: c.surface,
      surfaceVariant: isDark ? '#202531' : '#F0F1F6',
      onSurface: c.text,
      onBackground: c.text,
      outline: c.border,
      onSurfaceVariant: c.muted,
    },
  };
};
