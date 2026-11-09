import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import {
  Icon,
  IconButton,
  Surface,
  Text,
  TouchableRipple,
  Button,
} from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from '../../data/database';
import { useAppTheme } from '../../theme/ThemeContext';
import { getSettings, updateSetting } from '../../data/settingsRepository';

export default function Profile() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getSettings(db).then((res) => {
        if (mounted) setSettings(res);
      });
      return () => {
        mounted = false;
      };
    }, [db])
  );

  const toggleDayOfWeek = async () => {
    const nextDay = settings?.first_day_of_week === 'Lunes' ? 'Domingo' : 'Lunes';
    setSettings((prev) => ({ ...prev, first_day_of_week: nextDay }));
    await updateSetting(db, 'first_day_of_week', nextDay);
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas cerrar la sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => console.log('Saliendo...') },
    ]);
  };

  const dummyAlert = (title) => {
    Alert.alert(title, 'Esta funcionalidad se agregará próximamente.');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.avatarBox, { backgroundColor: palette.primary + '20' }]}>
          <Icon source="account" size={40} color={palette.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text variant="headlineSmall" style={[styles.title, { color: palette.text }]}>
            Usuario
          </Text>
          <Text variant="bodyMedium" style={{ color: palette.muted }}>
            Tu espacio de organización
          </Text>
          <View style={[styles.badge, { backgroundColor: palette.primary + '15' }]}>
            <Text style={[styles.badgeText, { color: palette.primary }]}>Cuenta personal</Text>
          </View>
        </View>
        <IconButton
          icon="pencil-outline"
          mode="contained-tonal"
          onPress={() => dummyAlert('Editar perfil')}
        />
      </View>

      <Text variant="labelMedium" style={[styles.sectionTitle, { color: palette.primary }]}>
        ORGANIZACIÓN
      </Text>
      <Surface
        style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
        elevation={0}
      >
        <MenuItem
          icon="folder-outline"
          title="Categorías"
          palette={palette}
          onPress={() => router.push('/categories')}
        />
        <MenuItem
          icon="chart-donut"
          title="Estadísticas"
          palette={palette}
          onPress={() => router.push('/statistics_view')}
          isLast
        />
      </Surface>

      <Text
        variant="labelMedium"
        style={[styles.sectionTitle, { color: palette.primary, marginTop: 18 }]}
      >
        PREFERENCIAS
      </Text>
      <Surface
        style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
        elevation={0}
      >
        <MenuItem
          icon="bell-outline"
          title="Notificaciones"
          subtitle="Recordatorios y avisos"
          palette={palette}
          onPress={() => router.push('/settings/notifications')}
        />
        <MenuItem
          icon="palette-outline"
          title="Apariencia"
          subtitle="Claro, oscuro o sistema"
          palette={palette}
          onPress={() => router.push('/appearance')}
        />
        <MenuItem
          icon="web"
          title="Idioma"
          subtitle="Español"
          palette={palette}
          onPress={() => dummyAlert('Cambiar idioma')}
        />
        <MenuItem
          icon="calendar-start"
          title="Inicio de semana"
          subtitle={settings?.first_day_of_week || 'Lunes'}
          palette={palette}
          onPress={toggleDayOfWeek}
          isLast
        />
      </Surface>

      <Text
        variant="labelMedium"
        style={[styles.sectionTitle, { color: palette.primary, marginTop: 18 }]}
      >
        DATOS Y AYUDA
      </Text>
      <Surface
        style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
        elevation={0}
      >
        <MenuItem
          icon="export"
          title="Exportar datos"
          palette={palette}
          onPress={() => router.push('/settings/export')}
        />
        <MenuItem
          icon="cloud-upload-outline"
          title="Copias de seguridad"
          palette={palette}
          onPress={() => router.push('/settings/backup')}
        />
        <MenuItem
          icon="help-circle-outline"
          title="Ayuda y soporte"
          palette={palette}
          onPress={() => router.push('/settings/help')}
        />
        <MenuItem
          icon="shield-check-outline"
          title="Privacidad y términos"
          palette={palette}
          onPress={() => router.push('/settings/privacy')}
          isLast
        />
      </Surface>

      <Button
        mode="contained"
        icon="logout"
        style={[styles.logoutButton, { backgroundColor: palette.urgent || '#EF4444' }]}
        onPress={handleLogout}
      >
        Cerrar sesión
      </Button>
    </ScrollView>
  );
}

function MenuItem({ icon, title, subtitle, palette, onPress, isLast }) {
  return (
    <>
      <TouchableRipple onPress={onPress} style={styles.menuItem}>
        <View style={styles.menuItemInner}>
          <Icon source={icon} size={22} color={palette.text} />
          <View style={styles.menuTextContainer}>
            <Text variant="titleMedium" style={{ color: palette.text, fontWeight: '600' }}>
              {title}
            </Text>
            {subtitle && (
              <Text variant="bodySmall" style={{ color: palette.muted, marginTop: 2 }}>
                {subtitle}
              </Text>
            )}
          </View>
          <Icon source="chevron-right" size={20} color={palette.muted} />
        </View>
      </TouchableRipple>
      {!isLast && <View style={[styles.divider, { backgroundColor: palette.border }]} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 55 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  avatarBox: {
    width: 70,
    height: 70,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '850', marginBottom: 2 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  sectionTitle: { fontWeight: '800', letterSpacing: 0.8, marginBottom: 10, marginLeft: 6 },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 6 },
  menuItem: { paddingVertical: 14, paddingHorizontal: 16 },
  menuItemInner: { flexDirection: 'row', alignItems: 'center' },
  menuTextContainer: { flex: 1, marginLeft: 14 },
  divider: { height: 1, marginLeft: 50 },
  logoutButton: { marginTop: 28, borderRadius: 14, paddingVertical: 4 },
});
