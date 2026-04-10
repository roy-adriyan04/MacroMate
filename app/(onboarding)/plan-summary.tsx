import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';

export default function PlanSummaryScreen() {
  const router = useRouter();
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const planJson = await AsyncStorage.getItem('onboarding_ai_plan');
        if (planJson) {
          setAiPlan(JSON.parse(planJson));
        } else {
          throw new Error("No cached plan found");
        }
      } catch (e) {
        console.warn("Failed to parse cached AI plan, providing fallback", e);
        setAiPlan({
          calories: 2100,
          protein: 150,
          carbs: 200,
          fat: 60,
          waterCups: 10,
          coachMessage: "Let's hit today's targets!"
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadPlan();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header Ribbon */}
        <View style={styles.headerRibbon}>
          <Text style={styles.ribbonText}>AI GENERATED PLAN</Text>
        </View>

        <Text style={styles.headline}>Your Path to Vitality</Text>
        
        <View style={[styles.clayCard, styles.coachCard]}>
          <View style={styles.coachAvatar}>
            <MaterialIcons name="auto-awesome" size={24} color="#005ab2" />
          </View>
          <Text style={styles.coachMessage}>"{aiPlan.coachMessage}"</Text>
        </View>

        {/* Hero Calories */}
        <View style={styles.heroRow}>
          <View style={[styles.clayCard, styles.heroCard]}>
            <Text style={styles.cardEyebrow}>DAILY CALORIES</Text>
            <View style={styles.calorieRow}>
              <Text style={styles.calorieValue}>{aiPlan.calories}</Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>
          </View>
          
          <View style={[styles.clayCard, styles.heroCard, { flex: 0.7 }]}>
            <Text style={styles.cardEyebrow}>HYDRATION</Text>
            <View style={styles.calorieRow}>
              <Text style={styles.calorieValue}>{aiPlan.waterCups}</Text>
              <Text style={styles.calorieUnit}>cups</Text>
            </View>
          </View>
        </View>

        {/* Macros Breakdown */}
        <Text style={styles.sectionTitle}>Targets</Text>
        
        <View style={styles.macrosContainer}>
          <View style={[styles.clayCard, styles.macroCard]}>
            <View style={[styles.macroIcon, { backgroundColor: 'rgba(0, 105, 73, 0.1)' }]}>
              <MaterialIcons name="egg-alt" size={20} color={Colors.tertiary} />
            </View>
            <Text style={styles.macroValue}>{aiPlan.protein}g</Text>
            <Text style={[styles.macroLabel, { color: Colors.tertiary }]}>PROTEIN</Text>
          </View>

          <View style={[styles.clayCard, styles.macroCard]}>
            <View style={[styles.macroIcon, { backgroundColor: 'rgba(0, 90, 178, 0.1)' }]}>
              <MaterialIcons name="breakfast-dining" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.macroValue}>{aiPlan.carbs}g</Text>
            <Text style={[styles.macroLabel, { color: Colors.primary }]}>CARBS</Text>
          </View>

          <View style={[styles.clayCard, styles.macroCard]}>
            <View style={[styles.macroIcon, { backgroundColor: 'rgba(145, 71, 9, 0.1)' }]}>
              <MaterialIcons name="water-drop" size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.macroValue}>{aiPlan.fat}g</Text>
            <Text style={[styles.macroLabel, { color: Colors.secondary }]}>FAT</Text>
          </View>
        </View>

      </ScrollView>

      {/* Floating Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(app)')}>
          <Text style={styles.primaryButtonText}>Go to Home</Text>
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 120,
    gap: 24,
  },
  clayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  headerRibbon: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 90, 178, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  ribbonText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '800',
    color: '#005ab2',
    letterSpacing: 1,
  },
  headline: {
    fontSize: 36,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '900',
    color: '#2a2f32',
    lineHeight: 42,
  },
  coachCard: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ecf1f6',
    borderWidth: 1,
    borderColor: '#dde3e8',
  },
  coachAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  coachMessage: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'BeVietnamPro-Regular',
    fontWeight: '600',
    color: '#004e9c',
    fontStyle: 'italic',
  },
  heroRow: {
    flexDirection: 'row',
    gap: 16,
  },
  heroCard: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  cardEyebrow: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '800',
    letterSpacing: 1,
    color: '#575c60',
    marginBottom: 8,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  calorieValue: {
    fontSize: 36,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '900',
    color: '#005ab2',
    letterSpacing: -1,
  },
  calorieUnit: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-Regular',
    fontWeight: '600',
    color: '#575c60',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '800',
    color: '#2a2f32',
    marginTop: 8,
  },
  macrosContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  macroCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  macroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '900',
    color: '#2a2f32',
  },
  macroLabel: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '800',
    letterSpacing: 1,
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
  primaryButton: {
    backgroundColor: '#005ab2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#005ab2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '800',
  }
});
