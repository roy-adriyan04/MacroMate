import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkout } from '../../context/WorkoutContext';

const { width } = Dimensions.get('window');

// Mock saved programs — later wire to Firestore
const SAVED_PROGRAMS = [
  {
    id: 'prog-1',
    name: 'Push Day Power',
    target: 'Chest, Shoulders & Triceps',
    exerciseCount: 6,
    duration: '~45 min',
    lastPerformed: '2 days ago',
    icon: 'fitness-center',
    color: '#64a1ff',
    exercises: [
      { name: 'Barbell Bench Press', target: 'Chest', sets: 3 },
      { name: 'Incline Dumbbell Press', target: 'Upper Chest', sets: 3 },
      { name: 'Cable Crossover', target: 'Chest', sets: 3 },
      { name: 'Military press', target: 'Shoulders', sets: 3 },
      { name: 'Side Lateral Raise', target: 'Shoulders', sets: 3 },
      { name: 'Triceps Pushdown', target: 'Triceps', sets: 3 },
    ],
  },
  {
    id: 'prog-2',
    name: 'Pull Day Strength',
    target: 'Back & Biceps',
    exerciseCount: 5,
    duration: '~50 min',
    lastPerformed: '4 days ago',
    icon: 'fitness-center',
    color: '#ffc5a3',
    exercises: [
      { name: 'Barbell Deadlift', target: 'Hamstrings', sets: 4 },
      { name: 'Pullups', target: 'Lats', sets: 3 },
      { name: 'Bent Over Barbell Row', target: 'Middle Back', sets: 3 },
      { name: 'Seated Cable Rows', target: 'Middle Back', sets: 3 },
      { name: 'Barbell Curl', target: 'Biceps', sets: 3 },
    ],
  },
  {
    id: 'prog-3',
    name: 'Leg Day',
    target: 'Quads, Hamstrings & Glutes',
    exerciseCount: 6,
    duration: '~55 min',
    lastPerformed: 'Last week',
    icon: 'directions-run',
    color: '#8efecb',
    exercises: [
      { name: 'Barbell Squat', target: 'Quadriceps', sets: 4 },
      { name: 'Leg Press', target: 'Quadriceps', sets: 3 },
      { name: 'Leg Extensions', target: 'Quadriceps', sets: 3 },
      { name: 'Lying Leg Curls', target: 'Hamstrings', sets: 3 },
      { name: 'Barbell Hip Thrust', target: 'Glutes', sets: 3 },
      { name: 'Standing Calf Raises', target: 'Calves', sets: 4 },
    ],
  },
  {
    id: 'prog-4',
    name: 'Abs & Core',
    target: 'Abdominals & Stability',
    exerciseCount: 5,
    duration: '~30 min',
    lastPerformed: 'Last week',
    icon: 'self-improvement',
    color: '#d7dee3',
    exercises: [
      { name: 'Elbow plank', target: 'Abdominals', sets: 3 },
      { name: 'Hanging leg raise', target: 'Abdominals', sets: 3 },
      { name: 'Russian twist', target: 'Abdominals', sets: 3 },
      { name: 'Mountain climber', target: 'Abdominals', sets: 3 },
      { name: 'Ab bicycle', target: 'Abdominals', sets: 3 },
    ],
  },
];

export default function StartWorkout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startWorkout } = useWorkout();

  const handleRepeatWorkout = (program: typeof SAVED_PROGRAMS[0]) => {
    startWorkout();
    // Build exercise params as JSON to pass to active-workout
    router.push({
      pathname: '/(app)/active-workout',
      params: {
        mode: 'repeat',
        programExercises: JSON.stringify(program.exercises),
        programName: program.name,
      },
    });
  };

  const handleNewWorkout = () => {
    startWorkout();
    router.push({
      pathname: '/(app)/active-workout',
      params: { mode: 'new' },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Start Workout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Option 1: New Workout ─── */}
        <TouchableOpacity style={styles.newWorkoutCard} activeOpacity={0.85} onPress={handleNewWorkout}>
          <View style={styles.newWorkoutIconWrap}>
            <MaterialIcons name="add-circle-outline" size={36} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.newWorkoutTitle}>New Workout</Text>
            <Text style={styles.newWorkoutDesc}>Start from scratch — add exercises as you go</Text>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* ─── Option 2: Repeat Workout ─── */}
        <View style={styles.repeatSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="replay" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Repeat a Workout</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Pick a saved program to load it instantly</Text>

          {SAVED_PROGRAMS.map((program) => (
            <TouchableOpacity
              key={program.id}
              style={styles.programCard}
              activeOpacity={0.85}
              onPress={() => handleRepeatWorkout(program)}
            >
              {/* Left: Icon badge */}
              <View style={[styles.programIcon, { backgroundColor: program.color }]}>
                <MaterialIcons name={program.icon as any} size={22} color="#00224a" />
              </View>

              {/* Center: Info */}
              <View style={styles.programInfo}>
                <Text style={styles.programName}>{program.name}</Text>
                <Text style={styles.programTarget}>{program.target}</Text>
                <View style={styles.programMeta}>
                  <View style={styles.metaTag}>
                    <MaterialIcons name="format-list-numbered" size={11} color={Colors.outline} />
                    <Text style={styles.metaText}>{program.exerciseCount} exercises</Text>
                  </View>
                  <View style={styles.metaTag}>
                    <MaterialIcons name="schedule" size={11} color={Colors.outline} />
                    <Text style={styles.metaText}>{program.duration}</Text>
                  </View>
                </View>
              </View>

              {/* Right arrow */}
              <View style={styles.programArrow}>
                <MaterialIcons name="play-arrow" size={22} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          ))}

          {/* Create New Program */}
          <TouchableOpacity
            style={styles.createProgramCard}
            activeOpacity={0.85}
            onPress={() => router.push('/(app)/routine-builder')}
          >
            <View style={styles.createProgramIcon}>
              <MaterialIcons name="add" size={24} color={Colors.primary} />
            </View>
            <View style={styles.createProgramInfo}>
              <Text style={styles.createProgramTitle}>Create New Program</Text>
              <Text style={styles.createProgramSub}>Build a custom routine from scratch</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={Colors.outline} />
          </TouchableOpacity>
        </View>

        {/* Info tip */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>
            Your saved programs will appear here. Create routines or complete workouts to save them as reusable templates!
          </Text>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  /* ── New Workout CTA ── */
  newWorkoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    marginBottom: 28,
    ...Platform.select({
      ios: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20 },
      android: { elevation: 8 },
    }),
  },
  newWorkoutIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newWorkoutTitle: {
    fontSize: 20,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: '#fff',
  },
  newWorkoutDesc: {
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 3,
  },

  /* ── Repeat Section ── */
  repeatSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.onSurface,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
    color: Colors.outline,
    marginBottom: 16,
    marginLeft: 28,
  },

  /* ── Program Card ── */
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  programIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  programInfo: {
    flex: 1,
    gap: 3,
  },
  programName: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.onSurface,
  },
  programTarget: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: Colors.outline,
  },
  programMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    color: Colors.outline,
  },
  programArrow: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#eff2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Info card ── */
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#eff2ff',
    borderRadius: 16,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    lineHeight: 19,
  },

  /* ── Create New Program ── */
  createProgramCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderStyle: 'dashed' as const,
    borderColor: 'rgba(100, 161, 255, 0.35)',
    backgroundColor: 'rgba(100, 161, 255, 0.04)',
  },
  createProgramIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#eff2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  createProgramInfo: {
    flex: 1,
    gap: 2,
  },
  createProgramTitle: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.primary,
  },
  createProgramSub: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: Colors.outline,
  },
});
