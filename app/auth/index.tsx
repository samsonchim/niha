import { ThemedText } from '@/components/ThemedText';
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DatePicker from 'react-native-date-picker';

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
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 4,
    zIndex: 2,
    fontFamily: 'Poppins-Regular',
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [country] = useState('Nigeria');
  const [countryCode] = useState('+234');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referral, setReferral] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const passwordCheck = checkPassword(password);
  const isPasswordValid = Object.values(passwordCheck).every(Boolean);
  const passwordsMatch = confirmPassword === password && password.length > 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: PRIMARY_COLOR }}>
      <View style={styles.headerRow}>
        <TouchableOpacity>
          <FontAwesome name="arrow-left" size={24} color={WHITE} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>Personal details</ThemedText>
        <TouchableOpacity>
          <FontAwesome name="comment-o" size={22} color={WHITE} />
        </TouchableOpacity>
      </View>

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

        {/* Gender Dropdown */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.floatingLabel}>Gender</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={gender}
              dropdownIconColor={WHITE}
              style={styles.picker}
              onValueChange={(itemValue) => setGender(itemValue)}
            >
              <Picker.Item label="Select Gender" value="" color="#bbb" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        </View>

        {/* Date Picker */}
        <TouchableOpacity
          style={[styles.input, { justifyContent: 'center', marginBottom: 24, borderColor: showDatePicker ? GREEN : '#232323' }]}
          onPress={() => {
            setShowDatePicker(true);
            Keyboard.dismiss();
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: dob ? WHITE : '#bbb', fontSize: 16, fontFamily: 'Poppins-Regular' }}>
            {dob ? dob.toLocaleDateString() : 'Date of Birth'}
          </Text>
        </TouchableOpacity>
        <DatePicker
          modal
          open={showDatePicker}
          date={dob || new Date()}
          mode="date"
          maximumDate={new Date()}
          onConfirm={(date) => {
            setShowDatePicker(false);
            setDob(date);
          }}
          onCancel={() => setShowDatePicker(false)}
          theme="dark"
        />

        {/* Nationality (not editable) */}
        <FloatingInput
          label="Nationality"
          value={country}
          editable={false}
        />

        {/* Country code and phone */}
        <View style={styles.row}>
          <View style={[styles.input, styles.countryCodeBox]}>
            <Text style={{ fontSize: 18, marginRight: 6 }}>🇳🇬</Text>
            <Text style={{ color: WHITE, fontFamily: 'Poppins-Regular' }}>{countryCode}</Text>
            <FontAwesome name="angle-down" size={16} color={WHITE} style={{ marginLeft: 4 }} />
          </View>
          <FloatingInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={{ flex: 2, marginLeft: 8, marginBottom: 0 }}
          />
        </View>

        {/* Email */}
        <FloatingInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        {/* Password */}
        <View style={{ marginBottom: 32 }}>
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
            <Text style={styles.link}>Bamboo’s Agreements</Text>
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: isPasswordValid && passwordsMatch && agree ? GREEN : PRIMARY_COLOR }]}
          disabled={!(isPasswordValid && passwordsMatch && agree)}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
    paddingTop: 64, // Increased for more space from top
    marginBottom: 24, // Added space below header
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
    backgroundColor: '#232323',
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
  pickerWrapper: {
    backgroundColor: '#232323',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#232323',
    marginTop: 18,
    marginBottom: 0,
    paddingLeft: 8,
    paddingRight: 8,
    height: 48,
    justifyContent: 'center',
  },
  picker: {
    color: WHITE,
    fontFamily: 'Poppins-Regular',
    width: '100%',
    height: 48,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'center',
  },
  countryCodeBox: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#232323',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#232323',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
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