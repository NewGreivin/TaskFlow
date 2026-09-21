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

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Pendiente',
      priority TEXT NOT NULL DEFAULT 'Media',
      category_id INTEGER,
      due_date TEXT NOT NULL,
      due_time TEXT,
      reminder_enabled INTEGER NOT NULL DEFAULT 0,
      reminder_minutes INTEGER NOT NULL DEFAULT 30,
      recurrence TEXT NOT NULL DEFAULT 'No se repite',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
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
      ['Finanzas', 'cash-outline', '#F3B51B'],
      ['Hogar', 'home-outline', '#FF8A4C'],
      ['Otras', 'dots-horizontal', '#8A8F9F'],
    ];
    for (const [name, icon, color] of categories) {
      await db.runAsync('INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)', name, icon, color);
    }
  }

  await db.runAsync(
    `INSERT OR IGNORE INTO settings (id, theme, language, notifications_enabled) VALUES (1, 'system', 'es', 1)`
  );

  const taskCount = await db.getFirstAsync('SELECT COUNT(*) AS count FROM tasks');
  if ((taskCount?.count ?? 0) === 0) {
    const now = new Date();
    const key = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const today = key(now);
    const tomorrowDate = new Date(now); tomorrowDate.setDate(tomorrowDate.getDate()+1);
    const tomorrow = key(tomorrowDate);
    const categoryRows = await db.getAllAsync('SELECT id, name FROM categories');
    const categoryId = (name) => categoryRows.find((c) => c.name === name)?.id ?? null;
    const seed = [
      ['Estudiar para examen', 'Revisar temas de redes, virtualización y realizar resúmenes.', 'Pendiente', 'Urgente', categoryId('Estudio'), today, '10:00'],
      ['Reunión de proyecto', 'Reunión para revisar avances del proyecto.', 'En progreso', 'Alta', categoryId('Trabajo'), today, '14:00'],
      ['Hacer ejercicio', 'Rutina de ejercicio personal.', 'Pendiente', 'Media', categoryId('Salud'), today, '18:00'],
      ['Llamar al banco', 'Resolver una gestión pendiente.', 'Pendiente', 'Baja', categoryId('Finanzas'), today, '19:00'],
      ['Revisar documentación', 'Revisar y ordenar documentación.', 'Pendiente', 'Alta', categoryId('Trabajo'), tomorrow, '09:00'],
      ['Comprar insumos', 'Comprar materiales necesarios.', 'Pendiente', 'Media', categoryId('Hogar'), tomorrow, '11:00'],
    ];
    for (const task of seed) {
      await db.runAsync(
        `INSERT INTO tasks (title, description, status, priority, category_id, due_date, due_time)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ...task
      );
    }
  }
}

export { SQLiteProvider, useSQLiteContext };
