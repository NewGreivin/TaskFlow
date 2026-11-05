import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text, FAB, ProgressBar } from 'react-native-paper';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from '../src/data/database';
import { getTasks, getProjectById, updateTaskStatus } from '../src/data/taskRepository';
import { useAppTheme } from '../src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import TaskCard from '../src/components/TaskCard';
import AssignTasksModal from '../src/components/AssignTasksModal';
import CategoryIcon from '../src/components/CategoryIcon';

export default function ProjectTasks() {
  const { projectId } = useLocalSearchParams();
  const router = useRouter();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useAppTheme();

  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [p, t] = await Promise.all([
      getProjectById(db, projectId),
      getTasks(db, { projectId: projectId })
    ]);
    setProject(p);
    setTasks(t);
  }, [db, projectId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const toggleTaskStatus = async (t) => {
    const nextStatus = t.status === 'Completada' ? 'Pendiente' : 'Completada';
    await updateTaskStatus(db, t.id, nextStatus);
    loadData();
  };

  const pendingCount = tasks.filter(t => t.status !== 'Completada' && t.status !== 'Terminada').length;
  const completedCount = tasks.filter(t => t.status === 'Completada' || t.status === 'Terminada').length;
  const progress = tasks.length > 0 ? completedCount / tasks.length : 0;

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} iconColor={palette.text} />
        <Text variant="titleLarge" style={[styles.headerTitle, { color: palette.text }]}>
          {project?.name || 'Proyecto'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {project && (
          <Surface style={[styles.projectInfoCard, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
            <View style={styles.projectInfoHeader}>
              <View style={[styles.iconBox, { backgroundColor: `${project.color || palette.primary}20` }]}>
                <CategoryIcon iconId={project.icon} color={project.color || palette.primary} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={{ fontWeight: '800', color: palette.text }}>{project.name}</Text>
                <Text variant="bodySmall" style={{ color: palette.muted }}>Estado: {project.status}</Text>
              </View>
            </View>
            {project.description ? (
              <Text style={{ color: palette.text, marginBottom: 12 }}>{project.description}</Text>
            ) : null}
            <View style={styles.datesRow}>
              <Text style={{ color: palette.muted, fontSize: 13 }}>Inicio: {project.start_date || 'N/A'}</Text>
              <Text style={{ color: palette.muted, fontSize: 13 }}>Fin: {project.due_date || 'N/A'}</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={{ color: palette.text, fontWeight: '700' }}>{pendingCount}</Text>
                <Text style={{ color: palette.muted, fontSize: 12 }}>Pendientes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={{ color: palette.text, fontWeight: '700' }}>{completedCount}</Text>
                <Text style={{ color: palette.muted, fontSize: 12 }}>Completadas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={{ color: palette.text, fontWeight: '700' }}>{Math.round(progress * 100)}%</Text>
                <Text style={{ color: palette.muted, fontSize: 12 }}>Progreso</Text>
              </View>
            </View>
            <ProgressBar progress={progress} color={project.color || palette.primary} style={styles.progressBar} />
          </Surface>
        )}

        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={{ color: palette.text, fontWeight: '800' }}>Tareas del Proyecto</Text>
          <IconButton icon="playlist-plus" size={24} iconColor={palette.primary} onPress={() => setAssignModalOpen(true)} />
        </View>

        {tasks.length === 0 ? (
          <Text style={{ color: palette.muted, textAlign: 'center', marginTop: 40 }}>
            No hay tareas en este proyecto.
          </Text>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onPress={() => router.push(`/task/${task.id}`)} onToggle={() => toggleTaskStatus(task)} />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: palette.primary, bottom: 20 + Math.max(insets.bottom, 6) }]}
        color="#FFF"
        onPress={() => router.push(`/task/new?projectId=${projectId}`)}
      />

      <AssignTasksModal
        visible={assignModalOpen}
        projectId={projectId}
        onClose={() => setAssignModalOpen(false)}
        onSave={() => { setAssignModalOpen(false); loadData(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 8 },
  headerTitle: { fontWeight: '700', marginLeft: 8 },
  content: { padding: 20, paddingBottom: 100 },
  projectInfoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  projectInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  fab: { position: 'absolute', right: 20, borderRadius: 18 },
});
