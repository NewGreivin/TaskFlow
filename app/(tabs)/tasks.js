import { ScrollView, StyleSheet, View } from 'react-native';
import { FAB, IconButton, Searchbar, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useAppTheme } from '../../src/theme/ThemeContext';
import { mockTasks } from '../../src/data/mock';
import TaskCard from '../../src/components/TaskCard';
import FilterPills from '../../src/components/FilterPills';

export default function Tasks() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const [filter, setFilter] = useState('Todas');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => mockTasks.filter((task) => {
    const matchesQuery = task.title.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === 'Todas' ||
      (filter === 'Pendientes' && task.status === 'Pendiente') ||
      (filter === 'En progreso' && task.status === 'En progreso') ||
      (filter === 'Terminadas' && task.status === 'Completada');
    return matchesQuery && matchesFilter;
  }), [filter, query]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="labelLarge" style={{ color: palette.primary, fontWeight: '800' }}>ORGANIZA</Text>
            <Text variant="headlineSmall" style={[styles.title, { color: palette.text }]}>Mis tareas</Text>
          </View>
          <IconButton icon="sort-variant" mode="contained-tonal" />
        </View>
        <Searchbar placeholder="Buscar tareas..." value={query} onChangeText={setQuery} style={[styles.search, { backgroundColor: palette.surface }]} inputStyle={{ color: palette.text }} />
        <FilterPills items={['Todas','Pendientes','En progreso','Terminadas']} value={filter} onChange={setFilter} />
        <Text variant="labelLarge" style={[styles.result, { color: palette.muted }]}>{filtered.length} tareas</Text>
        {filtered.length ? filtered.map((task, i) => <TaskCard key={task.id} task={task} index={i} onPress={() => router.push(`/task/${task.id}`)} />) : (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: palette.primarySoft }]}><Text style={{ fontSize: 30 }}>✓</Text></View>
            <Text variant="titleMedium" style={{ color: palette.text, fontWeight: '800' }}>Todo limpio</Text>
            <Text style={{ color: palette.muted, textAlign: 'center' }}>No hay tareas que coincidan con tu búsqueda.</Text>
          </View>
        )}
      </ScrollView>
      <FAB icon="plus" label="Nueva tarea" style={[styles.fab, { backgroundColor: palette.primary }]} color="#FFF" onPress={() => router.push('/task/new')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 55, paddingBottom: 125 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontWeight: '850', marginTop: 3 },
  search: { borderRadius: 15, marginBottom: 13 },
  result: { marginTop: 17, marginBottom: 10, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 70, gap: 8 },
  emptyIcon: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  fab: { position: 'absolute', right: 18, bottom: 88, borderRadius: 18 },
});
