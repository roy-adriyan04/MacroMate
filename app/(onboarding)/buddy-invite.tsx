import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@clerk/clerk-expo';
import { saveUserProfile } from '../../lib/firebase';

export default function BuddyInviteScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleCompleteSetup = async () => {
    // We defer the database save to generating-plan.tsx
    // Just navigate to the generating screen instead of marking setup as complete.
    router.push('/(onboarding)/generating-plan');
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
        <TouchableOpacity onPress={handleCompleteSetup}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>FINAL STEP</Text>
            <Text style={styles.progressPercent}>100%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>Know someone on MacroMate?</Text>
          <Text style={styles.subtitle}>Your friends are already hitting their goals! Connect to stay motivated together.</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#73777b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends or contacts..."
            placeholderTextColor="#73777b"
          />
        </View>

        {/* Quick Invite */}
        <View style={styles.inviteCard}>
          <View style={styles.inviteInfo}>
            <View style={styles.shareIconWrapper}>
              <MaterialIcons name="share" size={24} color="#006243" />
            </View>
            <View>
              <Text style={styles.inviteTitle}>Invite Friends</Text>
              <Text style={styles.inviteDesc}>Share your invite link</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Notice */}
        <View style={styles.noticeCard}>
          <MaterialIcons name="info" size={24} color="#006949" />
          <Text style={styles.noticeText}>
            Almost there! We're currently generating your custom macro targets based on your profile.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteSetup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.completeText}>Complete Setup</Text>
              <MaterialIcons name="check-circle" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.termsText}>By completing, you agree to our Terms of Service</Text>
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
    paddingBottom: 150,
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
    color: '#73777b',
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
    backgroundColor: '#006949', // tertiary indicating completion
    borderRadius: 4,
    shadowColor: '#006949',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 2,
  },
  headlineContainer: {
    marginBottom: 32,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf1f6',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#2a2f32',
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#2a2f32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  inviteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  shareIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8efecb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2a2f32',
    marginBottom: 2,
  },
  inviteDesc: {
    fontSize: 14,
    color: '#575c60',
  },
  shareButton: {
    backgroundColor: '#ffc5a3',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  shareButtonText: {
    color: '#753500',
    fontWeight: '800',
    fontSize: 14,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(142, 254, 203, 0.3)',
    borderColor: '#8efecb',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#006243',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  completeButton: {
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
    marginBottom: 16,
  },
  completeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  termsText: {
    textAlign: 'center',
    color: '#73777b',
    fontSize: 12,
    fontWeight: '500',
  },
});
