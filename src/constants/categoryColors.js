export const CATEGORY_COLORS = [
  // Red & Rose shades
  { id: 'red', name: 'Rojo Carmesí', value: '#EF4444' },
  { id: 'coral', name: 'Coral', value: '#F87171' },
  { id: 'rose', name: 'Rosa Vibrante', value: '#F43F5E' },
  { id: 'pink', name: 'Rosa Pastel', value: '#EC4899' },

  // Orange, Amber & Yellow
  { id: 'orange', name: 'Naranja', value: '#F97316' },
  { id: 'amber', name: 'Ámbar', value: '#F59E0B' },
  { id: 'yellow', name: 'Amarillo', value: '#EAB308' },
  { id: 'peach', name: 'Melocotón', value: '#FB923C' },

  // Greens & Emerald
  { id: 'emerald', name: 'Verde Esmeralda', value: '#10B981' },
  { id: 'green', name: 'Verde Hoja', value: '#22C55E' },
  { id: 'teal', name: 'Verde Menta', value: '#14B8A6' },

  // Cyan & Blues
  { id: 'cyan', name: 'Cian Claro', value: '#06B6D4' },
  { id: 'sky', name: 'Azul Cielo', value: '#0EA5E9' },
  { id: 'blue', name: 'Azul Vivo', value: '#3B82F6' },
  { id: 'indigo', name: 'Índigo', value: '#6366F1' },

  // Purple & Violet
  { id: 'purple', name: 'Morado', value: '#8B5CF6' },
  { id: 'violet', name: 'Violeta', value: '#A855F7' },
  { id: 'fuchsia', name: 'Fucsia', value: '#D946EF' },

  // Neutrals & Slate
  { id: 'slate', name: 'Gris Pizarra', value: '#64748B' },
  { id: 'gray', name: 'Gris Neutro', value: '#94A3B8' },
  { id: 'dark', name: 'Carbono', value: '#475569' },
];

export const DEFAULT_COLOR_VALUE = '#6366F1';

export function getColorById(id) {
  const found = CATEGORY_COLORS.find((item) => item.id === id);
  if (found) return found;
  return CATEGORY_COLORS[0];
}
