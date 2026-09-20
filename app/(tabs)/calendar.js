import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { FAB, IconButton, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAppTheme } from '../../src/theme/ThemeContext';
import { mockTasks } from '../../src/data/mock';
import TaskCard from '../../src/components/TaskCard';

const week = [
  ['Dom','20'], ['Lun','21'], ['Mar','22'], ['Mié','23'], ['Jue','24'], ['Vie','25'], ['Sáb','26']
];

export default function Calendar() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const [selected, setSelected] = useState('22');

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text variant="labelLarge" style={{ color: palette.primary, fontWeight: '800' }}>PLANIFICA</Text><Text variant="headlineSmall" style={[styles.title, { color: palette.text }]}>Calendario</Text></View>
          <IconButton icon="calendar-today" mode="contained-tonal" />
        </View>

        <View style={styles.monthRow}>
          <IconButton icon="chevron-left" />
          <Text variant="titleMedium" style={[styles.month, { color: palette.text }]}>Septiembre 2026</Text>
          <IconButton icon="chevron-right" />
        </View>

        <Surface style={[styles.calendar, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
          <View style={styles.week}>
            {week.map(([day, date]) => {
              const active = selected === date;
              return (
                <Pressable key={date} onPress={() => setSelected(date)} style={[styles.day, { borderColor: active ? palette.primary : 'transparent', backgroundColor: active ? palette.primary : 'transparent' }]}>
                  <Text style={{ color: active ? '#FFF' : palette.muted, fontSize: 11, fontWeight: '700' }}>{day}</Text>
                  <Text style={{ color: active ? '#FFF' : palette.text, fontWeight: '850', marginTop: 5 }}>{date}</Text>
                  <View style={[styles.dot, { backgroundColor: active ? '#FFF' : palette.primary }]} />
                </Pressable>
              );
            })}
          </View>
        </Surface>

        <View style={styles.dayTitle}>
          <View><Text variant="titleLarge" style={{ color: palette.text, fontWeight: '850' }}>Martes 22</Text><Text style={{ color: palette.muted }}>3 tareas programadas</Text></View>
          <Text style={{ color: palette.primary, fontWeight: '800' }}>Hoy</Text>
        </View>

        {mockTasks.slice(0, 3).map((task, i) => <TaskCard key={task.id} task={task} index={i} onPress={() => router.push(`/task/${task.id}`)} />)}
      </ScrollView>
      <FAB icon="plus" label="Nueva tarea" style={[styles.fab, { backgroundColor: palette.primary }]} color="#FFF" onPress={() => router.push('/task/new')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 55, paddingBottom: 125 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: '850', marginTop: 3 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 7 },
  month: { fontWeight: '800' },
  calendar: { borderRadius: 20, padding: 10, borderWidth: 1 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 43, height: 64, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 6 },
  dayTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 12 },
  fab: { position: 'absolute', right: 18, bottom: 88, borderRadius: 18 },
});
