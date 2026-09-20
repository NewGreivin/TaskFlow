import { ScrollView, StyleSheet, View } from 'react-native';
import { Icon, IconButton, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../src/theme/ThemeContext';

const notifications = [
  ['bell-alert-outline', 'Recordatorio de tarea', 'Estudiar para examen · Hoy, 09:30', 'Hace 10 min', 'urgent'],
  ['clock-outline', 'Tarea próxima', 'Reunión de proyecto · En 30 minutos', 'Ahora', 'primary'],
  ['check-circle-outline', '¡Buen trabajo!', 'Has completado 3 tareas hoy 🎉', 'Hoy, 12:40', 'green'],
  ['alert-outline', 'Tarea vencida', 'Llamar al banco · Ayer, 14:00', 'Ayer', 'urgent'],
];

export default function Notifications() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const color = (key) => palette[key] || palette.primary;

  return (
    <ScrollView style={[styles.container, { backgroundColor: palette.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View><Text variant="labelLarge" style={{ color: palette.primary, fontWeight: '800' }}>CENTRO</Text><Text variant="headlineSmall" style={[styles.title, { color: palette.text }]}>Notificaciones</Text></View>
        <IconButton icon="check-all" mode="contained-tonal" />
      </View>
      {notifications.map(([icon, title, body, time, key], i) => (
        <Surface key={i} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
          <View style={[styles.icon, { backgroundColor: color(key) + '20' }]}><Icon source={icon} size={23} color={color(key)} /></View>
          <View style={styles.text}><Text variant="titleMedium" style={[styles.cardTitle, { color: palette.text }]}>{title}</Text><Text style={[styles.body, { color: palette.muted }]}>{body}</Text><Text variant="labelSmall" style={{ color: palette.muted, marginTop: 5 }}>{time}</Text></View>
          {i < 2 ? <View style={[styles.unread, { backgroundColor: palette.primary }]} /> : null}
        </Surface>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 55, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { fontWeight: '850', marginTop: 3 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: 1, marginBottom: 10 },
  icon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, marginLeft: 12 },
  cardTitle: { fontWeight: '750' },
  body: { marginTop: 3, lineHeight: 19 },
  unread: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
});
