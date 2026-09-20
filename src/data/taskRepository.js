export async function getTasks(db, { date, status, search, priority, categoryId } = {}) {
  const where = [];
  const params = [];
  if (date) { where.push('t.due_date = ?'); params.push(date); }
  if (status && status !== 'Todas') {
    if (status === 'Terminadas') where.push("t.status IN ('Completada','Terminada')");
    else where.push('t.status = ?');
    if (status !== 'Terminadas') params.push(status);
  }
  if (priority && priority !== 'Todas') { where.push('t.priority = ?'); params.push(priority); }
  if (categoryId) { where.push('t.category_id = ?'); params.push(Number(categoryId)); }
  if (search?.trim()) { where.push('(t.title LIKE ? OR t.description LIKE ? OR t.notes LIKE ?)'); const q = `%${search.trim()}%`; params.push(q, q, q); }
  const sql = `
    SELECT t.*, c.name AS category, c.icon AS category_icon, c.color AS category_color
    FROM tasks t LEFT JOIN categories c ON c.id = t.category_id
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY CASE t.status WHEN 'Pendiente' THEN 1 WHEN 'En progreso' THEN 2 WHEN 'Completada' THEN 3 ELSE 4 END,
             CASE t.priority WHEN 'Urgente' THEN 1 WHEN 'Alta' THEN 2 WHEN 'Media' THEN 3 ELSE 4 END,
             t.due_date ASC, t.due_time ASC, t.id DESC
  `;
  return db.getAllAsync(sql, ...params);
}

export async function getTask(db, id) {
  const task = await db.getFirstAsync(`
    SELECT t.*, c.name AS category, c.icon AS category_icon, c.color AS category_color
    FROM tasks t LEFT JOIN categories c ON c.id = t.category_id WHERE t.id = ?
  `, Number(id));
  if (!task) return null;
  const subtasks = await db.getAllAsync('SELECT * FROM subtasks WHERE task_id = ? ORDER BY position, id', Number(id));
  return { ...task, subtasks };
}

export async function createTask(db, input) {
  const result = await db.runAsync(
    `INSERT INTO tasks (title, description, status, priority, category_id, due_date, due_time, reminder_enabled, reminder_minutes, recurrence, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.title.trim(), input.description?.trim() ?? '', input.status ?? 'Pendiente', input.priority ?? 'Media',
    input.categoryId ?? null, input.dueDate, input.dueTime || null, input.reminderEnabled ? 1 : 0,
    input.reminderMinutes ?? 30, input.recurrence ?? 'No se repite', input.notes?.trim() ?? ''
  );
  const id = result.lastInsertRowId;
  for (let i = 0; i < (input.subtasks || []).length; i++) {
    const title = input.subtasks[i]?.trim();
    if (title) await addSubtask(db, id, title, i);
  }
  return id;
}

export async function updateTask(db, id, input) {
  await db.runAsync(
    `UPDATE tasks SET title=?, description=?, status=?, priority=?, category_id=?, due_date=?, due_time=?, reminder_enabled=?, reminder_minutes=?, recurrence=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    input.title.trim(), input.description?.trim() ?? '', input.status, input.priority, input.categoryId ?? null,
    input.dueDate, input.dueTime || null, input.reminderEnabled ? 1 : 0, input.reminderMinutes ?? 30,
    input.recurrence ?? 'No se repite', input.notes?.trim() ?? '', Number(id)
  );
  await db.runAsync('DELETE FROM subtasks WHERE task_id = ?', Number(id));
  for (let i = 0; i < (input.subtasks || []).length; i++) {
    const s = input.subtasks[i];
    if (s?.title?.trim()) {
      await db.runAsync('INSERT INTO subtasks (task_id, title, completed, position) VALUES (?, ?, ?, ?)', Number(id), s.title.trim(), s.completed ? 1 : 0, i);
    }
  }
}

export async function updateTaskStatus(db, id, status) {
  await db.runAsync('UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', status, Number(id));
}

export async function deleteTask(db, id) { await db.runAsync('DELETE FROM tasks WHERE id = ?', Number(id)); }

export async function addSubtask(db, taskId, title, position = 0) {
  await db.runAsync('INSERT INTO subtasks (task_id, title, position) VALUES (?, ?, ?)', Number(taskId), title.trim(), position);
}

export async function toggleSubtask(db, id, completed) {
  await db.runAsync('UPDATE subtasks SET completed = ? WHERE id = ?', completed ? 1 : 0, Number(id));
}

export async function deleteSubtask(db, id) { await db.runAsync('DELETE FROM subtasks WHERE id = ?', Number(id)); }

export async function getCategories(db) {
  return db.getAllAsync(`SELECT c.*, COUNT(t.id) AS task_count FROM categories c LEFT JOIN tasks t ON t.category_id=c.id GROUP BY c.id ORDER BY c.name COLLATE NOCASE`);
}

export async function createCategory(db, { name, icon='folder-outline', color='#5B4BFF' }) {
  const result = await db.runAsync('INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)', name.trim(), icon, color);
  return result.lastInsertRowId;
}

export async function updateCategory(db, id, { name, icon, color }) {
  await db.runAsync('UPDATE categories SET name=?, icon=?, color=? WHERE id=?', name.trim(), icon, color, Number(id));
}

export async function deleteCategory(db, id) { await db.runAsync('DELETE FROM categories WHERE id=?', Number(id)); }

export async function getStats(db) {
  const totals = await db.getFirstAsync(`SELECT COUNT(*) AS total, SUM(CASE WHEN status IN ('Completada','Terminada') THEN 1 ELSE 0 END) AS completed, SUM(CASE WHEN status='Pendiente' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status='En progreso' THEN 1 ELSE 0 END) AS in_progress, SUM(CASE WHEN status='Cancelada' THEN 1 ELSE 0 END) AS cancelled FROM tasks`);
  const priorities = await db.getAllAsync('SELECT priority, COUNT(*) AS count FROM tasks GROUP BY priority ORDER BY CASE priority WHEN "Urgente" THEN 1 WHEN "Alta" THEN 2 WHEN "Media" THEN 3 ELSE 4 END');
  return { totals, priorities };
}

export function toTaskCard(row) { return { ...row, color: row.category_color || '#5B4BFF', time: row.due_time || 'Sin hora' }; }
