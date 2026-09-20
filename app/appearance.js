import { ScrollView, StyleSheet, View } from 'react-native';
import { Icon, RadioButton, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../src/theme/ThemeContext';

const options = [
  { value: 'light', title: 'Claro', subtitle: 'Una apariencia limpia y luminosa', icon: 'white-balance-sunny' },
  { value: 'dark', title: 'Oscuro', subtitle: 'Más cómodo para usar de noche', icon: 'weather-night' },
  { value: 'system', title: 'Sistema', subtitle: 'Usa automáticamente el tema del teléfono', icon: 'cellphone-cog' },
];

export default function Appearance() {
  const router = useRouter();
  const { mode, changeMode, palette } = useAppTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: palette.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Icon source="arrow-left" size={25} color={palette.text} onPress={() => router.back()} />
        <Text variant="headlineSmall" style={[styles.title, { color: palette.text }]}>Apariencia</Text>
      </View>

      <Text variant="bodyMedium" style={[styles.description, { color: palette.muted }]}>
        Personaliza cómo quieres ver TaskFlow. El cambio se guarda en el teléfono.
      </Text>

      {options.map((option) => (
        <Surface key={option.value} style={[styles.option, { backgroundColor: palette.surface, borderColor: mode === option.value ? palette.primary : palette.border }]} elevation={0}>
          <View style={[styles.optionIcon, { backgroundColor: palette.primarySoft }]}>
            <Icon source={option.icon} size={23} color={palette.primary} />
          </View>
          <View style={styles.info}>
            <Text variant="titleMedium" style={[styles.optionTitle, { color: palette.text }]}>{option.title}</Text>
            <Text variant="bodySmall" style={{ color: palette.muted }}>{option.subtitle}</Text>
          </View>
          <RadioButton
            value={option.value}
            status={mode === option.value ? 'checked' : 'unchecked'}
            onPress={() => changeMode(option.value)}
          />
        </Surface>
      ))}

      <Surface style={[styles.preview, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
        <Text variant="titleMedium" style={[styles.previewTitle, { color: palette.text }]}>Vista previa</Text>
        <View style={[styles.previewCard, { backgroundColor: palette.background }]}>
          <View style={[styles.previewDot, { backgroundColor: palette.primary }]} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.text, fontWeight: '700' }}>Tarea de ejemplo</Text>
            <Text variant="bodySmall" style={{ color: palette.muted }}>Hoy · 10:00</Text>
          </View>
          <Icon source="check-circle-outline" color={palette.primary} size={22} />
        </View>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 55, paddingBottom: 50 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  title: { fontWeight: '800' },
  description: { lineHeight: 21, marginBottom: 20 },
  option: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1.5, padding: 12, marginBottom: 10 },
  optionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 12 },
  optionTitle: { fontWeight: '750' },
  preview: { borderRadius: 18, borderWidth: 1, padding: 16, marginTop: 10 },
  previewTitle: { fontWeight: '800', marginBottom: 12 },
  previewCard: { borderRadius: 15, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewDot: { width: 10, height: 10, borderRadius: 5 },
});
