import { ScrollView, StyleSheet, View, Pressable, Platform, Alert } from 'react-native';
import { Icon, IconButton, Surface, Text, Switch, TouchableRipple } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useSQLiteContext } from '../../src/data/database';
import { useAppTheme } from '../../src/theme/ThemeContext';
import { getSettings, updateSetting } from '../../src/data/settingsRepository';
import TimePickerModal from '../../src/components/TimePickerModal';
import { configureNotifications } from '../../src/services/notifications';

const ANTICIPATION_OPTIONS = [
  { value: 5, label: '5 minutos' },
  { value: 10, label: '10 minutos' },
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 1440, label: '1 día' },
];

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const SHORT_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function NotificationsSettings() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { palette, isDark } = useAppTheme();

  const [settings, setSettings] = useState(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [anticipationOpen, setAnticipationOpen] = useState(false);

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

  const toggleSetting = async (key) => {
    if (!settings) return;
    const newValue = settings[key] ? 0 : 1;

    if (key === 'notif_reminders' && newValue === 1) {
      const granted = await configureNotifications();
      if (!granted) {
        Alert.alert(
          'Permiso denegado',
          'Debes permitir las notificaciones en los ajustes de tu teléfono.'
        );
        return;
      }
    }

    setSettings((prev) => ({ ...prev, [key]: newValue }));
    await updateSetting(db, key, newValue);
  };

  const updateAnticipation = async (val) => {
    setSettings((prev) => ({ ...prev, notif_anticipation: val }));
    await updateSetting(db, 'notif_anticipation', val);
    setAnticipationOpen(false);
  };

  const updateSummaryTime = async (timeStr) => {
    setSettings((prev) => ({ ...prev, notif_summary_time: timeStr }));
    await updateSetting(db, 'notif_summary_time', timeStr);
  };

  const toggleDay = async (day) => {
    if (!settings) return;
    const currentDays = settings.notif_days ? settings.notif_days.split(',') : [];
    let newDays;
    if (currentDays.includes(day)) {
      newDays = currentDays.filter((d) => d !== day);
    } else {
      newDays = [...currentDays, day];
    }
    const daysStr = newDays.join(',');
    setSettings((prev) => ({ ...prev, notif_days: daysStr }));
    await updateSetting(db, 'notif_days', daysStr);
  };

  if (!settings) return null;

  const currentAnticipation =
    ANTICIPATION_OPTIONS.find((opt) => opt.value === settings.notif_anticipation)?.label ||
    '15 minutos';
  const selectedDays = settings.notif_days ? settings.notif_days.split(',') : [];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
              Notificaciones
            </Text>
          </View>
        </View>

        <Text variant="labelMedium" style={[styles.sectionTitle, { color: palette.primary }]}>
          RECORDATORIOS
        </Text>
        <Surface
          style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          elevation={0}
        >
          <SettingSwitch
            title="Recordatorios de tareas"
            subtitle="Recibe avisos antes de tus tareas"
            value={!!settings.notif_reminders}
            onToggle={() => toggleSetting('notif_reminders')}
            palette={palette}
          />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <SettingButton
            title="Anticipación predeterminada"
            value={currentAnticipation}
            onPress={() => setAnticipationOpen(!anticipationOpen)}
            palette={palette}
          />
          {anticipationOpen && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {ANTICIPATION_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => updateAnticipation(opt.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: settings.notif_anticipation === opt.value }}
                    accessibilityLabel={`Anticipación: ${opt.label}`}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          settings.notif_anticipation === opt.value
                            ? palette.primary
                            : palette.background,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: settings.notif_anticipation === opt.value ? '#FFF' : palette.text,
                        fontSize: 13,
                        fontWeight: '600',
                      }}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <SettingButton
            title="Hora del resumen diario"
            value={settings.notif_summary_time}
            onPress={() => setTimePickerOpen(true)}
            palette={palette}
          />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <SettingSwitch
            title="Resumen diario"
            subtitle="Recibe un resumen de tus tareas al inicio del día"
            value={!!settings.notif_summary}
            onToggle={() => toggleSetting('notif_summary')}
            palette={palette}
          />
        </Surface>

        <Text
          variant="labelMedium"
          style={[styles.sectionTitle, { color: palette.primary, marginTop: 18 }]}
        >
          ACTIVIDAD
        </Text>
        <Surface
          style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          elevation={0}
        >
          <SettingSwitch
            title="Tareas vencidas"
            subtitle="Recibe avisos cuando una tarea se venza"
            value={!!settings.notif_overdue}
            onToggle={() => toggleSetting('notif_overdue')}
            palette={palette}
          />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <SettingSwitch
            title="Tareas completadas"
            subtitle="Recibe una confirmación al completar tareas"
            value={!!settings.notif_completed}
            onToggle={() => toggleSetting('notif_completed')}
            palette={palette}
          />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <SettingSwitch
            title="Cambios de fecha"
            subtitle="Recibe avisos cuando se modifique la fecha de una tarea"
            value={!!settings.notif_date_changed}
            onToggle={() => toggleSetting('notif_date_changed')}
            palette={palette}
          />
        </Surface>

        <Text
          variant="labelMedium"
          style={[styles.sectionTitle, { color: palette.primary, marginTop: 18 }]}
        >
          SONIDO Y VIBRACIÓN
        </Text>
        <Surface
          style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          elevation={0}
        >
          <SettingSwitch
            title="Sonido"
            value={!!settings.notif_sound}
            onToggle={() => toggleSetting('notif_sound')}
            palette={palette}
          />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <SettingSwitch
            title="Vibración"
            value={!!settings.notif_vibration}
            onToggle={() => toggleSetting('notif_vibration')}
            palette={palette}
          />
        </Surface>

        <Text
          variant="labelMedium"
          style={[styles.sectionTitle, { color: palette.primary, marginTop: 18 }]}
        >
          DÍAS DE RECORDATORIO
        </Text>
        <Surface
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border, padding: 16 },
          ]}
          elevation={0}
        >
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map((day, idx) => {
              const isSelected = selectedDays.includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={day}
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: isSelected ? palette.primary : palette.background,
                      borderColor: isSelected ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text style={{ color: isSelected ? '#FFF' : palette.text, fontWeight: '700' }}>
                    {SHORT_DAYS[idx]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text
            variant="bodySmall"
            style={{ color: palette.muted, marginTop: 14, textAlign: 'center' }}
          >
            Los recordatorios también se pueden personalizar en cada tarea.
          </Text>
        </Surface>
      </ScrollView>

      <TimePickerModal
        visible={timePickerOpen}
        time={settings.notif_summary_time}
        onSelect={updateSummaryTime}
        onClose={() => setTimePickerOpen(false)}
      />
    </View>
  );
}

function SettingSwitch({ title, subtitle, value, onToggle, palette }) {
  return (
    <TouchableRipple
      onPress={onToggle}
      style={styles.settingRow}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={title}
      accessibilityHint={subtitle}
    >
      <View style={styles.settingInner}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text variant="titleMedium" style={{ color: palette.text, fontWeight: '600' }}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodySmall" style={{ color: palette.muted, marginTop: 3 }}>
              {subtitle}
            </Text>
          )}
        </View>
        <Switch value={value} onValueChange={onToggle} color={palette.primary} />
      </View>
    </TouchableRipple>
  );
}

function SettingButton({ title, value, onPress, palette }) {
  return (
    <TouchableRipple
      onPress={onPress}
      style={styles.settingRow}
      accessibilityRole="button"
      accessibilityLabel={`${title}, actual: ${value}`}
    >
      <View style={styles.settingInner}>
        <Text variant="titleMedium" style={{ color: palette.text, fontWeight: '600', flex: 1 }}>
          {title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: palette.primary, fontWeight: '600', marginRight: 4 }}>{value}</Text>
          <Icon source="chevron-down" size={20} color={palette.muted} />
        </View>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 55, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontWeight: '850' },
  sectionTitle: { fontWeight: '800', letterSpacing: 0.8, marginBottom: 10, marginLeft: 6 },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 6 },
  settingRow: { paddingVertical: 16, paddingHorizontal: 16 },
  settingInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  divider: { height: 1, marginHorizontal: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
