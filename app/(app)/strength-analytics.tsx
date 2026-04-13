import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkout } from '../../context/WorkoutContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_PADDING = 16;
const CHART_W = SCREEN_WIDTH - 32 - CHART_PADDING * 2;

/* ──────────────── Mock Data ──────────────── */

const EXERCISE_LIST = [
  'Barbell Bench Press', 'Barbell Squat', 'Barbell Deadlift', 'Military press',
  'Barbell Curl', 'Pullups', 'Incline Dumbbell Press', 'Tricep Rope Pushdown',
];

// 1RM trend data (mock) — 12 data points per exercise
const ORM_DATA: Record<string, { week: string; value: number }[]> = {
  'Barbell Bench Press': [
    { week: 'W1', value: 185 }, { week: 'W2', value: 190 }, { week: 'W3', value: 190 },
    { week: 'W4', value: 195 }, { week: 'W5', value: 195 }, { week: 'W6', value: 200 },
    { week: 'W7', value: 200 }, { week: 'W8', value: 205 }, { week: 'W9', value: 210 },
    { week: 'W10', value: 210 }, { week: 'W11', value: 215 }, { week: 'W12', value: 220 },
  ],
  'Barbell Squat': [
    { week: 'W1', value: 225 }, { week: 'W2', value: 230 }, { week: 'W3', value: 235 },
    { week: 'W4', value: 235 }, { week: 'W5', value: 240 }, { week: 'W6', value: 245 },
    { week: 'W7', value: 250 }, { week: 'W8', value: 255 }, { week: 'W9', value: 255 },
    { week: 'W10', value: 260 }, { week: 'W11', value: 265 }, { week: 'W12', value: 270 },
  ],
  'Barbell Deadlift': [
    { week: 'W1', value: 275 }, { week: 'W2', value: 280 }, { week: 'W3', value: 285 },
    { week: 'W4', value: 290 }, { week: 'W5', value: 290 }, { week: 'W6', value: 295 },
    { week: 'W7', value: 300 }, { week: 'W8', value: 305 }, { week: 'W9', value: 310 },
    { week: 'W10', value: 315 }, { week: 'W11', value: 315 }, { week: 'W12', value: 325 },
  ],
};

// Volume by muscle (weekly)
const VOLUME_DATA = [
  { muscle: 'Chest', volume: 8400, prev: 7200, color: Colors.primary },
  { muscle: 'Back', volume: 7800, prev: 7500, color: '#64a1ff' },
  { muscle: 'Shoulders', volume: 5200, prev: 4800, color: Colors.secondary },
  { muscle: 'Legs', volume: 9600, prev: 8200, color: Colors.tertiary },
  { muscle: 'Arms', volume: 4100, prev: 3900, color: '#f5a623' },
  { muscle: 'Core', volume: 2400, prev: 2600, color: Colors.outlineVariant },
];

// PR records
const PR_RECORDS = [
  { exercise: 'Barbell Bench Press', weight: 220, reps: 1, date: 'Apr 10', trend: 'up' },
  { exercise: 'Barbell Squat', weight: 270, reps: 1, date: 'Apr 8', trend: 'up' },
  { exercise: 'Barbell Deadlift', weight: 325, reps: 1, date: 'Apr 6', trend: 'up' },
  { exercise: 'Military press', weight: 135, reps: 1, date: 'Apr 3', trend: 'same' },
  { exercise: 'Barbell Curl', weight: 95, reps: 5, date: 'Apr 1', trend: 'up' },
  { exercise: 'Pullups', weight: 45, reps: 8, date: 'Mar 28', trend: 'up' },
  { exercise: 'Incline Dumbbell Press', weight: 75, reps: 8, date: 'Mar 25', trend: 'down' },
];

// Heatmap data (90 days) — 0 = rest, 1 = light, 2 = moderate, 3 = intense
const generateHeatmap = () => {
  const data: number[] = [];
  for (let i = 0; i < 90; i++) {
    const rand = Math.random();
    if (rand < 0.4) data.push(0);
    else if (rand < 0.6) data.push(1);
    else if (rand < 0.8) data.push(2);
    else data.push(3);
  }
  return data;
};

