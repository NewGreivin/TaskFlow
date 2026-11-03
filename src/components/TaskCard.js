import { useEffect, useRef, memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Chip, Icon, Text } from 'react-native-paper';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useAppTheme } from '../theme/ThemeContext';
import { toLocalDateKey, addDays, formatShortDateEs } from '../data/date';

const statusMap = {
  Pendiente: 'clock-outline',
  'En progreso': 'progress-clock',
  Completada: 'check-circle',
  Cancelada: 'close-circle-outline',
};

function TaskCard({ task, onPress, onToggle, index = 0 }) {
  const { palette } = useAppTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = 1;
  }, [task.status]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const press = () => {
    scale.value = withSpring(0.985, { damping: 15 }, () => {
      scale.value = withSpring(1);
    });
    onPress?.();
  };

  const completed = task.status === 'Completada';

  const getRelativeDate = () => {
    if (!task.due_date) return task.time !== 'Sin hora' ? task.time : '';
    const today = toLocalDateKey();
    const tomorrow = addDays(today, 1);

    let baseDate = '';
    if (task.due_date === today) baseDate = 'Hoy';
    else if (task.due_date === tomorrow) baseDate = 'Mañana';
    else baseDate = formatShortDateEs(task.due_date);

    if (task.time && task.time !== 'Sin hora') {
      return `${baseDate} · ${task.time}`;
    }
    return baseDate;
  };

  const priorityColor =
    {
      Baja: palette.low,
      Media: palette.medium,
      Alta: palette.high,
      Urgente: palette.urgent,
    }[task.priority] || palette.muted;

  const dateText = getRelativeDate();

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 35).duration(280)}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={press}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
        >
          <View style={[styles.line, { backgroundColor: task.color }]} />
          <View style={styles.content}>
            <View style={styles.topRow}>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onToggle?.();
                }}
                hitSlop={8}
                style={[
                  styles.check,
                  {
                    borderColor: completed ? palette.green : task.color,
                    backgroundColor: completed ? palette.green : 'transparent',
                  },
                ]}
              >
                {completed ? <Icon source="check" size={15} color="#FFF" /> : null}
              </Pressable>
              <Text
                variant="titleMedium"
                numberOfLines={2}
                style={[
                  styles.title,
                  { color: palette.text, textDecorationLine: completed ? 'line-through' : 'none' },
                ]}
              >
                {task.title}
              </Text>
              <Icon
                source={statusMap[task.status] || 'circle-outline'}
                size={19}
                color={palette.muted}
              />
            </View>
            <View style={styles.bottom}>
              {dateText ? (
                <View style={styles.metaBadge}>
                  <Icon source="calendar-blank-outline" size={14} color={palette.muted} />
                  <Text variant="bodySmall" style={{ color: palette.muted, marginLeft: 4 }}>
                    {dateText}
                  </Text>
                </View>
              ) : null}

              {dateText && (task.category || task.project_name) && (
                <Text style={{ color: palette.border, fontSize: 12, marginHorizontal: 2 }}>|</Text>
              )}

              {task.category ? (
                <View
                  style={[
                    styles.metaBadge,
                    {
                      backgroundColor: `${task.category_color || task.color}25`,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                    },
                  ]}
                >
                  <Icon
                    source={task.category_icon || 'folder-outline'}
                    size={14}
                    color={task.category_color || task.color}
                  />
                  <Text
                    variant="bodySmall"
                    style={{ color: task.category_color || task.color, marginLeft: 6, fontWeight: '500' }}
                  >
                    {task.category}
                  </Text>
                </View>
              ) : null}

              {task.project_name ? (
                <View
                  style={[
                    styles.metaBadge,
                    {
                      backgroundColor: `${task.project_color || task.color}25`,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                    },
                  ]}
                >
                  <Icon
                    source={task.project_icon || 'briefcase-outline'}
                    size={14}
                    color={task.project_color || task.color}
                  />
                  <Text
                    variant="bodySmall"
                    style={{ color: task.project_color || task.color, marginLeft: 6, fontWeight: '500' }}
                  >
                    {task.project_name}
                  </Text>
                </View>
              ) : null}
              <View
                style={[
                  styles.metaBadge,
                  {
                    backgroundColor: `${priorityColor}15`,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    borderColor: `${priorityColor}40`,
                    borderWidth: 1,
                  },
                ]}
              >
                <Icon source="flag-outline" size={12} color={priorityColor} />
                <Text
                  variant="bodySmall"
                  style={{ color: priorityColor, fontWeight: '700', fontSize: 11, marginLeft: 4 }}
                >
                  {task.priority}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
  },
  line: { width: 4 },
  content: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  check: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontWeight: '700' },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
});

export default memo(TaskCard, (prev, next) => {
  return (
    prev.task.id === next.task.id &&
    prev.task.status === next.task.status &&
    prev.task.title === next.task.title &&
    prev.task.time === next.task.time &&
    prev.task.priority === next.task.priority &&
    prev.task.color === next.task.color
  );
});
