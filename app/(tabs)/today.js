import { StyleSheet, View, Pressable } from 'react-native';
import { FAB, Icon, IconButton, Surface, Text } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useSQLiteContext } from '../../src/data/database';
import {
  getDatesWithTasks,
  getTasks,
  toTaskCard,
  updateTaskStatus,
} from '../../src/data/taskRepository';
import { useAppTheme } from '../../src/theme/ThemeContext';
import { cancelTaskNotifications } from '../../src/data/notificationRepository';
import { toLocalDateKey, weekFrom, formatDateEs } from '../../src/data/date';
import TaskCard from '../../src/components/TaskCard';
import SectionHeader from '../../src/components/SectionHeader';

import { getSettings } from '../../src/data/settingsRepository';

export default function Today() {
  const router = useRouter();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const fabBottom = 60 + Math.max(insets.bottom, 6) + 16;
  const { palette, isDark } = useAppTheme();

  const [selected, setSelected] = useState(toLocalDateKey());
  const [tasks, setTasks] = useState([]);
  const [datesWithTasks, setDatesWithTasks] = useState(new Set());
  const [settings, setSettings] = useState(null);

  const days = useMemo(
    () => weekFrom(new Date(), settings?.first_day_of_week || 'Lunes'),
    [settings]
  );

  const load = useCallback(async () => {
    const startKey = days[0]?.key;
    const endKey = days[days.length - 1]?.key;

    const [rows, taskDatesSet, userSettings] = await Promise.all([
      getTasks(db, { date: selected }),
      startKey && endKey ? getDatesWithTasks(db, startKey, endKey) : new Set(),
      getSettings(db),
    ]);

    setTasks(rows.map(toTaskCard));
    setDatesWithTasks(taskDatesSet);
    setSettings(userSettings);
  }, [db, selected, days]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const pending = tasks.filter((t) => t.status === 'Pendiente').length;
  const progress = tasks.filter((t) => t.status === 'En progreso').length;
  const completed = tasks.filter((t) => t.status === 'Completada').length;

  const toggle = async (task) => {
    const nextStatus = task.status === 'Completada' ? 'Pendiente' : 'Completada';
    await updateTaskStatus(db, task.id, nextStatus);
    if (nextStatus === 'Completada') {
      await cancelTaskNotifications(db, task.id);
    }
    load();
  };

  const label = formatDateEs(selected);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <FlashList
        data={tasks}
        estimatedItemSize={76}
        keyExtractor={(t) => t.id.toString()}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text variant="labelLarge" style={{ color: palette.primary, fontWeight: '800' }}>
                  {label.toUpperCase()}
                </Text>
                <Text variant="headlineSmall" style={[styles.greeting, { color: palette.text }]}>
                  Tu día, a tu ritmo 👋
                </Text>
                <Text variant="bodyMedium" style={{ color: palette.muted, marginTop: 3 }}>
                  {pending} pendientes para este día
                </Text>
              </View>
              <View style={styles.headerActions}>
                <IconButton
                  icon={isDark ? 'white-balance-sunny' : 'weather-night'}
                  mode="contained-tonal"
                  onPress={() => router.push('/appearance')}
                  accessibilityLabel="Cambiar tema de apariencia"
                />
                <IconButton
                  icon="bell-outline"
                  mode="contained-tonal"
                  onPress={() => router.push('/notifications')}
                  accessibilityLabel="Ver notificaciones"
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 2, overflow: 'scroll' }}>
              {days.map((d) => {
                const hasTasks = datesWithTasks.has(d.key);
                const isSelected = selected === d.key;
                return (
                  <Pressable
                    key={d.key}
                    onPress={() => setSelected(d.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`Seleccionar fecha: ${d.day} ${d.date}`}
                    style={[
                      styles.day,
                      { backgroundColor: palette.surface, borderColor: palette.border },
                      isSelected && {
                        backgroundColor: palette.primary,
                        borderColor: palette.primary,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isSelected ? '#FFF' : palette.muted,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      {d.day}
                    </Text>
                    <Text
                      variant="titleMedium"
                      style={{
                        color: isSelected ? '#FFF' : palette.text,
                        marginTop: 4,
                        fontWeight: '800',
                      }}
                    >
                      {d.date}
                    </Text>
                    {hasTasks ? (
                      <View
                        style={[
                          styles.dayDot,
                          { backgroundColor: isSelected ? '#FFF' : palette.primary },
                        ]}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.metrics}>
              <Metric
                value={pending}
                label="Pendientes"
                icon="clock-outline"
                color={palette.primary}
                palette={palette}
              />
              <Metric
                value={progress}
                label="En progreso"
                icon="progress-clock"
                color={palette.blue}
                palette={palette}
              />
              <Metric
                value={completed}
                label="Completadas"
                icon="check-circle-outline"
                color={palette.green}
                palette={palette}
              />
            </View>

            <SectionHeader
              title="Tareas del día"
              action="Ver todas ›"
              onAction={() => router.push('/(tabs)/tasks')}
            />
          </>
        }
        ListEmptyComponent={<Empty palette={palette} />}
        renderItem={({ item, index }) => (
          <TaskCard
            task={item}
            index={index}
            onToggle={() => toggle(item)}
            onPress={() => router.push(`/task/${item.id}`)}
          />
        )}
      />

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        label="Nueva tarea"
        style={[styles.fab, { backgroundColor: palette.primary, bottom: fabBottom }]}
        color="#FFF"
        onPress={() => router.push('/task/new')}
      />
    </View>
  );
}

function Empty({ palette }) {
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: palette.primarySoft }]}>
        <Icon source="check-all" size={30} color={palette.primary} />
      </View>
      <Text variant="titleMedium" style={{ color: palette.text, fontWeight: '800' }}>
        Día despejado
      </Text>
      <Text style={{ color: palette.muted }}>No tienes tareas para esta fecha.</Text>
    </View>
  );
}

function Metric({ value, label, icon, color, palette }) {
  return (
    <Surface
      style={[styles.metric, { backgroundColor: palette.surface, borderColor: palette.border }]}
      elevation={0}
    >
      <Icon source={icon} color={color} size={20} />
      <Text variant="titleLarge" style={[styles.metricValue, { color: palette.text }]}>
        {value}
      </Text>
      <Text variant="labelSmall" style={{ color: palette.muted, textAlign: 'center' }}>
        {label}
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 55, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  headerActions: { flexDirection: 'row' },
  greeting: { fontWeight: '850', marginTop: 3 },
  days: { gap: 8, paddingBottom: 2 },
  day: { width: 55, paddingVertical: 10, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  dayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 5 },
  metrics: { flexDirection: 'row', gap: 9, marginTop: 18, marginBottom: 25 },
  metric: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 17,
    alignItems: 'center',
    borderWidth: 1,
    gap: 3,
  },
  metricValue: { fontWeight: '850' },
  empty: { alignItems: 'center', paddingVertical: 55, gap: 7 },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  fab: { position: 'absolute', right: 18, borderRadius: 18 },
});
