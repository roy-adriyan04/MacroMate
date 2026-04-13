import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, StatusBar, Dimensions } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { getUserProfile } from '../../lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WorkoutHub from '../../components/WorkoutHub';
import { useWorkout } from '../../context/WorkoutContext';

export default function Home() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(params.tab ? (params.tab as string) : 'Dashboard');
  const { isWorkoutActive, elapsedSeconds, formatTime, userUnit } = useWorkout();

  useEffect(() => {
    if (params.tab) {
      setActiveTab(params.tab as string);
    }
  }, [params.tab]);
  
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [userWeight, setUserWeight] = useState<string>('185.4');

  useEffect(() => {
    async function loadPlan() {
      if (!user) return;
      try {
        const profile = await getUserProfile(user.id);
        
        let prefs = profile?.preferences;
        if (!prefs) {
          const cachedJson = await AsyncStorage.getItem('onboarding_metrics');
          if (cachedJson) prefs = { metrics: JSON.parse(cachedJson) };
        }
        
        if (prefs?.metrics) {
          if (prefs.metrics.weight) {
            setUserWeight(prefs.metrics.weight);
          }
        }

        if (profile?.aiPlan) {
          setAiPlan(profile.aiPlan);
        } else {
          const cached = await AsyncStorage.getItem(`onboarding_ai_plan_${user.id}`);
          if (cached) setAiPlan(JSON.parse(cached));
        }
      } catch (err) {
        console.error("Home plan fetch error", err);
      }
    }
    loadPlan();
  }, [user]);

  // Derived progress values (Mocked at 60% completion for UI preview)
  const targetCals = aiPlan?.calories || 2100;
  const currentCals = Math.floor(targetCals * 0.6);
  const ringCircumference = 502; // 2 * pi * 80 radius
  const completionRatio = Math.min(Math.max(currentCals / targetCals, 0), 1);
  const ringOffset = ringCircumference - (ringCircumference * completionRatio);

  const waterTarget = aiPlan?.waterCups || 10;
  const currentWater = Math.floor(waterTarget * 0.5);

  const { width } = Dimensions.get('window');
  const cardWidth = width - 48; // Full width minus 24px padding on both sides

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f7fb" />
      
      {/* Top AppBar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.profilePicWrapper} onPress={() => signOut()}>
            {user?.imageUrl ? (
              <Image 
                source={{ uri: user.imageUrl }} 
                style={styles.profilePic} 
              />
            ) : (
              <View style={[styles.profilePic, { backgroundColor: '#dde3e8', alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.primary }}>
                  {user?.firstName?.charAt(0) || user?.primaryEmailAddress?.emailAddress?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.appName}>MacroMate</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => console.log("Open Notifications")}>
          <MaterialIcons name="notifications" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'Dashboard' ? (
          <>
        {/* Date Carousel */}
        <View style={styles.dateCarousel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
            <View style={styles.dateItemInactive}>
              <Text style={styles.dateDayInactive}>Mon</Text>
              <Text style={styles.dateNumInactive}>12</Text>
            </View>
            <View style={styles.dateItemInactive}>
              <Text style={styles.dateDayInactive}>Tue</Text>
              <Text style={styles.dateNumInactive}>13</Text>
            </View>
            <View style={styles.dateItemActive}>
              <Text style={styles.dateDayActive}>Wed</Text>
              <Text style={styles.dateNumActive}>14</Text>
              <View style={styles.dateDotActive} />
            </View>
            <View style={styles.dateItemInactive}>
              <Text style={styles.dateDayInactive}>Thu</Text>
              <Text style={styles.dateNumInactive}>15</Text>
            </View>
            <View style={styles.dateItemInactive}>
              <Text style={styles.dateDayInactive}>Fri</Text>
              <Text style={styles.dateNumInactive}>16</Text>
            </View>
          </ScrollView>
        </View>

        {/* Streak Indicator */}
        <View style={styles.streakWrapper}>
          <View style={styles.streakBadge}>
            <MaterialIcons name="local-fire-department" size={20} color={Colors.secondary} />
            <Text style={styles.streakText}>12-day streak</Text>
          </View>
        </View>

        {/* Main Progress Card */}
        <View style={[styles.clayCard, styles.progressCard]}>
          <View style={styles.glowEffect} />
          <View style={styles.progressContainer}>
            
            {/* Calorie Ring */}
            <View style={styles.ringWrapper}>
              <Svg style={{ transform: [{ rotate: '-90deg' }] }} width="192" height="192" viewBox="0 0 192 192">
                <Circle cx="96" cy="96" r="80" stroke="#dde3e8" strokeWidth="16" fill="transparent" />
                <Circle cx="96" cy="96" r="80" stroke="#005ab2" strokeWidth="16" fill="transparent" strokeDasharray={`${ringCircumference}`} strokeDashoffset={`${ringOffset}`} strokeLinecap="round" />
              </Svg>
              <View style={styles.ringTextContainer}>
                <Text style={styles.ringCalories}>{currentCals.toLocaleString()}</Text>
                <Text style={styles.ringGoal}>/ {targetCals.toLocaleString()} KCAL</Text>
              </View>
            </View>

            {/* Macro Bars */}
            <View style={styles.macrosRow}>
              <View style={styles.macroCol}>
                <View style={styles.macroTrack}>
                  <View style={[styles.macroFill, { backgroundColor: Colors.tertiary, width: '60%' }]} />
                </View>
                <View style={styles.macroLabelRow}>
                  <MaterialIcons name="egg-alt" size={14} color={Colors.tertiary} />
                  <Text style={[styles.macroLabel, { color: Colors.tertiary }]}>{aiPlan?.protein || 150}g Protein</Text>
                </View>
              </View>
              <View style={styles.macroCol}>
                <View style={styles.macroTrack}>
                  <View style={[styles.macroFill, { backgroundColor: Colors.primaryContainer, width: '60%' }]} />
                </View>
                <View style={styles.macroLabelRow}>
                  <MaterialIcons name="breakfast-dining" size={14} color={Colors.primary} />
                  <Text style={[styles.macroLabel, { color: Colors.primary }]}>{aiPlan?.carbs || 200}g Carbs</Text>
                </View>
              </View>
              <View style={styles.macroCol}>
                <View style={styles.macroTrack}>
                  <View style={[styles.macroFill, { backgroundColor: Colors.secondary, width: '60%' }]} />
                </View>
                <View style={styles.macroLabelRow}>
                  <MaterialIcons name="water-drop" size={14} color={Colors.secondary} />
                  <Text style={[styles.macroLabel, { color: Colors.secondary }]}>{aiPlan?.fat || 60}g Fats</Text>
                </View>
              </View>
            </View>

          </View>
        </View>

        {/* AI Coach Nudge */}
        <View style={[styles.clayCard, styles.coachCard]}>
          <View style={styles.coachAvatar}>
            <MaterialIcons name="smart-toy" size={32} color={Colors.onPrimaryContainer} />
          </View>
          <View style={styles.coachTextCol}>
            <Text style={styles.coachMessage}>{aiPlan?.coachMessage || "Let's hit today's targets!"}</Text>
            <TouchableOpacity>
              <Text style={styles.coachAction}>SHOW SUGGESTIONS</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.coachClose}>
            <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </View>

        {/* Weight & Steps Scrollable Row */}
        <View style={styles.scrollRowWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow} snapToInterval={cardWidth + 16} decelerationRate="fast">
            
            {/* Weight Card */}
            <View style={[styles.clayCard, styles.gridCard, { width: cardWidth }]}>
              <View style={styles.gridHeaderRow}>
                <View>
                  <Text style={styles.gridLabel}>CURRENT WEIGHT</Text>
                  <Text style={styles.gridValue}>{userWeight} <Text style={styles.gridUnit}>{userUnit}</Text></Text>
                </View>
                <View style={styles.gridBadge}>
                  <MaterialIcons name="trending-down" size={14} color={Colors.tertiary} />
                  <Text style={styles.gridBadgeText}>-1.2 {userUnit}</Text>
                </View>
              </View>
              
              <View style={styles.sparklineContainer}>
                <Svg style={{ width: '100%', height: 64, overflow: 'visible' }} viewBox="0 0 100 40" preserveAspectRatio="none">
                  <Path d="M 0,10 Q 15,12 25,18 T 50,25 T 75,32 T 100,38" fill="none" stroke="#64a1ff" strokeWidth="3" strokeLinecap="round" />
                  <Circle cx="0" cy="10" r="3" fill="#64a1ff" />
                  <Circle cx="100" cy="38" r="4" fill="#005ab2" />
                </Svg>
              </View>

              <TouchableOpacity style={styles.logButton}>
                <Text style={styles.logButtonText}>LOG WEIGHT</Text>
              </TouchableOpacity>
            </View>

            {/* Steps Card */}
            <View style={[styles.clayCard, styles.gridCard, { width: cardWidth }]}>
              <View style={styles.gridHeaderRow}>
                <View>
                  <Text style={styles.gridLabel}>DAILY STEPS</Text>
                  <Text style={styles.gridValue}>8,420 <Text style={styles.gridUnit}>steps</Text></Text>
                </View>
                <View style={[styles.gridBadge, { backgroundColor: 'rgba(0, 90, 178, 0.1)' }]}>
                  <MaterialIcons name="directions-walk" size={14} color={Colors.primary} />
                  <Text style={[styles.gridBadgeText, { color: Colors.primary }]}>+1,200</Text>
                </View>
              </View>
              
              <View style={styles.sparklineContainer}>
                <Svg style={{ width: '100%', height: 64, overflow: 'visible' }} viewBox="0 0 100 40" preserveAspectRatio="none">
                  <Path d="M 0,38 Q 20,38 40,25 T 80,15 T 100,5" fill="none" stroke={Colors.primary} strokeWidth="3" strokeLinecap="round" />
                  <Circle cx="0" cy="38" r="3" fill="#64a1ff" />
                  <Circle cx="100" cy="5" r="4" fill="#005ab2" />
                </Svg>
              </View>

              <TouchableOpacity style={styles.logButton}>
                <Text style={styles.logButtonText}>LOG STEPS</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>

        {/* Water Tracker (Full Width Row) */}
        <View style={styles.singleRow}>
          <View style={[styles.clayCard, styles.gridCard, { justifyContent: 'space-between' }]}>
            <View>
              <Text style={styles.gridLabel}>WATER INTAKE</Text>
              <Text style={styles.gridValue}>{currentWater}/{waterTarget} <Text style={styles.gridUnit}>cups</Text></Text>
            </View>
            
            <View style={styles.waterDrops}>
              {Array.from({ length: Math.min(currentWater, 12) }).map((_, i) => (
                <View key={i} style={styles.waterDropActive}>
                  <MaterialIcons name="water-drop" size={20} color="#fff" />
                </View>
              ))}
              <TouchableOpacity style={styles.waterDropAdd}>
                <MaterialIcons name="add" size={20} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Buddy Feed Preview */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Buddy Feed</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllBtn}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.feedList}>
          <View style={[styles.clayCard, styles.feedItem]}>
            <Image 
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQYo_i3fppUcwqLZjVbOtZXiqqczOMV6ECSl76QX_ov6oDUlJCOoq_b0tw6aYtgijRberPCvdzSCbp2P6dAKPptl_ZaHiI5ccfbyV8fDRd9EvNJ_G63nDybgALJ5Fwg6p3v6KcIDC0_oHRM63P0CiAncdCQzte9PKjfDO95njhlE7UGrbHCJDs4wFU8Q6KXNs9h9ssJA-2snQOuwq4tjkiTQE8f4hH4pUtwZ1HYigmWVd1w2dItud5zZOtcIFqyjbxky0ZR2aXydA" }}
              style={styles.feedAvatar} 
            />
            <View style={styles.feedContent}>
              <Text style={styles.feedText}><Text style={styles.feedName}>Sarah</Text> hit a PR!</Text>
              <Text style={styles.feedDetail}>DEADLIFT • 225 {userUnit.toUpperCase()}</Text>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="favorite" size={24} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
          <View style={[styles.clayCard, styles.feedItem]}>
            <Image 
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCw9BAAvTSPk16Vtms_KCTJ24yogFJ13ZAC1cDYaEYcovs1NHJDOPAYAgf_bL8FqhpJmDEToNk5PC7N-CGRIuZdRLSwlKk30lQqtPp6XEkC6f07g_zglqVXr57wsywsfumEXZgEx-MoxaJ9OQ-ShG9B5j-LNKMqFokXXnM_d5b-iTYvc29pg11TIcrOFcrbfb71wCYoE7Q8efXaLk5LvpKKGx7HjbxBhO5n5RWgQspsMPJm3sdQgLv3g7l54Xi_XwuFuN0jZfHAcFg" }}
              style={styles.feedAvatar} 
            />
            <View style={styles.feedContent}>
              <Text style={styles.feedText}><Text style={styles.feedName}>Marcus</Text> completed a 5k</Text>
              <Text style={styles.feedDetail}>MORNING RUN • 24:12</Text>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="favorite-outline" size={24} color="#a9aeb1" />
            </TouchableOpacity>
          </View>
        </View>
        </>
        ) : activeTab === 'Workouts' ? (
          <WorkoutHub />
        ) : null}
        
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.clayCard, styles.fab]}>
        <MaterialIcons name="smart-toy" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Floating Workout Timer (Global Access) */}
      {isWorkoutActive && (
        <TouchableOpacity 
           style={[styles.clayCard, styles.globalTimerFab]} 
           onPress={() => router.push('/(app)/active-workout')}
           activeOpacity={0.9}
        >
          <View style={styles.globalTimerDot} />
          <Text style={styles.globalTimerText}>{formatTime(elapsedSeconds)}</Text>
        </TouchableOpacity>
      )}

      {/* Floating Glass Bottom NavBar */}
      <View style={styles.bottomNavContainer}>
        <BlurView intensity={80} tint="light" style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Dashboard')}>
            <MaterialIcons name="home" size={24} color={activeTab === 'Dashboard' ? Colors.primary : Colors.onSurfaceVariant} />
            <Text style={[styles.navText, activeTab === 'Dashboard' && styles.navTextActive]}>Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Nutrition')}>
            <MaterialIcons name="restaurant" size={24} color={activeTab === 'Nutrition' ? Colors.primary : Colors.onSurfaceVariant} />
            <Text style={[styles.navText, activeTab === 'Nutrition' && styles.navTextActive]}>Nutrition</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Workouts')}>
            <MaterialIcons name="fitness-center" size={24} color={activeTab === 'Workouts' ? Colors.primary : Colors.onSurfaceVariant} />
            <Text style={[styles.navText, activeTab === 'Workouts' && styles.navTextActive]}>Workouts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Feed')}>
            <MaterialIcons name="dynamic-feed" size={24} color={activeTab === 'Feed' ? Colors.primary : Colors.onSurfaceVariant} />
            <Text style={[styles.navText, activeTab === 'Feed' && styles.navTextActive]}>Feed</Text>
          </TouchableOpacity>
        </BlurView>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f7fb',
  },
  clayCard: {
    backgroundColor: '#ffffff',
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  clayInset: {
    shadowColor: '#fff',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#f3f7fb',
    zIndex: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profilePicWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#005ab2',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 140, // space for nav + fab
    gap: 32,
  },
  
  // Date Carousel
  dateCarousel: {
    marginHorizontal: -24,
  },
  dateList: {
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 16,
  },
  dateItemInactive: {
    width: 56,
    height: 80,
    borderRadius: 28,
    backgroundColor: '#ecf1f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDayInactive: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
    color: '#575c60',
  },
  dateNumInactive: {
    fontSize: 18,
    fontWeight: '800',
    color: '#575c60',
  },
  dateItemActive: {
    width: 64,
    height: 96,
    borderRadius: 32,
    backgroundColor: '#005ab2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    shadowColor: '#005ab2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  dateDayActive: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#fff',
  },
  dateNumActive: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  dateDotActive: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  
  // Streak
  streakWrapper: {
    alignItems: 'center',
    marginTop: -16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffc5a3',
    borderRadius: 99,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#753500',
  },

  // Progress Card
  progressCard: {
    borderRadius: 32,
    padding: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    backgroundColor: 'rgba(0, 90, 178, 0.05)',
    borderRadius: 80,
  },
  progressContainer: {
    alignItems: 'center',
    gap: 24,
  },
  ringWrapper: {
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringCalories: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2a2f32',
    letterSpacing: -1,
  },
  ringGoal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#575c60',
    letterSpacing: 1,
    marginTop: 4,
  },
  macrosRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  macroCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  macroTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#dde3e8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  macroFill: {
    height: '100%',
    borderRadius: 4,
  },
  macroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Coach Card
  coachCard: {
    flexDirection: 'row',
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#002b5b',
    alignItems: 'flex-start',
    gap: 16,
  },
  coachAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachTextCol: {
    flex: 1,
    gap: 8,
  },
  coachMessage: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
  },
  coachAction: {
    color: Colors.primaryFixed,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  coachClose: {
    padding: 4,
  },

  // Grid & Scrollable Tracking Rows
  scrollRowWrapper: {
    marginHorizontal: -24, // Pull text to edges for scrolling
  },
  scrollRow: {
    paddingHorizontal: 24,
    gap: 16,
  },
  singleRow: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 24,
  },
  gridCard: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#575c60',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2a2f32',
  },
  gridUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#575c60',
  },
  gridBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.tertiary,
  },
  sparklineContainer: {
    height: 64,
    justifyContent: 'flex-end',
  },
  logButton: {
    backgroundColor: '#ecf1f6',
    paddingVertical: 12,
    borderRadius: 99,
    alignItems: 'center',
  },
  logButtonText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  waterDrops: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  waterDropActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  waterDropAdd: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dde3e8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Feed
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: -16, // offset list gap
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2a2f32',
  },
  viewAllBtn: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  feedList: {
    gap: 12,
  },
  feedItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 16,
  },
  feedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  feedContent: {
    flex: 1,
  },
  feedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2a2f32',
    fontFamily: 'BeVietnamPro-Regular',
  },
  feedName: {
    fontWeight: '900',
    color: Colors.primary,
  },
  feedDetail: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#575c60',
    marginTop: 4,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 110,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary, // gradient fallback
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    zIndex: 40,
  },
  globalTimerFab: {
    position: 'absolute',
    bottom: 110,
    left: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    zIndex: 40,
  },
  globalTimerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.tertiary,
    shadowColor: Colors.tertiary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  globalTimerText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: '#2a2f32',
  },

  // Bottom Nav Setup
  bottomNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 24,
    left: 24,
    right: 24,
    borderRadius: 40,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  navText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 4,
    color: Colors.onSurfaceVariant,
  },
  navTextActive: {
    color: Colors.primary,
  },
  navItemCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    marginTop: -20,
  },
  navTextCenter: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
    color: '#fff',
  }
});
