import { ScrollView, StyleSheet, View } from 'react-native';
import { Icon, IconButton, Surface, Text } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useSQLiteContext } from '../src/data/database';
import { useAppTheme } from '../src/theme/ThemeContext';
import { formatShortDateEs } from '../src/data/date';

export default function Notifications() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { palette } = useAppTheme();
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    const rows = await db.getAllAsync(`
      SELECT n.id, n.notification_id, n.scheduled_at, n.status,
             t.id AS task_id, t.title, t.due_date, t.due_time, t.status AS task_status
      FROM notifications n
      INNER JOIN tasks t ON t.id = n.task_id
      ORDER BY CASE WHEN n.scheduled_at IS NULL THEN 1 ELSE 0 END,
               n.scheduled_at ASC, n.id DESC
    `);
    setItems(rows);
  }, [db]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScrollView style={[styles.container, { backgroundColor: palette.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text variant="labelLarge" style={{ color: palette.primary, fontWeight: '800' }}>CENTRO</Text>
          <Text variant="headlineSmall" style={[styles.title, { color: palette.text }]}>Recordatorios</Text>
        </View>
        <IconButton icon="bell-outline" mode="contained-tonal" />
      </View>
      {items.length ? items.map((item) => (
        <Surface key={item.id} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
          <View style={[styles.icon, { backgroundColor: palette.primary + '20' }]}>
            <Icon source={item.task_status === 'Completada' ? 'check-circle-outline' : 'bell-alert-outline'} size={23} color={item.task_status === 'Completada' ? palette.green : palette.primary} />
          </View>
          <View style={styles.text}>
            <Text variant="titleMedium" style={[styles.cardTitle, { color: palette.text }]}>{item.title}</Text>
            <Text style={[styles.body, { color: palette.muted }]}>{formatShortDateEs(item.due_date)} · {item.due_time || 'Sin hora'}</Text>
            <Text variant="labelSmall" style={{ color: palette.muted, marginTop: 5 }}>{item.scheduled_at ? `Recordatorio: ${new Date(item.scheduled_at).toLocaleString('es-CR')}` : 'Recordatorio programado'}</Text>
          </View>
          <IconButton icon="chevron-right" onPress={() => router.push(`/task/${item.task_id}`)} />
        </Surface>
      )) : (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: palette.primarySoft }]}><Icon source="bell-off-outline" size={30} color={palette.primary} /></View>
          <Text variant="titleMedium" style={{ color: palette.text, fontWeight: '800' }}>Sin recordatorios</Text>
          <Text style={{ color: palette.muted, textAlign: 'center' }}>Cuando una tarea tenga un recordatorio, aparecerá aquí.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 55, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { fontWeight: '850', marginTop: 3 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: 1, marginBottom: 10 },
  icon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, marginLeft: 12 },
  cardTitle: { fontWeight: '750' },
  body: { marginTop: 3, lineHeight: 19 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 8 },
  emptyIcon: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
});
