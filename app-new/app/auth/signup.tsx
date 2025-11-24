import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedView } from '@/components/ThemedView';
import { API_BASE_URL } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet } from 'react-native';
// Hardcoded onboarding endpoint as requested (bypass config + helper)
const ONBOARDING_ENDPOINT = API_BASE_URL + '/onboarding';

export default function SignupScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!email || !password || !firstName || !lastName) return Alert.alert('Please fill in all fields');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      if (error || !data.user) throw error || new Error('Signup failed');

      // Direct hardcoded request to production onboarding endpoint
      try {
        const resp = await fetch(ONBOARDING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id, email, firstName, lastName, phone })
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`Onboarding failed (${resp.status}) ${text}`);
        }
      } catch (onbErr: any) {
        console.warn('Hardcoded onboarding request failed:', onbErr?.message);
        throw onbErr;
      }

      Alert.alert('Success', 'Account created. Redirecting to dashboard...');
      router.replace('/');
    } catch (e: any) {
      // Show enriched error including attempted URL.
      Alert.alert('Error', e.message || `Signup failed (Backend: ${API_BASE_URL})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('../../assets/images/signup.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
      <ThemedText style={styles.subtitle}>Sign up to get started</ThemedText>

      <ThemedTextInput
        style={styles.input}
        placeholder="First Name"
        autoCapitalize="words"
        value={firstName}
        onChangeText={setFirstName}
      />
      <ThemedTextInput
        style={styles.input}
        placeholder="Last Name"
        autoCapitalize="words"
        value={lastName}
        onChangeText={setLastName}
      />
      <ThemedTextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <ThemedTextInput
        style={styles.input}
        placeholder="Phone (e.g. 08012345678)"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <ThemedTextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <ThemedButton
        title="Sign Up"
        onPress={onSignup}
        loading={loading}
        style={styles.button}
      />

      <ThemedButton
        title="Login"
        onPress={() => router.push('/auth/login')}
        style={[styles.button, styles.loginButton]}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  image: { width: 100, height: 100, alignSelf: 'center', marginBottom: 24 },
  title: { marginBottom: 8 },
  subtitle: { marginBottom: 32, opacity: 0.7 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
  loginButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007AFF' },
});
