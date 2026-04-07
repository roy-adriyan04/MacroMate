import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { Colors } from '../../constants/Colors';

export default function Home() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Home!</Text>
      <TouchableOpacity style={styles.button} onPress={() => signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans-Bold',
    color: Colors.onBackground,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.errorContainer,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: {
    color: Colors.onErrorContainer,
    fontFamily: 'BeVietnamPro-Regular',
    fontWeight: '600',
  }
});
