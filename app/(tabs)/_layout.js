import { Tabs } from 'expo-router';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabIcon = (name) => ({ color, size }) => (
  <Icon source={name} color={color} size={size} />
);

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: '#5B4BFF',
        tabBarInactiveTintColor: '#8A8F9F',

        tabBarStyle: {
          height: 72 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 6,
          borderTopColor: '#E8EAF1',
          backgroundColor: '#FFFFFF',
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