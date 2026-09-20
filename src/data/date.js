export function localDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function formatSpanishDate(date = new Date()) {
  return new Intl.DateTimeFormat('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}
