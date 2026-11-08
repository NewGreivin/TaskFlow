import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { IconButton, Surface, Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/theme/ThemeContext';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useSQLiteContext } from '../../src/data/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  authorizeGoogleDrive,
  getGoogleDriveToken,
  logoutGoogleDrive,
  uploadBackupToDrive,
  getBackupFromDrive
} from '../../src/services/googleDrive';
import XLSX from 'xlsx';

export default function BackupScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const db = useSQLiteContext();

  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [lastDriveBackup, setLastDriveBackup] = useState(null);

  useEffect(() => {
    checkDriveStatus();
  }, []);

  const checkDriveStatus = async () => {
    const token = await getGoogleDriveToken();
    setIsDriveConnected(!!token);
    const lastBackup = await AsyncStorage.getItem('last_google_drive_backup');
    if (lastBackup) {
      setLastDriveBackup(new Date(lastBackup).toLocaleString('es-ES'));
    }
  };

  const toggleDriveConnection = async () => {
    if (isDriveConnected) {
      await logoutGoogleDrive();
      setIsDriveConnected(false);
      setLastDriveBackup(null);
      await AsyncStorage.removeItem('last_google_drive_backup');
    } else {
      try {
        setLoading(true);
        await authorizeGoogleDrive();
        setIsDriveConnected(true);
      } catch (e) {
        Alert.alert('Error', 'No se pudo conectar con Google Drive.');
      } finally {
        setLoading(false);
      }
    }
  };

  const createJSONBackupData = async () => {
    const categories = await db.getAllAsync('SELECT * FROM categories');
    const projects = await db.getAllAsync('SELECT * FROM projects');
    const tasks = await db.getAllAsync('SELECT * FROM tasks');
    const subtasks = await db.getAllAsync('SELECT * FROM subtasks');
    const notifications = await db.getAllAsync('SELECT * FROM notifications');
    const settings = await db.getAllAsync('SELECT * FROM settings');

    return {
      categories,
      projects,
      tasks,
      subtasks,
      notifications,
      settings,
    };
  };

  const handleCreateLocalBackup = async () => {
    try {
      setLoading(true);
      const backupData = await createJSONBackupData();
      const jsonString = JSON.stringify(backupData, null, 2);
      const backupUri = FileSystem.documentDirectory + 'backup_taskflow.json';

      await FileSystem.writeAsStringAsync(backupUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(backupUri, {
        dialogTitle: 'Exportar copia de seguridad JSON',
        mimeType: 'application/json',
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al crear la copia de seguridad.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCSVBackup = async () => {
    try {
      setLoading(true);
      const backupData = await createJSONBackupData();

      const flatTasks = backupData.tasks.map(t => {
        const cat = backupData.categories.find(c => c.id === t.category_id);
        const proj = backupData.projects?.find(p => p.id === t.project_id);
        return {
            ID: t.id,
            Titulo: t.title,
            Descripcion: t.description,
            Estado: t.status,
            Prioridad: t.priority,
            FechaVencimiento: t.due_date,
            Categoria: cat ? cat.name : '',
            Proyecto: proj ? proj.name : ''
        };
      });

      const ws = XLSX.utils.json_to_sheet(flatTasks);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tareas");

      const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const uri = FileSystem.documentDirectory + 'tareas_taskflow.xlsx';

      await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });

      await Sharing.shareAsync(uri, {
        dialogTitle: 'Exportar CSV/Excel',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

    } catch(error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al exportar los datos CSV.');
    } finally {
      setLoading(false);
    }
  };

  const executeRestore = async (backupData) => {
      if (!backupData.tasks || !backupData.categories) {
        throw new Error('Invalid backup format');
      }

      await db.withTransactionAsync(async () => {
        await db.execAsync('DELETE FROM subtasks');
        await db.execAsync('DELETE FROM notifications');
        await db.execAsync('DELETE FROM tasks');
        await db.execAsync('DELETE FROM projects');
        await db.execAsync('DELETE FROM categories');
        await db.execAsync('DELETE FROM settings');

        for (const cat of backupData.categories) {
          await db.runAsync(
            'INSERT INTO categories (id, name, icon, color, created_at) VALUES (?, ?, ?, ?, ?)',
            cat.id, cat.name, cat.icon, cat.color, cat.created_at
          );
        }

        if (backupData.projects) {
          for (const proj of backupData.projects) {
            await db.runAsync(
              'INSERT INTO projects (id, name, description, icon, color, start_date, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              proj.id, proj.name, proj.description, proj.icon, proj.color, proj.start_date, proj.due_date, proj.status, proj.created_at, proj.updated_at
            );
          }
        }

        for (const task of backupData.tasks) {
          await db.runAsync(
            'INSERT INTO tasks (id, title, description, status, priority, category_id, project_id, due_date, due_time, reminder_enabled, reminder_minutes, recurrence, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            task.id, task.title, task.description, task.status, task.priority, task.category_id, task.project_id, task.due_date, task.due_time, task.reminder_enabled, task.reminder_minutes, task.recurrence, task.notes, task.created_at, task.updated_at
          );
        }

        if (backupData.subtasks) {
          for (const sub of backupData.subtasks) {
            await db.runAsync(
              'INSERT INTO subtasks (id, task_id, title, completed, position) VALUES (?, ?, ?, ?, ?)',
              sub.id, sub.task_id, sub.title, sub.completed, sub.position
            );
          }
        }

        if (backupData.notifications) {
          for (const notif of backupData.notifications) {
            await db.runAsync(
              'INSERT INTO notifications (id, task_id, notification_id, scheduled_at, status) VALUES (?, ?, ?, ?, ?)',
              notif.id, notif.task_id, notif.notification_id, notif.scheduled_at, notif.status
            );
          }
        }

        if (backupData.settings) {
          const allowedSettingsCols = [
            'id', 'theme', 'language', 'notifications_enabled',
            'first_day_of_week', 'notif_reminders', 'notif_anticipation',
            'notif_summary', 'notif_summary_time', 'notif_overdue',
            'notif_completed', 'notif_date_changed', 'notif_sound',
            'notif_vibration', 'notif_days'
          ];
          for (const set of backupData.settings) {
            const safeKeys = Object.keys(set).filter(key => allowedSettingsCols.includes(key));
            if (safeKeys.length === 0) continue;
            const keys = safeKeys.join(', ');
            const placeholders = safeKeys.map(() => '?').join(', ');
            const values = safeKeys.map(key => set[key]);
            await db.runAsync(`INSERT INTO settings (${keys}) VALUES (${placeholders})`, ...values);
          }
        }
      });
  };

  const handleRestoreLocalBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (!file.name.endsWith('.json')) {
        Alert.alert('Formato incorrecto', 'Selecciona un archivo de copia de seguridad válido (.json).');
        return;
      }

      setLoading(true);
      const jsonString = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const backupData = JSON.parse(jsonString);
      await executeRestore(backupData);
      Alert.alert('Restauración Exitosa', 'La copia de seguridad se importó exitosamente.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al importar la copia de seguridad.');
    } finally {
      setLoading(false);
    }
  };

  const handleDriveBackup = async () => {
    try {
      setLoading(true);
      const backupData = await createJSONBackupData();
      const jsonString = JSON.stringify(backupData, null, 2);

      await uploadBackupToDrive(jsonString);

      const now = new Date();
      await AsyncStorage.setItem('last_google_drive_backup', now.toISOString());
      setLastDriveBackup(now.toLocaleString('es-ES'));

      Alert.alert('Respado en Drive', 'Tu respaldo ha sido guardado exitosamente en Google Drive.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error en Drive', 'Hubo un problema al respaldar en Google Drive. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleDriveRestore = async () => {
    try {
      setLoading(true);
      const backupData = await getBackupFromDrive();

      Alert.alert(
        'Confirmar Restauración',
        'Esto reemplazará todos tus datos locales con el respaldo de Google Drive. ¿Estás seguro?',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => setLoading(false) },
          { text: 'Restaurar', style: 'destructive', onPress: async () => {
              try {
                await executeRestore(backupData);
                Alert.alert('Restauración Exitosa', 'Tus datos se recuperaron desde Google Drive.');
              } catch (e) {
                Alert.alert('Error', 'El archivo de respaldo no es válido o está corrupto.');
              } finally {
                setLoading(false);
              }
          }}
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error en Drive', 'No se encontró un respaldo o hubo un problema al descargar.');
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: Math.max(insets.top, 20) }]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} iconColor={palette.text} onPress={() => router.back()} style={{ margin: 0, marginRight: 4 }} />
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={[styles.title, { color: palette.text }]}>Copias de seguridad</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: palette.muted }]}>
          Guarda o restaura una copia de seguridad de todas tus tareas, categorías y preferencias.
        </Text>

        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12, color: palette.text }}>Respaldos locales</Text>

        <Surface style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
          <View style={styles.iconBox}><IconButton icon="export" iconColor={palette.primary} size={30} /></View>
          <View style={styles.info}>
            <Text variant="titleMedium" style={{ fontWeight: '700', color: palette.text }}>Exportar JSON</Text>
          </View>
          <Button mode="contained" onPress={handleCreateLocalBackup} disabled={loading} buttonColor={palette.primary}>Crear</Button>
        </Surface>

        <Surface style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
          <View style={styles.iconBox}><IconButton icon="file-excel" iconColor={palette.green} size={30} /></View>
          <View style={styles.info}>
            <Text variant="titleMedium" style={{ fontWeight: '700', color: palette.text }}>Exportar CSV</Text>
          </View>
          <Button mode="contained" onPress={handleCreateCSVBackup} disabled={loading} buttonColor={palette.green}>Crear</Button>
        </Surface>

        <Surface style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
          <View style={styles.iconBox}><IconButton icon="import" iconColor={palette.medium} size={30} /></View>
          <View style={styles.info}>
            <Text variant="titleMedium" style={{ fontWeight: '700', color: palette.text }}>Importar JSON</Text>
          </View>
          <Button mode="contained" onPress={handleRestoreLocalBackup} disabled={loading} buttonColor={palette.medium}>Restaurar</Button>
        </Surface>

        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 24, marginBottom: 12, color: palette.text }}>Google Drive</Text>

        <Surface style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border, flexDirection: 'column', alignItems: 'stretch' }]} elevation={0}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={styles.iconBox}><IconButton icon="google-drive" iconColor={isDriveConnected ? palette.green : palette.muted} size={30} /></View>
              <View style={styles.info}>
                <Text variant="titleMedium" style={{ fontWeight: '700', color: palette.text }}>
                  {isDriveConnected ? 'Conectado' : 'No conectado'}
                </Text>
                {isDriveConnected && lastDriveBackup && (
                  <Text variant="bodySmall" style={{ color: palette.muted }}>Último respaldo: {lastDriveBackup}</Text>
                )}
              </View>
              <Button mode={isDriveConnected ? "outlined" : "contained"} onPress={toggleDriveConnection} disabled={loading}>
                {isDriveConnected ? 'Desconectar' : 'Conectar'}
              </Button>
            </View>

            {isDriveConnected && (
              <View style={{ gap: 8 }}>
                <Button icon="cloud-upload" mode="contained" buttonColor={palette.primary} onPress={handleDriveBackup} disabled={loading}>
                  Crear respaldo en Google Drive
                </Button>
                <Button icon="cloud-download" mode="contained-tonal" onPress={handleDriveRestore} disabled={loading}>
                  Importar respaldo desde Google Drive
                </Button>
              </View>
            )}
        </Surface>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  title: { fontWeight: '800' },
  content: { padding: 20, paddingBottom: 60 },
  description: { marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  iconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  info: { flex: 1 },
});
