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
  ActivityIndicator
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

// Using standard redirect URI pattern for Expo Go
const redirectUrl = AuthSession.makeRedirectUri({
  path: "/oauth-native-callback"
});

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      await setActive({ session: completeSignIn.createdSessionId });
      router.replace("/(app)");
    } catch (err: any) {
      alert(err.errors[0]?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleOAuthPress = useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({ redirectUrl });
      
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace("/(app)");
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Header section */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/macromate-logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Fueled and ready for today?</Text>
        </View>

        {/* Form section */}
        <View style={styles.form}>
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

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={onSignInPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
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
          <Text style={styles.footerText}>New to the squad? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Join Now</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
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
    // Volumetric Inner shadow simulation
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButton: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 999, // full pill shape
    justifyContent: "center",
    alignItems: "center",
    // Volumetric button styling
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
    marginBottom: 40,
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
