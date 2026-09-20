import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import { SQLiteProvider, migrateDbIfNeeded } from '../src/data/database';
import { ThemeProvider, useAppTheme } from '../src/theme/ThemeContext';

function NavigationShell() {
  const router = useRouter();
  const { theme, isDark } = useAppTheme();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const taskId = response.notification.request.content.data?.taskId;
      if (taskId) router.push(`/task/${taskId}`);
    });
    return () => subscription.remove();
  }, [router]);

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="taskflow.db" onInit={migrateDbIfNeeded}>
      <ThemeProvider>
        <NavigationShell />
      </ThemeProvider>
    </SQLiteProvider>
  );
}
