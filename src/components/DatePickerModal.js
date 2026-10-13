import React, { useState, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Icon, Surface, Text } from 'react-native-paper';
import { useAppTheme } from '../theme/ThemeContext';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export default function DatePickerModal({ visible, date, onSelect, onClose }) {
  const { palette } = useAppTheme();

  // Parse YYYY-MM-DD
  const parseDate = (dStr) => {
    if (!dStr || typeof dStr !== 'string' || !dStr.includes('-')) {
      return new Date();
    }
    const [y, m, d] = dStr.split('-').map(Number);
    return new Date(y, m - 1, d || 1);
  };

  const initialDate = parseDate(date);
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(date || '');

  useEffect(() => {
    if (visible && date) {
      const d = parseDate(date);
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
      setSelectedDateKey(date);
    }
  }, [visible, date]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDaySelect = (year, month, day) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const key = `${year}-${formattedMonth}-${formattedDay}`;
    setSelectedDateKey(key);
    onSelect?.(key);
    onClose?.();
  };

  // Generate calendar grid
  // First day of month (0 = Sunday, 1 = Monday...)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust so Monday is 0
  const startOffset = (firstDayOfMonth + 6) % 7;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: currentMonth === 0 ? 11 : currentMonth - 1,
      year: currentMonth === 0 ? currentYear - 1 : currentYear,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to fill grid (6 rows of 7 = 42 or 35)
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      day: i,
      month: currentMonth === 11 ? 0 : currentMonth + 1,
      year: currentMonth === 11 ? currentYear + 1 : currentYear,
      isCurrentMonth: false,
    });
  }

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
            {/* Header: Month Year + Arrows */}
            <View style={styles.header}>
              <Text variant="titleMedium" style={[styles.monthYearText, { color: palette.text }]}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>
              <View style={styles.arrowRow}>
                <TouchableOpacity activeOpacity={0.6} onPress={handlePrevMonth} style={styles.arrowButton}>
                  <Icon source="chevron-left" size={24} color={palette.text} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.6} onPress={handleNextMonth} style={styles.arrowButton}>
                  <Icon source="chevron-right" size={24} color={palette.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Days of week */}
            <View style={styles.weekRow}>
              {DAY_NAMES.map((dayName) => (
                <Text key={dayName} style={[styles.weekDayText, { color: palette.muted }]}>
                  {dayName}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.grid}>
              {calendarDays.map((item, index) => {
                const formattedMonth = String(item.month + 1).padStart(2, '0');
                const formattedDay = String(item.day).padStart(2, '0');
                const dateKey = `${item.year}-${formattedMonth}-${formattedDay}`;
                const isSelected = dateKey === selectedDateKey;

                return (
                  <TouchableOpacity
                    key={`${dateKey}-${index}`}
                    activeOpacity={0.7}
                    onPress={() => handleDaySelect(item.year, item.month, item.day)}
                    style={styles.dayCell}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        isSelected && { backgroundColor: palette.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color: isSelected
                              ? '#FFFFFF'
                              : item.isCurrentMonth
                              ? palette.text
                              : palette.muted + '66',
                          },
                          isSelected && styles.dayTextSelected,
                        ]}
                      >
                        {item.day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button mode="text" onPress={onClose}>
                Cancelar
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
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthYearText: {
    fontWeight: '800',
    fontSize: 17,
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowButton: {
    padding: 4,
    borderRadius: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dayTextSelected: {
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
});
