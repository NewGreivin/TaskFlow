import { StyleSheet, View, Pressable } from 'react-native';
import { FAB, IconButton, Surface, Text } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useSQLiteContext } from '../../data/database';
import {
  getTasks,
  toTaskCard,
  updateTaskStatus,
  getDatesWithTasks,
} from '../../data/taskRepository';
import { useAppTheme } from '../../theme/ThemeContext';
import { cancelTaskNotifications } from '../../data/notificationRepository';
import {
  toLocalDateKey,
  formatDateEs,
  getMonthCalendarDays,
  formatMonthYearEs,
} from '../../data/date';
import TaskCard from '../../components/TaskCard';

import { getSettings } from '../../data/settingsRepository';

const WEEKDAYS_MONDAY = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
const WEEKDAYS_SUNDAY = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export default function Calendar() {
  const router = useRouter();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const fabBottom = 60 + Math.max(insets.bottom, 6) + 16;
  const { palette, isDark } = useAppTheme();

  const todayKey = useMemo(() => toLocalDateKey(), []);
  const todayDate = useMemo(() => new Date(), []);

  const [selected, setSelected] = useState(todayKey);
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth());
  const [tasks, setTasks] = useState([]);
  const [datesWithTasks, setDatesWithTasks] = useState(new Set());
  const [settings, setSettings] = useState(null);

  const firstDayPref = settings?.first_day_of_week || 'Lunes';
  const WEEKDAYS = firstDayPref === 'Domingo' ? WEEKDAYS_SUNDAY : WEEKDAYS_MONDAY;

  const calendarDays = useMemo(() => {
    return getMonthCalendarDays(currentYear, currentMonth, firstDayPref);
  }, [currentYear, currentMonth, firstDayPref]);

  const loadTasks = useCallback(async () => {
    const list = await getTasks(db, { date: selected });
    setTasks(list.map(toTaskCard));
  }, [db, selected]);

  const loadMonthIndicators = useCallback(async () => {
    if (!calendarDays.length) return;
    const startKey = calendarDays[0].key;
    const endKey = calendarDays[calendarDays.length - 1].key;
    const [taskDatesSet, userSettings] = await Promise.all([
      getDatesWithTasks(db, startKey, endKey),
      getSettings(db),
    ]);
    setDatesWithTasks(taskDatesSet);
    setSettings(userSettings);
  }, [db, calendarDays]);

  const load = useCallback(async () => {
    await Promise.all([loadTasks(), loadMonthIndicators()]);
  }, [loadTasks, loadMonthIndicators]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggle = async (t) => {
    const nextStatus = t.status === 'Completada' ? 'Pendiente' : 'Completada';
    await updateTaskStatus(db, t.id, nextStatus);
    if (nextStatus === 'Completada') {
      await cancelTaskNotifications(db, t.id);
    }
    load();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelected(toLocalDateKey(now));
  };

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
              <View>
                <Text variant="labelLarge" style={{ color: palette.primary, fontWeight: '800' }}>
                  PLANIFICA
                </Text>
                <Text variant="headlineSmall" style={[styles.title, { color: palette.text }]}>
                  Calendario
                </Text>
              </View>
              <IconButton icon="calendar-today" mode="contained-tonal" onPress={handleGoToToday} accessibilityLabel="Ir a hoy" />
            </View>

            <Surface
              style={[
                styles.calendarContainer,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
              elevation={0}
            >
              <View style={styles.monthNav}>
                <Text style={[styles.monthTitle, { color: palette.text }]}>
                  {formatMonthYearEs(currentYear, currentMonth)}
                </Text>
                <View style={styles.navButtons}>
                  <IconButton
                    icon="chevron-left"
                    size={22}
                    iconColor={palette.text}
                    onPress={handlePrevMonth}
                    style={styles.navButton}
                    accessibilityLabel="Mes anterior"
                  />
                  <IconButton
                    icon="chevron-right"
                    size={22}
                    iconColor={palette.text}
                    onPress={handleNextMonth}
                    style={styles.navButton}
                    accessibilityLabel="Mes siguiente"
                  />
                </View>
              </View>
              <View style={styles.weekdaysRow}>
                {WEEKDAYS.map((wd) => (
                  <View key={wd} style={styles.weekdayCell}>
                    <Text style={[styles.weekdayText, { color: palette.muted }]}>{wd}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.daysGrid}>
                {calendarDays.map((d) => {
                  const isSelected = selected === d.key;
                  const hasTasks = datesWithTasks.has(d.key);
                  const isCurrentMonth = d.isCurrentMonth;
                  return (
                    <Pressable
                      key={d.key}
                      onPress={() => {
                        setSelected(d.key);
                        if (!isCurrentMonth) {
                          setCurrentYear(d.year);
                          setCurrentMonth(d.month);
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Seleccionar fecha: ${d.dateNumber}`}
                      style={styles.dayCell}
                    >
                      <View
                        style={[
                          styles.dayCircle,
                          isSelected && { backgroundColor: palette.primary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            {
                              color: isSelected
                                ? '#FFFFFF'
                                : isCurrentMonth
                                  ? isDark
                                    ? palette.text
                                    : '#111827'
                                  : palette.muted,
                              fontWeight: isSelected ? '800' : isCurrentMonth ? '600' : '400',
                            },
                          ]}
                        >
                          {d.dateNumber}
                        </Text>
                      </View>
                      <View style={styles.dotContainer}>
                        {hasTasks && (
                          <View
                            style={[
                              styles.dot,
                              { backgroundColor: isSelected ? '#FFFFFF' : palette.primary },
                            ]}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </Surface>

            <View style={styles.dayTitle}>
              <View>
                <Text variant="titleLarge" style={{ color: palette.text, fontWeight: '850' }}>
                  {formatDateEs(selected)}
                </Text>
                <Text style={{ color: palette.muted }}>
                  {tasks.length} {tasks.length === 1 ? 'tarea programada' : 'tareas programadas'}
                </Text>
              </View>
              {selected === todayKey ? (
                <Text style={{ color: palette.primary, fontWeight: '800' }}>Hoy</Text>
              ) : null}
            </View>
          </>
        }
        ListEmptyComponent={
          <Text style={{ color: palette.muted, paddingVertical: 40, textAlign: 'center' }}>
            No hay tareas para este día.
          </Text>
        }
        renderItem={({ item, index }) => (
          <TaskCard
            task={item}
            index={index}
            onToggle={() => toggle(item)}
            onPress={() => router.push(`/task/${item.id}`)}
          />
        )}
      />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 130,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontWeight: '850',
    marginTop: 3,
  },
  calendarContainer: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    margin: 0,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekdayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 3,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
  },
  dotContainer: {
    height: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dayTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 90,
    borderRadius: 18,
  },
});
