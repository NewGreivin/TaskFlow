import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { FAB, Icon, IconButton, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/theme/ThemeContext';
import { mockTasks } from '../../src/data/mock';
import TaskCard from '../../src/components/TaskCard';
import SectionHeader from '../../src/components/SectionHeader';

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const dates = ['22', '23', '24', '25', '26', '27', '28'];

export default function Today() {
  const router = useRouter();
  const { palette, isDark } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="labelLarge" style={{ color: palette.primary, fontWeight: '800' }}>LUNES · 22 SEP</Text>
            <Text variant="headlineSmall" style={[styles.greeting, { color: palette.text }]}>Tu día, a tu ritmo 👋</Text>
            <Text variant="bodyMedium" style={{ color: palette.muted, marginTop: 3 }}>Tienes 5 tareas pendientes</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton icon={isDark ? 'white-balance-sunny' : 'weather-night'} mode="contained-tonal" onPress={() => router.push('/appearance')} />
            <IconButton icon="bell-outline" mode="contained-tonal" onPress={() => router.push('/notifications')} />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
          {days.map((day, i) => (
            <Pressable key={day} style={[styles.day, { backgroundColor: palette.surface, borderColor: palette.border }, i === 0 && { backgroundColor: palette.primary, borderColor: palette.primary }]}>
              <Text style={{ color: i === 0 ? '#FFF' : palette.muted, fontSize: 12, fontWeight: '700' }}>{day}</Text>
              <Text variant="titleMedium" style={{ color: i === 0 ? '#FFF' : palette.text, marginTop: 4, fontWeight: '800' }}>{dates[i]}</Text>
              <View style={[styles.dayDot, { backgroundColor: i === 0 ? '#FFF' : palette.primary }]} />
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.metrics}>
          <Metric value="5" label="Pendientes" icon="clock-outline" color={palette.primary} palette={palette} />
          <Metric value="3" label="En progreso" icon="progress-clock" color={palette.blue} palette={palette} />
          <Metric value="8" label="Completadas" icon="check-circle-outline" color={palette.green} palette={palette} />
        </View>

        <SectionHeader title="Tareas de hoy" action="Ver todas ›" onAction={() => router.push('/(tabs)/tasks')} />

        {mockTasks.map((task, i) => (
          <TaskCard key={task.id} task={task} index={i} onPress={() => router.push(`/task/${task.id}`)} />
        ))}

        <Surface style={[styles.quote, { backgroundColor: palette.primarySoft }]} elevation={0}>
          <View style={[styles.quoteIcon, { backgroundColor: palette.primary + '20' }]}><Icon source="leaf" size={20} color={palette.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quoteTitle, { color: palette.text }]}>Un paso a la vez</Text>
            <Text variant="bodySmall" style={{ color: palette.muted }}>La constancia convierte las tareas en progreso.</Text>
          </View>
        </Surface>
      </ScrollView>

      <FAB icon="plus" label="Nueva tarea" style={[styles.fab, { backgroundColor: palette.primary }]} color="#FFF" onPress={() => router.push('/task/new')} />
    </View>
  );
}

function Metric({ value, label, icon, color, palette }) {
  return (
    <Surface style={[styles.metric, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
      <Icon source={icon} color={color} size={20} />
      <Text variant="titleLarge" style={[styles.metricValue, { color: palette.text }]}>{value}</Text>
      <Text variant="labelSmall" style={{ color: palette.muted, textAlign: 'center' }}>{label}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 55, paddingBottom: 125 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  headerActions: { flexDirection: 'row' },
  greeting: { fontWeight: '850', marginTop: 3 },
  days: { gap: 8, paddingBottom: 2 },
  day: { width: 55, paddingVertical: 10, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  dayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 5 },
  metrics: { flexDirection: 'row', gap: 9, marginTop: 18, marginBottom: 25 },
  metric: { flex: 1, paddingVertical: 13, borderRadius: 17, alignItems: 'center', borderWidth: 1, gap: 3 },
  metricValue: { fontWeight: '850' },
  quote: { marginTop: 5, padding: 14, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 11 },
  quoteIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  quoteTitle: { fontWeight: '800', marginBottom: 2 },
  fab: { position: 'absolute', right: 18, bottom: 88, borderRadius: 18 },
});
