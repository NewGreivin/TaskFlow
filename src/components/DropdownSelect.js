import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Surface, Text } from 'react-native-paper';
import { useAppTheme } from '../theme/ThemeContext';

export default function DropdownSelect({
  label,
  value,
  options = [],
  onSelect,
  icon,
  iconColor,
  placeholder = 'Seleccionar...',
  style,
}) {
  const { palette } = useAppTheme();
  const [open, setOpen] = useState(false);

  // Normalize option list
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        label: opt.label ?? String(opt.value),
        value: opt.value,
        icon: opt.icon,
        color: opt.color,
      };
    }
    return {
      label: String(opt),
      value: opt,
      icon: null,
      color: null,
    };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || {
    label: value !== undefined && value !== null ? String(value) : placeholder,
    value,
  };

  const handleSelect = (val) => {
    onSelect?.(val);
    setOpen(false);
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text variant="titleMedium" style={[styles.label, { color: palette.text }]}>
          {label}
        </Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen(true)}
        style={[
          styles.selector,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.selectorLeft}>
          {icon ? (
            <View style={styles.iconContainer}>
              <Icon source={icon} size={20} color={iconColor || selectedOption.color || palette.primary} />
            </View>
          ) : null}
          <Text
            numberOfLines={1}
            style={[
              styles.selectorText,
              {
                color: selectedOption.label ? palette.text : palette.muted,
              },
            ]}
          >
            {selectedOption.label || placeholder}
          </Text>
        </View>
        <Icon source="chevron-down" size={22} color={palette.muted} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Surface
              elevation={4}
              style={[
                styles.modal,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              {label ? (
                <Text variant="titleLarge" style={[styles.modalTitle, { color: palette.text }]}>
                  {label}
                </Text>
              ) : null}

              <ScrollView style={styles.optionsList} bounces={false}>
                {normalizedOptions.map((item, idx) => {
                  const isSelected = item.value === value;
                  const itemColor = item.color || palette.primary;

                  return (
                    <TouchableOpacity
                      key={item.value !== undefined ? String(item.value) : idx}
                      activeOpacity={0.7}
                      onPress={() => handleSelect(item.value)}
                      style={[
                        styles.optionRow,
                        isSelected && {
                          backgroundColor: palette.primarySoft || palette.primary + '22',
                        },
                      ]}
                    >
                      <View style={styles.optionLeft}>
                        {item.icon ? (
                          <Icon source={item.icon} size={20} color={isSelected ? palette.primary : itemColor} />
                        ) : icon ? (
                          <Icon source={icon} size={20} color={isSelected ? palette.primary : itemColor} />
                        ) : null}
                        <Text
                          style={[
                            styles.optionLabel,
                            { color: isSelected ? palette.primary : palette.text },
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </View>

                      {isSelected ? (
                        <Icon source="check" size={20} color={palette.primary} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Surface>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 8,
    fontWeight: '750',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconContainer: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorText: {
    fontSize: 15,
    fontWeight: '500',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  optionsList: {
    maxHeight: 320,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
  },
  optionLabelSelected: {
    fontWeight: '700',
  },
});
