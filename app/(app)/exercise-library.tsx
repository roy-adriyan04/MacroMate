import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { exerciseLibrary, MUSCLE_GROUPS, EQUIPMENT_TYPES, Exercise } from '../../data/exerciseLibrary';

const POPULAR_MUSCLES = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quadriceps', 'Hamstrings', 'Glutes', 'Abdominals', 'Calves'];

// Map muscle groups to icon names
const muscleIcons: Record<string, string> = {
  Chest: 'fitness-center', Shoulders: 'fitness-center', Biceps: 'fitness-center',
  Triceps: 'fitness-center', Quadriceps: 'directions-run', Hamstrings: 'directions-run',
  Glutes: 'directions-run', Calves: 'directions-run', Abdominals: 'self-improvement',
  Lats: 'fitness-center', 'Middle Back': 'fitness-center', 'Lower Back': 'fitness-center',
  Forearms: 'fitness-center', Traps: 'fitness-center', Abductors: 'directions-run',
  Adductors: 'directions-run', Neck: 'accessibility',
};

const equipmentIcons: Record<string, string> = {
  Barbell: 'fitness-center', Dumbbell: 'fitness-center', 'Body Only': 'accessibility',
  Cable: 'settings-input-component', Machine: 'precision-manufacturing',
  Kettlebells: 'fitness-center', Bands: 'all-inclusive', 'E-Z Curl Bar': 'fitness-center',
  'Exercise Ball': 'sports-basketball', 'Medicine Ball': 'sports-basketball',
  Other: 'build', None: 'do-not-disturb',
};

export default function ExerciseLibrary() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ from?: string }>();
  const fromWorkout = params.from === 'workout';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [showAllMuscles, setShowAllMuscles] = useState(false);
  const [showEquipmentFilter, setShowEquipmentFilter] = useState(false);

  const filteredExercises = useMemo(() => {
    let result = exerciseLibrary;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(e => e.name.toLowerCase().includes(q));
    }
    if (selectedMuscle) {
      result = result.filter(e => e.muscleGroup === selectedMuscle);
    }
    if (selectedEquipment) {
      result = result.filter(e => e.equipment === selectedEquipment);
    }
    
    // Sort by rating (descending)
    return result.sort((a, b) => b.rating - a.rating);
  }, [searchQuery, selectedMuscle, selectedEquipment]);

  const handleExerciseTap = useCallback((exercise: Exercise) => {
    router.push({
      pathname: '/(app)/exercise-detail',
      params: {
        exerciseId: exercise.id,
        from: fromWorkout ? 'workout' : 'library',
      }
    });
  }, [fromWorkout]);

  const muscleFilters = showAllMuscles ? [...MUSCLE_GROUPS] : POPULAR_MUSCLES;

  const uniqueEquipment = useMemo(() => {
    return [...EQUIPMENT_TYPES].filter(e => e && e !== 'None' && e !== 'Cables' && e !== 'Dumbbells' && e !== 'Weight Bench');
  }, []);

  const renderExerciseCard = useCallback(({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      activeOpacity={0.7}
      onPress={() => handleExerciseTap(item)}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <MaterialIcons
              name={(muscleIcons[item.muscleGroup] || 'fitness-center') as any}
              size={28}
              color={Colors.primary}
            />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.exerciseName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.metaChip}>
            <MaterialIcons name={(muscleIcons[item.muscleGroup] || 'fitness-center') as any} size={12} color={Colors.primary} />
            <Text style={styles.metaText}>{item.muscleGroup}</Text>
          </View>
          {item.equipment && item.equipment !== 'None' && (
            <View style={[styles.metaChip, { backgroundColor: '#fff0e8' }]}>
              <MaterialIcons name={(equipmentIcons[item.equipment] || 'build') as any} size={12} color={Colors.secondary} />
              <Text style={[styles.metaText, { color: Colors.secondary }]}>{item.equipment}</Text>
            </View>
          )}
        </View>
        <View style={styles.ratingRow}>
          <MaterialIcons name="star" size={14} color="#f5a623" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      <MaterialIcons name="chevron-right" size={24} color={Colors.outlineVariant} />
    </TouchableOpacity>
  ), [handleExerciseTap]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exercise Library</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={22} color={Colors.outline} style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search 420+ exercises..."
          placeholderTextColor={Colors.outlineVariant}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
            <MaterialIcons name="close" size={18} color={Colors.outline} />
          </TouchableOpacity>
        )}
      </View>

      {/* Muscle Group Filter Chips */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          data={[
            { label: 'All', value: null },
            ...muscleFilters.map(m => ({ label: m, value: m })),
            ...(showAllMuscles ? [] : [{ label: 'More...', value: '__MORE__' }]),
          ]}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => {
            if (item.value === '__MORE__') {
              return (
                <TouchableOpacity
                  style={[styles.chip, { borderStyle: 'dashed' as any }]}
                  onPress={() => setShowAllMuscles(true)}
                >
                  <Text style={styles.chipText}>More...</Text>
                </TouchableOpacity>
              );
            }
            const active = selectedMuscle === item.value;
            return (
              <TouchableOpacity
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedMuscle(active ? null : item.value)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Equipment Filter Toggle */}
      <TouchableOpacity
        style={styles.equipmentToggle}
        onPress={() => setShowEquipmentFilter(!showEquipmentFilter)}
      >
        <MaterialIcons name="tune" size={18} color={Colors.primary} />
        <Text style={styles.equipmentToggleText}>
          {selectedEquipment || 'Equipment Filter'}
        </Text>
        <MaterialIcons
          name={showEquipmentFilter ? 'expand-less' : 'expand-more'}
          size={20}
          color={Colors.outline}
        />
      </TouchableOpacity>

      {showEquipmentFilter && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          data={[
            { label: 'All', value: null },
            ...uniqueEquipment.map(e => ({ label: e, value: e })),
          ]}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => {
            const active = selectedEquipment === item.value;
            return (
              <TouchableOpacity
                style={[styles.chip, active && styles.chipActiveOrange]}
                onPress={() => setSelectedEquipment(active ? null : item.value)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Results Count */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>{filteredExercises.length} exercises</Text>
      </View>

      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseCard}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={52} color={Colors.outlineVariant} />
            <Text style={styles.emptyText}>No exercises found</Text>
            <Text style={styles.emptySubtext}>Try a different search or filter</Text>
          </View>
        }
      />
    </View>
  );
}

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.surfaceContainerHigh,
    height: 50,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: 'Plus Jakarta Sans',
    color: Colors.onSurface,
    height: '100%',
  },
  filterSection: {
    marginTop: 12,
  },
  chipRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipActiveOrange: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: '#fff',
  },
  equipmentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  equipmentToggleText: {
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    color: Colors.primary,
  },
  resultsBar: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  resultsText: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    color: Colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  thumbnailContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    fontSize: 15,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.onSurface,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    color: Colors.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#f5a623',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.onSurface,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    color: Colors.outline,
  },
});
