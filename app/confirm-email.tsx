import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ConfirmEmailScreen() {
  const [code, setCode] = useState(['', '', '', '', '']);
  const [error, setError] = useState('');
  const inputs = useRef<Array<TextInput | null>>([]);
  const router = useRouter();

  const handleChange = (text: string, idx: number) => {
    if (text.length > 1) text = text.slice(-1);
    const newCode = [...code];
    newCode[idx] = text;
    setCode(newCode);

    if (text && idx < 4) {
      inputs.current[idx + 1]?.focus();
    }
    if (!text && idx > 0 && !newCode[idx]) {
      inputs.current[idx - 1]?.focus();
    }
    setError('');
  };

  const handleConfirm = () => {
    if (code.some(digit => digit === '')) {
      setError('Please enter the complete code');
      return;
    }
    setError('');
    // Proceed to next step or screen
    // router.push('/next-screen');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      {/* Niha Pay logo and text */}
      <View style={styles.logoRow}>
        <Image
          source={require('@/assets/images/niha.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>Niha Pay</Text>
      </View>
      {/* Confirm Email Title */}
      <Text style={styles.title}>Confirm Email Address</Text>
      {/* Code Inputs */}
      <View style={styles.codeRow}>
        {code.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={ref => (inputs.current[idx] = ref)}
            style={[styles.codeInput, error && digit === '' ? styles.codeInputError : null]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={text => handleChange(text, idx)}
            autoFocus={idx === 0}
            returnKeyType="next"
            placeholder=""
            placeholderTextColor="#444"
            textContentType="oneTimeCode"
            importantForAutofill="yes"
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {/* Confirm Button */}
    <TouchableOpacity
      style={[
        styles.button,
        code.some(digit => digit === '') ? styles.buttonDisabled : null,
      ]}
      onPress={handleConfirm}
      disabled={code.some(digit => digit === '')}
      accessibilityLabel="Confirm Email"
    >
      <Text style={styles.buttonText}>Confirm Email</Text>
      <FontAwesome name="check-circle" size={18} color="#fff" style={styles.arrow} />
    </TouchableOpacity>
      {/* Resend code */}
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          Didn't receive a code?{' '}
          <Text style={styles.resendLink} onPress={() => {/* handle resend */}}>
            Resend
          </Text>
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
    flex: 2,
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
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 24,
    marginLeft: 2,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 32,
    marginLeft: 9,
    gap: 12,
  },
  codeInput: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#222',
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  codeInputError: {
    borderColor: '#FF4EDB',
  },
  error: {
    color: '#FF4EDB',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4EDB',
    borderRadius: 10,
    paddingVertical: 14,
    justifyContent: 'center',
    width: '100%',
    marginTop: 16,
    opacity: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
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
  resendContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  resendText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.7,
  },
  resendLink: {
    color: '#FF4EDB',
    fontWeight: '500',
  },
});