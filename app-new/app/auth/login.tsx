import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) return Alert.alert('Please fill in all fields');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.user) throw error || new Error('Login failed');

      Alert.alert('Success', 'Login successful. Redirecting to dashboard...');
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Login failed');
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
      <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
      <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>

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
        title="Login"
        onPress={onLogin}
        loading={loading}
        style={styles.button}
      />

      <ThemedButton
        title="Sign Up"
        onPress={() => router.push('/auth/signup')}
        style={[styles.button, styles.signupButton]}
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
  signupButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007AFF' },
});
