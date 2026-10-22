import React, { memo } from 'react';
import { Icon } from 'react-native-paper';
import { getIconById } from '../constants/categoryIcons';

function CategoryIcon({ iconId, size = 22, color = '#8B7CFF', style }) {
  const iconEntry = getIconById(iconId);
  const resolvedSource = iconEntry
    ? iconEntry.iconName
    : typeof iconId === 'string' && iconId.trim()
    ? iconId
    : 'folder-outline';

  return <Icon source={resolvedSource} size={size} color={color} style={style} />;
}

export default memo(CategoryIcon);
