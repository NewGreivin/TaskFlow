import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/theme/ThemeContext';

export default function PrivacyScreen() {
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
            Privacidad y términos
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Surface
          style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          elevation={0}
        >
          <Text
            variant="titleMedium"
            style={{ fontWeight: '700', color: palette.text, marginBottom: 8 }}
          >
            Políticas de Privacidad
          </Text>
          <Text variant="bodyMedium" style={{ color: palette.muted, marginBottom: 10 }}>
            Tus datos están seguros. Toda la información de tus tareas, categorías y configuraciones
            se almacena localmente en tu dispositivo. No compartimos ni subimos tu información a
            servidores externos.
          </Text>
          <Text variant="bodyMedium" style={{ color: palette.muted }}>
            Las copias de seguridad generadas por ti son administradas bajo tu propia
            responsabilidad.
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
            Términos de Servicio
          </Text>
          <Text variant="bodyMedium" style={{ color: palette.muted }}>
            El uso de esta aplicación es bajo tu propio riesgo. Nos esforzamos por ofrecer una
            experiencia fluida, pero no nos hacemos responsables por la pérdida accidental de datos.
            Recomendamos utilizar la función de copias de seguridad de forma periódica.
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
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
});
