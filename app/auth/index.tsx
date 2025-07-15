import { ThemedText } from '@/components/ThemedText';
import API_CONFIG from '@/constants/ApiConfig';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const PRIMARY_COLOR = '#000000';
const WHITE = '#fff';
const GREEN = '#00C853';
const RED = '#FF1744';

function checkPassword(password: string) {
  return {
    small: /[a-z]/.test(password),
    capital: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    length: password.length >= 8,
  };
}

// Floating label input component
function FloatingInput({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  editable = true,
  style,
  placeholder,
  ...props
}: any) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

 const labelStyle = {
  position: 'absolute',
  left: 16,
  top: animatedIsFocused.interpolate({
    inputRange: [0, 1],
    outputRange: [18, -10],
  }),
  fontSize: animatedIsFocused.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  }),
  color: isFocused ? GREEN : '#bbb',
  backgroundColor: '#2E2E2E',
  paddingHorizontal: 6,  
  paddingVertical: 2,   
  marginLeft: -4,       
  marginRight: -4,
  borderRadius: 6,       
  zIndex: 2,
  fontFamily: 'Poppins-Regular',
};

  return (
    <View style={{ marginBottom: 24 }}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      {/* Custom placeholder background */}
      {!value && !isFocused && (
                <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 16,
              right: 16,
              top: 18,
              height: 20,
              backgroundColor: '#2E2E2E', 
              borderRadius: 4,
              zIndex: 1,
              justifyContent: 'center',
            }}
          >

          <Text
            style={{
              color: '#bbb',
              fontSize: 16,
              fontFamily: 'Poppins-Regular',
            }}
          >
            {label}
          </Text>
        </View>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          style,
          {
            borderColor: isFocused ? GREEN : '#232323',
            paddingTop: 18,
            color: editable ? WHITE : '#bbb',
          },
        ]}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    </View>
  );
}

export default function AuthScreen() {
  const navigation = useNavigation<any>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country] = useState('Nigeria');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referral, setReferral] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  const passwordCheck = checkPassword(password);
  const isPasswordValid = Object.values(passwordCheck).every(Boolean);
  const passwordsMatch = confirmPassword === password && password.length > 0;

  // Add this function after all the useStates:
  const handleSignup = async () => {
    if (!isPasswordValid || !passwordsMatch || !agree) {
      Alert.alert('Error', 'Please complete the form correctly.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API_CONFIG.URLS.SIGNUP, {
        firstName,
        lastName,
        email,
        password,
        referral,
      });

      if (response.data.success) {
        navigation.navigate('auth/otp', { email });
      } else {
        Alert.alert('Signup Failed', response.data.message || 'Try again later.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Signup Error', error?.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: PRIMARY_COLOR }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('onboarding')}>
          <FontAwesome name="arrow-left" size={24} color={WHITE} />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="headphones" size={22} color={WHITE} />
        </TouchableOpacity>
      </View>
     <ThemedText type="title" style={styles.headerTitle}>Personal details</ThemedText>
       
      <View style={styles.container}>
        {/* First and Last Name */}
        <FloatingInput
          label="Official First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <FloatingInput
          label="Official Last Name"
          value={lastName}
          onChangeText={setLastName}
        />

        {/* Nationality (not editable) */}
        <FloatingInput
          label="Nationality"
          value={country}
          editable={false}
        />

        {/* Email */}
        <FloatingInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        {/* Password */}
        <View style={{ marginBottom: 3 }}>
          <FloatingInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={{ marginBottom: 8 }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#bbb" />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <FloatingInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <View style={styles.checkRow}>
          <FontAwesome
            name={passwordsMatch ? "check" : "close"}
            size={16}
            color={passwordsMatch ? GREEN : RED}
          />
          <Text style={[styles.checkText, { color: passwordsMatch ? GREEN : RED }]}>
            Passwords match
          </Text>
        </View>

        {/* Password Checklist */}
        <View style={styles.passwordChecklist}>
          <View style={styles.checkRow}>
            <FontAwesome name={passwordCheck.small ? "check" : "close"} size={16} color={passwordCheck.small ? GREEN : RED} />
            <Text style={[styles.checkText, { color: passwordCheck.small ? GREEN : RED }]}>1 small letter</Text>
            <FontAwesome name={passwordCheck.capital ? "check" : "close"} size={16} color={passwordCheck.capital ? GREEN : RED} style={{ marginLeft: 16 }} />
            <Text style={[styles.checkText, { color: passwordCheck.capital ? GREEN : RED }]}>1 capital letter</Text>
          </View>
          <View style={styles.checkRow}>
            <FontAwesome name={passwordCheck.number ? "check" : "close"} size={16} color={passwordCheck.number ? GREEN : RED} />
            <Text style={[styles.checkText, { color: passwordCheck.number ? GREEN : RED }]}>1 number</Text>
            <FontAwesome name={passwordCheck.special ? "check" : "close"} size={16} color={passwordCheck.special ? GREEN : RED} style={{ marginLeft: 16 }} />
            <Text style={[styles.checkText, { color: passwordCheck.special ? GREEN : RED }]}>1 special character</Text>
          </View>
          <View style={styles.checkRow}>
            <FontAwesome name={passwordCheck.length ? "check" : "close"} size={16} color={passwordCheck.length ? GREEN : RED} />
            <Text style={[styles.checkText, { color: passwordCheck.length ? GREEN : RED }]}>8 characters</Text>
          </View>
        </View>

        {/* Referral */}
        <FloatingInput
          label="Referral Code (Optional)"
          value={referral}
          onChangeText={setReferral}
        />

        {/* Agreement with checkbox */}
        <View style={styles.agreeRow}>
          <TouchableOpacity onPress={() => setAgree(!agree)}>
            <FontAwesome
              name={agree ? "check-square" : "square-o"}
              size={22}
              color={WHITE}
            />
          </TouchableOpacity>
          <Text style={styles.agreeText}>
            I acknowledge that I have read and agree to{' '}
            <Text style={styles.link}>Niha's Agreements</Text>
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: isPasswordValid && passwordsMatch && agree ? "#2E2E2E" : PRIMARY_COLOR }]}
          disabled={!(isPasswordValid && passwordsMatch && agree) || loading}
          onPress={handleSignup} // Changed this line
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 64, 
    marginBottom: 24, 
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: WHITE,
    fontSize: 22,
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  container: {
    padding: 16,
    backgroundColor: PRIMARY_COLOR,
    flex: 1,
  },
  input: {
    backgroundColor: '#2E2E2E', 
    color: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 0,
    borderWidth: 1.5,
    borderColor: '#232323',
  },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    top: -10,
    fontSize: 12,
    color: '#bbb',
    backgroundColor: '#2E2E2E',
    zIndex: 2,
    paddingHorizontal: 4,
    fontFamily: 'Poppins-Regular',
  },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },

    phoneInputBox: {
      flex: 11,
      marginLeft: 8,
    },

  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  eyeIcon: {
    position: 'absolute',
    right: 18,
    top: 18,
    zIndex: 1,
  },
  passwordChecklist: {
    marginBottom: 16,
    marginTop: 8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkText: {
    fontSize: 14,
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  agreeText: {
    color: WHITE,
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
    flex: 1,
    flexWrap: 'wrap',
  },
  link: {
    color: '#00C853',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins-Regular',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  buttonText: {
    color: WHITE,
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
});