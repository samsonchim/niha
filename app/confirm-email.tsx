import LetterInEnvelope from '@/components/LetterInEnvelope';
import { useRouter } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

export default function ConfirmEmailScreen() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      {/* Logo */}
      <View style={styles.logoRow}>
        <Image
          source={require('@/assets/images/niha.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>Niha Pay</Text>
      </View>

      {/* Centered Letter Animation */}
      <View style={styles.centered}>
        <LetterInEnvelope size={120} />
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.infoText}>
          We just sent a magic link to your email. Please click the link to verify your address and continue.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

export const options = {
  headerShown: false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 24,
    justifyContent: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    marginTop: 65,
    gap: 4,
  },
  logoImage: {
    width: 34,
    height: 34,
    marginRight: 2,
  },
  logoText: {
    color: '#FF4EDB',
    fontSize: 20,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 18,
    marginLeft: 2,
    textAlign: 'center',
  },
});