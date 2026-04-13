import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform,
  Share, Dimensions, Alert,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useWorkout } from '../../context/WorkoutContext';

const { width: SCREEN_W } = Dimensions.get('window');

/* ──────────────── Types ──────────────── */
interface SummaryExercise {
  name: string;
  target: string;
  setsCompleted: number;
  totalSets: number;
  topWeight: number;
  topReps: number;
  volume: number;
  isPR: boolean;
}

/* ──────────────── Component ──────────────── */
export default function WorkoutSummary() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    duration?: string;
    exercisesJson?: string;
  }>();

  const [difficultyRating, setDifficultyRating] = useState(0);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const { userUnit } = useWorkout();

  /* ── Parse workout data from params ── */
  const durationSec = parseInt(params.duration || '2700', 10);
  const exercises: SummaryExercise[] = useMemo(() => {
    if (params.exercisesJson) {
      try { return JSON.parse(params.exercisesJson); } catch { /* fallback */ }
    }
    // Mock fallback for direct access
    return [
      { name: 'Barbell Bench Press', target: 'Chest', setsCompleted: 3, totalSets: 3, topWeight: 200, topReps: 5, volume: 2550, isPR: true },
      { name: 'Incline Dumbbell Press', target: 'Chest', setsCompleted: 3, totalSets: 3, topWeight: 70, topReps: 10, volume: 1800, isPR: false },
      { name: 'Cable Crossover', target: 'Chest', setsCompleted: 2, totalSets: 3, topWeight: 30, topReps: 12, volume: 660, isPR: false },
      { name: 'Military press', target: 'Shoulders', setsCompleted: 3, totalSets: 3, topWeight: 135, topReps: 6, volume: 1890, isPR: true },
      { name: 'Lateral Raise', target: 'Shoulders', setsCompleted: 3, totalSets: 3, topWeight: 25, topReps: 15, volume: 900, isPR: false },
      { name: 'Tricep Pushdown', target: 'Triceps', setsCompleted: 3, totalSets: 3, topWeight: 60, topReps: 12, volume: 1620, isPR: false },
    ];
  }, [params.exercisesJson]);

  /* ── Derived stats ── */
  const totalVolume = exercises.reduce((s, e) => s + e.volume, 0);
  const totalSetsCompleted = exercises.reduce((s, e) => s + e.setsCompleted, 0);
  const totalSets = exercises.reduce((s, e) => s + e.totalSets, 0);
  const prCount = exercises.filter(e => e.isPR).length;
  const caloriesBurned = Math.round(durationSec / 60 * 6.5); // rough estimate: ~6.5 cal/min weightlifting

  const durationMin = Math.floor(durationSec / 60);
  const durationStr = durationMin >= 60
    ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`
    : `${durationMin}m`;

  /* ── Muscle breakdown ── */
  const muscleMap = useMemo(() => {
    const map: Record<string, { volume: number; sets: number }> = {};
    exercises.forEach(e => {
      if (!map[e.target]) map[e.target] = { volume: 0, sets: 0 };
      map[e.target].volume += e.volume;
      map[e.target].sets += e.setsCompleted;
    });
    const arr = Object.entries(map).map(([name, data]) => ({ name, ...data }));
    arr.sort((a, b) => b.volume - a.volume);
    return arr;
  }, [exercises]);

  const totalMuscleVol = muscleMap.reduce((s, m) => s + m.volume, 0) || 1;

  const muscleColors = [Colors.primary, Colors.secondary, Colors.tertiary, '#f5a623', Colors.outlineVariant, '#c5ceff'];

  /* ── Completion ring ── */
  const completionPct = totalSets > 0 ? totalSetsCompleted / totalSets : 1;
  const ringSize = 100;
  const ringStroke = 8;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircum = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircum * (1 - completionPct);

  /* ── Difficulty stars ── */
  const difficultyLabels = ['', 'Easy', 'Moderate', 'Challenging', 'Hard', 'Max Effort'];

  /* ── Share ── */
  const handleShare = async () => {
    try {
      await Share.share({
        message: `🏋️ Just crushed a workout!\n\n⏱ ${durationStr} | 💪 ${(totalVolume / 1000).toFixed(1)}k ${userUnit} | ✅ ${totalSetsCompleted} sets${prCount > 0 ? `\n🏆 ${prCount} new PR${prCount > 1 ? 's' : ''}!` : ''}\n\n#MacroMate #FitnessJourney`,
      });
    } catch {}
  };

  /* ── Save ── */
  const handleSave = () => {
    // TODO: persist to Firestore
    setSaved(true);
    Alert.alert('Saved!', 'Workout saved to your history.', [
      { text: 'Done', onPress: () => router.replace({ pathname: '/(app)', params: { tab: 'Workouts' } }) },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Header ── */}
        <View style={styles.heroSection}>
          <View style={styles.trophyRow}>
            <MaterialIcons name="emoji-events" size={32} color="#f5a623" />
          </View>
          <Text style={styles.heroTitle}>Workout Complete!</Text>
          <Text style={styles.heroSubtitle}>Great session — here's your recap</Text>
        </View>

        {/* ── Key Metrics Strip ── */}
        <View style={styles.metricsCard}>
          <View style={styles.metricCol}>
            <View style={styles.ringContainer}>
              <Svg width={ringSize} height={ringSize}>
                <SvgCircle cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                  stroke={Colors.surfaceContainerHigh} strokeWidth={ringStroke} fill="none" />
                <SvgCircle cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                  stroke={Colors.primary} strokeWidth={ringStroke} fill="none"
                  strokeDasharray={ringCircum} strokeDashoffset={ringOffset}
                  strokeLinecap="round" rotation={-90} origin={`${ringSize / 2}, ${ringSize / 2}`} />
              </Svg>
              <Text style={styles.ringPct}>{Math.round(completionPct * 100)}%</Text>
            </View>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <MaterialIcons name="schedule" size={18} color={Colors.primary} />
              <Text style={styles.metricValue}>{durationStr}</Text>
              <Text style={styles.metricSub}>Duration</Text>
            </View>
            <View style={styles.metricItem}>
              <FontAwesome5 name="weight-hanging" size={14} color={Colors.tertiary} />
              <Text style={styles.metricValue}>{(totalVolume / 1000).toFixed(1)}k</Text>
              <Text style={styles.metricSub}>{userUnit} Volume</Text>
            </View>
            <View style={styles.metricItem}>
              <MaterialIcons name="check-circle" size={18} color={Colors.tertiary} />
              <Text style={styles.metricValue}>{totalSetsCompleted}/{totalSets}</Text>
              <Text style={styles.metricSub}>Sets</Text>
            </View>
            <View style={styles.metricItem}>
              <MaterialIcons name="local-fire-department" size={18} color={Colors.secondary} />
              <Text style={styles.metricValue}>{caloriesBurned}</Text>
              <Text style={styles.metricSub}>kcal (est.)</Text>
            </View>
          </View>
        </View>

        {/* ── New PRs ── */}
        {prCount > 0 && (
          <View style={styles.prCard}>
            <View style={styles.prHeader}>
              <MaterialIcons name="emoji-events" size={22} color="#f5a623" />
              <Text style={styles.prTitle}>{prCount} New PR{prCount > 1 ? 's' : ''}!</Text>
            </View>
            {exercises.filter(e => e.isPR).map((e, i) => (
              <View key={i} style={styles.prRow}>
                <View style={styles.prBadge}>
                  <MaterialIcons name="star" size={14} color="#f5a623" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prExName}>{e.name}</Text>
                  <Text style={styles.prDetail}>{e.topWeight} {userUnit} × {e.topReps} reps</Text>
                </View>
                <View style={styles.prTrophyWrap}>
                  <Text style={styles.prTrophyText}>🏆</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Muscle Group Breakdown ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Muscle Groups Trained</Text>

          {/* Proportional bar */}
          <View style={styles.muscleBar}>
            {muscleMap.map((m, i) => (
              <View
                key={i}
                style={[
                  styles.muscleBarSegment,
                  {
                    flex: m.volume / totalMuscleVol,
                    backgroundColor: muscleColors[i % muscleColors.length],
                    borderTopLeftRadius: i === 0 ? 8 : 0,
                    borderBottomLeftRadius: i === 0 ? 8 : 0,
                    borderTopRightRadius: i === muscleMap.length - 1 ? 8 : 0,
                    borderBottomRightRadius: i === muscleMap.length - 1 ? 8 : 0,
                  },
                ] as any}
              />
            ))}
          </View>

          {/* Legend */}
          <View style={styles.muscleLegend}>
            {muscleMap.map((m, i) => (
              <View key={i} style={styles.muscleLegendItem}>
                <View style={[styles.muscleLegendDot, { backgroundColor: muscleColors[i % muscleColors.length] }]} />
                <Text style={styles.muscleLegendName}>{m.name}</Text>
                <Text style={styles.muscleLegendPct}>{Math.round((m.volume / totalMuscleVol) * 100)}%</Text>
              </View>
            ))}
          </View>

          {/* Detailed breakdown */}
          {muscleMap.map((m, i) => (
            <View key={i} style={styles.muscleDetailRow}>
              <View style={[styles.muscleDetailDot, { backgroundColor: muscleColors[i % muscleColors.length] }]} />
              <Text style={styles.muscleDetailName}>{m.name}</Text>
              <Text style={styles.muscleDetailSets}>{m.sets} sets</Text>
              <Text style={styles.muscleDetailVol}>{(m.volume / 1000).toFixed(1)}k {userUnit}</Text>
            </View>
          ))}
        </View>

        {/* ── Exercise Breakdown ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Exercise Breakdown</Text>
          {exercises.map((e, i) => (
            <View key={i} style={styles.exerciseRow}>
              <View style={styles.exerciseInfo}>
                <View style={styles.exerciseNameRow}>
                  <Text style={styles.exerciseName} numberOfLines={1}>{e.name}</Text>
                  {e.isPR && (
                    <View style={styles.prMini}>
                      <Text style={styles.prMiniText}>PR</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.exerciseMeta}>{e.target} · {e.setsCompleted}/{e.totalSets} sets</Text>
              </View>
              <View style={styles.exerciseStats}>
                <Text style={styles.exerciseTopSet}>{e.topWeight}×{e.topReps}</Text>
                <Text style={styles.exerciseVol}>{e.volume} {userUnit}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Rate Difficulty ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Rate Difficulty</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => setDifficultyRating(n)} style={styles.starBtn}>
                <MaterialIcons
                  name={n <= difficultyRating ? 'star' : 'star-outline'}
                  size={36}
                  color={n <= difficultyRating ? '#f5a623' : Colors.outlineVariant}
                />
              </TouchableOpacity>
            ))}
          </View>
          {difficultyRating > 0 && (
            <Text style={styles.difficultyLabel}>{difficultyLabels[difficultyRating]}</Text>
          )}
        </View>

        {/* ── Workout Notes ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Workout Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="How did this session feel? Any notes..."
            placeholderTextColor={Colors.outlineVariant}
            value={workoutNotes}
            onChangeText={setWorkoutNotes}
            multiline
            maxLength={500}
          />
        </View>

        {/* ── Share Card Preview ── */}
        <View style={styles.shareCardOuter}>
          <View style={styles.shareCard}>
            <View style={styles.shareCardHeader}>
              <Text style={styles.shareCardLogo}>M</Text>
              <Text style={styles.shareCardBrand}>MacroMate</Text>
            </View>
            <Text style={styles.shareCardTitle}>Workout Complete 💪</Text>
            <View style={styles.shareCardStats}>
              <View style={styles.shareStatItem}>
                <Text style={styles.shareStatVal}>{durationStr}</Text>
                <Text style={styles.shareStatLabel}>Duration</Text>
              </View>
              <View style={styles.shareStatDivider} />
              <View style={styles.shareStatItem}>
                <Text style={styles.shareStatVal}>{(totalVolume / 1000).toFixed(1)}k</Text>
                <Text style={styles.shareStatLabel}>Volume</Text>
              </View>
              <View style={styles.shareStatDivider} />
              <View style={styles.shareStatItem}>
                <Text style={styles.shareStatVal}>{totalSetsCompleted}</Text>
                <Text style={styles.shareStatLabel}>Sets</Text>
              </View>
              {prCount > 0 && <>
                <View style={styles.shareStatDivider} />
                <View style={styles.shareStatItem}>
                  <Text style={styles.shareStatVal}>🏆 {prCount}</Text>
                  <Text style={styles.shareStatLabel}>PRs</Text>
                </View>
              </>}
            </View>
            <Text style={styles.shareCardMuscles}>
              {muscleMap.map(m => m.name).join(' · ')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky Footer ── */}
      <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <MaterialIcons name="share" size={20} color={Colors.primary} />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnDone]}
          onPress={handleSave}
          disabled={saved}
        >
          <MaterialIcons name={saved ? 'check' : 'save'} size={20} color="#fff" />
          <Text style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save & Finish'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ──────────────── Styles ──────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 16 },

  /* Hero */
  heroSection: { alignItems: 'center', paddingTop: 20, paddingBottom: 24 },
  trophyRow: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#fef3e2',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28, fontFamily: 'Plus Jakarta Sans', fontWeight: '900',
    color: Colors.onSurface, marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', color: Colors.outline,
  },

  /* Metrics Card */
  metricsCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 24, padding: 20,
    marginBottom: 16, alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16 },
      android: { elevation: 4 },
    }),
  },
  metricCol: { alignItems: 'center', gap: 8 },
  ringContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ringPct: {
    position: 'absolute', fontSize: 20, fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900', color: Colors.primary,
  },
  metricLabel: {
    fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontWeight: '700',
    color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.3,
  },
  metricDivider: {
    width: 1, height: 80, backgroundColor: Colors.surfaceContainerHigh, marginHorizontal: 16,
  },
  metricsGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  metricItem: {
    width: '47%', alignItems: 'center', gap: 2, paddingVertical: 8,
  },
  metricValue: {
    fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '900', color: Colors.onSurface,
  },
  metricSub: {
    fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '600',
    color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.3,
  },

  /* PR Card */
  prCard: {
    backgroundColor: '#fef8f0', borderRadius: 22, padding: 18,
    borderWidth: 1.5, borderColor: '#f5deb3', marginBottom: 16,
  },
  prHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  prTitle: {
    fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: '900', color: '#5a3e1b',
  },
  prRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(245,222,179,0.5)',
  },
  prBadge: {
    width: 32, height: 32, borderRadius: 12, backgroundColor: '#fef3e2',
    alignItems: 'center', justifyContent: 'center',
  },
  prExName: {
    fontSize: 15, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', color: '#5a3e1b',
  },
  prDetail: {
    fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', color: '#a07a4a',
  },
  prTrophyWrap: { paddingHorizontal: 8 },
  prTrophyText: { fontSize: 22 },

  /* Section Card */
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 22, padding: 18, marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: {
    fontSize: 17, fontFamily: 'Plus Jakarta Sans', fontWeight: '800',
    color: Colors.onSurface, marginBottom: 14,
  },

  /* Muscle Bar */
  muscleBar: {
    flexDirection: 'row', height: 12, borderRadius: 8, overflow: 'hidden',
    gap: 2, marginBottom: 14,
  },
  muscleBarSegment: { height: '100%' },
  muscleLegend: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14,
  },
  muscleLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  muscleLegendDot: { width: 8, height: 8, borderRadius: 4 },
  muscleLegendName: {
    fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', color: Colors.outline,
  },
  muscleLegendPct: {
    fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', color: Colors.onSurface,
  },
  muscleDetailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: Colors.surfaceContainerLow,
  },
  muscleDetailDot: { width: 10, height: 10, borderRadius: 5 },
  muscleDetailName: {
    flex: 1, fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '700',
    color: Colors.onSurface,
  },
  muscleDetailSets: {
    fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', color: Colors.outline,
    marginRight: 16,
  },
  muscleDetailVol: {
    fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', color: Colors.onSurface,
  },

  /* Exercise Breakdown */
  exerciseRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: Colors.surfaceContainerLow,
  },
  exerciseInfo: { flex: 1, gap: 3 },
  exerciseNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  exerciseName: {
    fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '700',
    color: Colors.onSurface, flexShrink: 1,
  },
  exerciseMeta: {
    fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', color: Colors.outline,
  },
  exerciseStats: { alignItems: 'flex-end', gap: 2 },
  exerciseTopSet: {
    fontSize: 15, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', color: Colors.onSurface,
  },
  exerciseVol: {
    fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', color: Colors.outline,
  },
  prMini: {
    backgroundColor: '#fef3e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  prMiniText: {
    fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', color: '#f5a623',
  },

  /* Difficulty Stars */
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  starBtn: { padding: 4 },
  difficultyLabel: {
    textAlign: 'center', fontSize: 14, fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700', color: '#f5a623',
  },

  /* Notes */
  notesInput: {
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, minHeight: 90,
    fontSize: 14, fontFamily: 'Plus Jakarta Sans', color: Colors.onSurface,
    textAlignVertical: 'top', borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },

  /* Share Card Preview */
  shareCardOuter: { marginBottom: 16 },
  shareCard: {
    backgroundColor: '#0a1628', borderRadius: 22, padding: 24,
    borderWidth: 1, borderColor: 'rgba(100,161,255,0.2)',
  },
  shareCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16,
  },
  shareCardLogo: {
    fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: '900', color: Colors.primary,
    backgroundColor: '#1a2b45', width: 28, height: 28, borderRadius: 8,
    textAlign: 'center', lineHeight: 28, overflow: 'hidden',
  },
  shareCardBrand: {
    fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
  },
  shareCardTitle: {
    fontSize: 22, fontFamily: 'Plus Jakarta Sans', fontWeight: '900', color: '#fff',
    marginBottom: 16,
  },
  shareCardStats: {
    flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16,
  },
  shareStatItem: { alignItems: 'center', gap: 4 },
  shareStatVal: {
    fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '900', color: '#fff',
  },
  shareStatLabel: {
    fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '600',
    color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5,
  },
  shareStatDivider: {
    width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'center',
  },
  shareCardMuscles: {
    fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '600',
    color: 'rgba(100,161,255,0.7)', textAlign: 'center',
  },

  /* Sticky Footer */
  stickyFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12,
    backgroundColor: Colors.background, borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 16, paddingTop: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 16, borderRadius: 16,
    backgroundColor: '#eff2ff', borderWidth: 1.5, borderColor: Colors.primary,
  },
  shareBtnText: {
    fontSize: 15, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', color: Colors.primary,
  },
  saveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 16, backgroundColor: Colors.primary,
  },
  saveBtnDone: { backgroundColor: Colors.tertiary },
  saveBtnText: {
    fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', color: '#fff',
  },
});
