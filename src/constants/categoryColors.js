export const CATEGORY_COLORS = [
  { id: 'purple', name: 'Violeta', value: '#8B7CFF' },
  { id: 'blue', name: 'Azul', value: '#4D7CFE' },
  { id: 'green', name: 'Verde', value: '#35C99A' },
  { id: 'orange', name: 'Naranja', value: '#FF9955' },
  { id: 'pink', name: 'Rosa', value: '#FF5C93' },
  { id: 'yellow', name: 'Amarillo', value: '#E9BD45' },
  { id: 'gray', name: 'Gris', value: '#777E8E' },
  { id: 'cyan', name: 'Cian', value: '#00D2D3' },
  { id: 'red', name: 'Rojo', value: '#FF4D6D' },
];

export const DEFAULT_COLOR_VALUE = '#8B7CFF';

export function getColorById(id) {
  const found = CATEGORY_COLORS.find((item) => item.id === id);
  if (found) return found;
  return CATEGORY_COLORS[0];
}
