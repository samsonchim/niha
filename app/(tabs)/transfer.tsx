import { Colors, Fonts, Spacing } from '@/components/GlobalStyles';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TransferScreen() {
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transfer Fiat</Text>

      {/* Account Number Input */}
      <Text style={styles.label}>Account Number</Text>
      <TextInput
        style={styles.input}
        value={accountNumber}
        onChangeText={setAccountNumber}
        placeholder="Enter account number"
        keyboardType="numeric"
      />

      {/* Bank Dropdown */}
      <Text style={styles.label}>Select Bank</Text>
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={selectedBank}
          onValueChange={(itemValue) => setSelectedBank(itemValue)}
          style={styles.dropdown}
        >
          <Picker.Item label="Select a bank" value="" />
          <Picker.Item label="Access Bank" value="access" />
          <Picker.Item label="GTBank" value="gtbank" />
          <Picker.Item label="Zenith Bank" value="zenith" />
          <Picker.Item label="First Bank" value="first" />
        </Picker>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: accountNumber && selectedBank ? Colors.green : Colors.gray }]}
        disabled={!accountNumber || !selectedBank}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: Spacing.medium,
  },
  title: {
    color: Colors.white,
    fontSize: 22,
    fontFamily: Fonts.bold,
    marginBottom: Spacing.large,
    textAlign: 'center',
  },
  label: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.regular,
    marginBottom: Spacing.small,
  },
  input: {
    backgroundColor: Colors.darkGray,
    color: Colors.white,
    borderRadius: 8,
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
    fontSize: 16,
    fontFamily: Fonts.regular,
    marginBottom: Spacing.medium,
  },
  dropdownContainer: {
    backgroundColor: Colors.darkGray,
    borderRadius: 8,
    marginBottom: Spacing.medium,
  },
  dropdown: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  button: {
    borderRadius: 8,
    paddingVertical: Spacing.medium,
    alignItems: 'center',
    marginTop: Spacing.large,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
});