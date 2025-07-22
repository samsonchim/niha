import Confirmation from '@/components/Confirmation';
import API_CONFIG from '@/constants/ApiConfig';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PRIMARY_COLOR = '#000000';
const WHITE = '#fff';
const GREEN = '#00C853';

export default function EmailVerificationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [startAnimation, setStartAnimation] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState('');

  // Get email from navigation params
  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
  }, [route.params]);

  // Function to check verification status
  const checkVerificationStatus = async () => {
    if (!email || isVerified) return; // Don't check if already verified

    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/verify-status/${encodeURIComponent(email)}`);
      
      if (response.data.success && response.data.verified) {
        setIsVerified(true);
        setIsChecking(false);
        
        console.log('✅ Email verified, navigating to BVN screen');
        
        // Use router.replace to completely replace OTP screen and stop polling
        setTimeout(() => {
          router.replace({
            pathname: '/auth/bvn',
            params: {
              email,
              firstName: route.params?.firstName,
              lastName: route.params?.lastName
            }
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  useEffect(() => {
    // Trigger animation when screen mounts
    setStartAnimation(true);

    // Start checking verification status every 3 seconds if email is available and not already verified
    if (email && !isVerified) {
      const interval = setInterval(checkVerificationStatus, 3000);
      
      // Check immediately
      checkVerificationStatus();

      // Cleanup interval on unmount or when verified
      return () => {
        console.log('🧹 Cleaning up OTP verification interval');
        clearInterval(interval);
      };
    }
  }, [email, isVerified]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Centered Animation */}
        <Confirmation />

        <Text style={styles.title}>
          {isVerified ? 'Email Verified!' : 'Check your email'}
        </Text>

        <Text style={styles.description}>
          {isVerified 
            ? 'Your email has been successfully verified. You will be redirected to the next step shortly.'
            : `We have sent a verification link to ${email}. Please check your inbox and follow the link to verify your account.`
          }
        </Text>

        {isVerified && (
          <Text style={styles.successText}>
            ✓ Proceeding to next step...
          </Text>
        )}

        {!isVerified && (
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Back to Signup</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    color: WHITE,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#bbb',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: "#2E2E2E",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  successText: {
    color: GREEN,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
});
