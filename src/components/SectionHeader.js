import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../theme/ThemeContext';

export default function SectionHeader({ title, action, onAction }) {
  const { palette } = useAppTheme();
  return (
    <View style={styles.row}>
      <Text variant="titleLarge" style={[styles.title, { color: palette.text }]}>{title}</Text>
      {action ? <Text onPress={onAction} style={[styles.action, { color: palette.primary }]}>{action}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontWeight: '800' },
  action: { fontWeight: '700' },
});
