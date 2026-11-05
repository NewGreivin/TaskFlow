import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Icon, IconButton, Surface, Text } from 'react-native-paper';
import { useAppTheme } from '../theme/ThemeContext';
import { getTasks, assignTasksToProject } from '../data/taskRepository';
import { useSQLiteContext } from '../data/database';

export default function AssignTasksModal({ visible, projectId, onClose, onSave }) {
  const db = useSQLiteContext();
  const { palette, isDark } = useAppTheme();
  const [tasks, setTasks] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Specific Theme Tokens based on specifications
  const themeTokens = {
    modalBg: isDark ? '#161722' : '#FFFFFF',
    dialogBg: isDark ? '#1E202C' : '#FFFFFF',
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
      loadTasks();
    }
  }, [visible]);

  const loadTasks = async () => {
    // Only fetch tasks not already assigned to a project (or optionally to any project, for now we let users pick any task without a project)
    const allTasks = await getTasks(db);
    // Filter tasks that are NOT already in this project (ensure projectId is treated as a Number)
    const numericProjectId = Number(projectId);
    const unassignedTasks = allTasks.filter(t => t.project_id !== numericProjectId);
    setTasks(unassignedTasks);
    setSelectedIds(new Set());
  };

  const toggleTask = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSave = async () => {
    if (selectedIds.size > 0) {
      await assignTasksToProject(db, projectId, Array.from(selectedIds));
      onSave?.();
    }
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
              { backgroundColor: themeTokens.modalBg, borderColor: themeTokens.cardBorder },
            ]}
          >
            <View style={styles.header}>
              <Text variant="titleLarge" style={[styles.title, { color: themeTokens.titleText }]}>
                Añadir Tareas Existentes
              </Text>
              <IconButton icon="close" size={20} iconColor={themeTokens.titleText} onPress={onClose} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {tasks.length === 0 ? (
                <Text style={{ color: themeTokens.subText, textAlign: 'center', marginTop: 20 }}>
                  No hay tareas disponibles para añadir.
                </Text>
              ) : (
                tasks.map(task => {
                  const isSelected = selectedIds.has(task.id);
                  return (
                    <TouchableOpacity
                      key={task.id}
                      activeOpacity={0.7}
                      onPress={() => toggleTask(task.id)}
                      style={[
                        styles.taskRow,
                        { borderColor: themeTokens.cardBorder, backgroundColor: themeTokens.cardBg }
                      ]}
                    >
                      <View style={{ marginRight: 12 }}>
                        <Icon
                          source={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                          size={24}
                          color={isSelected ? themeTokens.sectionTitle : themeTokens.subText}
                        />
                      </View>
                      <Text style={[styles.taskTitle, { color: themeTokens.titleText }]}>
                        {task.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <View style={[styles.actions, { borderTopColor: themeTokens.cardBorder }]}>
              <Button mode="text" onPress={onClose} textColor={themeTokens.subText}>
                Cancelar
              </Button>
              <Button
                mode="contained"
                disabled={selectedIds.size === 0}
                onPress={handleSave}
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: selectedIds.size > 0
                      ? themeTokens.primaryBtn
                      : `${themeTokens.primaryBtn}50`,
                  },
                ]}
                textColor={themeTokens.primaryBtnText}
              >
                Añadir {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  modalWrapper: {
    maxHeight: '80%',
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
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  taskTitle: {
    marginLeft: 8,
    flex: 1,
    fontSize: 15,
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
