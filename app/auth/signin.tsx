import API_CONFIG from '@/constants/ApiConfig';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PRIMARY_COLOR = '#000000';
const WHITE = '#fff';
const GREEN = '#00C853';

export default function SignInScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API_CONFIG.URLS.LOGIN, {
        email: email.trim().toLowerCase(),
        password: password
      });

      if (response.data.success) {
        const { user, hasVirtualAccount, virtualAccount } = response.data.data;
        
        Alert.alert(
          'Welcome back!',
          `Hello ${user.firstName}! ${hasVirtualAccount ? 'Your account is ready.' : 'Complete your setup by adding your BVN.'}`,
          [
            {
              text: 'Continue',
              onPress: () => {
                if (hasVirtualAccount) {
                  // Navigate to main app
                  navigation.navigate('(tabs)', { user, virtualAccount });
                } else {
                  // Navigate to BVN setup
                  navigation.navigate('auth/bvn', {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                  });
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Login Failed', response.data.message);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error cases
      if (error?.response?.data?.needsVerification) {
        Alert.alert(
          'Email Verification Required',
          'Please check your email and verify your account before signing in.',
          [
            {
              text: 'Resend Email',
              onPress: () => {
                // TODO: Implement resend verification email
                Alert.alert('Info', 'Please check your email for the verification link.');
              }
            },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('Login Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.navigate('onboarding')}>
          <AntDesign name="arrowleft" size={24} color={WHITE}  />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign In</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome back!</Text>
        
        <Text style={styles.description}>
          Sign in with your email/phone and password
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email or Phone Number"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <AntDesign 
              name={showPassword ? "eye" : "eyeo"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('auth/forgot-password')}
        >
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.button, 
            { 
              backgroundColor: 
                email.length > 0 && password.length > 0 
                  ? '#2E2E2E'
                  : PRIMARY_COLOR
            }
          ]}
          disabled={email.length === 0 || password.length === 0 || loading}
          onPress={handleSignIn}
        >
          {loading ? (
            <ActivityIndicator color={WHITE} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('auth/index')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    color: WHITE,
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#bbb',
    fontFamily: 'Poppins-Regular',
    marginBottom: 32,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#2E2E2E',
    borderRadius: 8,
    padding: 16,
    color: WHITE,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    borderWidth: 1.5,
    borderColor: '#232323',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  forgotPassword: {
    color: GREEN,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'right',
    marginBottom: 32,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  signupText: {
    color: '#bbb',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  signupLink: {
    color: GREEN,
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
});