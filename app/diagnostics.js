import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Icon, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSQLiteContext } from '../src/data/database';
import { useAppTheme } from '../src/theme/ThemeContext';

export default function Diagnostics() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { palette } = useAppTheme();
  const [result, setResult] = useState(null);

  async function runChecks() {
    try {
      const checks = [];
      for (const [label, sql] of [
        ['SQLite · categorías', 'SELECT COUNT(*) AS count FROM categories'],
        ['SQLite · tareas', 'SELECT COUNT(*) AS count FROM tasks'],
        ['SQLite · subtareas', 'SELECT COUNT(*) AS count FROM subtasks'],
      ]) {
        const row = await db.getFirstAsync(sql);
        checks.push({ label, ok: Number(row?.count) >= 0 });
      }
      const settings = await db.getFirstAsync('SELECT theme FROM settings WHERE id = 1');
      checks.push({ label: 'SQLite · configuración', ok: !!settings });
      setResult(checks);
    } catch (error) {
      setResult([{ label: `Error: ${error.message}`, ok: false }]);
    }
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: palette.background}]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Icon source="arrow-left" size={25} color={palette.text} onPress={() => router.back()} />
        <Text variant="headlineSmall" style={[styles.title, {color: palette.text}]}>Diagnóstico</Text>
      </View>
      <Text style={{color: palette.muted, marginBottom: 18}}>Comprobación interna de SQLite antes de generar la APK.</Text>
      <Button mode="contained" icon="play" onPress={runChecks}>Ejecutar comprobaciones</Button>
      {result?.map((item, i) => (
        <Surface key={i} style={[styles.row, {backgroundColor: palette.surface, borderColor: palette.border}]} elevation={0}>
          <Icon source={item.ok ? 'check-circle' : 'alert-circle'} color={item.ok ? palette.green : palette.urgent} size={22} />
          <Text style={{color: palette.text, flex: 1}}>{item.label}</Text>
        </Surface>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container:{flex:1}, content:{padding:20,paddingTop:55,paddingBottom:40},
  header:{flexDirection:'row',alignItems:'center',gap:14,marginBottom:12}, title:{fontWeight:'800'},
  row:{flexDirection:'row',alignItems:'center',gap:12,padding:15,borderRadius:16,borderWidth:1,marginTop:10}
});
