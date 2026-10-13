import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Divider, Icon, IconButton, Surface, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useSQLiteContext } from '../../src/data/database';
import { deleteTask, getTask, toggleSubtask, updateTaskStatus } from '../../src/data/taskRepository';
import { cancelTaskNotifications } from '../../src/data/notificationRepository';
import { useAppTheme } from '../../src/theme/ThemeContext';

export default function TaskDetail() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState(null);

  const load = useCallback(async () => {
    if (id) {
      const data = await getTask(db, id);
      setTask(data);
    }
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!task) {
    return (
      <View style={[styles.loading, { backgroundColor: palette.background }]}>
        <Text style={{ color: palette.text }}>Cargando tarea...</Text>
      </View>
    );
  }

  const changeStatus = async (status) => {
    try {
      await updateTaskStatus(db, id, status);
      if (status === 'Completada') {
        await cancelTaskNotifications(db, id);
      }
      await load();
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el estado de la tarea.');
    }
  };

  const handleToggleSubtask = async (subtaskId, currentCompleted) => {
    try {
      await toggleSubtask(db, subtaskId, !currentCompleted);
      await load();
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar la subtarea.');
    }
  };

  const remove = () =>
    Alert.alert('Eliminar tarea', '¿Deseas eliminar esta tarea?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await cancelTaskNotifications(db, id);
          await deleteTask(db, id);
          router.back();
        },
      },
    ]);

  const completedSubtasksCount = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0;
  const totalSubtasksCount = task.subtasks ? task.subtasks.length : 0;

  const statusConfigs = [
    { key: 'Pendiente', label: 'Pendiente', icon: 'clock-outline', color: palette.muted },
    { key: 'En progreso', label: 'En progreso', icon: 'progress-clock', color: palette.purple || palette.primary },
    { key: 'Completada', label: 'Completada', icon: 'check-circle-outline', color: palette.green || palette.low },
    { key: 'Cancelada', label: 'Cancelada', icon: 'close-circle-outline', color: palette.urgent },
  ];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: palette.background }]}
        contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={() => router.back()} />
          <Text variant="titleLarge" style={[styles.title, { color: palette.text }]}>
            Detalle de tarea
          </Text>
          <IconButton icon="pencil-outline" onPress={() => router.push(`/task/edit?id=${id}`)} />
          <IconButton icon="delete-outline" onPress={remove} />
        </View>

        {/* Main Card */}
        <Surface style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
          <View style={styles.taskTitle}>
            <View style={[styles.dot, { backgroundColor: task.category_color || palette.primary }]} />
            <Text variant="titleLarge" style={[styles.name, { color: palette.text }]}>
              {task.title}
            </Text>
          </View>

          {/* Segmented Status Selector */}
          <View style={styles.statusesGrid}>
            {statusConfigs.map((s) => {
              const isSelected = task.status === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  activeOpacity={0.7}
                  onPress={() => changeStatus(s.key)}
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: isSelected ? `${s.color}25` : palette.background,
                      borderColor: isSelected ? s.color : palette.border,
                      borderWidth: isSelected ? 1.5 : 1,
                    },
                  ]}
                >
                  <Icon source={s.icon} size={16} color={isSelected ? s.color : palette.muted} />
                  <Text
                    style={[
                      styles.statusChipText,
                      { color: isSelected ? s.color : palette.muted },
                      isSelected && styles.statusChipTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Divider style={[styles.divider, { backgroundColor: palette.border }]} />

          <Text variant="bodyLarge" style={[styles.description, { color: palette.text }]}>
            {task.description || 'Sin descripción.'}
          </Text>

          <Info palette={palette} icon="calendar-outline" text={task.due_date} />
          <Info palette={palette} icon="clock-outline" text={task.due_time || 'Sin hora'} />
          <Info palette={palette} icon="folder-outline" text={task.category || 'Sin categoría'} />
          <Info palette={palette} icon="flag-outline" text={`Prioridad ${task.priority ? task.priority.toLowerCase() : ''}`} />
          <Info
            palette={palette}
            icon="bell-outline"
            text={
              task.reminder_enabled
                ? `${
                    task.reminder_minutes === 0
                      ? 'A la hora de la tarea'
                      : task.reminder_minutes >= 60
                      ? `${task.reminder_minutes / 60} hora${task.reminder_minutes === 60 ? '' : 's'} antes`
                      : `${task.reminder_minutes} minutos antes`
                  }`
                : 'Sin recordatorio'
            }
          />
          <Info palette={palette} icon="repeat" text={task.recurrence || 'No se repite'} />
          {task.notes ? <Info palette={palette} icon="note-text-outline" text={task.notes} /> : null}
        </Surface>

        {/* Subtasks Section */}
        <Surface style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: palette.text }]}>
            Subtareas ({completedSubtasksCount}/{totalSubtasksCount})
          </Text>

          {task.subtasks && task.subtasks.length > 0 ? (
            task.subtasks.map((s) => (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.7}
                onPress={() => handleToggleSubtask(s.id, !!s.completed)}
                style={[
                  styles.subtaskRow,
                  {
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.checkboxCircle,
                    {
                      borderColor: s.completed ? palette.primary : palette.border,
                      backgroundColor: s.completed ? palette.primary : 'transparent',
                    },
                  ]}
                >
                  {s.completed ? <Icon source="check" size={14} color="#FFFFFF" /> : null}
                </View>
                <Text
                  style={[
                    styles.subtaskTitle,
                    { color: palette.text },
                    s.completed && { color: palette.muted, textDecorationLine: 'line-through' },
                  ]}
                >
                  {s.title}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: palette.muted, fontStyle: 'italic', paddingVertical: 4 }}>
              No hay subtareas todavía.
            </Text>
          )}
        </Surface>

        {/* Bottom Primary Action Button */}
        <Button
          mode="contained"
          icon="check"
          disabled={task.status === 'Completada'}
          onPress={() => changeStatus('Completada')}
          style={[styles.button, { backgroundColor: palette.primary }]}
          contentStyle={{ paddingVertical: 6 }}
        >
          {task.status === 'Completada' ? 'Completada' : 'Marcar como completada'}
        </Button>
      </ScrollView>
    </View>
  );
}

function Info({ icon, text, palette }) {
  return (
    <View style={styles.info}>
      <Icon source={icon} size={19} color={palette.muted} />
      <Text style={[styles.infoText, { color: palette.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 45, paddingBottom: 65 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginHorizontal: -8, marginBottom: 16 },
  title: { flex: 1, fontWeight: '800' },
  card: { borderRadius: 22, borderWidth: 1, padding: 18, marginBottom: 16 },
  taskTitle: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  name: { flex: 1, fontWeight: '800' },
  statusesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 4 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusChipText: { fontSize: 13, fontWeight: '600' },
  statusChipTextActive: { fontWeight: '800' },
  divider: { marginVertical: 16 },
  description: { lineHeight: 22, marginBottom: 14 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
  infoText: { flex: 1, fontSize: 14 },
  sectionTitle: { fontWeight: '800', marginBottom: 12 },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskTitle: { flex: 1, fontSize: 15 },
  button: { marginTop: 6, borderRadius: 18 },
});
