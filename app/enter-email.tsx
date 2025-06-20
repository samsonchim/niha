import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EnterEmailScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      setShowError(true);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setShowError(true);
      return;
    }

    setLoading(true);
    setShowError(false);

    // Commented out Supabase signup for testing
    /*
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      setShowError(true);
    } else {
      router.push('/confirm-email');
    }
    */

    // Simulate success for testing
    setTimeout(() => {
      setLoading(false);
      router.push('/confirm-email');
    }, 800);
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={12} color="#bbb" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton}>
          <FontAwesome name="question-circle-o" size={22} color="#FF4EDB" />
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.logoRow}>
        <Image
          source={require('@/assets/images/niha.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>Niha Pay</Text>
      </View>

      {/* Email input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      {/* Confirm Password input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#ccc"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      {/* Error Modal */}
      <Modal
        visible={showError}
        transparent
        animationType="fade"
        onRequestClose={() => setShowError(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
            <Text style={styles.modalText}>{errorMessage || 'Something went wrong.'}</Text>
            <Pressable style={styles.closeButton} onPress={() => setShowError(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </BlurView>
        </View>
      </Modal>

      {/* Sign up button */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.buttonText}>Sign up</Text>
            <FontAwesome name="arrow-right" size={18} color="#fff" style={styles.arrow} />
          </>
        )}
      </TouchableOpacity>

      {/* Terms */}
      <Text style={styles.terms}>
        I have read, understand and agreed to the{' '}
        <Text style={styles.link}>Terms & Conditions</Text> and{' '}
        <Text style={styles.link}>Privacy Policy</Text>
      </Text>

      {/* Login link */}
      <View style={styles.loginContainer}>
        <Text style={styles.login}>
          Already have a Niha Account? <Text style={styles.loginLink}>Login</Text>
        </Text>
      </View>
    </View>
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
  topBar: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
  },
  backButton: {
    position: 'absolute',
    left: 4,
    top: 11,
    padding: 4,
    zIndex: 2,
  },
  helpButton: {
    marginTop: 28,
    zIndex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 10,
    gap: 6,
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
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4EDB',
    borderRadius: 10,
    paddingVertical: 14,
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
  arrow: {
    marginLeft: -20,
    marginRight: 10,
  },
  terms: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 8,
    opacity: 0.7,
  },
  link: {
    color: '#FF4EDB',
    textDecorationLine: 'underline',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  login: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 40,
    opacity: 0.7,
    marginBottom: 10,
  },
  loginLink: {
    color: '#FF4EDB',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: 280,
    padding: 28,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(30,30,30,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 18,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#FF4EDB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    color: '#FF4EDB',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: -24,
    fontSize: 13,
    fontWeight: '600',
  },
});