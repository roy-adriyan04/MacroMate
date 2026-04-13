import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile } from '../lib/firebase';

export type WeightUnit = 'kg' | 'lbs';

interface WorkoutContextType {
  isWorkoutActive: boolean;
  elapsedSeconds: number;
  userUnit: WeightUnit;
  startWorkout: () => void;
  finishWorkout: () => void;
  formatTime: (seconds: number) => string;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [userUnit, setUserUnit] = useState<WeightUnit>('lbs');
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<any>(null);

  // Load the user's preferred unit from Firestore / AsyncStorage
  const { user } = useUser();
  useEffect(() => {
    async function loadUnit() {
      if (!user) return;
      try {
        const profile = await getUserProfile(user.id);
        let prefs = profile?.preferences;
        if (!prefs) {
          const cachedJson = await AsyncStorage.getItem('onboarding_metrics');
          if (cachedJson) prefs = { metrics: JSON.parse(cachedJson) };
        }
        if (prefs?.metrics?.unit) {
          setUserUnit(prefs.metrics.unit === 'metric' ? 'kg' : 'lbs');
        }
      } catch {}
    }
    loadUnit();
  }, [user]);

  const startWorkout = () => {
    if (isWorkoutActive) return;
    setIsWorkoutActive(true);
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
  };

  const finishWorkout = () => {
    setIsWorkoutActive(false);
    setElapsedSeconds(0);
    startTimeRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isWorkoutActive && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - (startTimeRef.current || now)) / 1000);
        setElapsedSeconds(diff);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isWorkoutActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <WorkoutContext.Provider value={{
      isWorkoutActive,
      elapsedSeconds,
      userUnit,
      startWorkout,
      finishWorkout,
      formatTime
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
