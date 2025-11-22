import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedView } from '@/components/ThemedView';
import { API_BASE_URL } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import { triggerOnboarding } from '@/services/backend';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet } from 'react-native';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!email || !password || !fullName) return Alert.alert('Please fill in all fields');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (error || !data.user) throw error || new Error('Signup failed');

      // Trigger backend onboarding (DVA + crypto address) silently
      await triggerOnboarding({ userId: data.user.id, email: email, fullName });

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
        placeholder="Full Name"
        autoCapitalize="words"
        value={fullName}
        onChangeText={setFullName}
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
});
