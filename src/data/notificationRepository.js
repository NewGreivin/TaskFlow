import { cancelTaskNotification } from '../services/notifications';

export async function replaceTaskNotification(db, taskId, notificationId, scheduledAt = null) {
  const oldRows = await db.getAllAsync('SELECT notification_id FROM notifications WHERE task_id = ?', Number(taskId));
  await Promise.all(oldRows.map(row => cancelTaskNotification(row.notification_id)));
  await db.runAsync('DELETE FROM notifications WHERE task_id = ?', Number(taskId));
  if (!notificationId) return;
  await db.runAsync(
    `INSERT INTO notifications (task_id, notification_id, scheduled_at, status) VALUES (?, ?, ?, 'scheduled')`,
    Number(taskId), notificationId, scheduledAt
  );
}

export async function cancelTaskNotifications(db, taskId) {
  const rows = await db.getAllAsync('SELECT notification_id FROM notifications WHERE task_id = ?', Number(taskId));
  await Promise.all(rows.map(row => cancelTaskNotification(row.notification_id)));
  await db.runAsync('DELETE FROM notifications WHERE task_id = ?', Number(taskId));
}

export async function getTaskNotification(db, taskId) {
  return db.getFirstAsync('SELECT * FROM notifications WHERE task_id = ? ORDER BY id DESC LIMIT 1', Number(taskId));
}
