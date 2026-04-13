import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform,
  Alert, FlatList, Modal, Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { exerciseLibrary, MUSCLE_GROUPS, Exercise } from '../../data/exerciseLibrary';

/* ── Types ── */
interface RoutineExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  repRange: string;
  restSeconds: number;
  notes: string;
  supersetGroup?: number | null;
}

/* ── Helpers ── */
const REST_OPTIONS = [30, 45, 60, 90, 120, 180];
const REP_PRESETS = ['3-5', '5-8', '8-12', '10-15', '12-15', '15-20'];

const COVER_COLORS = ['#64a1ff', '#ffc5a3', '#8efecb', '#d7dee3', '#f5c6ec', '#c5ceff', '#ffe0b2', '#b2dfdb'];
const COVER_ICONS: { name: string; label: string }[] = [
  { name: 'fitness-center', label: 'Strength' },
  { name: 'directions-run', label: 'Cardio' },
  { name: 'self-improvement', label: 'Core' },
  { name: 'sports-martial-arts', label: 'Athletic' },
  { name: 'whatshot', label: 'Intense' },
  { name: 'accessibility', label: 'Flex' },
];

export default function RoutineBuilder() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  /* ── State ── */
  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [coverIcon, setCoverIcon] = useState(COVER_ICONS[0].name);
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedExId, setExpandedExId] = useState<string | null>(null);

  /* ── Exercise Search ── */
  const searchResults = searchQuery.trim().length > 0
    ? exerciseLibrary.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase().trim())).slice(0, 20)
    : exerciseLibrary.slice(0, 20);

  const addExercise = (libEx: Exercise) => {
    const newEx: RoutineExercise = {
      id: `rb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: libEx.name,
      muscleGroup: libEx.muscleGroup,
      sets: 3,
      repRange: '8-12',
      restSeconds: 90,
      notes: '',
      supersetGroup: null,
    };
    setExercises(prev => [...prev, newEx]);
    setShowSearch(false);
    setSearchQuery('');
  };

  const removeExercise = (id: string) => {
    setExercises(prev => prev.filter(e => e.id !== id));
    if (expandedExId === id) setExpandedExId(null);
  };

  const updateExercise = (id: string, updates: Partial<RoutineExercise>) => {
    setExercises(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const to = direction === 'up' ? index - 1 : index + 1;
    if (to < 0 || to >= exercises.length) return;
    setExercises(prev => {
      const arr = [...prev];
      [arr[index], arr[to]] = [arr[to], arr[index]];
      return arr;
    });
  };

  /* ── Superset grouping ── */
  const toggleSuperset = (index: number) => {
    if (index >= exercises.length - 1) return; // need next exercise
    setExercises(prev => {
      const next = [...prev];
      const current = next[index];
      const nextEx = next[index + 1];
      if (current.supersetGroup != null) {
        // Remove superset
        next[index] = { ...current, supersetGroup: null };
        if (nextEx.supersetGroup === current.supersetGroup) {
          next[index + 1] = { ...nextEx, supersetGroup: null };
        }
      } else {
        // Create superset
        const groupId = Date.now();
        next[index] = { ...current, supersetGroup: groupId };
        next[index + 1] = { ...nextEx, supersetGroup: groupId };
      }
      return next;
    });
  };

  /* ── Save ── */
  const handleSave = () => {
    if (!routineName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your routine.');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Add at least one exercise to your routine.');
      return;
    }
    // TODO: persist to Firestore
    Alert.alert('Routine Saved!', `"${routineName}" with ${exercises.length} exercises has been saved.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  /* ── Render ── */
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Build Routine</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveHeaderBtn}>
          <Text style={styles.saveHeaderText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Cover Preview ── */}
        <View style={[styles.coverCard, { backgroundColor: coverColor }]}>
          <View style={styles.coverIconWrap}>
            <MaterialIcons name={coverIcon as any} size={36} color="#00224a" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.coverTitle} numberOfLines={1}>
              {routineName || 'Routine Name'}
            </Text>
            <Text style={styles.coverSub}>
              {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
              {description ? ` · ${description.substring(0, 30)}` : ''}
            </Text>
          </View>
        </View>

        {/* ── Name & Description ── */}
        <View style={styles.section}>
          <Text style={styles.label}>Routine Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Push Day Power"
            placeholderTextColor={Colors.outlineVariant}
            value={routineName}
            onChangeText={setRoutineName}
            maxLength={40}
          />
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Optional: describe this routine"
            placeholderTextColor={Colors.outlineVariant}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
          />
        </View>

        {/* ── Cover Color Picker ── */}
        <View style={styles.section}>
          <Text style={styles.label}>Cover Color</Text>
          <View style={styles.colorRow}>
            {COVER_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, coverColor === c && styles.colorDotActive]}
                onPress={() => setCoverColor(c)}
              />
            ))}
          </View>
        </View>

        {/* ── Cover Icon Picker ── */}
        <View style={styles.section}>
          <Text style={styles.label}>Cover Icon</Text>
          <View style={styles.iconRow}>
            {COVER_ICONS.map(ic => (
              <TouchableOpacity
                key={ic.name}
                style={[styles.iconChip, coverIcon === ic.name && styles.iconChipActive]}
                onPress={() => setCoverIcon(ic.name)}
              >
                <MaterialIcons name={ic.name as any} size={20} color={coverIcon === ic.name ? '#fff' : Colors.onSurface} />
                <Text style={[styles.iconChipLabel, coverIcon === ic.name && { color: '#fff' }]}>{ic.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Visibility Toggle ── */}
        <View style={styles.visibilityRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Public Routine</Text>
            <Text style={styles.visibilityHint}>Others can view and duplicate</Text>
          </View>
          <Switch
            trackColor={{ false: Colors.surfaceContainer, true: Colors.primaryContainer }}
            thumbColor={isPublic ? Colors.primary : Colors.outline}
            onValueChange={setIsPublic}
            value={isPublic}
          />
        </View>

        {/* ── Exercises List ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises ({exercises.length})</Text>
          </View>

          {exercises.length === 0 && (
            <View style={styles.emptyExercises}>
              <MaterialIcons name="playlist-add" size={40} color={Colors.outlineVariant} />
              <Text style={styles.emptyExText}>No exercises added yet</Text>
              <Text style={styles.emptyExSub}>Tap the button below to search and add</Text>
            </View>
          )}

          {exercises.map((ex, index) => {
            const isExpanded = expandedExId === ex.id;
            const isFirst = index === 0;
            const isLast = index === exercises.length - 1;
            const inSuperset = ex.supersetGroup != null;
            const nextInSuperset = !isLast && exercises[index + 1]?.supersetGroup === ex.supersetGroup && inSuperset;

            return (
              <View key={ex.id}>
                {/* Superset connector */}
                {inSuperset && index > 0 && exercises[index - 1]?.supersetGroup === ex.supersetGroup && (
                  <View style={styles.supersetConnector}>
                    <View style={styles.supersetLine} />
                    <Text style={styles.supersetLabel}>SUPERSET</Text>
                    <View style={styles.supersetLine} />
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.exerciseCard,
                    inSuperset && styles.exerciseCardSuperset,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setExpandedExId(isExpanded ? null : ex.id)}
                >
                  {/* Reorder buttons */}
                  <View style={styles.reorderCol}>
                    <TouchableOpacity onPress={() => moveExercise(index, 'up')} disabled={isFirst}>
                      <MaterialIcons name="keyboard-arrow-up" size={20} color={isFirst ? Colors.outlineVariant : Colors.onSurface} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => moveExercise(index, 'down')} disabled={isLast}>
                      <MaterialIcons name="keyboard-arrow-down" size={20} color={isLast ? Colors.outlineVariant : Colors.onSurface} />
                    </TouchableOpacity>
                  </View>

                  {/* Exercise Info */}
                  <View style={styles.exInfo}>
                    <Text style={styles.exName} numberOfLines={1}>{ex.name}</Text>
                    <Text style={styles.exMeta}>
                      {ex.muscleGroup} · {ex.sets} sets · {ex.repRange} reps · {ex.restSeconds}s rest
                    </Text>
                    {ex.notes ? <Text style={styles.exNotes} numberOfLines={1}>📝 {ex.notes}</Text> : null}
                  </View>

                  {/* Actions */}
                  <View style={styles.exActions}>
                    <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color={Colors.outline} />
                  </View>
                </TouchableOpacity>

                {/* Expanded config */}
                {isExpanded && (
                  <View style={styles.expandedPanel}>
                    {/* Sets */}
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Sets</Text>
                      <View style={styles.stepperRow}>
                        <TouchableOpacity style={styles.stepperBtn} onPress={() => updateExercise(ex.id, { sets: Math.max(1, ex.sets - 1) })}>
                          <MaterialIcons name="remove" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{ex.sets}</Text>
                        <TouchableOpacity style={styles.stepperBtn} onPress={() => updateExercise(ex.id, { sets: Math.min(10, ex.sets + 1) })}>
                          <MaterialIcons name="add" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Rep Range */}
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Rep Range</Text>
                      <View style={styles.chipRow}>
                        {REP_PRESETS.map(r => (
                          <TouchableOpacity
                            key={r}
                            style={[styles.miniChip, ex.repRange === r && styles.miniChipActive]}
                            onPress={() => updateExercise(ex.id, { repRange: r })}
                          >
                            <Text style={[styles.miniChipText, ex.repRange === r && styles.miniChipTextActive]}>{r}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Rest Time */}
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Rest (sec)</Text>
                      <View style={styles.chipRow}>
                        {REST_OPTIONS.map(r => (
                          <TouchableOpacity
                            key={r}
                            style={[styles.miniChip, ex.restSeconds === r && styles.miniChipActiveOrange]}
                            onPress={() => updateExercise(ex.id, { restSeconds: r })}
                          >
                            <Text style={[styles.miniChipText, ex.restSeconds === r && styles.miniChipTextActive]}>{r}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Notes */}
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Notes</Text>
                      <TextInput
                        style={styles.noteInput}
                        placeholder="e.g. Slow eccentric, pause at bottom"
                        placeholderTextColor={Colors.outlineVariant}
                        value={ex.notes}
                        onChangeText={(val) => updateExercise(ex.id, { notes: val })}
                        maxLength={100}
                      />
                    </View>

                    {/* Bottom actions */}
                    <View style={styles.expandedActions}>
                      {!isLast && (
                        <TouchableOpacity style={styles.supersetBtn} onPress={() => toggleSuperset(index)}>
                          <MaterialIcons name="link" size={16} color={inSuperset ? Colors.secondary : Colors.primary} />
                          <Text style={[styles.supersetBtnText, inSuperset && { color: Colors.secondary }]}>
                            {inSuperset ? 'Remove Superset' : 'Superset with next'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={styles.removeBtn} onPress={() => removeExercise(ex.id)}>
                        <MaterialIcons name="delete-outline" size={16} color={Colors.error} />
                        <Text style={styles.removeBtnText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {/* Add Exercise Button */}
          <TouchableOpacity style={styles.addExBtn} onPress={() => setShowSearch(true)}>
            <MaterialIcons name="add" size={22} color={Colors.primary} />
            <Text style={styles.addExText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Save Button (sticky) ── */}
      <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <MaterialIcons name="save" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Save Routine</Text>
        </TouchableOpacity>
      </View>

      {/* ── Exercise Search Modal ── */}
      <Modal visible={showSearch} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Exercise</Text>
              <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
                <MaterialIcons name="close" size={24} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>

            {/* Search bar */}
            <View style={styles.modalSearchBar}>
              <MaterialIcons name="search" size={20} color={Colors.outline} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search exercises..."
                placeholderTextColor={Colors.outlineVariant}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons name="close" size={18} color={Colors.outline} />
                </TouchableOpacity>
              )}
            </View>

            {/* Results */}
            <FlatList
              data={searchResults}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const alreadyAdded = exercises.some(e => e.name.toLowerCase() === item.name.toLowerCase());
                return (
                  <TouchableOpacity
                    style={[styles.searchCard, alreadyAdded && styles.searchCardDisabled]}
                    onPress={() => !alreadyAdded && addExercise(item)}
                    disabled={alreadyAdded}
                  >
                    <View style={styles.searchInfo}>
                      <Text style={styles.searchName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.searchMeta}>{item.muscleGroup} · {item.equipment}</Text>
                    </View>
                    {alreadyAdded ? (
                      <MaterialIcons name="check-circle" size={22} color={Colors.tertiary} />
                    ) : (
                      <View style={styles.searchAddBtn}>
                        <MaterialIcons name="add" size={18} color={Colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.searchEmpty}>
                  <MaterialIcons name="search-off" size={40} color={Colors.outlineVariant} />
                  <Text style={styles.searchEmptyText}>No exercises found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ────────────────────── Styles ────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.onSurface,
  },
  saveHeaderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  saveHeaderText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  /* Cover preview */
  coverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  coverIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverTitle: {
    fontSize: 20,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: '#00224a',
  },
  coverSub: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    color: 'rgba(0,34,74,0.6)',
    marginTop: 3,
  },

  /* Section */
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.onSurface,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Plus Jakarta Sans',
    color: Colors.onSurface,
    borderWidth: 1.5,
    borderColor: Colors.surfaceContainerHigh,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 72,
    textAlignVertical: 'top',
  },

  /* Color picker */
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: Colors.onSurface,
    borderWidth: 3,
  },

  /* Icon picker */
  iconRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  iconChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  iconChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  iconChipLabel: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    color: Colors.onSurface,
  },

  /* Visibility */
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    marginBottom: 20,
  },
  visibilityHint: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    color: Colors.outline,
    marginTop: 2,
  },

  /* Empty exercises */
  emptyExercises: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 6,
  },
  emptyExText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.onSurface,
  },
  emptyExSub: {
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
    color: Colors.outline,
  },

  /* Exercise card */
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 12,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  exerciseCardSuperset: {
    borderColor: Colors.secondaryContainer,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  reorderCol: {
    alignItems: 'center',
    marginRight: 8,
    gap: 0,
  },
  exInfo: {
    flex: 1,
    gap: 2,
  },
  exName: {
    fontSize: 15,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.onSurface,
  },
  exMeta: {
    fontSize: 11,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: Colors.outline,
  },
  exNotes: {
    fontSize: 11,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: Colors.primary,
    fontStyle: 'italic',
  },
  exActions: {
    marginLeft: 8,
  },

  /* Superset connector */
  supersetConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 20,
  },
  supersetLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.secondaryContainer,
  },
  supersetLabel: {
    fontSize: 10,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 1,
  },

  /* Expanded panel */
  expandedPanel: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    marginTop: 2,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  configRow: {
    marginBottom: 14,
  },
  configLabel: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  miniChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  miniChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  miniChipActiveOrange: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  miniChipText: {
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  miniChipTextActive: {
    color: '#fff',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  stepperValue: {
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: Colors.onSurface,
    minWidth: 24,
    textAlign: 'center',
  },
  noteInput: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  expandedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  supersetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#eff2ff',
  },
  supersetBtnText: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.primary,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#fce4e4',
  },
  removeBtnText: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.error,
  },

  /* Add exercise button */
  addExBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed' as const,
    borderColor: 'rgba(100, 161, 255, 0.3)',
    backgroundColor: 'rgba(100, 161, 255, 0.06)',
    marginTop: 8,
  },
  addExText: {
    fontSize: 15,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.primary,
  },

  /* Save sticky */
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 16,
    paddingTop: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
  },
  saveBtnText: {
    fontSize: 17,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: '#fff',
  },

  /* ── Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 60,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.onSurface,
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: Colors.surfaceContainerHigh,
    height: 48,
    marginBottom: 12,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Plus Jakarta Sans',
    color: Colors.onSurface,
    height: '100%',
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  searchCardDisabled: {
    opacity: 0.5,
  },
  searchInfo: {
    flex: 1,
    gap: 2,
  },
  searchName: {
    fontSize: 15,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.onSurface,
  },
  searchMeta: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    color: Colors.outline,
  },
  searchAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#eff2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchEmpty: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 8,
  },
  searchEmptyText: {
    fontSize: 15,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    color: Colors.outline,
  },
});
