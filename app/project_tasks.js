import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text, FAB } from 'react-native-paper';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from '../src/data/database';
import { getTasks } from '../src/data/taskRepository';
import { useAppTheme } from '../src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import TaskCard from '../src/components/TaskCard';

export default function ProjectTasks() {
  const { projectId, projectName } = useLocalSearchParams();
  const router = useRouter();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  const [tasks, setTasks] = useState([]);

  const loadTasks = useCallback(async () => {
    const res = await getTasks(db, { categoryId: projectId });
    setTasks(res);
  }, [db, projectId]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} iconColor={palette.text} />
        <Text variant="titleLarge" style={[styles.headerTitle, { color: palette.text }]}>
          {projectName || 'Proyecto'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tasks.length === 0 ? (
          <Text style={{ color: palette.muted, textAlign: 'center', marginTop: 40 }}>
            No hay tareas en este proyecto.
          </Text>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onPress={() => router.push(`/task/${task.id}`)} />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: palette.primary, bottom: 20 + Math.max(insets.bottom, 6) }]}
        color="#FFF"
        onPress={() => router.push(`/task/new?categoryId=${projectId}`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 8 },
  headerTitle: { fontWeight: '700', marginLeft: 8 },
  content: { padding: 20, paddingBottom: 100 },
  fab: { position: 'absolute', right: 20, borderRadius: 18 },
});
