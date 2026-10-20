import React, { useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, IconButton, Surface, Text, TextInput } from 'react-native-paper';
import { useAppTheme } from '../theme/ThemeContext';
import { CATEGORY_ICONS, DEFAULT_ICON_ID } from '../constants/categoryIcons';
import { CATEGORY_COLORS, DEFAULT_COLOR_VALUE } from '../constants/categoryColors';
import CategoryIcon from './CategoryIcon';

export default function CategoryModal({ visible, category, onSave, onClose }) {
  const { palette } = useAppTheme();

  const [name, setName] = useState('');
  const [selectedIconId, setSelectedIconId] = useState(DEFAULT_ICON_ID);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR_VALUE);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      if (category) {
        setName(category.name || '');
        // Resolve icon identifier from category.icon or fallback
        const matchingIcon = CATEGORY_ICONS.find(
          (item) => item.id === category.icon || item.iconName === category.icon
        );
        setSelectedIconId(matchingIcon ? matchingIcon.id : category.icon || DEFAULT_ICON_ID);
        setSelectedColor(category.color || DEFAULT_COLOR_VALUE);
      } else {
        setName('');
        setSelectedIconId(DEFAULT_ICON_ID);
        setSelectedColor(DEFAULT_COLOR_VALUE);
      }
      setSearchQuery('');
    }
  }, [visible, category]);

  // Filter central icon catalog dynamically
  const filteredIcons = CATEGORY_ICONS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = item.name.toLowerCase().includes(q);
    const idMatch = item.id.toLowerCase().includes(q);
    const keywordMatch = (item.keywords || []).some((kw) => kw.toLowerCase().includes(q));
    return nameMatch || idMatch || keywordMatch;
  });

  const handleSave = () => {
    if (!name.trim()) return;
    onSave?.({
      name: name.trim(),
      icon: selectedIconId,
      color: selectedColor,
    });
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalWrapper}>
          <Surface
            elevation={5}
            style={[
              styles.modalContainer,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text variant="titleLarge" style={[styles.title, { color: palette.text }]}>
                {category ? 'Editar categoría' : 'Crear categoría'}
              </Text>
              <IconButton icon="close" size={20} onPress={onClose} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* 1. Preview Card */}
              <Text variant="labelLarge" style={[styles.sectionTitle, { color: palette.primary }]}>
                VISTA PREVIA
              </Text>
              <Surface
                style={[
                  styles.previewCard,
                  { backgroundColor: palette.background, borderColor: palette.border },
                ]}
                elevation={0}
              >
                <View style={[styles.previewIconBox, { backgroundColor: `${selectedColor}22` }]}>
                  <CategoryIcon iconId={selectedIconId} size={24} color={selectedColor} />
                </View>
                <Text variant="titleMedium" style={[styles.previewName, { color: palette.text }]}>
                  {name.trim() || 'Nombre de la categoría'}
                </Text>
              </Surface>

              {/* 2. Category Name Input */}
              <TextInput
                label="Nombre de la categoría"
                value={name}
                onChangeText={setName}
                mode="outlined"
                placeholder="Ej. Finanzas, Libros..."
                style={[styles.input, { backgroundColor: palette.surface }]}
              />

              {/* 3. Icon Selector */}
              <Text variant="labelLarge" style={[styles.sectionTitle, { color: palette.primary }]}>
                SELECCIONAR ICONO
              </Text>
              <TextInput
                placeholder="Buscar icono (ej. libro, casa...)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                mode="outlined"
                dense
                left={<TextInput.Icon icon="magnify" />}
                style={[styles.searchInput, { backgroundColor: palette.surface }]}
              />

              <ScrollView
                style={styles.iconScrollContainer}
                nestedScrollEnabled
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.iconGrid}>
                  {filteredIcons.map((item) => {
                    const isSelected = selectedIconId === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        onPress={() => setSelectedIconId(item.id)}
                        style={[
                          styles.iconTile,
                          { borderColor: palette.border, backgroundColor: palette.background },
                          isSelected && {
                            borderColor: selectedColor,
                            backgroundColor: `${selectedColor}20`,
                            borderWidth: 2,
                          },
                        ]}
                      >
                        <CategoryIcon
                          iconId={item.id}
                          size={22}
                          color={isSelected ? selectedColor : palette.muted}
                        />
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.iconTileLabel,
                            { color: isSelected ? palette.text : palette.muted },
                            isSelected && { fontWeight: '700' },
                          ]}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* 4. Color Palette Selector */}
              <Text variant="labelLarge" style={[styles.sectionTitle, { color: palette.primary, marginTop: 16 }]}>
                COLOR DE CATEGORÍA
              </Text>
              <View style={styles.colorRow}>
                {CATEGORY_COLORS.map((col) => {
                  const isSelected = selectedColor === col.value;
                  return (
                    <TouchableOpacity
                      key={col.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedColor(col.value)}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: col.value },
                        isSelected && styles.colorCircleSelected,
                      ]}
                    >
                      {isSelected ? <IconButton icon="check" size={16} iconColor="#FFF" /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <Button mode="text" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                mode="contained"
                disabled={!name.trim()}
                onPress={handleSave}
                style={styles.saveBtn}
              >
                Guardar categoría
              </Button>
            </View>
          </Surface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalWrapper: {
    maxHeight: '90%',
  },
  modalContainer: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 12,
  },
  sectionTitle: {
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  previewIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewName: {
    fontWeight: '700',
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 12,
  },
  iconScrollContainer: {
    maxHeight: 180,
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 4,
  },
  iconTile: {
    width: '31%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconTileLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF10',
  },
  saveBtn: {
    borderRadius: 12,
  },
});
