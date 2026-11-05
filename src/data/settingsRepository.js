export async function getSettings(db) {
  return db.getFirstAsync('SELECT * FROM settings WHERE id = 1');
}

export async function updateSetting(db, key, value) {
  const allowedSettingsCols = [
    'theme', 'language', 'notifications_enabled',
    'first_day_of_week', 'notif_reminders', 'notif_anticipation',
    'notif_summary', 'notif_summary_time', 'notif_overdue',
    'notif_completed', 'notif_date_changed', 'notif_sound',
    'notif_vibration', 'notif_days'
  ];
  if (!allowedSettingsCols.includes(key)) {
    throw new Error('Invalid setting key');
  }
  await db.runAsync(`UPDATE settings SET ${key} = ? WHERE id = 1`, value);
}
