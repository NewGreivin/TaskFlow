import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../theme/ThemeContext';

export default function FilterPills({ items, value, onChange }) {
  const { palette } = useAppTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {items.map((item) => {
        const active = item === value;
        return (
          <Pressable key={item} onPress={() => onChange(item)} style={[styles.pill, { backgroundColor: active ? palette.primary : palette.surface, borderColor: active ? palette.primary : palette.border }]}>
            <Text style={{ color: active ? '#FFF' : palette.text, fontWeight: '700', fontSize: 12 }}>{item}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingVertical: 2 },
  pill: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
});
