import { ScrollView, StyleSheet, View, Alert, Dimensions } from 'react-native';
import {
  Icon,
  IconButton,
  Surface,
  Text,
  TouchableRipple,
  Button,
  SegmentedButtons,
} from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from '../../src/data/database';
import { useAppTheme } from '../../src/theme/ThemeContext';
import { getSettings, updateSetting } from '../../src/data/settingsRepository';
import { getStats } from '../../src/data/taskRepository';

const { width } = Dimensions.get('window');

export default function Reports() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState('Productividad'); // 'Productividad' | 'Tareas'
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState({
    totals: { total: 0, completed: 0, pending: 0, in_progress: 0 },
    priorities: [],
  });

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getSettings(db).then((res) => {
        if (mounted) setSettings(res);
      });
      getStats(db).then((res) => {
        if (mounted) setStats(res);
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

  const renderProductividad = () => {
    const total = Number(stats.totals?.total || 0);
    const completed = Number(stats.totals?.completed || 0);
    const inProgress = Number(stats.totals?.in_progress || 0);
    const pending = total - completed - inProgress;

    // Simulate donut chart circumference
    const radius = 40;
    const strokeWidth = 12;
    // We are just simulating the visual here, a real SVG would be better

    return (
      <View style={styles.tabContent}>
        <Surface style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
          <Text variant="titleMedium" style={[styles.panelTitle, { color: palette.text }]}>
            Resumen del mes
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.donutPlaceholder}>
              <View style={[styles.donutRing, { borderColor: palette.green }]} />
              <View style={[styles.donutRing, { borderColor: palette.primary, borderLeftColor: 'transparent', borderBottomColor: 'transparent', transform: [{rotate: '45deg'}] }]} />
              <View style={[styles.donutRing, { borderColor: palette.muted, borderLeftColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: 'transparent', transform: [{rotate: '-45deg'}] }]} />
              <View style={[styles.donutInner, { backgroundColor: palette.surface }]}>
                <Text style={[{ color: palette.text, fontSize: 20, fontWeight: '800' }]}>{total}</Text>
                <Text style={[{ color: palette.muted, fontSize: 10 }]}>Tareas</Text>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 20, gap: 10 }}>
              <LegendItem color={palette.green} label="Completadas" count={completed} palette={palette} />
              <LegendItem color={palette.primary} label="En progreso" count={inProgress} palette={palette} />
              <LegendItem color={palette.muted} label="Pendientes" count={pending} palette={palette} />
            </View>
          </View>
        </Surface>

        <Surface style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
          <Text variant="titleMedium" style={[styles.panelTitle, { color: palette.text }]}>
            Actividad semanal
          </Text>
          <View style={styles.barChart}>
            {/* Dummy bar chart */}
            {[0.2, 0.4, 0.6, 0.3, 0.8, 0.3, 0.1].map((h, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.bar, { height: 100 * h, backgroundColor: palette.primary }]} />
                <Text style={[styles.barLabel, { color: palette.muted }]}>
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i]}
                </Text>
              </View>
            ))}
          </View>
        </Surface>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <Surface style={[styles.smallCard, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
            <Icon source="fire" size={24} color={palette.urgent || '#FF4D6D'} />
            <Text style={[styles.smallCardValue, { color: palette.text }]}>3</Text>
            <Text style={[styles.smallCardLabel, { color: palette.muted }]}>Días activos</Text>
          </Surface>
          <Surface style={[styles.smallCard, { backgroundColor: palette.surface, borderColor: palette.border }]} elevation={0}>
            <Icon source="target" size={24} color={palette.green || '#36B37E'} />
            <Text style={[styles.smallCardValue, { color: palette.text }]}>{total > 0 ? Math.round((completed / total) * 100) : 0}%</Text>
            <Text style={[styles.smallCardLabel, { color: palette.muted }]}>Tasa de cierre</Text>
          </Surface>
        </View>
      </View>
    );
  };

  const renderProfile = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.headerProfile}>
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
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerTop}>
        <Text variant="headlineSmall" style={[styles.mainTitle, { color: palette.text }]}>
          Reportes
        </Text>
      </View>

      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: 'Productividad', label: 'Productividad' },
          { value: 'Perfil', label: 'Perfil' },
        ]}
        style={styles.segmented}
        theme={{ colors: { secondaryContainer: palette.primarySoft } }}
      />

      {tab === 'Productividad' ? renderProductividad() : renderProfile()}
    </ScrollView>
  );
}

function LegendItem({ color, label, count, palette }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginRight: 8 }} />
        <Text style={{ color: palette.text, fontSize: 13 }}>{label}</Text>
      </View>
      <Text style={{ color: palette.text, fontWeight: '700', fontSize: 13 }}>{count}</Text>
    </View>
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
  headerTop: { marginBottom: 18 },
  mainTitle: { fontWeight: '850', fontSize: 28 },
  segmented: { marginBottom: 20 },
  tabContent: { flex: 1 },

  panel: { marginTop: 14, borderRadius: 18, borderWidth: 1, padding: 16 },
  panelTitle: { fontWeight: '800', marginBottom: 16 },

  donutPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  donutRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 12,
  },
  donutInner: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  barChart: {
    flexDirection: 'row',
    height: 130,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.2)',
    paddingBottom: 5,
  },
  barCol: { alignItems: 'center', width: 30 },
  bar: { width: 14, borderRadius: 4, marginBottom: 5 },
  barLabel: { fontSize: 10 },

  smallCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  smallCardValue: {
    fontSize: 22,
    fontWeight: '850',
    marginTop: 8,
  },
  smallCardLabel: {
    fontSize: 12,
    marginTop: 2,
  },

  /* Profile styles */
  headerProfile: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
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
