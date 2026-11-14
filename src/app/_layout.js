import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
let Notifications;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.warn('Failed to load expo-notifications', e);
}
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider, migrateDbIfNeeded } from '../data/database';
import { ThemeProvider, useAppTheme } from '../theme/ThemeContext';

SplashScreen.preventAutoHideAsync();

function NavigationShell() {
  const router = useRouter();
  const { theme, isDark } = useAppTheme();

  useEffect(() => {
    if (!Notifications) {
      SplashScreen.hideAsync();
      return;
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const taskId = response.notification.request.content.data?.taskId;
      if (taskId) router.push(`/task/${taskId}`);
    });

    // Hide splash screen when navigation is ready
    SplashScreen.hideAsync();

    return () => subscription.remove();
  }, [router]);

  return (
    <PaperProvider
      theme={theme}
      settings={{
        icon: (props) => <MaterialCommunityIcons {...props} />,
      }}
    >
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
