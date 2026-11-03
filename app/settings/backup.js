import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { IconButton, Surface, Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/theme/ThemeContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

// Note: In an Expo project we usually use `expo-updates` to restart the app,
// but for a bare minimal restart we might just alert the user to reopen the app.
// I will alert the user to reopen the app after restoring.

export default function BackupScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const dbName = 'app.db';
  const dbDir = FileSystem.documentDirectory + 'SQLite/';
  const dbPath = dbDir + dbName;

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      const dbInfo = await FileSystem.getInfoAsync(dbPath);
      if (!dbInfo.exists) {
        Alert.alert('Error', 'No se encontró la base de datos.');
        return;
      }

      const backupUri = FileSystem.cacheDirectory + 'backup_taskflow.db';
      await FileSystem.copyAsync({ from: dbPath, to: backupUri });

      await Sharing.shareAsync(backupUri, {
        dialogTitle: 'Exportar copia de seguridad',
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
      if (!file.name.endsWith('.db')) {
        Alert.alert(
          'Formato incorrecto',
          'Por favor selecciona un archivo de base de datos válido (.db).'
        );
        return;
      }

      setLoading(true);

      // Verify destination dir exists
      const dirInfo = await FileSystem.getInfoAsync(dbDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
      }

      await FileSystem.copyAsync({ from: file.uri, to: dbPath });

      Alert.alert(
        'Restauración Exitosa',
        'La copia de seguridad ha sido importada. Reinicia la aplicación para aplicar los cambios.',
        [{ text: 'Entendido' }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al importar la copia de seguridad.');
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
          Guarda o restaura una copia de seguridad de todas tus tareas, categorías y preferencias.
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
              Exportar base de datos
            </Text>
            <Text variant="bodySmall" style={{ color: palette.muted }}>
              Crea un archivo .db con tu información actual.
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
              Importar base de datos
            </Text>
            <Text variant="bodySmall" style={{ color: palette.muted }}>
              Restaura un archivo .db previamente exportado.
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
