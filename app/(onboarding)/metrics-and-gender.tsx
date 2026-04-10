import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MetricsScreen() {
  const router = useRouter();
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null);
  const [customGender, setCustomGender] = useState('');
  
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');

  const handleNext = async () => {
    if (isFormValid) {
      const metrics = {
        unit,
        gender: gender === 'other' ? customGender : gender,
        height,
        weight,
        targetWeight
      };
      await AsyncStorage.setItem('onboarding_metrics', JSON.stringify(metrics));
      router.push('/(onboarding)/buddy-invite');
    }
  };

  const isFormValid = height && weight && targetWeight && gender && (gender !== 'other' || customGender.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f7fb" />
      
      {/* Top Nav */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={24} color="#005ab2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MacroMate</Text>
        <TouchableOpacity onPress={() => router.push('/(onboarding)/buddy-invite')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Progress Section */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>ONBOARDING PROGRESS</Text>
              <Text style={styles.progressPercent}>80%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '80%' }]} />
            </View>
          </View>

          {/* Headline */}
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>Tell us about yourself</Text>
            <Text style={styles.subtitle}>This helps us calculate your daily caloric needs accurately.</Text>
          </View>

          {/* Unit Toggle */}
          <View style={styles.unitToggleContainer}>
            <TouchableOpacity 
              style={[styles.unitToggleButton, unit === 'metric' && styles.unitToggleButtonActive]}
              onPress={() => setUnit('metric')}
            >
              <Text style={[styles.unitToggleText, unit === 'metric' && styles.unitToggleTextActive]}>Metric</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.unitToggleButton, unit === 'imperial' && styles.unitToggleButtonActive]}
              onPress={() => setUnit('imperial')}
            >
              <Text style={[styles.unitToggleText, unit === 'imperial' && styles.unitToggleTextActive]}>Imperial</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            
            {/* Gender Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabelMuted}>Gender</Text>
              
              <View style={styles.genderToggleContainer}>
                <TouchableOpacity 
                  style={[styles.genderToggleButton, gender === 'male' && styles.genderToggleButtonActive]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[styles.genderToggleText, gender === 'male' && styles.genderToggleTextActive]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.genderToggleButton, gender === 'female' && styles.genderToggleButtonActive]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[styles.genderToggleText, gender === 'female' && styles.genderToggleTextActive]}>Female</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.genderToggleButton, gender === 'other' && styles.genderToggleButtonActive]}
                  onPress={() => setGender('other')}
                >
                  <Text style={[styles.genderToggleText, gender === 'other' && styles.genderToggleTextActive]}>Other</Text>
                </TouchableOpacity>
              </View>

              {/* Specify Identity if Other */}
              {gender === 'other' && (
                <View style={[styles.inputWrapper, { marginTop: 8 }]}>
                  <TextInput
                    style={[styles.input, { fontSize: 18 }]}
                    placeholder="Please specify your identity"
                    placeholderTextColor="#a9aeb1"
                    value={customGender}
                    onChangeText={setCustomGender}
                  />
                </View>
              )}
            </View>

            {/* Height */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={unit === 'metric' ? "175" : "70"}
                  placeholderTextColor="#a9aeb1"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
                <Text style={styles.inputSuffix}>{unit === 'metric' ? 'cm' : 'in'}</Text>
              </View>
            </View>

            {/* Weights */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Current Weight</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder={unit === 'metric' ? "82.5" : "180"}
                    placeholderTextColor="#a9aeb1"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                  <Text style={styles.inputSuffix}>{unit === 'metric' ? 'kg' : 'lbs'}</Text>
                </View>
              </View>
              
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Target Weight</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder={unit === 'metric' ? "75.0" : "165"}
                    placeholderTextColor="#a9aeb1"
                    keyboardType="numeric"
                    value={targetWeight}
                    onChangeText={setTargetWeight}
                  />
                  <Text style={styles.inputSuffix}>{unit === 'metric' ? 'kg' : 'lbs'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Info Card - Volumetric Goal */}
          {targetWeight ? (
            <View style={styles.infoCard}>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Volumetric Goal</Text>
                <Text style={styles.infoDesc}>
                  We'll adjust your macros to hit your target safely.
                </Text>
              </View>
              <View style={styles.infoIconWrapper}>
                <MaterialIcons name="trending-down" size={32} color="#006949" />
              </View>
              {/* Decorative element simulated with absolute positioning and opacity */}
              <View style={styles.decorativeGlow} />
            </View>
          ) : null}
          
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]}
          onPress={handleNext}
          disabled={!isFormValid as boolean}
        >
          <Text style={styles.continueText}>Next Step</Text>
          <MaterialIcons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>
        
        {/* Decorative pagination indicator */}
        <View style={styles.paginationIndicators}>
          <View style={styles.pageDot} />
          <View style={styles.pageDot} />
          <View style={styles.pageDot} />
          <View style={styles.pageDotActive} />
          <View style={styles.pageDot} />
        </View>
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
    paddingBottom: 200,
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
    fontWeight: '800',
    fontSize: 14,
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#dde3e8',
    borderRadius: 6,
    overflow: 'hidden',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#005ab2', // Should be primary gradient matching HTML visually
    borderRadius: 4,
  },
  headlineContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2a2f32',
    lineHeight: 40,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#575c60',
    fontWeight: '500',
    lineHeight: 24,
    textAlign: 'center',
  },
  unitToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ecf1f6',
    borderRadius: 30,
    padding: 4,
    marginBottom: 32,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  unitToggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 26,
  },
  unitToggleButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  unitToggleText: {
    color: '#575c60',
    fontWeight: '700',
    fontSize: 16,
  },
  unitToggleTextActive: {
    color: '#005ab2',
  },
  formSection: {
    gap: 24,
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2a2f32',
    marginLeft: 8,
  },
  inputLabelMuted: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2a2f32',
    marginLeft: 8,
  },
  genderToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ecf1f6',
    borderRadius: 30,
    padding: 4,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  genderToggleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 26,
  },
  genderToggleButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  genderToggleText: {
    color: '#575c60',
    fontWeight: '700',
    fontSize: 16,
  },
  genderToggleTextActive: {
    color: '#005ab2',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dde3e8',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#fff',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 18,
    fontSize: 20,
    fontWeight: '700',
    color: '#004e9c', // primary-dim
  },
  inputSuffix: {
    paddingRight: 24,
    fontSize: 18,
    fontWeight: '800',
    color: '#575c60',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginTop: 40,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  infoTextContainer: {
    flex: 1,
    marginRight: 16,
    zIndex: 2,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2a2f32',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 14,
    color: '#575c60',
  },
  infoIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#8efecb',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '3deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 2,
  },
  decorativeGlow: {
    position: 'absolute',
    right: -16,
    bottom: -16,
    width: 96,
    height: 96,
    backgroundColor: 'rgba(0, 90, 178, 0.05)',
    borderRadius: 48,
    zIndex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: 'rgba(243, 247, 251, 0.95)',
  },
  continueButton: {
    backgroundColor: '#005ab2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
    gap: 12,
    shadowColor: '#005ab2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 24,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  paginationIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d7dee3',
  },
  pageDotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#005ab2',
    shadowColor: '#005ab2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
