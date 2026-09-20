export function validateTaskInput({ title, dueDate }) {
  const errors = {};
  if (!title || !title.trim()) errors.title = 'El título es obligatorio.';
  else if (title.trim().length > 120) errors.title = 'El título no puede superar 120 caracteres.';
  if (!dueDate) errors.dueDate = 'Selecciona una fecha.';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function normalizeTaskTitle(value = '') {
  return value.trim().replace(/\s+/g, ' ');
}
