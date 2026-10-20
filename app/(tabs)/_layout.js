import { Tabs } from 'expo-router';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/theme/ThemeContext';

const tabIcon = (name) => ({ color, size }) => (
  <Icon source={name} color={color} size={size} />
);

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useAppTheme();
  const bottomInset = Math.max(insets.bottom, 6);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,

        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60 + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
          backgroundColor: palette.surface,
          borderTopWidth: 1,
          borderTopColor: palette.border,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderLeftColor: palette.border,
          borderRightColor: palette.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 10,
          overflow: 'hidden',
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Hoy',
          tabBarIcon: tabIcon('home-outline'),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          tabBarIcon: tabIcon('calendar-month-outline'),
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tareas',
          tabBarIcon: tabIcon('format-list-checks'),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categorías',
          tabBarIcon: tabIcon('folder-outline'),
        }}
      />

      <Tabs.Screen
        name="stats"
        options={{
          title: 'Estadísticas',
          tabBarIcon: tabIcon('chart-donut'),
        }}
      />
    </Tabs>
  );
}
