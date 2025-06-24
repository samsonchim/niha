import Confirmation from '@/components/Confirmation';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PRIMARY_COLOR = '#000000';
const WHITE = '#fff';
const GREEN = '#00C853';

export default function EmailVerificationScreen() {
  const navigation = useNavigation();
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    // Trigger animation when screen mounts
    setStartAnimation(true);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 🟢 Centered Animation with startAnimation=true */}
        <Confirmation startAnimation={startAnimation} />

        <Text style={styles.title}>Check your email</Text>

        <Text style={styles.description}>
          We have sent a verification link to your email address. Please check your inbox and follow the link to verify your account.
        </Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
          </View>
          <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('auth/bvn')}
        >
          <Text style={styles.buttonText}>Next screen</Text>
        </TouchableOpacity>
    
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
});
