import React, { useState, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';

const CLOCK_SIZE = 280; // Diameter of the clock circle
const RADIUS = CLOCK_SIZE / 2;
const NUMBER_DISTANCE = 100; // Distance from center to numbers

export default function TimePickerModal({ visible, time, onSelect, onClose }) {
  // Mode: 'hours' or 'minutes'
  const [mode, setMode] = useState('hours');
  const [hour, setHour] = useState(10); // 1 to 12
  const [minute, setMinute] = useState(0); // 0 to 59
  const [period, setPeriod] = useState('AM'); // 'AM' or 'PM'

  // Parse incoming 24h string ("HH:MM")
  useEffect(() => {
    if (visible && time) {
      const [hStr, mStr] = (time || '10:00').split(':');
      let h = parseInt(hStr, 10);
      let m = parseInt(mStr, 10);
      if (isNaN(h)) h = 10;
      if (isNaN(m)) m = 0;

      let p = 'AM';
      if (h >= 12) {
        p = 'PM';
        if (h > 12) h -= 12;
      } else if (h === 0) {
        h = 12;
      }

      setHour(h);
      setMinute(m);
      setPeriod(p);
      setMode('hours');
    }
  }, [visible, time]);

  const handleHourSelect = (selectedH) => {
    setHour(selectedH);
    // Transition automatically to minutes mode
    setMode('minutes');
  };

  const handleMinuteSelect = (selectedM) => {
    setMinute(selectedM);
  };

  const handleConfirm = () => {
    let final24Hour = hour;
    if (period === 'PM' && hour < 12) {
      final24Hour = hour + 12;
    } else if (period === 'AM' && hour === 12) {
      final24Hour = 0;
    }

    const formattedH = String(final24Hour).padStart(2, '0');
    const formattedM = String(minute).padStart(2, '0');
    const time24 = `${formattedH}:${formattedM}`;

    onSelect?.(time24);
    onClose?.();
  };

  // Numbers for hours: 1 to 12
  const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  // Numbers for minutes: 00 to 55 (5-minute steps)
  const minuteNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const currentNumbers = mode === 'hours' ? hourNumbers : minuteNumbers;
  const currentValue = mode === 'hours' ? hour : Math.round(minute / 5) * 5 % 60;

  // Calculate angle for selected value
  // 12 or 0 is at top (-90 deg or -Math.PI/2)
  const activeIndex = currentNumbers.indexOf(currentValue);
  const angleDeg = activeIndex !== -1 ? activeIndex * 30 - 90 : -90;
  const angleRad = (angleDeg * Math.PI) / 180;

  const handX = RADIUS + NUMBER_DISTANCE * Math.cos(angleRad);
  const handY = RADIUS + NUMBER_DISTANCE * Math.sin(angleRad);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Surface elevation={5} style={styles.modalContainer}>
            {/* Title */}
            <Text style={styles.modalTitle}>Seleccionar hora</Text>

            {/* Header: Hour Box, Separator, Minute Box, AM/PM Toggle */}
            <View style={styles.headerRow}>
              <View style={styles.timeDisplayGroup}>
                {/* Hours Box */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setMode('hours')}
                  style={[
                    styles.timeBox,
                    mode === 'hours' ? styles.timeBoxActive : styles.timeBoxInactive,
                  ]}
                >
                  <Text style={[styles.timeBoxText, mode === 'hours' && styles.timeBoxTextActive]}>
                    {String(hour).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>

                {/* Separator */}
                <Text style={styles.timeSeparator}>:</Text>

                {/* Minutes Box */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setMode('minutes')}
                  style={[
                    styles.timeBox,
                    mode === 'minutes' ? styles.timeBoxActive : styles.timeBoxInactive,
                  ]}
                >
                  <Text style={[styles.timeBoxText, mode === 'minutes' && styles.timeBoxTextActive]}>
                    {String(minute).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* AM / PM Toggle */}
              <View style={styles.periodContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPeriod('AM')}
                  style={[
                    styles.periodButton,
                    period === 'AM' ? styles.periodActive : styles.periodInactive,
                  ]}
                >
                  <Text style={[styles.periodText, period === 'AM' && styles.periodTextActive]}>
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPeriod('PM')}
                  style={[
                    styles.periodButton,
                    period === 'PM' ? styles.periodActive : styles.periodInactive,
                  ]}
                >
                  <Text style={[styles.periodText, period === 'PM' && styles.periodTextActive]}>
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Circular Analog Clock */}
            <View style={styles.clockContainer}>
              <View style={styles.clockCircle}>
                {/* Center Pivot Dot */}
                <View style={styles.pivotDot} />

                {/* Clock Hand Line */}
                <View
                  style={[
                    styles.clockHand,
                    {
                      width: NUMBER_DISTANCE,
                      transform: [
                        { translateX: NUMBER_DISTANCE / 2 },
                        { rotate: `${angleDeg}deg` },
                        { translateX: -NUMBER_DISTANCE / 2 },
                      ],
                    },
                  ]}
                />

                {/* Active Selection Highlight Circle */}
                <View
                  style={[
                    styles.selectionHighlight,
                    {
                      left: handX - 26,
                      top: handY - 26,
                    },
                  ]}
                />

                {/* Clock Numbers */}
                {currentNumbers.map((num, idx) => {
                  const numDeg = idx * 30 - 90;
                  const numRad = (numDeg * Math.PI) / 180;
                  const x = RADIUS + NUMBER_DISTANCE * Math.cos(numRad);
                  const y = RADIUS + NUMBER_DISTANCE * Math.sin(numRad);

                  const isSelected = mode === 'hours' ? num === hour : num === currentValue;

                  const label = mode === 'hours' ? String(num) : String(num).padStart(2, '0');

                  return (
                    <TouchableOpacity
                      key={num}
                      activeOpacity={0.7}
                      onPress={() => (mode === 'hours' ? handleHourSelect(num) : handleMinuteSelect(num))}
                      style={[
                        styles.numberTouch,
                        {
                          left: x - 24,
                          top: y - 24,
                        },
                      ]}
                    >
                      <Text style={[styles.numberText, isSelected && styles.numberTextSelected]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Bottom Actions */}
            <View style={styles.actionsRow}>
              <Button mode="text" onPress={onClose} textColor="#C5C2FF" style={styles.cancelBtn}>
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirm}
                buttonColor="#8B7CFF"
                textColor="#171A24"
                style={styles.confirmBtn}
                labelStyle={{ fontWeight: '800' }}
              >
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
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#292A32',
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D0CFD8',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeDisplayGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBox: {
    width: 80,
    height: 72,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeBoxInactive: {
    backgroundColor: '#41424B',
  },
  timeBoxActive: {
    backgroundColor: '#41416F',
    borderWidth: 2.5,
    borderColor: '#C5C2FF',
  },
  timeBoxText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#D0CFD8',
  },
  timeBoxTextActive: {
    color: '#C5C2FF',
  },
  timeSeparator: {
    fontSize: 42,
    fontWeight: '700',
    color: '#D0CFD8',
    marginHorizontal: 6,
  },
  periodContainer: {
    width: 52,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#41424B',
    backgroundColor: '#292A32',
    overflow: 'hidden',
  },
  periodButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodInactive: {
    backgroundColor: 'transparent',
  },
  periodActive: {
    backgroundColor: '#41416F',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8D9A',
  },
  periodTextActive: {
    color: '#C5C2FF',
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  clockCircle: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: RADIUS,
    backgroundColor: '#41424B',
    position: 'relative',
  },
  pivotDot: {
    position: 'absolute',
    left: RADIUS - 7,
    top: RADIUS - 7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#C5C2FF',
    zIndex: 10,
  },
  clockHand: {
    position: 'absolute',
    left: RADIUS,
    top: RADIUS - 1,
    height: 2,
    backgroundColor: '#C5C2FF',
    zIndex: 5,
  },
  selectionHighlight: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#C5C2FF',
    zIndex: 6,
  },
  numberTouch: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
  },
  numberText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F2F1F7',
  },
  numberTextSelected: {
    color: '#171A24',
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    paddingHorizontal: 8,
  },
  confirmBtn: {
    borderRadius: 16,
    paddingHorizontal: 16,
  },
});
