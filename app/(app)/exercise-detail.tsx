import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Linking
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { exerciseLibrary } from '../../data/exerciseLibrary';

// Map muscle groups to a readable color for the activation badge
const muscleColors: Record<string, { bg: string; text: string }> = {
  primary: { bg: '#fce4e4', text: '#c0392b' },
  secondary: { bg: '#fef3e2', text: '#e67e22' },
};

const difficultyFromRating = (rating: number) => {
  if (rating >= 9.3) return { label: 'Advanced', color: '#c0392b', bg: '#fce4e4' };
  if (rating >= 8.8) return { label: 'Intermediate', color: '#e67e22', bg: '#fef3e2' };
  return { label: 'Beginner', color: '#27ae60', bg: '#e8faf0' };
};

export default function ExerciseDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ exerciseId: string; from?: string }>();

  const exercise = exerciseLibrary.find(e => e.id === params.exerciseId);
  const fromWorkout = params.from === 'workout';

  if (!exercise) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Exercise not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, textAlign: 'center', marginTop: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const difficulty = difficultyFromRating(exercise.rating);

  const handleAddToWorkout = () => {
    // Navigate back to active-workout with selected exercise data
    router.navigate({
      pathname: '/(app)/active-workout',
      params: {
        addExerciseId: exercise.id,
        addExerciseName: exercise.name,
        addExerciseTarget: exercise.muscleGroup,
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Exercise Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: fromWorkout ? 100 : insets.bottom + 30 }]}
      >
        {/* Hero Images */}
        {(exercise.image || exercise.image1) && (
          <View style={styles.imageRow}>
            {exercise.image && (
              <Image source={{ uri: exercise.image }} style={styles.heroImage} />
            )}
            {exercise.image1 && (
              <Image source={{ uri: exercise.image1 }} style={styles.heroImage} />
            )}
          </View>
        )}

        {/* Title + badges */}
        <View style={styles.titleSection}>
          <Text style={styles.exerciseTitle}>{exercise.name}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: '#eff2ff' }]}>
              <MaterialIcons name="fitness-center" size={14} color={Colors.primary} />
              <Text style={[styles.badgeText, { color: Colors.primary }]}>{exercise.muscleGroup}</Text>
            </View>
            {exercise.equipment && exercise.equipment !== 'None' && (
              <View style={[styles.badge, { backgroundColor: '#fff0e8' }]}>
                <MaterialIcons name="build" size={14} color={Colors.secondary} />
                <Text style={[styles.badgeText, { color: Colors.secondary }]}>{exercise.equipment}</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: difficulty.bg }]}>
              <Text style={[styles.badgeText, { color: difficulty.color }]}>{difficulty.label}</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={20} color="#f5a623" />
            <Text style={styles.ratingValue}>{exercise.rating}</Text>
            <Text style={styles.ratingLabel}> / 10 Community Rating</Text>
          </View>
        </View>

        {/* Muscle Activation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Muscle Activation</Text>
          <View style={styles.activationCard}>
            <View style={styles.activationRow}>
              <View style={[styles.activationDot, { backgroundColor: '#c0392b' }]} />
              <Text style={styles.activationLabel}>Primary:</Text>
              <View style={[styles.badge, { backgroundColor: muscleColors.primary.bg }]}>
                <Text style={[styles.badgeText, { color: muscleColors.primary.text }]}>{exercise.muscleGroup}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rep Range Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rep Range Recommendations</Text>
          <View style={styles.repRangeRow}>
            <View style={[styles.repCard, { borderColor: '#3498db' }]}>
              <MaterialIcons name="bolt" size={22} color="#3498db" />
              <Text style={[styles.repCardTitle, { color: '#3498db' }]}>Strength</Text>
              <Text style={styles.repCardRange}>3-6 reps</Text>
              <Text style={styles.repCardNote}>Heavy weight</Text>
            </View>
            <View style={[styles.repCard, { borderColor: '#e67e22' }]}>
              <MaterialIcons name="trending-up" size={22} color="#e67e22" />
              <Text style={[styles.repCardTitle, { color: '#e67e22' }]}>Hypertrophy</Text>
              <Text style={styles.repCardRange}>8-12 reps</Text>
              <Text style={styles.repCardNote}>Moderate weight</Text>
            </View>
            <View style={[styles.repCard, { borderColor: '#27ae60' }]}>
              <MaterialIcons name="replay" size={22} color="#27ae60" />
              <Text style={[styles.repCardTitle, { color: '#27ae60' }]}>Endurance</Text>
              <Text style={styles.repCardRange}>15-20 reps</Text>
              <Text style={styles.repCardNote}>Light weight</Text>
            </View>
          </View>
        </View>

        {/* Form Cues */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Form Cues</Text>
          <View style={styles.cueCard}>
            <View style={styles.cueRow}>
              <View style={styles.cueNum}><Text style={styles.cueNumText}>1</Text></View>
              <Text style={styles.cueText}>Set up with proper stance and grip width</Text>
            </View>
            <View style={styles.cueRow}>
              <View style={styles.cueNum}><Text style={styles.cueNumText}>2</Text></View>
              <Text style={styles.cueText}>Engage your core, keep your back neutral</Text>
            </View>
            <View style={styles.cueRow}>
              <View style={styles.cueNum}><Text style={styles.cueNumText}>3</Text></View>
              <Text style={styles.cueText}>Control the eccentric (lowering) phase — 2-3 seconds</Text>
            </View>
            <View style={styles.cueRow}>
              <View style={styles.cueNum}><Text style={styles.cueNumText}>4</Text></View>
              <Text style={styles.cueText}>Drive through the concentric with full range of motion</Text>
            </View>
            <View style={styles.cueRow}>
              <View style={styles.cueNum}><Text style={styles.cueNumText}>5</Text></View>
              <Text style={styles.cueText}>Breathe out on exertion, in on the return</Text>
            </View>
          </View>
        </View>

        {/* Common Mistakes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Mistakes</Text>
          <View style={styles.mistakeCard}>
            {[
              'Using momentum instead of controlled movement',
              'Not achieving full range of motion',
              'Excessive weight at the expense of form',
              'Rushing through reps without proper tempo',
            ].map((mistake, i) => (
              <View key={i} style={styles.mistakeRow}>
                <MaterialIcons name="warning" size={16} color="#e67e22" />
                <Text style={styles.mistakeText}>{mistake}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* External Link */}
        {exercise.url && (
          <TouchableOpacity
            style={styles.externalLink}
            onPress={() => Linking.openURL(exercise.url!)}
          >
            <MaterialIcons name="open-in-new" size={18} color={Colors.primary} />
            <Text style={styles.externalLinkText}>View full guide on bodybuilding.com</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Sticky Add to Workout Button */}
      {fromWorkout && (
        <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddToWorkout}>
            <MaterialIcons name="add" size={22} color="#fff" />
            <Text style={styles.addBtnText}>Add to Workout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: Colors.outline,
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
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.onSurface,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  heroImage: {
    flex: 1,
    height: 180,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainer,
  },
  titleSection: {
    marginBottom: 24,
  },
  exerciseTitle: {
    fontSize: 26,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: Colors.onSurface,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: '#f5a623',
    marginLeft: 4,
  },
  ratingLabel: {
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
    color: Colors.outline,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 12,
  },
  activationCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  activationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activationLabel: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.onSurface,
  },
  repRangeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  repCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
  },
  repCardTitle: {
    fontSize: 11,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  repCardRange: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: Colors.onSurface,
  },
  repCardNote: {
    fontSize: 10,
    fontFamily: 'Plus Jakarta Sans',
    color: Colors.outline,
    textAlign: 'center',
  },
  cueCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  cueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cueNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cueNumText: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: '#fff',
  },
  cueText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: Colors.onSurface,
    lineHeight: 20,
  },
  mistakeCard: {
    backgroundColor: '#fef8f0',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f5deb3',
  },
  mistakeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  mistakeText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#5a3e1b',
    lineHeight: 20,
  },
  externalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  externalLinkText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    color: Colors.primary,
  },
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
  },
  addBtnText: {
    fontSize: 17,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: '#fff',
  },
});
