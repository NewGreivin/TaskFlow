import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Chip, Icon, Text } from 'react-native-paper';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../theme/ThemeContext';

const statusMap = {
  Pendiente: 'clock-outline',
  'En progreso': 'progress-clock',
  Completada: 'check-circle',
  Cancelada: 'close-circle-outline',
};

export default function TaskCard({ task, onPress, onToggle, index = 0 }) {
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

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 35).duration(280)} style={animatedStyle}>
      <Pressable onPress={press} style={({ pressed }) => [styles.card, { backgroundColor: palette.surface, borderColor: palette.border, opacity: pressed ? 0.92 : 1 }]}>
        <View style={[styles.line, { backgroundColor: task.color }]} />
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Pressable onPress={(e) => { e.stopPropagation(); onToggle?.(); }} hitSlop={8} style={[styles.check, { borderColor: completed ? palette.green : task.color, backgroundColor: completed ? palette.green : 'transparent' }]}>
              {completed ? <Icon source="check" size={15} color="#FFF" /> : null}
            </Pressable>
            <Text variant="titleMedium" numberOfLines={2} style={[styles.title, { color: palette.text, textDecorationLine: completed ? 'line-through' : 'none' }]}>{task.title}</Text>
            <Icon source={statusMap[task.status] || 'circle-outline'} size={19} color={palette.muted} />
          </View>
          <View style={styles.bottom}>
            <View style={styles.meta}>
              <Icon source="clock-outline" size={15} color={palette.muted} />
              <Text variant="bodySmall" style={{ color: palette.muted }}>{task.time}</Text>
              {task.category ? <Text variant="bodySmall" style={{ color: palette.muted }}>· {task.category}</Text> : null}
            </View>
            <Chip compact mode="flat" style={[styles.chip, { backgroundColor: `${task.color}20` }]} textStyle={{ color: task.color, fontSize: 10, fontWeight: '800' }}>
              {task.priority}
            </Chip>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: 18, marginBottom: 10, overflow: 'hidden', borderWidth: 1 },
  line: { width: 4 },
  content: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  check: { width: 23, height: 23, borderRadius: 7, borderWidth: 1.7, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontWeight: '700' },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 11 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  chip: { height: 27 },
});
