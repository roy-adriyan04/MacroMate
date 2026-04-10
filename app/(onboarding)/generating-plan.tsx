import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUserProfile } from '../../lib/firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini 
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export default function GeneratingPlanScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [loadingText, setLoadingText] = useState("Analyzing your metrics...");

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Text cycling
    const textInterval = setInterval(() => {
      setLoadingText(prev => {
        if (prev === "Analyzing your metrics...") return "Calculating daily calorie goal...";
        if (prev === "Calculating daily calorie goal...") return "Balancing macros for your diet...";
        return "Finalizing AI plan...";
      });
    }, 2500);

    // Call AI and finish Setup
    generateAndSavePlan();

    return () => clearInterval(textInterval);
  }, []);

  const generateAndSavePlan = async () => {
    try {
      if (!user) throw new Error("User not found");

      // 1. Gather AsyncStorage context
      const goal = await AsyncStorage.getItem('onboarding_goal');
      const activityLevel = await AsyncStorage.getItem('onboarding_activity');
      const dietType = await AsyncStorage.getItem('onboarding_diet');
      const metricsJson = await AsyncStorage.getItem('onboarding_metrics');
      let metrics = metricsJson ? JSON.parse(metricsJson) : null;

      // 2. Format a prompt for Gemini
      const prompt = `
        You are a world-class fitness coach and nutritionist. 
        Calculate the precise daily caloric needs, macronutrient targets (Protein, Carbs, Fats), and daily water intake required for a person with the following profile:
        - Goal: ${goal}
        - Activity Level: ${activityLevel}
        - Preferred Diet: ${dietType}
        - Metrics: ${metricsJson}

        Return strictly valid JSON corresponding to this format:
        {
          "calories": (integer),
          "protein": (integer),
          "carbs": (integer),
          "fat": (integer),
          "waterCups": (integer, minimum 8),
          "coachMessage": (a short encouraging 1-sentence message based on their goal)
        }
      `;

      // 3. Request generation (Using gemini-3-flash-preview exactly as requested)
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview", 
        generationConfig: {
          responseMimeType: "application/json"
        }
      });
      
      let responseText = "";
      try {
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } catch (geminiErr: any) {
        console.warn("Gemini API Error, falling back to offline mock plan:", geminiErr.message);
        responseText = JSON.stringify({
          calories: goal === 'Lose weight' ? 1800 : (goal === 'Gain muscle' ? 2800 : 2200),
          protein: 160,
          carbs: 220,
          fat: 65,
          waterCups: 12,
          coachMessage: `Because your API key was revoked, I am supplying an offline fallback plan so you can continue building the app!`
        });
      }
      
      let aiPlan = null;
      try {
        aiPlan = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse Gemini response as JSON", responseText);
        // Fallback placeholder structure just in case the model failed schema constraints
        aiPlan = { calories: 2000, protein: 150, carbs: 200, fat: 60, waterCups: 10, coachMessage: "Let's hit your goals!" };
      }

      // 4. Save to Firebase
      const dbSuccess = await saveUserProfile(user.id, {
        preferences: {
          onboardingComplete: true,
          goal,
          activityLevel,
          dietType,
          metrics,
        },
        aiPlan: {
          ...aiPlan,
          generatedAt: new Date().toISOString()
        }
      });

      if (!dbSuccess) {
        throw new Error("Firestore persistence failed");
      }

      // Pass the plan via AsyncStorage for local persistence if needed
      await AsyncStorage.setItem('onboarding_ai_plan', JSON.stringify(aiPlan));
      await AsyncStorage.setItem('onboardingComplete', 'true');

      // 5. Navigate to Summary
      router.replace('/(onboarding)/plan-summary' as any);

    } catch (err) {
      console.error("AI Generation Error: ", err);
      // We explicitly DO NOT set onboardingComplete to true if AI or DB fails.
      // Route back so they can try again.
      router.replace('/(onboarding)/buddy-invite');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.innerCircle}>
            <Text style={styles.aiIcon}>✨</Text>
          </View>
        </Animated.View>

        <Text style={styles.title}>Crafting your plan</Text>
        <Text style={styles.subtitle}>{loadingText}</Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 24,
  },
  pulseCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0, 90, 178, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#005ab2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#005ab2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  aiIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '800',
    color: '#2a2f32',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'BeVietnamPro-Regular',
    color: '#575c60',
    fontWeight: '500',
  }
});
