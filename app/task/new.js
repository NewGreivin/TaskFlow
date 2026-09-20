import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Divider, Icon, IconButton, SegmentedButtons, Switch, Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAppTheme } from '../../src/theme/ThemeContext';

export default function NewTask() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const [priority, setPriority] = useState('Urgente');
  const [status, setStatus] = useState('Pendiente');
  const [reminder, setReminder] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <IconButton icon="close" onPress={() => router.back()} />
          <Text variant="titleLarge" style={[styles.title, { color: palette.text }]}>Nueva tarea</Text>
          <Button mode="contained" compact onPress={() => router.back()}>Guardar</Button>
        </View>

        <Text variant="labelLarge" style={[styles.eyebrow, { color: palette.primary }]}>DETALLES</Text>
        <TextInput label="Título" placeholder="¿Qué necesitas hacer?" mode="outlined" style={[styles.input, { backgroundColor: palette.surface }]} />
        <TextInput label="Descripción" placeholder="Añade contexto, notas o detalles..." mode="outlined" multiline numberOfLines={4} style={[styles.input, { backgroundColor: palette.surface }]} />

        <Text variant="labelLarge" style={[styles.eyebrow, { color: palette.primary }]}>CUÁNDO</Text>
        <View style={styles.row}>
          <TextInput label="Fecha" value="22 sep. 2026" mode="outlined" style={[styles.half, { backgroundColor: palette.surface }]} left={<TextInput.Icon icon="calendar-outline" />} />
          <TextInput label="Hora" value="10:00" mode="outlined" style={[styles.half, { backgroundColor: palette.surface }]} left={<TextInput.Icon icon="clock-outline" />} />
        </View>

        <TextInput label="Categoría" value="📚 Estudio" mode="outlined" style={[styles.input, { backgroundColor: palette.surface }]} left={<TextInput.Icon icon="folder-outline" />} />

        <Text variant="titleMedium" style={[styles.label, { color: palette.text }]}>Prioridad</Text>
        <View style={styles.chips}>
          {['Baja','Media','Alta','Urgente'].map(x => <Chip key={x} selected={priority === x} onPress={() => setPriority(x)}>{x}</Chip>)}
        </View>

        <Text variant="titleMedium" style={[styles.label, { color: palette.text }]}>Estado</Text>
        <SegmentedButtons value={status} onValueChange={setStatus} buttons={[{value:'Pendiente',label:'Pendiente'},{value:'En progreso',label:'En progreso'}]} />

        <Divider style={[styles.divider, { backgroundColor: palette.border }]} />

        <View style={styles.switchRow}>
          <View style={styles.settingIcon}><Icon source="bell-outline" size={21} color={palette.primary} /></View>
          <View style={{ flex: 1 }}><Text variant="titleMedium" style={{ color: palette.text, fontWeight: '700' }}>Recordatorio</Text><Text style={{ color: palette.muted }}>30 minutos antes</Text></View>
          <Switch value={reminder} onValueChange={setReminder} />
        </View>

        <TextInput label="Repetir" value="No se repite" mode="outlined" style={[styles.input, { backgroundColor: palette.surface }]} left={<TextInput.Icon icon="repeat" />} />
        <Text variant="titleMedium" style={[styles.label, { color: palette.text }]}>Subtareas</Text>
        <Button icon="plus" mode="outlined" onPress={() => {}}>Añadir subtarea</Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 45, paddingBottom: 55 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginHorizontal: -8 },
  title: { flex: 1, fontWeight: '850' },
  eyebrow: { fontWeight: '850', letterSpacing: 0.8, marginBottom: 9 },
  input: { marginBottom: 14 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1, marginBottom: 14 },
  label: { marginBottom: 10, marginTop: 5, fontWeight: '750' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  divider: { marginVertical: 22 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 18 },
  settingIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#5B4BFF18', alignItems: 'center', justifyContent: 'center' },
});
