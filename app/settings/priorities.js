import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrioritiesScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();

  const priorities = [
    { label: 'Baja', color: palette.low || '#4CAF50' },
    { label: 'Media', color: palette.medium || '#FF9800' },
    { label: 'Alta', color: palette.high || '#F44336' },
    { label: 'Urgente', color: palette.urgent || '#9C27B0' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: Math.max(insets.top, 20) }]}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={palette.text}
          onPress={() => router.back()}
          style={{ margin: 0, marginRight: 4 }}
        />
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={[styles.title, { color: palette.text }]}>
            Prioridades
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: palette.muted }]}>
          Niveles de prioridad disponibles para tus tareas.
        </Text>

        {priorities.map((p, idx) => (
          <Surface
            key={idx}
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
            elevation={0}
          >
            <View style={[styles.iconBox, { backgroundColor: `${p.color}15` }]}>
              <IconButton icon="flag" iconColor={p.color} size={22} style={{ margin: 0 }} />
            </View>

            <View style={styles.info}>
              <Text variant="titleMedium" style={[styles.name, { color: palette.text }]}>
                {p.label}
              </Text>
            </View>
          </Surface>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: { fontWeight: '800' },
  content: { padding: 20, paddingBottom: 60 },
  description: { marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, marginLeft: 14 },
  name: { fontWeight: '700' },
});
