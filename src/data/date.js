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

export function formatMonthYearEs(year, month) {
  const date = new Date(year, month, 1);
  return new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric' }).format(date);
}

export function getMonthCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const startDate = new Date(year, month, 1 - startDayOfWeek);

  const days = [];
  // 6 weeks * 7 days = 42 cells to cover any month view fixed grid
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    days.push({
      key: toLocalDateKey(d),
      dateNumber: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }

  // Trim trailing 7 days if they belong entirely to next month and total grid is 35 days and covers all days of current month
  // (Standard practice for crisp 5 or 6 row layout)
  if (days.length === 42 && days[35].month !== month) {
    days.splice(35, 7);
  }

  return days;
}
