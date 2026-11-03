import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { IconButton, Surface, Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/theme/ThemeContext';
import { useSQLiteContext } from '../../src/data/database';
import { getTasks } from '../../src/data/taskRepository';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import XLSX from 'xlsx';

export default function ExportScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(false);

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const tasks = await getTasks(db);

      const data = tasks.map((t) => ({
        Título: t.title,
        Descripción: t.description || '',
        Estado: t.status,
        Prioridad: t.priority,
        Categoría: t.category || '',
        Fecha: t.due_date || '',
        Hora: t.due_time || '',
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tareas');

      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const uri = FileSystem.documentDirectory + 'tareas.xlsx';

      await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Exportar Tareas',
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo generar el archivo Excel.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const tasks = await getTasks(db);

      const rows = tasks
        .map(
          (t) => `
        <tr>
          <td>${t.title}</td>
          <td>${t.status}</td>
          <td>${t.priority}</td>
          <td>${t.category || '-'}</td>
          <td>${t.due_date || '-'}</td>
        </tr>
      `
        )
        .join('');

      const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Helvetica'; padding: 20px; }
              h1 { text-align: center; color: #5B4BFF; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Mis Tareas</h1>
            <table>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Categoría</th>
                <th>Fecha</th>
              </tr>
              ${rows}
            </table>
          </body>
        </html>
      `;

      const { uri: tempUri } = await Print.printToFileAsync({ html });
      const finalUri = FileSystem.documentDirectory + 'tareas.pdf';

      await FileSystem.copyAsync({
        from: tempUri,
        to: finalUri,
      });

      await Sharing.shareAsync(finalUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Exportar PDF',
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo generar el archivo PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.background, paddingTop: Math.max(insets.top, 20) },
      ]}
    >
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
            Exportar datos
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: palette.muted }]}>
          Descarga un reporte completo de tus tareas para respaldar tu información o analizar tu
          productividad.
        </Text>

        <Surface
          style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          elevation={0}
        >
          <View style={styles.iconBox}>
            <IconButton icon="file-excel-outline" iconColor="#4CAF50" size={30} />
          </View>
          <View style={styles.info}>
            <Text variant="titleMedium" style={{ fontWeight: '700', color: palette.text }}>
              Excel (.xlsx)
            </Text>
            <Text variant="bodySmall" style={{ color: palette.muted }}>
              Exporta en formato de hoja de cálculo.
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleExportExcel}
            disabled={loading}
            buttonColor="#4CAF50"
          >
            Exportar
          </Button>
        </Surface>

        <Surface
          style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          elevation={0}
        >
          <View style={styles.iconBox}>
            <IconButton icon="file-pdf-box" iconColor="#F44336" size={30} />
          </View>
          <View style={styles.info}>
            <Text variant="titleMedium" style={{ fontWeight: '700', color: palette.text }}>
              PDF
            </Text>
            <Text variant="bodySmall" style={{ color: palette.muted }}>
              Exporta un documento listo para imprimir.
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleExportPDF}
            disabled={loading}
            buttonColor="#F44336"
          >
            Exportar
          </Button>
        </Surface>
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  info: { flex: 1 },
});
