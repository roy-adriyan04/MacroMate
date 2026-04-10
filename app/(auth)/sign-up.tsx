import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useSignUp, useOAuth, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from "expo-auth-session";
import { saveUserProfile } from "../../lib/firebase";

WebBrowser.maybeCompleteAuthSession();
const redirectUrl = AuthSession.makeRedirectUri({ path: "/oauth-native-callback" });

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setLoading(true);
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      alert(err.errors[0]?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Update user profile with full name if provided
        if (fullName) {
          try {
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            
            // Note: We need the user object from the session or hook to update it.
            // Since we're navigating to (app) right after, the AppLayout will 
            // pick up the updated user object.
          } catch (e) {
            console.error("Failed to update name", e);
          }
        }
        
        router.replace("/(app)/home");
      }
    } catch (err: any) {
      alert(err.errors[0]?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleOAuthPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive, signUp } = await startOAuthFlow({ redirectUrl });
      
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace("/(app)/home");
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  if (pendingVerification) {
    return (
      <View style={[styles.container, { justifyContent: 'center', padding: 24 }]}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>We've sent a verification code to {emailAddress}</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Code..."
            onChangeText={setCode}
            keyboardType="number-pad"
          />
        </View>
        
        <TouchableOpacity style={styles.primaryButton} onPress={onPressVerify} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={styles.primaryButtonText}>Verify Email</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header section */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/macromate-logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your journey to tactile vitality</Text>
        </View>

        {/* Form section */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={Colors.onSurfaceVariant}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.onSurfaceVariant}
              value={emailAddress}
              onChangeText={setEmailAddress}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.onSurfaceVariant}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={Colors.onSurfaceVariant}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, { marginTop: 16 }]} 
            onPress={onSignUpPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Separator */}
        <View style={styles.separatorContainer}>
          <View style={styles.separator} />
          <Text style={styles.separatorText}>OR CONTINUE WITH</Text>
          <View style={styles.separator} />
        </View>

        {/* OAuth Buttons */}
        <TouchableOpacity style={styles.oauthButton} onPress={onGoogleOAuthPress}>
          <Ionicons name="logo-google" size={24} color={Colors.onSurface} style={styles.oauthIcon} />
          <Text style={styles.oauthButtonText}>Google</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: "bold",
    color: Colors.onBackground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-Regular',
    color: Colors.onSurfaceVariant,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: Colors.surfaceDim,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    color: Colors.onSurface,
    fontSize: 16,
    fontFamily: 'BeVietnamPro-Regular',
  },
  primaryButton: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primaryDim,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryButtonText: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: "bold",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.outlineVariant,
    opacity: 0.3,
  },
  separatorText: {
    marginHorizontal: 16,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Regular',
    fontWeight: "600",
    letterSpacing: 1,
  },
  oauthButton: {
    flexDirection: "row",
    height: 56,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  oauthIcon: {
    marginRight: 12,
  },
  oauthButtonText: {
    color: Colors.onSurface,
    fontSize: 16,
    fontFamily: 'BeVietnamPro-Regular',
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
  },
  footerText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 14,
    fontWeight: "bold",
  }
});
