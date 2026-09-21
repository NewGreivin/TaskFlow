export function pad2(value) { return String(value).padStart(2, '0'); }
export function toLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
export function formatDateEs(key) {
  if (!key) return '';
  const [y,m,d] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('es-CR', { weekday:'long', day:'numeric', month:'long' }).format(new Date(y,m-1,d));
}
export function formatShortDateEs(key) {
  if (!key) return '';
  const [y,m,d] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('es-CR', { day:'numeric', month:'short' }).format(new Date(y,m-1,d));
}
export function addDays(key, amount) {
  const [y,m,d] = key.split('-').map(Number);
  const date = new Date(y,m-1,d); date.setDate(date.getDate()+amount); return toLocalDateKey(date);
}
export function weekFrom(date = new Date()) {
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mondayOffset = (base.getDay() + 6) % 7;
  base.setDate(base.getDate() - mondayOffset);
  return Array.from({length:7}, (_,i) => { const d = new Date(base); d.setDate(base.getDate()+i); return { key: toLocalDateKey(d), day: new Intl.DateTimeFormat('es-CR',{weekday:'short'}).format(d).replace('.',''), date: String(d.getDate()), month: d.getMonth(), year:d.getFullYear() }; });
}
