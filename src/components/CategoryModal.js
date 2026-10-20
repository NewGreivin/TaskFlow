import React, { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, IconButton, Surface, Text, TextInput, Portal, Dialog } from 'react-native-paper';
import { useAppTheme } from '../theme/ThemeContext';
import { CATEGORY_ICONS, ICON_CATEGORIES, DEFAULT_ICON_ID } from '../constants/categoryIcons';
import { CATEGORY_COLORS, DEFAULT_COLOR_VALUE } from '../constants/categoryColors';
import CategoryIcon from './CategoryIcon';

export default function CategoryModal({ visible, category, onSave, onClose }) {
  const { palette, isDark } = useAppTheme();

  // Form State
  const [name, setName] = useState('');
  const [selectedIconId, setSelectedIconId] = useState(DEFAULT_ICON_ID);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR_VALUE);

  // Submodal State (Icon Picker)
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [tempIconId, setTempIconId] = useState(DEFAULT_ICON_ID);
  const [iconSearchQuery, setIconSearchQuery] = useState('');

  // Custom Color Dialog State
  const [customColorDialogVisible, setCustomColorDialogVisible] = useState(false);
  const [customHex, setCustomHex] = useState('#6366F1');

  // Specific Theme Tokens based on specifications
  const themeTokens = {
    modalBg: isDark ? '#161722' : '#FFFFFF',
    cardBg: isDark ? '#12131C' : '#F8FAFC',
    cardBorder: isDark ? '#2B2D3C' : '#E2E8F0',
    titleText: isDark ? '#FFFFFF' : '#0F172A',
    sectionTitle: isDark ? '#818CF8' : '#6366F1',
    subText: isDark ? '#71788E' : '#94A3B8',
    neutralIcon: isDark ? '#CBD5E1' : '#475569',
    primaryBtn: isDark ? '#2E334D' : '#4F46E5',
    primaryBtnText: '#FFFFFF',
  };

  useEffect(() => {
    if (visible) {
      if (category) {
        setName(category.name || '');
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
      setIconPickerVisible(false);
      setCustomColorDialogVisible(false);
    }
  }, [visible, category]);

  // Handle Main Modal Save
  const handleSave = () => {
    if (!name.trim()) return;
    onSave?.({
      name: name.trim(),
      icon: selectedIconId,
      color: selectedColor,
    });
    onClose?.();
  };

  // Icon Picker Submodal Handlers
  const handleOpenIconPicker = () => {
    setTempIconId(selectedIconId);
    setIconSearchQuery('');
    setIconPickerVisible(true);
  };

  const handleConfirmIconPicker = () => {
    setSelectedIconId(tempIconId);
    setIconPickerVisible(false);
  };

  // Custom Color Picker Handlers
  const handleApplyCustomColor = () => {
    const validHexPattern = /^#([0-9A-F]{3}){1,2}$/i;
    if (validHexPattern.test(customHex.trim())) {
      setSelectedColor(customHex.trim().toUpperCase());
    }
    setCustomColorDialogVisible(false);
  };

  // Filtered icons for Icon Picker Submodal
  const filteredIcons = CATEGORY_ICONS.filter((item) => {
    if (!iconSearchQuery.trim()) return true;
    const q = iconSearchQuery.toLowerCase().trim();
    const nameMatch = item.name.toLowerCase().includes(q);
    const catMatch = (item.category || '').toLowerCase().includes(q);
    const keywordMatch = (item.keywords || []).some((kw) => kw.toLowerCase().includes(q));
    return nameMatch || catMatch || keywordMatch;
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalWrapper}>
          <Surface
            elevation={5}
            style={[
              styles.modalContainer,
              { backgroundColor: themeTokens.modalBg, borderColor: themeTokens.cardBorder },
            ]}
          >
            {/* Header: Title left, Close button (✕) right */}
            <View style={styles.header}>
              <Text variant="titleLarge" style={[styles.title, { color: themeTokens.titleText }]}>
                {category ? 'Editar categoría' : 'Crear categoría'}
              </Text>
              <IconButton icon="close" size={22} iconColor={themeTokens.titleText} onPress={onClose} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Real-time Preview Card */}
              <Text variant="labelLarge" style={[styles.sectionTitle, { color: themeTokens.sectionTitle }]}>
                VISTA PREVIA
              </Text>
              <Surface
                style={[
                  styles.previewCard,
                  { backgroundColor: themeTokens.cardBg, borderColor: themeTokens.cardBorder },
                ]}
                elevation={0}
              >
                <View style={[styles.previewIconBox, { backgroundColor: `${selectedColor}22` }]}>
                  <CategoryIcon iconId={selectedIconId} size={24} color={selectedColor} />
                </View>
                <Text variant="titleMedium" style={[styles.previewName, { color: themeTokens.titleText }]}>
                  {name.trim() || 'Nombre de la categoría'}
                </Text>
              </Surface>

              {/* Input for category name */}
              <TextInput
                label="Nombre de la categoría"
                placeholder="Nombre de la categoría"
                value={name}
                onChangeText={setName}
                mode="outlined"
                textColor={themeTokens.titleText}
                placeholderTextColor={themeTokens.subText}
                outlineColor={themeTokens.cardBorder}
                activeOutlineColor={themeTokens.sectionTitle}
                style={[styles.input, { backgroundColor: themeTokens.cardBg }]}
              />

              {/* Trigger Button/Card for Submodal Icon Picker */}
              <Text variant="labelLarge" style={[styles.sectionTitle, { color: themeTokens.sectionTitle }]}>
                SELECCIONAR ICONO
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleOpenIconPicker}
                style={[
                  styles.iconTriggerCard,
                  { backgroundColor: themeTokens.cardBg, borderColor: themeTokens.cardBorder },
                ]}
              >
                <View style={[styles.triggerIconBox, { backgroundColor: `${selectedColor}18` }]}>
                  <CategoryIcon iconId={selectedIconId} size={22} color={selectedColor} />
                </View>
                <Text style={[styles.triggerText, { color: themeTokens.titleText }]}>
                  Elegir icono
                </Text>
                <IconButton icon="chevron-right" size={22} iconColor={themeTokens.neutralIcon} />
              </TouchableOpacity>

              {/* Color Palette + Custom Color Selector */}
              <Text variant="labelLarge" style={[styles.sectionTitle, { color: themeTokens.sectionTitle, marginTop: 16 }]}>
                COLOR DE CATEGORÍA
              </Text>
              <View style={styles.colorGrid}>
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
                      {isSelected && <IconButton icon="check" size={16} iconColor="#FFFFFF" style={{ margin: 0 }} />}
                    </TouchableOpacity>
                  );
                })}

                {/* Custom Color Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setCustomHex(selectedColor);
                    setCustomColorDialogVisible(true);
                  }}
                  style={[
                    styles.colorCircle,
                    styles.customColorBtn,
                    { borderColor: themeTokens.sectionTitle },
                  ]}
                >
                  <IconButton icon="palette-outline" size={18} iconColor={themeTokens.sectionTitle} style={{ margin: 0 }} />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Main Modal Footer Actions */}
            <View style={[styles.actions, { borderTopColor: themeTokens.cardBorder }]}>
              <Button mode="text" onPress={onClose} textColor={themeTokens.subText}>
                Cancelar
              </Button>
              <Button
                mode="contained"
                disabled={!name.trim()}
                onPress={handleSave}
                style={[
                  styles.saveBtn,
                  { backgroundColor: name.trim() ? themeTokens.primaryBtn : `${themeTokens.primaryBtn}50` },
                ]}
                textColor={themeTokens.primaryBtnText}
              >
                Guardar categoría
              </Button>
            </View>
          </Surface>
        </Pressable>
      </Pressable>

      {/* Submodal Secundario: "Seleccionar icono" */}
      <Modal visible={iconPickerVisible} transparent animationType="slide" onRequestClose={() => setIconPickerVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIconPickerVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.submodalWrapper}>
            <Surface
              elevation={5}
              style={[
                styles.modalContainer,
                { backgroundColor: themeTokens.modalBg, borderColor: themeTokens.cardBorder },
              ]}
            >
              <View style={styles.header}>
                <Text variant="titleLarge" style={[styles.title, { color: themeTokens.titleText }]}>
                  Seleccionar icono
                </Text>
                <IconButton
                  icon="close"
                  size={20}
                  iconColor={themeTokens.titleText}
                  onPress={() => setIconPickerVisible(false)}
                />
              </View>

              {/* Search Bar */}
              <TextInput
                placeholder="Buscar iconos"
                value={iconSearchQuery}
                onChangeText={setIconSearchQuery}
                mode="outlined"
                dense
                textColor={themeTokens.titleText}
                placeholderTextColor={themeTokens.subText}
                outlineColor={themeTokens.cardBorder}
                activeOutlineColor={themeTokens.sectionTitle}
                left={<TextInput.Icon icon="magnify" iconColor={themeTokens.subText} />}
                style={[styles.searchInput, { backgroundColor: themeTokens.cardBg }]}
              />

              {/* 7-column grid with smooth vertical scroll */}
              <ScrollView
                style={styles.iconScrollArea}
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
              >
                {iconSearchQuery.trim() ? (
                  <View style={styles.sevenColGrid}>
                    {filteredIcons.map((item) => {
                      const isSelected = tempIconId === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.7}
                          onPress={() => setTempIconId(item.id)}
                          style={[
                            styles.colTile,
                            { backgroundColor: themeTokens.cardBg, borderColor: themeTokens.cardBorder },
                            isSelected && { borderColor: selectedColor, backgroundColor: `${selectedColor}22` },
                          ]}
                        >
                          <CategoryIcon
                            iconId={item.id}
                            size={22}
                            color={isSelected ? selectedColor : themeTokens.neutralIcon}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  ICON_CATEGORIES.map((catName) => {
                    const catIcons = CATEGORY_ICONS.filter((item) => item.category === catName);
                    if (catIcons.length === 0) return null;
                    return (
                      <View key={catName} style={styles.catGroup}>
                        <Text style={[styles.catGroupTitle, { color: themeTokens.sectionTitle }]}>
                          {catName}
                        </Text>
                        <View style={styles.sevenColGrid}>
                          {catIcons.map((item) => {
                            const isSelected = tempIconId === item.id;
                            return (
                              <TouchableOpacity
                                key={item.id}
                                activeOpacity={0.7}
                                onPress={() => setTempIconId(item.id)}
                                style={[
                                  styles.colTile,
                                  { backgroundColor: themeTokens.cardBg, borderColor: themeTokens.cardBorder },
                                  isSelected && { borderColor: selectedColor, backgroundColor: `${selectedColor}25` },
                                ]}
                              >
                                <CategoryIcon
                                  iconId={item.id}
                                  size={22}
                                  color={isSelected ? selectedColor : themeTokens.neutralIcon}
                                />
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              {/* Submodal Actions */}
              <View style={[styles.actions, { borderTopColor: themeTokens.cardBorder }]}>
                <Button mode="text" onPress={() => setIconPickerVisible(false)} textColor={themeTokens.subText}>
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleConfirmIconPicker}
                  style={[styles.saveBtn, { backgroundColor: themeTokens.primaryBtn }]}
                  textColor={themeTokens.primaryBtnText}
                >
                  Seleccionar
                </Button>
              </View>
            </Surface>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Custom HEX Color Picker Dialog */}
      <Portal>
        <Dialog
          visible={customColorDialogVisible}
          onDismiss={() => setCustomColorDialogVisible(false)}
          style={{ backgroundColor: themeTokens.modalBg }}
        >
          <Dialog.Title style={{ color: themeTokens.titleText }}>Color personalizado (HEX)</Dialog.Title>
          <Dialog.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: /^#([0-9A-F]{3}){1,2}$/i.test(customHex) ? customHex : '#8B7CFF',
                  borderWidth: 1,
                  borderColor: themeTokens.cardBorder,
                }}
              />
              <TextInput
                label="Código Hexadecimal"
                placeholder="#FF5500"
                value={customHex}
                onChangeText={setCustomHex}
                mode="outlined"
                style={{ flex: 1, backgroundColor: themeTokens.cardBg }}
                textColor={themeTokens.titleText}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCustomColorDialogVisible(false)} textColor={themeTokens.subText}>
              Cancelar
            </Button>
            <Button onPress={handleApplyCustomColor} textColor={themeTokens.sectionTitle}>
              Aplicar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  modalWrapper: {
    maxHeight: '92%',
  },
  submodalWrapper: {
    maxHeight: '85%',
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
    paddingBottom: 8,
  },
  sectionTitle: {
    fontWeight: '800',
    letterSpacing: 0.8,
    fontSize: 12,
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
  iconTriggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  triggerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  triggerText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 15,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  customColorBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  searchInput: {
    marginBottom: 12,
  },
  iconScrollArea: {
    maxHeight: 320,
    marginBottom: 12,
  },
  catGroup: {
    marginBottom: 14,
  },
  catGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sevenColGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  colTile: {
    width: '12.5%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  saveBtn: {
    borderRadius: 12,
  },
});
