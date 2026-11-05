import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { IconButton, Surface, Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/theme/ThemeContext';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useSQLiteContext } from '../../src/data/database';

export default function BackupScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const db = useSQLiteContext();

  const handleCreateBackup = async () => {
    try {
      setLoading(true);

      const categories = await db.getAllAsync('SELECT * FROM categories');
      const projects = await db.getAllAsync('SELECT * FROM projects');
      const tasks = await db.getAllAsync('SELECT * FROM tasks');
      const subtasks = await db.getAllAsync('SELECT * FROM subtasks');
      const notifications = await db.getAllAsync('SELECT * FROM notifications');
      const settings = await db.getAllAsync('SELECT * FROM settings');

      const backupData = {
        categories,
        projects,
        tasks,
        subtasks,
        notifications,
        settings,
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const backupUri = FileSystem.documentDirectory + 'backup_taskflow.json';

      await FileSystem.writeAsStringAsync(backupUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(backupUri, {
        dialogTitle: 'Exportar copia de seguridad',
        mimeType: 'application/json',
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al crear la copia de seguridad.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (!file.name.endsWith('.json')) {
        Alert.alert(
          'Formato incorrecto',
          'Por favor selecciona un archivo de copia de seguridad válido (.json).'
        );
        return;
      }

      setLoading(true);

      const jsonString = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const backupData = JSON.parse(jsonString);

      if (!backupData.tasks || !backupData.categories) {
        throw new Error('Invalid backup format');
      }

      await db.withTransactionAsync(async () => {
        // Clear existing
        await db.execAsync('DELETE FROM subtasks');
        await db.execAsync('DELETE FROM notifications');
        await db.execAsync('DELETE FROM tasks');
        await db.execAsync('DELETE FROM projects');
        await db.execAsync('DELETE FROM categories');
        await db.execAsync('DELETE FROM settings');

        // Restore Categories
        for (const cat of backupData.categories) {
          await db.runAsync(
            'INSERT INTO categories (id, name, icon, color, created_at) VALUES (?, ?, ?, ?, ?)',
            cat.id,
            cat.name,
            cat.icon,
            cat.color,
            cat.created_at
          );
        }

        // Restore Projects
        if (backupData.projects) {
          for (const proj of backupData.projects) {
            await db.runAsync(
              'INSERT INTO projects (id, name, description, icon, color, start_date, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              proj.id,
              proj.name,
              proj.description,
              proj.icon,
              proj.color,
              proj.start_date,
              proj.due_date,
              proj.status,
              proj.created_at,
              proj.updated_at
            );
          }
        }

        // Restore Tasks
        for (const task of backupData.tasks) {
          await db.runAsync(
            'INSERT INTO tasks (id, title, description, status, priority, category_id, due_date, due_time, reminder_enabled, reminder_minutes, recurrence, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            task.id,
            task.title,
            task.description,
            task.status,
            task.priority,
            task.category_id,
            task.due_date,
            task.due_time,
            task.reminder_enabled,
            task.reminder_minutes,
            task.recurrence,
            task.notes,
            task.created_at,
            task.updated_at
          );
        }

        // Restore Subtasks
        if (backupData.subtasks) {
          for (const sub of backupData.subtasks) {
            await db.runAsync(
              'INSERT INTO subtasks (id, task_id, title, completed, position) VALUES (?, ?, ?, ?, ?)',
              sub.id,
              sub.task_id,
              sub.title,
              sub.completed,
              sub.position
            );
          }
        }

        // Restore Notifications
        if (backupData.notifications) {
          for (const notif of backupData.notifications) {
            await db.runAsync(
              'INSERT INTO notifications (id, task_id, notification_id, scheduled_at, status) VALUES (?, ?, ?, ?, ?)',
              notif.id,
              notif.task_id,
              notif.notification_id,
              notif.scheduled_at,
              notif.status
            );
          }
        }

        // Restore Settings
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

      Alert.alert('Restauración Exitosa', 'La copia de seguridad ha sido importada exitosamente.', [
        { text: 'Entendido' },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Error',
        'Hubo un problema al importar la copia de seguridad. El archivo podría estar corrupto o tener un formato inválido.'
      );
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
            Copias de seguridad
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: palette.muted }]}>
          Guarda o restaura una copia de seguridad de todas tus tareas, categorías y preferencias en
          formato JSON.
        </Text>

        <Surface
          style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          elevation={0}
        >
          <View style={styles.iconBox}>
            <IconButton icon="cloud-upload" iconColor={palette.primary} size={30} />
          </View>
          <View style={styles.info}>
            <Text variant="titleMedium" style={{ fontWeight: '700', color: palette.text }}>
              Exportar datos
            </Text>
            <Text variant="bodySmall" style={{ color: palette.muted }}>
              Crea un archivo .json con tu información actual.
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleCreateBackup}
            disabled={loading}
            buttonColor={palette.primary}
          >
            Crear
          </Button>
        </Surface>

        <Surface
          style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          elevation={0}
        >
          <View style={styles.iconBox}>
            <IconButton icon="cloud-download" iconColor={palette.medium} size={30} />
          </View>
          <View style={styles.info}>
            <Text variant="titleMedium" style={{ fontWeight: '700', color: palette.text }}>
              Importar datos
            </Text>
            <Text variant="bodySmall" style={{ color: palette.muted }}>
              Restaura un archivo .json previamente exportado.
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleRestoreBackup}
            disabled={loading}
            buttonColor={palette.medium}
          >
            Restaurar
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
