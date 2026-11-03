import { ScrollView, StyleSheet, View } from 'react-native';
import { FAB, IconButton, Surface, Text, TouchableRipple } from 'react-native-paper';
import { useSQLiteContext } from '../../src/data/database';
import { getProjectStats } from '../../src/data/taskRepository';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppTheme } from '../../src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CategoryIcon from '../../src/components/CategoryIcon';
import CategoryModal from '../../src/components/CategoryModal';
import { createCategory, updateCategory, deleteCategory } from '../../src/data/taskRepository';

export default function Projects() {
  const router = useRouter();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const fabBottom = 60 + Math.max(insets.bottom, 6) + 16;
  const { palette } = useAppTheme();

  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const load = useCallback(() => getProjectStats(db).then(setProjects), [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleSaveCategory = async (data) => {
    if (editingCategory) {
      await updateCategory(db, editingCategory.id, data);
    } else {
      await createCategory(db, data);
    }
    setModalOpen(false);
    setEditingCategory(null);
    load();
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={[styles.title, { color: palette.text }]}>
            Proyectos
          </Text>
        </View>

        {projects.map((p) => {
          const color = p.color || palette.primary;
          const total = Number(p.total_tasks || 0);
          const completed = Number(p.completed_tasks || 0);
          const pending = total - completed;
          const progressPercent = total > 0 ? (completed / total) * 100 : 0;

          let stateLabel = '';
          if (total === 0) {
            stateLabel = 'Sin tareas';
          } else if (pending === 0) {
            stateLabel = 'Completado';
          } else if (completed > 0) {
            stateLabel = 'En progreso';
          } else {
            stateLabel = 'Pendiente';
          }

          return (
            <Surface
              key={p.id}
              style={[
                styles.card,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
              elevation={0}
            >
              <TouchableRipple
                style={styles.cardRipple}
                onPress={() => router.push({ pathname: '/project_tasks', params: { projectId: p.id, projectName: p.name } })}
              >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
                    <CategoryIcon iconId={p.icon} color={color} size={22} />
                  </View>
                  <Text variant="titleMedium" style={[styles.name, { color: palette.text }]}>
                    {p.name}
                  </Text>
                </View>
                <IconButton icon="dots-vertical" size={20} onPress={() => { setEditingCategory(p); setModalOpen(true); }} style={{ margin: 0 }}/>
              </View>

              <Text style={[styles.statsText, { color: palette.muted }]}>
                {total} {total === 1 ? 'tarea' : 'tareas'} · {stateLabel}
              </Text>

              <View style={styles.progressRow}>
                <View style={[styles.track, { backgroundColor: palette.border }]}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${Math.min(100, progressPercent)}%`, backgroundColor: color },
                    ]}
                  />
                </View>
                <Text style={[styles.progressPercent, { color: palette.text }]}>
                  {Math.round(progressPercent)}%
                </Text>
              </View>
              </TouchableRipple>
            </Surface>
          );
        })}
      </ScrollView>

      {/* Floating Action Button (+) */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: palette.primary, bottom: fabBottom }]}
        color="#FFF"
        onPress={handleOpenCreate}
      />

      {/* Category Creation / Editing Modal */}
      <CategoryModal type="project"
        visible={modalOpen}
        category={editingCategory}
        onSave={handleSaveCategory}
        onClose={() => setModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 55, paddingBottom: 130 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: { fontWeight: '850', fontSize: 28 },
  card: {
    padding: 0,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardRipple: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  name: { fontWeight: '800' },
  statsText: {
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '500'
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  fill: { height: '100%', borderRadius: 3 },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  fab: { position: 'absolute', right: 20, bottom: 90, borderRadius: 18 },
});
