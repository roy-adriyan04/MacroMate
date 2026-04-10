import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const GOALS = [
  { id: 'lose_weight', title: 'Lose\nweight', icon: 'fitness-center' },
  { id: 'gain_muscle', title: 'Gain\nmuscle', icon: 'directions-run' }, // exercise substitution
  { id: 'maintain_weight', title: 'Maintain\nweight', icon: 'monitor-weight' }, // balance substitution
  { id: 'improve_fitness', title: 'Improve\nfitness', icon: 'bolt' },
];

export default function GoalScreen() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleContinue = async () => {
    if (selectedGoal) {
      await AsyncStorage.setItem('onboarding_goal', selectedGoal);
      router.push('/(onboarding)/activity-level');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f7fb" />
      
      {/* Top Nav */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={24} color="#005ab2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MacroMate</Text>
        <TouchableOpacity onPress={() => router.push('/(onboarding)/activity-level')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>ONBOARDING</Text>
            <Text style={styles.progressPercent}>20%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '20%' }]} />
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>
            What is your {'\n'}
            <Text style={styles.headlinePrimary}>main goal?</Text>
          </Text>
          <Text style={styles.subtitle}>We'll tailor your experience based on this choice.</Text>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {GOALS.map((goal) => {
            const isActive = selectedGoal === goal.id;
            return (
              <TouchableOpacity
                key={goal.id}
                style={[styles.card, isActive && styles.cardActive]}
                onPress={() => setSelectedGoal(goal.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconWrapper, isActive ? styles.iconWrapperActive : styles.iconWrapperInactive]}>
                  <MaterialIcons name={goal.icon as any} size={28} color={isActive ? '#fff' : '#005ab2'} />
                </View>
                <Text style={[styles.cardTitle, isActive && styles.cardTitleActive]}>
                  {goal.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedGoal && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedGoal}
        >
          <Text style={styles.continueText}>Continue</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f7fb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#f3f7fb',
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 10,
  },
  iconButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#005ab2',
    letterSpacing: -0.5,
  },
  skipText: {
    color: '#a9aeb1',
    fontWeight: '700',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 100,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    color: '#575c60',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  progressPercent: {
    color: '#005ab2',
    fontWeight: '700',
    fontSize: 14,
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#e3e9ee',
    borderRadius: 6,
    overflow: 'hidden',
    padding: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#005ab2',
    borderRadius: 4,
  },
  headlineContainer: {
    marginBottom: 40,
  },
  headline: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2a2f32',
    lineHeight: 44,
    marginBottom: 8,
  },
  headlinePrimary: {
    color: '#005ab2',
  },
  subtitle: {
    fontSize: 16,
    color: '#575c60',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: (width - 48 - 16) / 2, // 2 columns, padding 24 on sides, 16 gap
    height: 180,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    // Claymorphism soft shadow simulation
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardActive: {
    backgroundColor: '#005ab2',
    shadowColor: '#005ab2',
    shadowOpacity: 0.3,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperInactive: {
    backgroundColor: 'rgba(0, 90, 178, 0.1)',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2a2f32',
    lineHeight: 24,
  },
  cardTitleActive: {
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: 'rgba(243, 247, 251, 0.9)',
  },
  continueButton: {
    backgroundColor: '#005ab2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#005ab2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