// Body map muscle status
const BODY_MUSCLES = [
  { name: 'Chest', status: 'trained', sessions: 3 },
  { name: 'Back', status: 'trained', sessions: 2 },
  { name: 'Shoulders', status: 'trained', sessions: 3 },
  { name: 'Biceps', status: 'trained', sessions: 2 },
  { name: 'Triceps', status: 'trained', sessions: 2 },
  { name: 'Quadriceps', status: 'undertrained', sessions: 1 },
  { name: 'Hamstrings', status: 'undertrained', sessions: 0 },
  { name: 'Glutes', status: 'undertrained', sessions: 0 },
  { name: 'Calves', status: 'neglected', sessions: 0 },
  { name: 'Core', status: 'trained', sessions: 2 },
  { name: 'Forearms', status: 'undertrained', sessions: 1 },
  { name: 'Traps', status: 'undertrained', sessions: 1 },
];

/* ──────────────── Component ──────────────── */

type TimeWindow = '7d' | '30d' | '90d';

export default function StrengthAnalytics() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userUnit } = useWorkout();

  const [timeWindow, setTimeWindow] = useState<TimeWindow>('30d');
  const [selectedExercise, setSelectedExercise] = useState(EXERCISE_LIST[0]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [prSort, setPrSort] = useState<'weight' | 'date'>('weight');

  const heatmapData = useMemo(() => generateHeatmap(), []);

  // Get 1RM data for selected exercise
  const ormPoints = ORM_DATA[selectedExercise] || ORM_DATA['Barbell Bench Press'];
  const windowSlice = timeWindow === '7d' ? 4 : timeWindow === '30d' ? 8 : 12;
  const visibleOrm = ormPoints.slice(-windowSlice);

  const sortedPRs = useMemo(() => {
    const copy = [...PR_RECORDS];
    if (prSort === 'weight') copy.sort((a, b) => b.weight - a.weight);
    return copy;
  }, [prSort]);

  /* ── 1RM Line Chart (SVG) ── */
  const renderLineChart = () => {
    const h = 160;
    const w = CHART_W;
    const values = visibleOrm.map(d => d.value);
    const min = Math.min(...values) - 10;
    const max = Math.max(...values) + 10;
    const range = max - min || 1;

    const points = visibleOrm.map((d, i) => ({
      x: (i / (visibleOrm.length - 1)) * w,
      y: h - ((d.value - min) / range) * (h - 20),
    }));

    // Smooth path (catmull-rom → cubic bezier)
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    // Fill area
    const areaD = pathD + ` L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;

    const lastPoint = points[points.length - 1];
    const lastValue = values[values.length - 1];
    const firstValue = values[0];
    const change = lastValue - firstValue;
    const pctChange = ((change / firstValue) * 100).toFixed(1);

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          {/* Exercise Picker */}
          <TouchableOpacity
            style={styles.exercisePicker}
            onPress={() => setShowExercisePicker(!showExercisePicker)}
          >
            <MaterialIcons name="fitness-center" size={16} color={Colors.primary} />
            <Text style={styles.exercisePickerText} numberOfLines={1}>{selectedExercise}</Text>
            <MaterialIcons name={showExercisePicker ? 'expand-less' : 'expand-more'} size={18} color={Colors.outline} />
          </TouchableOpacity>
          <View style={styles.ormBadge}>
            <Text style={styles.ormValue}>{lastValue}</Text>
            <Text style={styles.ormUnit}>{userUnit}</Text>
            <View style={[styles.ormChange, { backgroundColor: change >= 0 ? '#e8faf0' : '#fce4e4' }]}>
              <MaterialIcons name={change >= 0 ? 'arrow-upward' : 'arrow-downward'} size={10} color={change >= 0 ? Colors.tertiary : Colors.error} />
              <Text style={[styles.ormChangeText, { color: change >= 0 ? Colors.tertiary : Colors.error }]}>
                {change >= 0 ? '+' : ''}{pctChange}%
              </Text>
            </View>
          </View>
        </View>

        {showExercisePicker && (
          <View style={styles.pickerDropdown}>
            {EXERCISE_LIST.map(ex => (
              <TouchableOpacity
                key={ex}
                style={[styles.pickerItem, selectedExercise === ex && styles.pickerItemActive]}
                onPress={() => { setSelectedExercise(ex); setShowExercisePicker(false); }}
              >
                <Text style={[styles.pickerItemText, selectedExercise === ex && styles.pickerItemTextActive]}>{ex}</Text>
                {selectedExercise === ex && <MaterialIcons name="check" size={16} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.chartSubtitle}>Estimated 1RM Trend</Text>

        <View style={{ paddingVertical: 8 }}>
          <Svg width={w} height={h + 24}>
            <Defs>
              <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.18" />
                <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0.02" />
              </LinearGradient>
            </Defs>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
              <Line key={i} x1={0} y1={h * pct} x2={w} y2={h * pct}
                stroke={Colors.surfaceContainerHigh} strokeWidth={1} strokeDasharray="4,4" />
            ))}
            {/* Area fill */}
            <Path d={areaD} fill="url(#areaGrad)" />
            {/* Line */}
            <Path d={pathD} stroke={Colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            {/* Data points */}
            {points.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3}
                fill={i === points.length - 1 ? Colors.primary : '#fff'}
                stroke={Colors.primary} strokeWidth={2} />
            ))}
            {/* X labels */}
            {visibleOrm.map((d, i) => (
              <SvgText key={i} x={points[i].x} y={h + 18} fontSize={10} fill={Colors.outline}
                textAnchor="middle" fontWeight="600">{d.week}</SvgText>
            ))}
            {/* Last point label */}
            <SvgText x={lastPoint.x} y={lastPoint.y - 12} fontSize={11} fill={Colors.primary}
              textAnchor="middle" fontWeight="800">{lastValue}</SvgText>
          </Svg>
        </View>
      </View>
    );
  };

  /* ── Volume Bar Chart ── */
  const renderVolumeChart = () => {
    const maxVol = Math.max(...VOLUME_DATA.map(d => Math.max(d.volume, d.prev)));
    const barH = 120;

    return (
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Weekly Volume by Muscle</Text>
        <Text style={styles.chartSubtitle}>Current vs Previous Period ({userUnit})</Text>

        <View style={styles.volumeBars}>
          {VOLUME_DATA.map((d, i) => {
            const currentH = (d.volume / maxVol) * barH;
            const prevH = (d.prev / maxVol) * barH;
            const change = ((d.volume - d.prev) / d.prev * 100).toFixed(0);
            const isUp = d.volume >= d.prev;

            return (
              <View key={i} style={styles.volumeCol}>
                <Text style={[styles.volumeChangeText, { color: isUp ? Colors.tertiary : Colors.error }]}>
                  {isUp ? '+' : ''}{change}%
                </Text>
                <View style={styles.volumeBarPair}>
                  {/* Prev */}
                  <View style={[styles.volumeBar, { height: prevH, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 6 }] as any} />
                  {/* Current */}
                  <View style={[styles.volumeBar, { height: currentH, backgroundColor: d.color, borderRadius: 6 }] as any} />
                </View>
                <Text style={styles.volumeLabel}>{d.muscle}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.volumeLegend}>
          <View style={styles.legendRow}>
            <View style={[styles.legendSquare, { backgroundColor: Colors.surfaceContainerHigh }]} />
            <Text style={styles.legendText}>Previous</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendSquare, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Current</Text>
          </View>
        </View>
      </View>
    );
  };

  /* ── PR Records Table ── */
  const renderPRTable = () => (
    <View style={styles.chartCard}>
      <View style={styles.prHeader}>
        <Text style={styles.sectionTitle}>Personal Records</Text>
        <View style={styles.sortRow}>
          {(['weight', 'date'] as const).map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sortChip, prSort === s && styles.sortChipActive]}
              onPress={() => setPrSort(s)}
            >
              <Text style={[styles.sortChipText, prSort === s && styles.sortChipTextActive]}>
                {s === 'weight' ? 'Weight' : 'Date'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Table Header */}
      <View style={styles.tableRow}>
        <Text style={[styles.tableHeader, { flex: 2.5 }]}>Exercise</Text>
        <Text style={[styles.tableHeader, { flex: 1, textAlign: 'center' }]}>Best</Text>
        <Text style={[styles.tableHeader, { flex: 1, textAlign: 'center' }]}>Reps</Text>
        <Text style={[styles.tableHeader, { flex: 1, textAlign: 'right' }]}>Date</Text>
      </View>

      {sortedPRs.map((pr, i) => (
        <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
          <View style={{ flex: 2.5, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialIcons
              name={pr.trend === 'up' ? 'trending-up' : pr.trend === 'down' ? 'trending-down' : 'trending-flat'}
              size={14}
              color={pr.trend === 'up' ? Colors.tertiary : pr.trend === 'down' ? Colors.error : Colors.outline}
            />
            <Text style={styles.tableCell} numberOfLines={1}>{pr.exercise}</Text>
          </View>
          <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'center' }]}>{pr.weight} {userUnit}</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>x{pr.reps}</Text>
          <Text style={[styles.tableCellDate, { flex: 1, textAlign: 'right' }]}>{pr.date}</Text>
        </View>
      ))}
    </View>
  );

  /* ── Heatmap ── */
  const renderHeatmap = () => {
    const cellSize = 12;
    const gap = 3;
    const weeks = 13; // 90 days ≈ 13 weeks
    const days = 7;
    const dayLabels = ['M', '', 'W', '', 'F', '', 'S'];

    const getColor = (val: number) => {
      if (val === 0) return Colors.surfaceContainerLow;
      if (val === 1) return '#b3d4ff';
      if (val === 2) return '#64a1ff';
      return Colors.primary;
    };

    return (
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Workout Frequency</Text>
        <Text style={styles.chartSubtitle}>Last 90 days</Text>

        <View style={styles.heatmapContainer}>
          {/* Day labels */}
          <View style={styles.heatmapDayLabels}>
            {dayLabels.map((l, i) => (
              <Text key={i} style={[styles.heatmapDayText, { height: cellSize + gap }]}>{l}</Text>
            ))}
          </View>

          {/* Grid */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.heatmapGrid}>
              {Array.from({ length: weeks }).map((_, week) => (
                <View key={week} style={styles.heatmapCol}>
                  {Array.from({ length: days }).map((_, day) => {
                    const idx = week * 7 + day;
                    const val = idx < heatmapData.length ? heatmapData[idx] : 0;
                    return (
                      <View
                        key={day}
                        style={[
                          styles.heatmapCell,
                          {
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: getColor(val),
                            borderRadius: 3,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Legend */}
        <View style={styles.heatmapLegend}>
          <Text style={styles.heatmapLegendText}>Less</Text>
          {[0, 1, 2, 3].map(v => (
            <View key={v} style={[styles.heatmapLegendCell, { backgroundColor: getColor(v) }]} />
          ))}
          <Text style={styles.heatmapLegendText}>More</Text>
        </View>
      </View>
    );
  };

  /* ── Body Map ── */
  const renderBodyMap = () => {
    const getStatusStyle = (status: string) => {
      if (status === 'trained') return { bg: '#e8faf0', color: Colors.tertiary, icon: 'check-circle' as const };
      if (status === 'undertrained') return { bg: '#fef3e2', color: '#e67e22', icon: 'warning' as const };
      return { bg: '#fce4e4', color: Colors.error, icon: 'error' as const };
    };

    const trained = BODY_MUSCLES.filter(m => m.status === 'trained');
    const undertrained = BODY_MUSCLES.filter(m => m.status !== 'trained');

    return (
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Muscle Balance</Text>
        <Text style={styles.chartSubtitle}>Trained vs undertrained this period</Text>

        {/* Summary badge */}
        <View style={styles.bodyMapSummary}>
          <View style={styles.bodyMapStat}>
            <View style={[styles.bodyMapDot, { backgroundColor: Colors.tertiary }]} />
            <Text style={styles.bodyMapStatText}>{trained.length} trained</Text>
          </View>
          <View style={styles.bodyMapStat}>
            <View style={[styles.bodyMapDot, { backgroundColor: '#e67e22' }]} />
            <Text style={styles.bodyMapStatText}>{undertrained.length} need work</Text>
          </View>
        </View>

        {/* Muscle grid */}
        <View style={styles.muscleGrid}>
          {BODY_MUSCLES.map((m, i) => {
            const s = getStatusStyle(m.status);
            return (
              <View key={i} style={[styles.muscleChip, { backgroundColor: s.bg }]}>
                <MaterialIcons name={s.icon} size={14} color={s.color} />
                <Text style={[styles.muscleChipText, { color: s.color }]}>{m.name}</Text>
                <Text style={[styles.muscleChipCount, { color: s.color }]}>
                  {m.sessions > 0 ? `${m.sessions}x` : '—'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Strength Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Time Window Selector */}
      <View style={styles.windowRow}>
        {(['7d', '30d', '90d'] as TimeWindow[]).map(w => (
          <TouchableOpacity
            key={w}
            style={[styles.windowBtn, timeWindow === w && styles.windowBtnActive]}
            onPress={() => setTimeWindow(w)}
          >
            <Text style={[styles.windowBtnText, timeWindow === w && styles.windowBtnTextActive]}>
              {w === '7d' ? '7 Days' : w === '30d' ? '30 Days' : '90 Days'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {renderLineChart()}
        {renderVolumeChart()}
        {renderPRTable()}
        {renderHeatmap()}
        {renderBodyMap()}
      </ScrollView>
    </View>
  );
}

/* ──────────────── Styles ──────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', color: Colors.onSurface,
  },
  scrollContent: { paddingHorizontal: 16, gap: 16 },

  /* Time Window */
  windowRow: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 14, padding: 4,
  },
  windowBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
  },
  windowBtnActive: {
    backgroundColor: '#fff',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  windowBtnText: {
    fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', color: Colors.outline,
  },
  windowBtnTextActive: { color: Colors.primary, fontWeight: '800' },

  /* Chart Card (shared) */
  chartCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 14 },
      android: { elevation: 3 },
    }),
  },
  sectionTitle: {
    fontSize: 17, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', color: Colors.onSurface,
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', color: Colors.outline,
    marginBottom: 12,
  },

  /* Exercise Picker */
  chartHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
  },
  exercisePicker: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceContainerLow, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, maxWidth: '55%',
  },
  exercisePickerText: {
    fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '700',
    color: Colors.onSurface, flexShrink: 1,
  },
  pickerDropdown: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 14, padding: 6,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh, marginBottom: 8,
  },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
  },
  pickerItemActive: { backgroundColor: '#eff2ff' },
  pickerItemText: {
    fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', color: Colors.onSurface,
  },
  pickerItemTextActive: { color: Colors.primary, fontWeight: '700' },

  /* 1RM badge */
  ormBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  ormValue: {
    fontSize: 28, fontFamily: 'Plus Jakarta Sans', fontWeight: '900', color: Colors.onSurface,
  },
  ormUnit: { fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', color: Colors.outline },
  ormChange: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, marginLeft: 6,
  },
  ormChangeText: { fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontWeight: '800' },

  /* Volume Chart */
  volumeBars: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    height: 140, paddingTop: 16,
  },
  volumeCol: { flex: 1, alignItems: 'center', gap: 6 },
  volumeBarPair: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 120,
  },
  volumeBar: { width: 14 },
  volumeLabel: {
    fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '700',
    color: Colors.outline, textAlign: 'center',
  },
  volumeChangeText: {
    fontSize: 9, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', textAlign: 'center',
  },
  volumeLegend: {
    flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 14,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.surfaceContainerLow,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSquare: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', color: Colors.outline },

  /* PR Table */
  prHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  sortRow: { flexDirection: 'row', gap: 6 },
  sortChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    backgroundColor: Colors.surfaceContainerLow,
  },
  sortChipActive: { backgroundColor: Colors.primary },
  sortChipText: {
    fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', color: Colors.outline,
  },
  sortChipTextActive: { color: '#fff' },
  tableRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8,
    borderRadius: 8,
  },
  tableRowAlt: { backgroundColor: Colors.surfaceContainerLow },
  tableHeader: {
    fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '800',
    color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  tableCell: { fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', color: Colors.onSurface },
  tableCellBold: { fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', color: Colors.onSurface },
  tableCellDate: { fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', color: Colors.outline },

  /* Heatmap */
  heatmapContainer: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  heatmapDayLabels: { gap: 3 },
  heatmapDayText: {
    fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '600',
    color: Colors.outline, lineHeight: 12,
  },
  heatmapGrid: { flexDirection: 'row', gap: 3 },
  heatmapCol: { gap: 3 },
  heatmapCell: {},
  heatmapLegend: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  heatmapLegendText: {
    fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '600',
    color: Colors.outline, marginHorizontal: 4,
  },
  heatmapLegendCell: { width: 12, height: 12, borderRadius: 3 },

  /* Body Map */
  bodyMapSummary: {
    flexDirection: 'row', gap: 24, marginBottom: 16,
  },
  bodyMapStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bodyMapDot: { width: 10, height: 10, borderRadius: 5 },
  bodyMapStatText: {
    fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', color: Colors.onSurface,
  },
  muscleGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  muscleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12,
  },
  muscleChipText: {
    fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '700',
  },
  muscleChipCount: {
    fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontWeight: '800',
  },
});
