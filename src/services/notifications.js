import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const REMINDER_OPTIONS = [
  { value: 1440, label: '1 día antes' },
  { value: 60, label: '1 hora antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 15, label: '15 minutos antes' },
  { value: 5, label: '5 minutos antes' },
  { value: 0, label: 'A la hora de la tarea' },
];

export const RECURRENCE_OPTIONS = ['No se repite', 'Cada día', 'Cada semana', 'Cada mes'];

export async function configureNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-reminders', {
      name: 'Recordatorios de tareas',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 200, 250],
      sound: 'default',
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (!current.granted) {
    const requested = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    return requested.granted;
  }
  return true;
}

function buildTaskDate(dueDate, dueTime) {
  const [year, month, day] = dueDate.split('-').map(Number);
  const [hour = 0, minute = 0] = (dueTime || '00:00').split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function getReminderDate(dueDate, dueTime, reminderMinutes = 30) {
  return new Date(buildTaskDate(dueDate, dueTime).getTime() - Number(reminderMinutes) * 60 * 1000);
}

export async function scheduleTaskNotification({ taskId, title, dueDate, dueTime, reminderMinutes = 30, recurrence = 'No se repite' }) {
  const granted = await configureNotifications();
  if (!granted) throw new Error('PERMISSION_DENIED');

  const reminderDate = getReminderDate(dueDate, dueTime, reminderMinutes);
  if (reminderDate.getTime() <= Date.now() && recurrence === 'No se repite') return null;
  if (!['Cada día','Cada semana','Cada mes','No se repite'].includes(recurrence)) recurrence = 'No se repite';

  const content = {
    title: '🔔 TaskFlow · Recordatorio',
    body: reminderMinutes === 0 ? title : `${title} · ${formatReminder(reminderMinutes)}`,
    data: { taskId: String(taskId) },
    sound: 'default',
  };

  let trigger;
  if (recurrence === 'Cada día') {
    trigger = { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: reminderDate.getHours(), minute: reminderDate.getMinutes(), channelId: 'task-reminders' };
  } else if (recurrence === 'Cada semana') {
    trigger = { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: reminderDate.getDay() + 1, hour: reminderDate.getHours(), minute: reminderDate.getMinutes(), channelId: 'task-reminders' };
  } else if (recurrence === 'Cada mes') {
    trigger = { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: reminderDate.getDate(), hour: reminderDate.getHours(), minute: reminderDate.getMinutes(), channelId: 'task-reminders' };
  } else {
    trigger = { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate, channelId: 'task-reminders' };
  }
  return Notifications.scheduleNotificationAsync({ content, trigger });
}

export async function cancelTaskNotification(notificationId) {
  if (notificationId) await Notifications.cancelScheduledNotificationAsync(notificationId);
}

function formatReminder(minutes) {
  if (minutes >= 1440) return '1 día antes';
  if (minutes >= 60) return `${minutes / 60} hora${minutes === 60 ? '' : 's'} antes`;
  return `${minutes} minutos antes`;
}
