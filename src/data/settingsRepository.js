export async function getSettings(db) {
  return db.getFirstAsync('SELECT * FROM settings WHERE id = 1');
}

export async function updateSetting(db, key, value) {
  // Be careful with SQL injection, only use this internally with safe keys
  await db.runAsync(`UPDATE settings SET ${key} = ? WHERE id = 1`, value);
}
