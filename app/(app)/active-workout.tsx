import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useWorkout } from '../../context/WorkoutContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ExerciseSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  prevWeight: number;
  prevReps: number;
  note?: string;
  isPR?: boolean;
}

export interface ExerciseItem {
  id: string;
  name: string;
  target: string;
  sets: ExerciseSet[];
}

export default function ActiveWorkout() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{
    addExerciseId?: string;
    addExerciseName?: string;
    addExerciseTarget?: string;
    mode?: string;
    programExercises?: string;
    programName?: string;
  }>();

  // Build initial exercises based on how we arrived here
  const buildInitialExercises = (): ExerciseItem[] => {
    if (searchParams.mode === 'new') {
      return []; // blank workout
    }
    if (searchParams.mode === 'repeat' && searchParams.programExercises) {
      try {
        const parsed = JSON.parse(searchParams.programExercises as string) as { name: string; target: string; sets: number }[];
        return parsed.map((ex, i) => ({
          id: `rep-${i}-${Date.now()}`,
          name: ex.name,
          target: ex.target,
          sets: Array.from({ length: ex.sets }, (_, si) => ({
            id: `s-rep-${i}-${si}`,
            weight: '',
            reps: '',
            completed: false,
            prevWeight: 0,
            prevReps: 0,
          })),
        }));
      } catch { return []; }
    }
    // Default: mock data (legacy, for when opened directly)
    return [
      {
        id: 'ex-1',
        name: 'Barbell Bench Press',
        target: 'Chest / Push',
        sets: [
          { id: 's-1-1', weight: '135', reps: '10', completed: true, prevWeight: 135, prevReps: 10 },
          { id: 's-1-2', weight: '185', reps: '8', completed: false, prevWeight: 185, prevReps: 8 },
          { id: 's-1-3', weight: '', reps: '', completed: false, prevWeight: 200, prevReps: 5 },
        ]
      },
      {
        id: 'ex-2',
        name: 'Incline Dumbbell Press',
        target: 'Upper Chest',
        sets: [
          { id: 's-2-1', weight: '', reps: '', completed: false, prevWeight: 65, prevReps: 10 }
        ]
      },
      {
        id: 'ex-3',
        name: 'Tricep Rope Pushdown',
        target: 'Triceps',
        sets: [
          { id: 's-3-1', weight: '', reps: '', completed: false, prevWeight: 45, prevReps: 15 }
        ]
      }
    ];
  };

  const [exercises, setExercises] = useState<ExerciseItem[]>(buildInitialExercises);

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const currentExercise = exercises[currentExIndex];
  
  const { user } = useUser();
  const { isWorkoutActive, elapsedSeconds, startWorkout, finishWorkout, formatTime, userUnit } = useWorkout();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // Snapshot of previous session data — used to populate the "Previous" column on new sets
  const lastSessionRef = useRef(
    exercises.map(ex => ({
      id: ex.id,
      sets: ex.sets.map(s => ({ prevWeight: s.prevWeight, prevReps: s.prevReps }))
    }))
  );

  // Watch for exercise added from the library
  useEffect(() => {
    if (searchParams.addExerciseId && searchParams.addExerciseName) {
      // Check if this exercise is already in the list (avoid duplicates on re-render)
      const alreadyExists = exercises.some(e => e.id === searchParams.addExerciseId);
      if (!alreadyExists) {
        const newExercise: ExerciseItem = {
          id: searchParams.addExerciseId,
          name: searchParams.addExerciseName,
          target: searchParams.addExerciseTarget || '',
          sets: [{
            id: `s-${searchParams.addExerciseId}-1`,
            weight: '',
            reps: '',
            completed: false,
            prevWeight: 0,
            prevReps: 0,
          }],
        };
        setExercises(prev => [...prev, newExercise]);
        // Auto-select the newly added exercise
        setCurrentExIndex(exercises.length);
      }
    }
  }, [searchParams.addExerciseId]);



  useEffect(() => {
    if (!isWorkoutActive) {
      startWorkout();
    }
  }, []);

  const updateSet = (setId: string, field: 'weight' | 'reps' | 'note', value: string) => {
    setExercises(prev => prev.map(ex => {
      // Find the exercise that contains this set
      const hasSet = ex.sets.some(s => s.id === setId);
      if (!hasSet) return ex;
      
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id === setId) {
            const newSet = { ...s, [field]: value };
            if (field === 'weight' || field === 'reps') {
              const currentW = parseFloat(newSet.weight) || 0;
              const currentR = parseFloat(newSet.reps) || 0;
              // PR Logic: weight > maxWeight OR reps > maxReps
              newSet.isPR = (currentW > s.prevWeight) || (currentR > s.prevReps);
            }
            return newSet;
          }
          return s;
        })
      };
    }));
  };

  const toggleSetComplete = (setId: string) => {
    setExercises(prev => prev.map(ex => {
      const hasSet = ex.sets.some(s => s.id === setId);
      if (!hasSet) return ex;
      
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
      };
    }));
  };

  const removeSet = (exId: string, setId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      if (ex.sets.length <= 1) return ex; // keep at least 1 set
      return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
    }));
  };

  const addSet = (exId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      
      const newSetIndex = ex.sets.length; // 0-based index of the new set
      
      // Look up what was done in session for this set position
      const lastSessionEx = lastSessionRef.current.find(e => e.id === exId);
      const lastSessionSet = lastSessionEx?.sets[newSetIndex];
      
      const newSet: ExerciseSet = {
        id: `s-${exId}-${Date.now()}`,
        weight: '',
        reps: '',
        completed: false,
        prevWeight: lastSessionSet ? lastSessionSet.prevWeight : 0,
        prevReps: lastSessionSet ? lastSessionSet.prevReps : 0,
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    }));
  };

  const moveExercise = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= exercises.length) return;
    
    setExercises(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
    
    // Keep currentExIndex tracking the same exercise
    if (currentExIndex === fromIndex) {
      setCurrentExIndex(toIndex);
    } else if (currentExIndex === toIndex) {
      setCurrentExIndex(fromIndex);
    }
  };

  const renderQueueItem = (item: ExerciseItem, index: number) => {
    const isCurrent = item.id === currentExercise?.id;
    const isFirst = index === 0;
    const isLast = index === exercises.length - 1;
    return (
      <View
        key={item.id}
        style={[styles.queueItem, isCurrent && styles.queueItemCurrent]}
      >
        {/* Reorder buttons */}
        <View style={styles.reorderBtns}>
          <TouchableOpacity 
            onPress={() => moveExercise(index, 'up')} 
            style={[styles.reorderBtn, isFirst && styles.reorderBtnDisabled]}
            disabled={isFirst}
          >
            <MaterialIcons name="keyboard-arrow-up" size={18} color={isFirst ? Colors.surfaceVariant : Colors.outline} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => moveExercise(index, 'down')} 
            style={[styles.reorderBtn, isLast && styles.reorderBtnDisabled]}
            disabled={isLast}
          >
            <MaterialIcons name="keyboard-arrow-down" size={18} color={isLast ? Colors.surfaceVariant : Colors.outline} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            const idx = exercises.findIndex(e => e.id === item.id);
            if(idx !== -1) setCurrentExIndex(idx);
          }}
          style={styles.queueItemTouchable}
        >
          <View style={styles.queueItemContent}>
            <Text style={[styles.queueItemName, isCurrent && {color: Colors.primary}]}>{item.name}</Text>
            <Text style={styles.queueItemTarget}>{item.target}</Text>
          </View>
          <View style={styles.queueItemStatus}>
            {isCurrent ? (
              <MaterialIcons name="play-arrow" size={20} color={Colors.primary} />
            ) : item.sets.every(s => s.completed) ? (
              <MaterialIcons name="check-circle" size={20} color={Colors.tertiary} />
            ) : null}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.footerActions}>
      <TouchableOpacity style={styles.secondaryBtn} onPress={() => {
        router.push({ pathname: '/(app)/exercise-library', params: { from: 'workout' } });
      }}>
        <MaterialIcons name="add" size={20} color={Colors.primary} />
        <Text style={styles.secondaryBtnText}>Add Exercise</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.secondaryBtn}>
        <MaterialIcons name="link" size={20} color={Colors.secondary} />
        <Text style={[styles.secondaryBtnText, {color: Colors.secondary}]}>Link as Superset / Drop set</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.finishBtn} onPress={() => {
        // Build summary data from the current session
        const summaryExercises = exercises.map(ex => ({
          name: ex.name,
          target: ex.target,
          setsCompleted: ex.sets.filter(s => s.completed).length,
          totalSets: ex.sets.length,
          topWeight: Math.max(...ex.sets.map(s => parseFloat(s.weight) || 0)),
          topReps: Math.max(...ex.sets.map(s => parseInt(s.reps) || 0)),
          volume: ex.sets.reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0),
          isPR: ex.sets.some(s => s.isPR),
        }));

        finishWorkout();
        router.replace({
          pathname: '/(app)/workout-summary',
          params: {
            duration: String(elapsedSeconds),
            exercisesJson: JSON.stringify(summaryExercises),
          },
        });
      }}>
        <Text style={styles.finishBtnText}>Finish Workout</Text>
        <MaterialIcons name="flag" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.currentExWrapper}>
      {currentExercise ? (
        <View style={styles.currentExCard}>
          <Text style={styles.exName}>{currentExercise.name}</Text>
          <Text style={styles.exTarget}>{currentExercise.target}</Text>

          <View style={styles.setsContainer}>
            <View style={styles.setsHeader}>
              <Text style={[styles.colHeader, styles.colSet]}>SET</Text>
              <Text style={[styles.colHeader, styles.colPrev]}>PREVIOUS</Text>
              <Text style={[styles.colHeader, styles.colLogged]}>LOGGED</Text>
              <View style={styles.colActions} />
            </View>
            
            {currentExercise.sets.map((s, idx) => (
              <View key={s.id}>
                <View style={[styles.setRow, s.completed && styles.setRowCompleted]}>
                  <View style={styles.colSet}>
                    <View style={styles.setNumBadge}>
                      <Text style={styles.setNum}>{idx + 1}</Text>
                    </View>
                  </View>
                  <View style={styles.colPrev}>
                    <Text style={styles.prevText}>
                      {s.prevWeight === 0 && s.prevReps === 0
                        ? '—'
                        : `${s.prevWeight} ${userUnit} x ${s.prevReps}`}
                    </Text>
                  </View>
                  
                  <View style={styles.colLoggedInputs}>
                    <TextInput 
                      style={styles.inputBox}
                      keyboardType="numeric"
                      placeholder={userUnit}
                      placeholderTextColor={Colors.outlineVariant}
                      value={s.weight}
                      onChangeText={(val) => updateSet(s.id, 'weight', val)}
                    />
                    <Text style={styles.inputX}>x</Text>
                    <TextInput 
                      style={styles.inputBox}
                      keyboardType="numeric"
                      placeholder="reps"
                      placeholderTextColor={Colors.outlineVariant}
                      value={s.reps}
                      onChangeText={(val) => updateSet(s.id, 'reps', val)}
                    />
                    {s.isPR && (
                      <View style={styles.prBadge}>
                        <Text style={styles.prText}>PR</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.actionsRow}>
                    <TouchableOpacity 
                      style={styles.noteBtn} 
                      onPress={() => setEditingNoteId(editingNoteId === s.id ? null : s.id)}
                    >
                      <MaterialIcons name="edit-note" size={24} color={s.note ? Colors.primary : Colors.outlineVariant} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSetComplete(s.id)} style={[styles.tickBtn, s.completed && styles.tickBtnActive]}>
                      <MaterialIcons name="check" size={18} color={s.completed ? "#fff" : Colors.outlineVariant} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeSet(currentExercise.id, s.id)} style={styles.removeSetBtn}>
                      <MaterialIcons name="close" size={14} color={Colors.outline} />
                    </TouchableOpacity>
                  </View>
                </View>
                {editingNoteId === s.id && (
                  <View style={styles.noteInputWrapper}>
                    <TextInput 
                      style={styles.noteInput}
                      placeholder="Add a note for this set..."
                      value={s.note}
                      onChangeText={(val) => updateSet(s.id, 'note', val)}
                      autoFocus
                    />
                  </View>
                )}
              </View>
            ))}
            
            <TouchableOpacity style={styles.addSetRowBtn} onPress={() => addSet(currentExercise.id)}>
              <MaterialIcons name="add" size={20} color={Colors.outline} />
              <Text style={styles.addSetRowText}>Add Set</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.queueHeader}>Up Next</Text>
        </View>
      ) : (
        <View style={styles.emptyWorkoutCard}>
          <View style={styles.emptyIconWrap}>
            <MaterialIcons name="fitness-center" size={40} color={Colors.outlineVariant} />
          </View>
          <Text style={styles.emptyTitle}>No Exercises Yet</Text>
          <Text style={styles.emptySubtitle}>Tap "Add Exercise" below to build your workout</Text>
          <TouchableOpacity
            style={styles.emptyAddBtn}
            onPress={() => router.push({ pathname: '/(app)/exercise-library', params: { from: 'workout' } })}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.emptyAddBtnText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, backgroundColor: Colors.surface }]}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace({ pathname: '/(app)', params: { tab: 'Workouts' } })} style={styles.closeBtn}>
          <MaterialIcons name="close" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Active Workout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.listContent, { paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {renderHeader()}
        
        {exercises.map((item, index) => renderQueueItem(item, index))}
        
        {renderFooter()}
      </ScrollView>
      
      {/* Floating Timer Pill */}
      <View style={[styles.floatingTimer, { bottom: 24 + insets.bottom }]}>
        <View style={styles.timerDot} />
        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.onSurface,
  },
  listContent: {
    paddingBottom: 120, // space for nav and buttons
  },
  currentExWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  currentExCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  activeHeader: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.primary,
    marginBottom: 8,
  },
  exName: {
    fontSize: 24,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: '#2a2f32',
    marginBottom: 2,
  },
  exTarget: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '600',
    color: Colors.outline,
    marginBottom: 24,
  },
  setsContainer: {
    gap: 8,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  colHeader: {
    fontSize: 10,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.5,
  },
  colSet: { width: 40, alignItems: 'center' },
  colPrev: { flex: 1, alignItems: 'center' },
  colLogged: { flex: 1.5, alignItems: 'center' },
  colActions: { width: 80 },
  
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
  },
  setRowCompleted: {
    backgroundColor: 'rgba(0, 105, 73, 0.05)',
  },
  setNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ecf1f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNum: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: '#575c60',
  },
  prevText: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '600',
    color: '#999da1',
  },
  colLoggedInputs: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
  },
  inputBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e9ee',
    borderRadius: 8,
    height: 36,
    width: 48,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#2a2f32',
  },
  inputX: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '600',
    color: Colors.outlineVariant,
  },
  prBadge: {
    position: 'absolute',
    top: -10,
    right: -5,
    backgroundColor: '#ffc5a3', // secondary container
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    transform: [{ rotate: '10deg' }],
  },
  prText: {
    fontSize: 8,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: '#833d00',
  },
  actionsRow: {
    width: 100,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  noteBtn: {
    padding: 4,
  },
  tickBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  tickBtnActive: {
    backgroundColor: Colors.tertiary,
    borderColor: Colors.tertiary,
  },
  removeSetBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f0f3f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  queueHeader: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: '#2a2f32',
    marginTop: 32,
    marginBottom: 8,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  queueItemDragging: {
    shadowOpacity: 0.1,
    elevation: 5,
    transform: [{ scale: 1.02 }],
  },
  queueItemCurrent: {
    borderLeftWidth: 4,
    borderColor: Colors.primary,
  },
  queueItemDragHandle: {
    marginRight: 12,
  },
  reorderBtns: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    gap: 2,
  },
  reorderBtn: {
    padding: 2,
    borderRadius: 6,
    backgroundColor: '#f0f3f7',
  },
  reorderBtnDisabled: {
    opacity: 0.4,
  },
  queueItemTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueItemContent: {
    flex: 1,
  },
  queueItemName: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: '#2a2f32',
    marginBottom: 2,
  },
  queueItemTarget: {
    fontSize: 10,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '500',
    color: Colors.outline,
  },
  queueItemStatus: {
    width: 24,
    alignItems: 'center',
  },

  footerActions: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(100, 161, 255, 0.1)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(100, 161, 255, 0.3)',
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.primary,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 99,
    backgroundColor: Colors.tertiary,
    marginTop: 8,
    gap: 12,
    shadowColor: Colors.tertiary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  finishBtnText: {
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '900',
    color: '#fff',
  },

  floatingTimer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2f32',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.errorContainer, // red blinking effect
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  noteInputWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e9ee',
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 8,
    marginHorizontal: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteInput: {
    fontSize: 14,
    fontFamily: 'Be Vietnam Pro',
    color: '#2a2f32',
    minHeight: 40,
    textAlignVertical: 'top',
  },
  addSetRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3e9ee',
    borderStyle: 'dashed',
    gap: 8,
  },
  addSetRowText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: Colors.outline,
  },

  // Empty workout state
  emptyWorkoutCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed' as const,
    borderColor: Colors.surfaceContainerHigh,
    marginBottom: 24,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    color: Colors.outline,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyAddBtnText: {
    fontSize: 15,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#fff',
  },
});

