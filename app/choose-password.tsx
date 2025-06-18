import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EnterEmailScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Top bar with back icon above help icon */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.helpButton}>
          <FontAwesome name="question-circle-o" size={22} color="#FF4EDB" />
        </TouchableOpacity>
      </View>
      {/* Niha Pay logo and text */}
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
        placeholder="Password"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

       <TextInput
        style={styles.input}
        placeholder="Confrim Password"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Sign up button */}
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push('/confirm-email')}
    >
      <Text style={styles.buttonText}>Finish Up</Text>
      <FontAwesome name="lock" size={18} color="#fff" style={styles.arrow} />
    </TouchableOpacity>
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
});