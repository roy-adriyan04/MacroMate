import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const DIETS = [
  { id: 'vegan', title: 'Vegan', desc: 'Plant-based lifestyle', icon: 'eco' },
  { id: 'keto', title: 'Keto', desc: 'High fat, low carb', icon: 'bolt' },
  { id: 'paleo', title: 'Paleo', desc: 'Hunter-gatherer diet', icon: 'fitness-center' },
  { id: 'gluten_free', title: 'Gluten-Free', desc: 'Celiac safe options', icon: 'grass' },
  { id: 'vegetarian', title: 'Vegetarian', desc: 'Meat-free living', icon: 'egg-alt' },
  { id: 'none', title: 'None', desc: 'I eat everything', icon: 'restaurant' },
];

export default function DietaryPreferencesScreen() {
  const router = useRouter();
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);

  const handleNext = async () => {
    if (selectedDiet) {
      await AsyncStorage.setItem('onboarding_diet', selectedDiet);
      router.push('/(onboarding)/metrics-and-gender');
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
        <TouchableOpacity onPress={() => router.push('/(onboarding)/metrics-and-gender')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>STEP 3 OF 5</Text>
            <Text style={styles.progressPercent}>60%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>Any dietary preferences?</Text>
          <Text style={styles.subtitle}>We'll tailor your meal plans and recommendations to fit your lifestyle.</Text>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {DIETS.map((diet) => {
            const isActive = selectedDiet === diet.id;
            return (
              <TouchableOpacity
                key={diet.id}
                style={[styles.card, isActive && styles.cardActive]}
                onPress={() => setSelectedDiet(diet.id)}
                activeOpacity={0.8}
              >
                {isActive && (
                  <View style={styles.checkIcon}>
                    <MaterialIcons name="check-circle" size={20} color="#005ab2" />
                  </View>
                )}
                <View style={[styles.iconWrapper, isActive ? styles.iconWrapperActive : styles.iconWrapperInactive]}>
                  <MaterialIcons name={diet.icon as any} size={24} color={isActive ? '#005ab2' : '#575c60'} />
                </View>
                <Text style={[styles.cardTitle, isActive && styles.cardTitleActive]}>
                  {diet.title}
                </Text>
                <Text style={[styles.cardDesc, isActive && styles.cardDescActive]}>
                  {diet.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !selectedDiet && styles.continueButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedDiet}
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
    color: '#005ab2',
    fontWeight: '700',
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 130,
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
    textTransform: 'uppercase',
  },
  progressPercent: {
    color: '#005ab2',
    fontWeight: '800',
    fontSize: 20,
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
    backgroundColor: '#005ab2',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: (width - 48 - 16) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    position: 'relative',
  },
  cardActive: {
    backgroundColor: '#64a1ff', // primary-container
    shadowColor: '#005ab2',
    shadowOpacity: 0.2,
    borderWidth: 2,
    borderColor: '#005ab2',
  },
  checkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconWrapperInactive: {
    backgroundColor: '#ecf1f6',
  },
  iconWrapperActive: {
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2a2f32',
    marginBottom: 4,
  },
  cardTitleActive: {
    color: '#00224a',
  },
  cardDesc: {
    fontSize: 12,
    color: '#575c60',
  },
  cardDescActive: {
    color: 'rgba(0, 34, 74, 0.7)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: 'rgba(243, 247, 251, 0.9)',
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backText: {
    color: '#005ab2',
    fontSize: 18,
    fontWeight: '700',
  },
  continueButton: {
    flex: 2,
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
