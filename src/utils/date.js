export function pad2(value) { return String(value).padStart(2, '0'); }
export function toLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`;
}
export function isPastDate(dateString) {
  return !!dateString && dateString < toLocalDateKey(new Date());
}
