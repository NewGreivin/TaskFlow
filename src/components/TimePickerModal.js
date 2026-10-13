import React, { useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Icon, Surface, Text } from 'react-native-paper';
import { useAppTheme } from '../theme/ThemeContext';

export default function TimePickerModal({ visible, time, onSelect, onClose }) {
  const { palette } = useAppTheme();

  // Parse HH:MM
  const parseTime = (tStr) => {
    if (!tStr || typeof tStr !== 'string' || !tStr.includes(':')) {
      return { hour: 10, minute: 0 };
    }
    const [h, m] = tStr.split(':').map(Number);
    return { hour: isNaN(h) ? 10 : h, minute: isNaN(m) ? 0 : m };
  };

  const initial = parseTime(time);
  const [selectedHour, setSelectedHour] = useState(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState(initial.minute);

  useEffect(() => {
    if (visible && time) {
      const { hour, minute } = parseTime(time);
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [visible, time]);

  const handleConfirm = () => {
    const formattedHour = String(selectedHour).padStart(2, '0');
    const formattedMinute = String(selectedMinute).padStart(2, '0');
    const result = `${formattedHour}:${formattedMinute}`;
    onSelect?.(result);
    onClose?.();
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10... 55

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Surface
            elevation={4}
            style={[
              styles.modal,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text variant="titleMedium" style={[styles.title, { color: palette.text }]}>
              Seleccionar hora
            </Text>

            {/* Display selected time */}
            <View style={[styles.timeDisplay, { backgroundColor: palette.primarySoft || palette.primary + '18' }]}>
              <Icon source="clock-outline" size={24} color={palette.primary} />
              <Text variant="headlineLarge" style={[styles.timeDisplayText, { color: palette.primary }]}>
                {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')}
              </Text>
            </View>

            <View style={styles.pickersContainer}>
              {/* Hours Column */}
              <View style={styles.column}>
                <Text style={[styles.columnHeader, { color: palette.muted }]}>HORA</Text>
                <ScrollView style={styles.scrollList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {hours.map((h) => {
                    const isSelected = h === selectedHour;
                    return (
                      <TouchableOpacity
                        key={h}
                        activeOpacity={0.7}
                        onPress={() => setSelectedHour(h)}
                        style={[
                          styles.itemButton,
                          isSelected && { backgroundColor: palette.primary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.itemText,
                            { color: isSelected ? '#FFFFFF' : palette.text },
                            isSelected && styles.itemTextSelected,
                          ]}
                        >
                          {String(h).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <Text style={[styles.colon, { color: palette.text }]}>:</Text>

              {/* Minutes Column */}
              <View style={styles.column}>
                <Text style={[styles.columnHeader, { color: palette.muted }]}>MINUTOS</Text>
                <ScrollView style={styles.scrollList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {minutes.map((m) => {
                    const isSelected = m === selectedMinute;
                    return (
                      <TouchableOpacity
                        key={m}
                        activeOpacity={0.7}
                        onPress={() => setSelectedMinute(m)}
                        style={[
                          styles.itemButton,
                          isSelected && { backgroundColor: palette.primary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.itemText,
                            { color: isSelected ? '#FFFFFF' : palette.text },
                            isSelected && styles.itemTextSelected,
                          ]}
                        >
                          {String(m).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button mode="text" onPress={onClose}>
                Cancelar
              </Button>
              <Button mode="contained" onPress={handleConfirm} style={styles.confirmButton}>
                Aceptar
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  title: {
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'center',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 16,
  },
  timeDisplayText: {
    fontWeight: '800',
    letterSpacing: 1,
  },
  pickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginBottom: 16,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scrollList: {
    width: '100%',
  },
  colon: {
    fontSize: 24,
    fontWeight: '800',
    marginHorizontal: 8,
    marginTop: 20,
  },
  itemButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemTextSelected: {
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  confirmButton: {
    borderRadius: 10,
  },
});
