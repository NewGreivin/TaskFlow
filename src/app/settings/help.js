import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/ThemeContext';

export default function HelpScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();

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
            Ayuda y soporte
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: palette.muted }]}>
          Encuentra respuestas a las preguntas más frecuentes sobre el uso de la aplicación.
        </Text>

        <Surface
          style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          elevation={0}
        >
          <Text
            variant="titleMedium"
            style={{ fontWeight: '700', color: palette.text, marginBottom: 8 }}
          >
            ¿Cómo crear una nueva tarea?
          </Text>
          <Text variant="bodyMedium" style={{ color: palette.muted }}>
            Dirígete a la pestaña central de "Tareas" en la barra de navegación inferior y presiona
            el botón "+" para crear una nueva tarea.
          </Text>
        </Surface>

        <Surface
          style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          elevation={0}
        >
          <Text
            variant="titleMedium"
            style={{ fontWeight: '700', color: palette.text, marginBottom: 8 }}
          >
            ¿Cómo organizo mis categorías?
          </Text>
          <Text variant="bodyMedium" style={{ color: palette.muted }}>
            Ve a la pestaña de "Perfil" y selecciona "Categorías". Allí podrás agregar, editar y
            eliminar las categorías que utilizas para clasificar tus tareas.
          </Text>
        </Surface>

        <Surface
          style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          elevation={0}
        >
          <Text
            variant="titleMedium"
            style={{ fontWeight: '700', color: palette.text, marginBottom: 8 }}
          >
            ¿Dónde configuro mis notificaciones?
          </Text>
          <Text variant="bodyMedium" style={{ color: palette.muted }}>
            En la sección "Perfil", ingresa a "Notificaciones" para ajustar cuándo deseas recibir
            alertas sobre tus tareas pendientes y definir tu horario de resumen diario.
          </Text>
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
});
