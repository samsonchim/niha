import { ThemedText } from '@/components/ThemedText';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('@/assets/images/niha.png')} // Replace with your logo path
        style={styles.logo}
        resizeMode="contain"
      />
      {/* Illustration */}
      <Image
        source={require('@/assets/images/onboarding.png')} 
        style={styles.illustration}
        resizeMode="contain"
      />
      {/* Title */}
      <ThemedText type="title" style={styles.title}>
        Crypto-Based Online Banking
      </ThemedText>
      {/* Subtitle */}
      <ThemedText style={styles.subtitle}>
        Its secure and support near about{'\n'}hundred cryto currencies
      </ThemedText>
      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/auth')}
      >
        <ThemedText style={styles.buttonText}>Get Started</ThemedText>
        <FontAwesome name="arrow-right" size={22} color="#fff" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/auth')}>
        <ThemedText style={styles.signup}>Sign In</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 60,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 40,
    marginTop: 60,
  },
  illustration: {
    width: 250,
    height: 250,
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    alignSelf: 'flex-start',
    marginLeft: 32,
    marginBottom: 12,
    fontSize: 28,
    lineHeight: 36,
  },
  subtitle: {
    color: '#ccc',
    textAlign: 'center',
    marginLeft: 32,
    marginBottom: 32,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    marginBottom: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  arrow: {
    color: '#fff',
    fontSize: 22,
    marginLeft: 8,
  },
  signup: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});