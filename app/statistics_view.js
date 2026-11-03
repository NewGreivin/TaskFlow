import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text, IconButton } from 'react-native-paper';
import { useSQLiteContext } from '../src/data/database';
import { getStats } from '../src/data/taskRepository';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppTheme } from '../src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StatisticsView() {
  const router = useRouter();
  const db = useSQLiteContext(),
    { palette } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState({
    totals: { total: 0, completed: 0, pending: 0, in_progress: 0 },
    priorities: [],
  });

  const load = useCallback(async () => setStats(await getStats(db)), [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const total = Number(stats.totals?.total || 0),
    completed = Number(stats.totals?.completed || 0);

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} iconColor={palette.text} />
        <Text variant="titleLarge" style={[styles.headerTitle, { color: palette.text }]}>
          Estadísticas
        </Text>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text variant="labelLarge" style={{ color: palette.primary, fontWeight: '800' }}>
          ANALIZA
        </Text>
        <Text variant="headlineSmall" style={[styles.title, { color: palette.text }]}>
          Progreso General
        </Text>
        <View style={styles.metrics}>
          <Stat value={total} label="Total de tareas" palette={palette} />
          <Stat value={completed} label="Completadas" palette={palette} />
          <Stat
            value={total ? `${Math.round((completed / total) * 100)}%` : '0%'}
            label="Progreso"
            palette={palette}
          />
        </View>
        <Surface
          style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}
          elevation={0}
        >
          <Text variant="titleMedium" style={[styles.panelTitle, { color: palette.text }]}>
            Tareas por estado
          </Text>
          <Row
            name="Pendientes"
            count={Number(stats.totals?.pending || 0)}
            max={total}
            color={palette.urgent}
            palette={palette}
          />
          <Row
            name="En progreso"
            count={Number(stats.totals?.in_progress || 0)}
            max={total}
            color={palette.blue}
            palette={palette}
          />
          <Row
            name="Completadas"
            count={completed}
            max={total}
            color={palette.green}
            palette={palette}
          />
          <Row
            name="Canceladas"
            count={Number(stats.totals?.cancelled || 0)}
            max={total}
            color={palette.muted}
            palette={palette}
          />
        </Surface>
        <Surface
          style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}
          elevation={0}
        >
          <Text variant="titleMedium" style={[styles.panelTitle, { color: palette.text }]}>
            Tareas por prioridad
          </Text>
          {['Urgente', 'Alta', 'Media', 'Baja'].map((name, i) => {
            const count = Number(stats.priorities.find((p) => p.priority === name)?.count || 0);
            return (
              <Row
                key={name}
                name={name}
                count={count}
                max={Math.max(total, 1)}
                color={[palette.urgent, palette.high, palette.medium, palette.low][i]}
                palette={palette}
              />
            );
          })}
        </Surface>
      </ScrollView>
    </View>
  );
}

function Row({ name, count, max, color, palette }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowName, { color: palette.text }]}>{name}</Text>
      <View style={[styles.track, { backgroundColor: palette.border }]}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(100, max ? (count / max) * 100 : 0)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={{ color: palette.text }}>{count}</Text>
    </View>
  );
}

function Stat({ value, label, palette }) {
  return (
    <Surface
      style={[styles.stat, { backgroundColor: palette.surface, borderColor: palette.border }]}
      elevation={0}
    >
      <Text variant="headlineSmall" style={[styles.value, { color: palette.text }]}>
        {value}
      </Text>
      <Text variant="labelSmall" style={[styles.label, { color: palette.muted }]}>
        {label}
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 8 },
  headerTitle: { fontWeight: '700', marginLeft: 8 },
  content: { padding: 20, paddingBottom: 50 },
  title: { fontWeight: '850', marginTop: 3 },
  metrics: { flexDirection: 'row', gap: 9, marginTop: 18 },
  stat: { flex: 1, borderRadius: 17, borderWidth: 1, padding: 13, alignItems: 'center' },
  value: { fontWeight: '850' },
  label: { textAlign: 'center', marginTop: 3 },
  panel: { marginTop: 14, borderRadius: 18, borderWidth: 1, padding: 16 },
  panelTitle: { fontWeight: '800', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 13 },
  rowName: { width: 82 },
  track: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
