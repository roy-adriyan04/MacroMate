import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVITY_LEVELS = [
  { id: 'sedentary', title: 'Sedentary', desc: 'Office job, little to no exercise', icon: 'chair' },
  { id: 'lightly_active', title: 'Lightly Active', desc: 'Light exercise 1-3 days/week', icon: 'directions-walk' },
  { id: 'moderately_active', title: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week', icon: 'fitness-center' },
  { id: 'very_active', title: 'Very Active', desc: 'Hard exercise 6-7 days/week', icon: 'directions-run' },
  { id: 'athlete', title: 'Athlete', desc: 'Professional athlete or physical labor', icon: 'bolt' },
];

export default function ActivityLevelScreen() {
  const router = useRouter();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const handleNext = async () => {
    if (selectedActivity) {
      await AsyncStorage.setItem('onboarding_activity', selectedActivity);
      router.push('/(onboarding)/dietary-preferences');
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
        <TouchableOpacity onPress={() => router.push('/(onboarding)/dietary-preferences')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>ONBOARDING</Text>
            <Text style={styles.progressPercent}>40%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '40%' }]} />
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>How active are you?</Text>
          <Text style={styles.subtitle}>This helps us calculate your daily calorie requirements accurately.</Text>
        </View>

        {/* List */}
        <View style={styles.list}>
          {ACTIVITY_LEVELS.map((activity) => {
            const isActive = selectedActivity === activity.id;
            return (
              <TouchableOpacity
                key={activity.id}
                style={[styles.card, isActive && styles.cardActive]}
                onPress={() => setSelectedActivity(activity.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconWrapper, isActive ? styles.iconWrapperActive : styles.iconWrapperInactive]}>
                  <MaterialIcons name={activity.icon as any} size={28} color={isActive ? '#ffffff' : '#005ab2'} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.cardTitle, isActive && styles.cardTitleActive]}>
                    {activity.title}
                  </Text>
                  <Text style={[styles.cardDesc, isActive && styles.cardDescActive]}>
                    {activity.desc}
                  </Text>
                </View>
                <MaterialIcons 
                  name="check-circle" 
                  size={24} 
                  color={isActive ? '#ffffff' : '#a9aeb1'} 
                  style={{ opacity: isActive ? 1 : 0.3 }} 
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedActivity && styles.continueButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedActivity}
        >
          <Text style={styles.continueText}>Next Step</Text>
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
    zIndex: 10,
    elevation: 2,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 130, // Space for fixed footer
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
    color: '#005ab2',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressPercent: {
    color: '#005ab2',
    fontWeight: '800',
    fontSize: 14,
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#dde3e8',
    borderRadius: 6,
    overflow: 'hidden',
    padding: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#006949', // progress indicator color
    borderRadius: 4,
  },
  headlineContainer: {
    marginBottom: 40,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2a2f32',
    lineHeight: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#575c60',
    fontWeight: '500',
    lineHeight: 24,
  },
  list: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardActive: {
    backgroundColor: '#005ab2',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconWrapperInactive: {
    backgroundColor: '#e3e9ee',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2a2f32',
    marginBottom: 4,
  },
  cardTitleActive: {
    color: '#ffffff',
  },
  cardDesc: {
    fontSize: 14,
    color: '#575c60',
  },
  cardDescActive: {
    color: 'rgba(255, 255, 255, 0.9)',
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
    fontWeight: '800',
  },
});
