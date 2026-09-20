import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { useSQLiteContext } from '../data/database';
import { darkColors, lightColors } from './colors';
import { makeTheme } from './theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const db = useSQLiteContext();
  const [mode, setMode] = useState('system');
  const [systemDark, setSystemDark] = useState(Appearance.getColorScheme() === 'dark');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemDark(colorScheme === 'dark');
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const row = await db.getFirstAsync('SELECT theme FROM settings WHERE id = 1');
      if (mounted && row?.theme) setMode(row.theme);
    })();
    return () => { mounted = false; };
  }, [db]);

  const isDark = mode === 'dark' || (mode === 'system' && systemDark);
  const theme = useMemo(() => makeTheme(isDark), [isDark]);
  const palette = isDark ? darkColors : lightColors;

  const changeMode = async (nextMode) => {
    setMode(nextMode);
    await db.runAsync('UPDATE settings SET theme = ? WHERE id = 1', nextMode);
  };

  const value = useMemo(() => ({
    mode,
    isDark,
    theme,
    palette,
    changeMode,
  }), [mode, isDark, theme, palette]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme must be used inside ThemeProvider');
  return value;
}
