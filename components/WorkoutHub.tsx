import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Defs, LinearGradient, Rect, Stop, Path, Circle } from 'react-native-svg';
import { useWorkout } from '../context/WorkoutContext';

const { width } = Dimensions.get('window');

export default function WorkoutHub() {
  const router = useRouter();
  const { startWorkout, userUnit } = useWorkout();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Date Carousel (Similar to Dashboard) */}
      <View style={styles.dateCarousel}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
          {['Mon', 'Tue'].map((day, i) => (
            <View key={i} style={styles.dateItemInactive}>
              <Text style={styles.dateDayInactive}>{day}</Text>
              <Text style={styles.dateNumInactive}>{12 + i}</Text>
            </View>
          ))}
          <View style={styles.dateItemActive}>
            <Text style={styles.dateDayActive}>Wed</Text>
            <Text style={styles.dateNumActive}>14</Text>
            <View style={styles.dateDotActive} />
          </View>
          {['Thu', 'Fri', 'Sat'].map((day, i) => (
            <View key={i} style={styles.dateItemInactive}>
              <Text style={styles.dateDayInactive}>{day}</Text>
              <Text style={styles.dateNumInactive}>{15 + i}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Hero Workout Card - Asymmetric Claymorphism */}
      <View style={styles.heroSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.heroTitle}>Today's Target</Text>
          <TouchableOpacity>
            <MaterialIcons name="more-horiz" size={24} color={Colors.outline} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.heroCardWrapper}
          onPress={() => {
            startWorkout();
            router.push('/(app)/active-workout');
          }}
        >
          {/* Volumetric base layer */}
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroIconBadge}>
                <MaterialIcons name="fitness-center" size={24} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroWorkoutName}>Push Day Power</Text>
                <Text style={styles.heroTarget}>Chest, Shoulders & Triceps</Text>
              </View>
              <View style={styles.heroPlayBadge}>
                <MaterialIcons name="chevron-right" size={28} color="#fff" />
              </View>
            </View>
            
            <View style={styles.heroFooter}>
              <Text style={styles.heroMetadata}>45 MIN • 6 EXERCISES</Text>
              <View style={styles.difficultyDots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={[styles.dot, styles.dotActive]} />
                <View style={[styles.dot]} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Start Empty Workout (Overlapping Action) */}
      <TouchableOpacity 
        style={styles.startEmptyWrapper} 
        onPress={() => {
          router.push('/(app)/start-workout');
        }}
        activeOpacity={0.8}
      >
        <View style={styles.startEmptyBtn}>
          <Text style={styles.startEmptyText}>START EMPTY WORKOUT</Text>
          <MaterialIcons name="add" size={20} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* ── Analytics Section ── */}
      <View style={styles.analyticsSection}>
        <View style={styles.analyticsSectionHeader}>
          <Text style={styles.analyticsTitle}>This Week</Text>
          <View style={styles.analyticsBadge}>
            <MaterialIcons name="trending-up" size={14} color={Colors.tertiary} />
            <Text style={styles.analyticsBadgeText}>+12%</Text>
          </View>
        </View>

        {/* Mini Activity Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartBars}>
            {[
              { day: 'M', value: 0.7, active: true },
              { day: 'T', value: 0.9, active: true },
              { day: 'W', value: 0,   active: false },
              { day: 'T', value: 1.0, active: true },
              { day: 'F', value: 0,   active: false },
              { day: 'S', value: 0,   active: false },
              { day: 'S', value: 0,   active: false },
            ].map((d, i) => (
              <View key={i} style={styles.chartCol}>
                <View style={styles.chartBarTrack}>
                  <View
                    style={[
                      styles.chartBarFill,
                      {
                        height: `${Math.max(d.value * 100, 6)}%`,
                        backgroundColor: d.active ? Colors.primary : Colors.surfaceContainerHigh,
                        borderRadius: 6,
                      },
                    ] as any}
                  />
                </View>
                <Text style={[styles.chartDayLabel, d.active && styles.chartDayLabelActive]}>{d.day}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chartSummaryRow}>
            <Text style={styles.chartSummaryText}>3 of 5 sessions completed</Text>
            <View style={styles.chartProgressTrack}>
              <View style={[styles.chartProgressFill, { width: '60%' }] as any} />
            </View>
          </View>
        </View>

        {/* Stat Cards Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#eff2ff' }]}>
              <MaterialIcons name="event-available" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statUnit}>sessions</Text>
            <View style={[styles.trendPill, { backgroundColor: '#e8faf0' }]}>
              <MaterialIcons name="arrow-upward" size={10} color={Colors.tertiary} />
              <Text style={[styles.trendText, { color: Colors.tertiary }]}>+1</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#e8faf0' }]}>
              <FontAwesome5 name="weight-hanging" size={13} color={Colors.tertiary} />
            </View>
            <Text style={styles.statValue}>12.4k</Text>
            <Text style={styles.statUnit}>{userUnit} lifted</Text>
            <View style={[styles.trendPill, { backgroundColor: '#e8faf0' }]}>
              <MaterialIcons name="arrow-upward" size={10} color={Colors.tertiary} />
              <Text style={[styles.trendText, { color: Colors.tertiary }]}>8%</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#fff0e8' }]}>
              <MaterialIcons name="local-fire-department" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statUnit}>day streak</Text>
            <View style={[styles.trendPill, { backgroundColor: '#fff0e8' }]}>
              <MaterialIcons name="whatshot" size={10} color={Colors.secondary} />
              <Text style={[styles.trendText, { color: Colors.secondary }]}>Best!</Text>
            </View>
          </View>
        </View>

        {/* Muscle Split */}
        <View style={styles.muscleSplitCard}>
          <Text style={styles.muscleSplitTitle}>Muscle Split</Text>
          <View style={styles.muscleSplitBar}>
            <View style={[styles.muscleSplitSegment, { flex: 4, backgroundColor: Colors.primary, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }] as any} />
            <View style={[styles.muscleSplitSegment, { flex: 3, backgroundColor: Colors.secondary }] as any} />
            <View style={[styles.muscleSplitSegment, { flex: 2, backgroundColor: Colors.tertiary }] as any} />
            <View style={[styles.muscleSplitSegment, { flex: 1, backgroundColor: Colors.outlineVariant, borderTopRightRadius: 8, borderBottomRightRadius: 8 }] as any} />
          </View>
          <View style={styles.muscleSplitLegend}>
            {[
              { label: 'Chest', color: Colors.primary, pct: '40%' },
              { label: 'Shoulders', color: Colors.secondary, pct: '30%' },
              { label: 'Triceps', color: Colors.tertiary, pct: '20%' },
              { label: 'Core', color: Colors.outlineVariant, pct: '10%' },
            ].map((m, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: m.color }]} />
                <Text style={styles.legendLabel}>{m.label}</Text>
                <Text style={styles.legendPct}>{m.pct}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Link to full analytics */}
        <TouchableOpacity
          style={styles.viewAnalyticsBtn}
          onPress={() => router.push('/(app)/strength-analytics')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="insights" size={18} color={Colors.primary} />
          <Text style={styles.viewAnalyticsText}>View Full Analytics</Text>
          <MaterialIcons name="arrow-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Recent Routines Map */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderPadding}>
          <Text style={styles.sectionTitle}>Recent Routines</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routineList} snapToInterval={width * 0.4 + 16} decelerationRate="fast">
          {[
            { icon: 'fitness-center', title: 'Back & Biceps', time: '2 days ago', color: '#64a1ff' },
            { icon: 'directions-run', title: 'Squat Focus', time: '4 days ago', color: '#ffc5a3' },
            { icon: 'local-fire-department', title: 'Abs & Stability', time: 'Last week', color: '#8efecb' },
          ].map((r, i) => (
            <TouchableOpacity key={i} style={styles.routineCard} activeOpacity={0.9}>
              <View style={[styles.routineIconBadge, { backgroundColor: r.color }]}>
                <MaterialIcons name={r.icon as any} size={18} color="#00224a" />
              </View>
              <Text style={styles.routineTitle}>{r.title}</Text>
              <Text style={styles.routineSub}>Last: {r.time}</Text>
              <View style={styles.routineAction}>
                <Text style={styles.routineActionText}>REUSE</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Create New Workout Action */}
      <View style={styles.createWorkoutWrapper}>
        <TouchableOpacity style={styles.createWorkoutBtn} activeOpacity={0.8}>
          <MaterialIcons name="add" size={20} color={Colors.primary} />
          <Text style={styles.createWorkoutText}>Create a new Workout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 160 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  
  // Date Carousel
  dateCarousel: {
    marginBottom: 32,
  },
  dateList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  dateItemInactive: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  dateDayInactive: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '700',
    color: Colors.outlineVariant,
  },
  dateNumInactive: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.outline,
  },
  dateItemActive: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  dateDayActive: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
  },
  dateNumActive: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: '#fff',
  },
  dateDotActive: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginTop: 2,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: '#2a2f32',
    letterSpacing: -0.5,
  },
  heroCardWrapper: {
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 6,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 24,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWorkoutName: {
    fontSize: 20,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: '#2a2f32',
  },
  heroTarget: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '600',
    color: Colors.outline,
    marginTop: 4,
  },
  heroPlayBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#f3f7fb',
  },
  heroMetadata: {
    fontSize: 10,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 1,
  },
  difficultyDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceVariant,
  },
  dotActive: {
    backgroundColor: Colors.secondary,
  },

  // Floating Start Button
  startEmptyWrapper: {
    marginHorizontal: 40,
    marginTop: 0,
    marginBottom: 32,
    zIndex: 10,
  },
  startEmptyBtn: {
    backgroundColor: '#2a2f32',
    borderRadius: 99,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  startEmptyText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    letterSpacing: 1,
  },

  // ── Analytics Section ──
  analyticsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  analyticsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analyticsTitle: {
    fontSize: 20,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: '#2a2f32',
    letterSpacing: -0.5,
  },
  analyticsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8faf0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  analyticsBadgeText: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.tertiary,
  },

  // Chart Card
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 14,
    gap: 8,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  chartBarTrack: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    minHeight: 4,
  },
  chartDayLabel: {
    fontSize: 11,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.outlineVariant,
  },
  chartDayLabelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  chartSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  chartSummaryText: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    color: Colors.outline,
  },
  chartProgressTrack: {
    width: 80,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surfaceContainerLow,
    overflow: 'hidden',
  },
  chartProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },

  // Stat Cards
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: '#2a2f32',
    lineHeight: 24,
  },
  statUnit: {
    fontSize: 10,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 2,
  },
  trendText: {
    fontSize: 10,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
  },

  // Muscle Split
  muscleSplitCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  muscleSplitTitle: {
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: '#2a2f32',
    marginBottom: 10,
  },
  muscleSplitBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 8,
    overflow: 'hidden',
    gap: 2,
    marginBottom: 12,
  },
  muscleSplitSegment: {
    height: '100%',
  },
  muscleSplitLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    color: Colors.outline,
  },
  legendPct: {
    fontSize: 11,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: '#2a2f32',
  },

  // View Analytics Link
  viewAnalyticsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#eff2ff',
    marginTop: 14,
  },
  viewAnalyticsText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.primary,
  },

  // Routines
  section: {
    marginBottom: 32,
  },
  sectionHeaderPadding: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: '#2a2f32',
    letterSpacing: -0.5,
  },
  viewAll: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '700',
    color: Colors.primary,
  },
  routineList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  routineCard: {
    width: width * 0.4,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  routineIconBadge: {
    alignSelf: 'flex-start',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 16,
  },
  routineTitle: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: '#2a2f32',
  },
  routineSub: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '600',
    color: Colors.outline,
    marginTop: 4,
    marginBottom: 20,
  },
  routineAction: {
    backgroundColor: '#f3f7fb',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  routineActionText: {
    fontSize: 11,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },

  // Create Workout Footer
  createWorkoutWrapper: {
    paddingHorizontal: 24,
    marginTop: 0,
  },
  createWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(100, 161, 255, 0.08)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(100, 161, 255, 0.3)',
    gap: 12,
  },
  createWorkoutText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.primary,
  }
});
