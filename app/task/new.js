import { Alert, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Icon, IconButton, Switch, Text, TextInput, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSQLiteContext } from '../../src/data/database';
import { createTask, getCategories, getTask, updateTask } from '../../src/data/taskRepository';
import { cancelTaskNotifications, replaceTaskNotification } from '../../src/data/notificationRepository';
import { configureNotifications, getReminderDate, RECURRENCE_OPTIONS, REMINDER_OPTIONS, scheduleTaskNotification } from '../../src/services/notifications';
import { validateTaskInput } from '../../src/utils/validation';
import { toLocalDateKey } from '../../src/data/date';
import { useAppTheme } from '../../src/theme/ThemeContext';
import DropdownSelect from '../../src/components/DropdownSelect';

export default function NewTask() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { palette } = useAppTheme();
  const params = useLocalSearchParams();
  const editId = params.id ? Number(params.id) : null;
  const editing = !!editId;

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(toLocalDateKey());
  const [dueTime, setDueTime] = useState('10:00');
  const [categoryId, setCategoryId] = useState(null);
  const [priority, setPriority] = useState('Media');
  const [status, setStatus] = useState('Pendiente');
  const [reminder, setReminder] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [recurrence, setRecurrence] = useState('No se repite');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [subtask, setSubtask] = useState('');

  useEffect(() => {
    (async () => {
      setCategories(await getCategories(db));
      if (editing) {
        const t = await getTask(db, editId);
        if (t) {
          setTitle(t.title);
          setDescription(t.description || '');
          setDueDate(t.due_date);
          setDueTime(t.due_time || '10:00');
          setCategoryId(t.category_id);
          setPriority(t.priority);
          setStatus(t.status);
          setReminder(!!t.reminder_enabled);
          setReminderMinutes(Number(t.reminder_minutes || 30));
          setRecurrence(t.recurrence || 'No se repite');
          setNotes(t.notes || '');
          setSubtasks(t.subtasks || []);
        }
      }
      setLoading(false);
    })();
  }, [db, editId, editing]);

  const addSubtask = () => {
    if (subtask.trim()) {
      setSubtasks([...subtasks, { id: `new-${Date.now()}`, title: subtask.trim(), completed: false }]);
      setSubtask('');
    }
  };

  const save = async () => {
    const validation = validateTaskInput({ title, dueDate });
    if (!validation.valid) {
      Alert.alert('Revisa la tarea', validation.errors.title || validation.errors.dueDate || 'Completa los datos requeridos.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        dueDate,
        dueTime,
        categoryId,
        priority,
        status,
        reminderEnabled: reminder,
        reminderMinutes,
        recurrence,
        notes,
        subtasks,
      };
      const id = editing ? editId : await createTask(db, payload);
      if (editing) await updateTask(db, id, payload);
      await cancelTaskNotifications(db, id);
      if (reminder) {
        const ok = await configureNotifications();
        if (ok) {
          const notificationId = await scheduleTaskNotification({
            taskId: id,
            title,
            dueDate,
            dueTime,
            reminderMinutes,
            recurrence,
          });
          if (notificationId) {
            await replaceTaskNotification(db, id, notificationId, getReminderDate(dueDate, dueTime, reminderMinutes).toISOString());
          }
        }
      }
      router.replace(`/task/${id}`);
    } catch (e) {
      Alert.alert(
        'No se pudo guardar',
        e.message === 'PERMISSION_DENIED'
          ? 'Debes permitir las notificaciones para usar recordatorios.'
          : 'Ocurrió un error al guardar la tarea.'
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedCategory = categories.find((c) => Number(c.id) === Number(categoryId));

  const priorityOptions = [
    { label: 'Baja', value: 'Baja', color: palette.low },
    { label: 'Media', value: 'Media', color: palette.medium },
    { label: 'Alta', value: 'Alta', color: palette.high },
    { label: 'Urgente', value: 'Urgente', color: palette.urgent },
  ];

  const statusOptions = [
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'En progreso', value: 'En progreso' },
    { label: 'Completada', value: 'Completada' },
  ];

  const reminderDropdownOptions = REMINDER_OPTIONS.map((opt) => ({
    label: opt.label,
    value: opt.value,
  }));

  const recurrenceDropdownOptions = RECURRENCE_OPTIONS.map((opt) => ({
    label: opt,
    value: opt,
  }));

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: palette.background }]}>
        <Text style={{ color: palette.text }}>Cargando tarea...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. Header */}
        <View style={styles.header}>
          <IconButton icon="close" onPress={() => router.back()} />
          <Text variant="titleLarge" style={[styles.title, { color: palette.text }]}>
            {editing ? 'Editar tarea' : 'Nueva tarea'}
          </Text>
          <Button mode="contained" compact loading={saving} disabled={saving} onPress={save}>
            Guardar
          </Button>
        </View>

        {/* 2. Details */}
        <Text variant="labelLarge" style={[styles.eyebrow, { color: palette.primary }]}>
          DETALLES
        </Text>
        <TextInput
          label="Título"
          value={title}
          onChangeText={setTitle}
          placeholder="¿Qué necesitas hacer?"
          mode="outlined"
          style={[styles.input, { backgroundColor: palette.surface }]}
        />
        <TextInput
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="Añade contexto, notas o detalles..."
          mode="outlined"
          multiline
          numberOfLines={4}
          style={[styles.input, { backgroundColor: palette.surface }]}
        />

        {/* 3. Schedule */}
        <Text variant="labelLarge" style={[styles.eyebrow, { color: palette.primary }]}>
          CUÁNDO
        </Text>
        <View style={styles.row}>
          <TextInput
            label="Fecha (AAAA-MM-DD)"
            value={dueDate}
            onChangeText={setDueDate}
            mode="outlined"
            style={[styles.half, { backgroundColor: palette.surface }]}
            left={<TextInput.Icon icon="calendar-outline" />}
          />
          <TextInput
            label="Hora (HH:MM)"
            value={dueTime}
            onChangeText={setDueTime}
            mode="outlined"
            style={[styles.half, { backgroundColor: palette.surface }]}
            left={<TextInput.Icon icon="clock-outline" />}
          />
        </View>
        <Button
          mode="outlined"
          icon="folder-outline"
          onPress={() => setCategoryOpen(true)}
          style={styles.categoryButton}
          contentStyle={{ justifyContent: 'flex-start' }}
        >
          {selectedCategory?.name || 'Sin categoría'}
        </Button>

        {/* 4. Priority Dropdown */}
        <DropdownSelect
          label="Prioridad"
          value={priority}
          options={priorityOptions}
          onSelect={setPriority}
          icon="flag-outline"
        />

        {/* 5. Status Dropdown */}
        <DropdownSelect
          label="Estado"
          value={status}
          options={statusOptions}
          onSelect={setStatus}
          icon="checkbox-marked-circle-outline"
        />

        <Divider style={[styles.divider, { backgroundColor: palette.border }]} />

        {/* 6. Reminder Switch & Dropdown */}
        <View style={styles.switchRow}>
          <View style={[styles.settingIcon, { backgroundColor: palette.primary + '18' }]}>
            <Icon source="bell-outline" size={21} color={palette.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ color: palette.text, fontWeight: '700' }}>
              Recordatorio
            </Text>
            <Text style={{ color: palette.muted }}>Avisarme antes de la tarea</Text>
          </View>
          <Switch value={reminder} onValueChange={setReminder} />
        </View>

        {reminder && (
          <DropdownSelect
            value={reminderMinutes}
            options={reminderDropdownOptions}
            onSelect={setReminderMinutes}
            icon="clock-alert-outline"
            style={{ marginTop: 4 }}
          />
        )}

        {/* 7. Recurrence Dropdown */}
        <DropdownSelect
          label="Repetir"
          value={recurrence}
          options={recurrenceDropdownOptions}
          onSelect={setRecurrence}
          icon="repeat"
        />

        {/* 8. Subtasks */}
        <Text variant="titleMedium" style={[styles.label, { color: palette.text }]}>
          Subtareas
        </Text>
        {subtasks.map((s, i) => (
          <Surface key={s.id || i} style={[styles.subtask, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
            <Icon source={s.completed ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={palette.primary} />
            <Text style={{ flex: 1, color: palette.text }}>{s.title}</Text>
            <IconButton icon="close" size={18} onPress={() => setSubtasks(subtasks.filter((_, j) => j !== i))} />
          </Surface>
        ))}
        <View style={styles.subtaskInput}>
          <TextInput label="Nueva subtarea" value={subtask} onChangeText={setSubtask} mode="outlined" style={{ flex: 1, backgroundColor: palette.surface }} />
          <IconButton icon="plus" mode="contained-tonal" onPress={addSubtask} />
        </View>

        {/* 9. Notes */}
        <TextInput
          label="Notas"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          style={[styles.input, { backgroundColor: palette.surface, marginTop: 14 }]}
        />
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal visible={categoryOpen} transparent animationType="fade" onRequestClose={() => setCategoryOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Surface style={[styles.modal, { backgroundColor: palette.surface }]} elevation={4}>
            <Text variant="titleLarge" style={{ color: palette.text, fontWeight: '800', marginBottom: 12 }}>
              Categoría
            </Text>
            <Button
              onPress={() => {
                setCategoryId(null);
                setCategoryOpen(false);
              }}
            >
              Sin categoría
            </Button>
            {categories.map((c) => (
              <Button
                key={c.id}
                icon={c.icon}
                contentStyle={{ justifyContent: 'flex-start' }}
                onPress={() => {
                  setCategoryId(c.id);
                  setCategoryOpen(false);
                }}
              >
                {c.name}
              </Button>
            ))}
            <Button mode="outlined" onPress={() => setCategoryOpen(false)} style={{ marginTop: 8 }}>
              Cerrar
            </Button>
          </Surface>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingTop: 45, paddingBottom: 55 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginHorizontal: -8 },
  title: { flex: 1, fontWeight: '850' },
  eyebrow: { fontWeight: '850', letterSpacing: 0.8, marginBottom: 9 },
  input: { marginBottom: 14 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1, marginBottom: 14 },
  categoryButton: { marginBottom: 14, borderRadius: 12 },
  label: { marginBottom: 10, marginTop: 5, fontWeight: '750' },
  divider: { marginVertical: 18 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 14 },
  settingIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  subtask: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  subtaskInput: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  modalBackdrop: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 24 },
  modal: { borderRadius: 22, padding: 18 },
});
