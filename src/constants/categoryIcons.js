export const CATEGORY_ICONS = [
  {
    id: 'folder',
    name: 'General',
    library: 'MaterialCommunityIcons',
    iconName: 'folder-outline',
    keywords: ['general', 'archivo', 'carpeta'],
  },
  {
    id: 'book-open',
    name: 'Libro / Estudios',
    library: 'MaterialCommunityIcons',
    iconName: 'book-open-variant',
    keywords: ['estudios', 'lectura', 'educacion', 'escuela', 'clases'],
  },
  {
    id: 'home',
    name: 'Hogar',
    library: 'MaterialCommunityIcons',
    iconName: 'home-outline',
    keywords: ['casa', 'vivienda', 'hogar', 'mantenimiento'],
  },
  {
    id: 'briefcase',
    name: 'Trabajo',
    library: 'MaterialCommunityIcons',
    iconName: 'briefcase-outline',
    keywords: ['empleo', 'oficina', 'trabajo', 'negocios'],
  },
  {
    id: 'heart',
    name: 'Salud',
    library: 'MaterialCommunityIcons',
    iconName: 'heart-outline',
    keywords: ['salud', 'bienestar', 'medico', 'ejercicio', 'cuidado'],
  },
  {
    id: 'cart',
    name: 'Compras',
    library: 'MaterialCommunityIcons',
    iconName: 'cart-outline',
    keywords: ['compras', 'supermercado', 'tienda', 'mercado'],
  },
  {
    id: 'cash',
    name: 'Finanzas',
    library: 'MaterialCommunityIcons',
    iconName: 'cash-multiple',
    keywords: ['finanzas', 'dinero', 'banco', 'pagos', 'presupuesto'],
  },
  {
    id: 'food',
    name: 'Alimentación',
    library: 'MaterialCommunityIcons',
    iconName: 'silverware-fork-knife',
    keywords: ['comida', 'restaurante', 'cocina', 'alimentacion'],
  },
  {
    id: 'car',
    name: 'Transporte',
    library: 'MaterialCommunityIcons',
    iconName: 'car-outline',
    keywords: ['auto', 'transporte', 'vehiculo', 'viaje'],
  },
  {
    id: 'airplane',
    name: 'Viajes',
    library: 'MaterialCommunityIcons',
    iconName: 'airplane',
    keywords: ['viaje', 'vacaciones', 'vuelo', 'turismo'],
  },
  {
    id: 'dog',
    name: 'Mascotas',
    library: 'MaterialCommunityIcons',
    iconName: 'dog',
    keywords: ['mascotas', 'perro', 'gato', 'animales'],
  },
  {
    id: 'laptop',
    name: 'Tecnología',
    library: 'MaterialCommunityIcons',
    iconName: 'laptop',
    keywords: ['computadora', 'programacion', 'tecnologia', 'web'],
  },
  {
    id: 'music',
    name: 'Música',
    library: 'MaterialCommunityIcons',
    iconName: 'music-note-outline',
    keywords: ['musica', 'audio', 'canciones', 'arte'],
  },
  {
    id: 'calendar',
    name: 'Eventos',
    library: 'MaterialCommunityIcons',
    iconName: 'calendar-month-outline',
    keywords: ['calendario', 'fechas', 'eventos', 'citas'],
  },
  {
    id: 'sports',
    name: 'Deportes',
    library: 'MaterialCommunityIcons',
    iconName: 'basketball',
    keywords: ['deporte', 'ejercicio', 'entrenamiento', 'gimnasio'],
  },
  {
    id: 'star',
    name: 'Metas',
    library: 'MaterialCommunityIcons',
    iconName: 'star-outline',
    keywords: ['metas', 'favoritos', 'prioridad', 'destacado'],
  },
];

export const DEFAULT_ICON_ID = 'folder';

export function getIconById(id) {
  const found = CATEGORY_ICONS.find((item) => item.id === id);
  if (found) return found;
  // Fallback to default
  return CATEGORY_ICONS.find((item) => item.id === DEFAULT_ICON_ID) || CATEGORY_ICONS[0];
}
