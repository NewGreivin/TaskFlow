import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { FAB, IconButton, Surface, Text } from 'react-native-paper';
import { useSQLiteContext } from '../../src/data/database';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../../src/data/taskRepository';
import { useAppTheme } from '../../src/theme/ThemeContext';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import CategoryIcon from '../../src/components/CategoryIcon';
import CategoryModal from '../../src/components/CategoryModal';

export default function Categories() {
  const db = useSQLiteContext();
  const { palette } = useAppTheme();

  const [cats, setCats] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const load = useCallback(() => getCategories(db).then(setCats), [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleSaveCategory = async (data) => {
    if (editingCategory) {
      await updateCategory(db, editingCategory.id, data);
    } else {
      await createCategory(db, data);
    }
    setModalOpen(false);
    setEditingCategory(null);
    load();
  };

  const remove = (c) =>
    Alert.alert(
      'Eliminar categoría',
      `¿Eliminar "${c.name}"? Las tareas quedarán sin categoría.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(db, c.id);
            load();
          },
        },
      ]
    );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text variant="labelLarge" style={{ color: palette.primary, fontWeight: '800' }}>
              ORGANIZA
            </Text>
            <Text variant="headlineSmall" style={[styles.title, { color: palette.text }]}>
              Categorías
            </Text>
          </View>
          <IconButton icon="plus" mode="contained-tonal" onPress={handleOpenCreate} />
        </View>

        {cats.map((c) => {
          const color = c.color || palette.primary;
          return (
            <Surface
              key={c.id}
              style={[
                styles.card,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
              elevation={0}
            >
              <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
                <CategoryIcon iconId={c.icon} color={color} size={22} />
              </View>

              <View style={styles.info}>
                <Text variant="titleMedium" style={[styles.name, { color: palette.text }]}>
                  {c.name}
                </Text>
                <Text style={{ color: palette.muted }}>{c.task_count} tareas</Text>
              </View>

              <IconButton icon="pencil-outline" size={19} onPress={() => handleOpenEdit(c)} />
              <IconButton icon="delete-outline" size={19} onPress={() => remove(c)} />
            </Surface>
          );
        })}
      </ScrollView>

      {/* Floating Action Button (+) */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: palette.primary }]}
        color="#FFF"
        onPress={handleOpenCreate}
      />

      {/* Category Creation / Editing Modal */}
      <CategoryModal
        visible={modalOpen}
        category={editingCategory}
        onSave={handleSaveCategory}
        onClose={() => setModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 55, paddingBottom: 110 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { fontWeight: '800' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 10 },
  name: { fontWeight: '700' },
  fab: { position: 'absolute', right: 20, bottom: 88, borderRadius: 18 },
});
