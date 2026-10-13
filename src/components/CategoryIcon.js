import React from 'react';
import { Icon } from 'react-native-paper';
import { CATEGORY_ICONS, DEFAULT_ICON_ID } from '../constants/categoryIcons';

export default function CategoryIcon({ iconId, size = 22, color = '#8B7CFF', style }) {
  // Look up icon in central catalog by ID, or if passed a direct icon name (e.g. 'folder-outline')
  const iconEntry =
    CATEGORY_ICONS.find((item) => item.id === iconId) ||
    CATEGORY_ICONS.find((item) => item.iconName === iconId);

  const resolvedSource = iconEntry
    ? iconEntry.iconName
    : typeof iconId === 'string' && iconId.trim()
    ? iconId
    : CATEGORY_ICONS.find((item) => item.id === DEFAULT_ICON_ID)?.iconName || 'folder-outline';

  return <Icon source={resolvedSource} size={size} color={color} style={style} />;
}
