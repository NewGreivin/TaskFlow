import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';

export const DATABASE_NAME = 'taskflow.db';

export async function migrateDbIfNeeded(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL DEFAULT 'folder-outline',
      color TEXT NOT NULL DEFAULT '#5B4BFF',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      icon TEXT NOT NULL DEFAULT 'briefcase-outline',
      color TEXT NOT NULL DEFAULT '#5B4BFF',
      start_date TEXT,
      due_date TEXT,
      status TEXT NOT NULL DEFAULT 'Activo',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Pendiente',
      priority TEXT NOT NULL DEFAULT 'Media',
      category_id INTEGER,
      project_id INTEGER,
      due_date TEXT NOT NULL,
      due_time TEXT,
      reminder_enabled INTEGER NOT NULL DEFAULT 0,
      reminder_minutes INTEGER NOT NULL DEFAULT 30,
      recurrence TEXT NOT NULL DEFAULT 'No se repite',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      notification_id TEXT,
      scheduled_at TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled',
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category_id);

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL DEFAULT 'system',
      language TEXT NOT NULL DEFAULT 'es',
      notifications_enabled INTEGER NOT NULL DEFAULT 1
    );
  `);

  const categoryCount = await db.getFirstAsync('SELECT COUNT(*) AS count FROM categories');
  if ((categoryCount?.count ?? 0) === 0) {
    const categories = [
      ['Trabajo', 'briefcase-outline', '#4E6CFF'],
      ['Estudio', 'school-outline', '#7C5CFC'],
      ['Personal', 'account-outline', '#36B37E'],
      ['Salud', 'heart-outline', '#FF4D6D'],
      ['Finanzas', 'cash', '#F3B51B'],
      ['Hogar', 'home-outline', '#FF8A4C'],
      ['Otras', 'dots-horizontal', '#8A8F9F'],
    ];
    for (const [name, icon, color] of categories) {
      await db.runAsync(
        'INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)',
        name,
        icon,
        color
      );
    }
  }

  await db.runAsync(
    `INSERT OR IGNORE INTO settings (id, theme, language, notifications_enabled) VALUES (1, 'system', 'es', 1)`
  );

  // Fix: Convert non-existent 'cash-outline' to 'cash' for users updating the app
  try {
    await db.execAsync(`UPDATE categories SET icon = 'cash' WHERE icon = 'cash-outline';`);
  } catch (e) {}

  const addColumn = async (tableName, colName, defVal) => {
    try {
      await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${defVal}`);
    } catch (e) {}
  };

  await addColumn('tasks', 'project_id', 'INTEGER REFERENCES projects(id) ON DELETE SET NULL');

  // Create index for project_id AFTER ensuring the column exists (safe for updates)
  try {
    await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);`);
  } catch (e) {}

  await addColumn('settings', 'first_day_of_week', "TEXT NOT NULL DEFAULT 'Lunes'");
  await addColumn('settings', 'notif_reminders', 'INTEGER NOT NULL DEFAULT 1');
  await addColumn('settings', 'notif_anticipation', 'INTEGER NOT NULL DEFAULT 15');
  await addColumn('settings', 'notif_summary', 'INTEGER NOT NULL DEFAULT 0');
  await addColumn('settings', 'notif_summary_time', "TEXT NOT NULL DEFAULT '20:00'");
  await addColumn('settings', 'notif_overdue', 'INTEGER NOT NULL DEFAULT 0');
  await addColumn('settings', 'notif_completed', 'INTEGER NOT NULL DEFAULT 0');
  await addColumn('settings', 'notif_date_changed', 'INTEGER NOT NULL DEFAULT 0');
  await addColumn('settings', 'notif_sound', 'INTEGER NOT NULL DEFAULT 1');
  await addColumn('settings', 'notif_vibration', 'INTEGER NOT NULL DEFAULT 1');
  await addColumn('settings',
    'notif_days',
    "TEXT NOT NULL DEFAULT 'Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo'"
  );
}

export { SQLiteProvider, useSQLiteContext };
