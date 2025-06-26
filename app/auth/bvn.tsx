import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PRIMARY_COLOR = '#000000';
const WHITE = '#fff';
const GREEN = '#00C853';

export default function BVNScreen() {
  const navigation = useNavigation();
  const [bvn, setBvn] = useState('');



  const handleBvnChange = (text: string) => {
    if (/^\d*$/.test(text) && text.length <= 11) {
      setBvn(text);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BVN Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
      
        <Text style={styles.title}>Enter your BVN</Text>
        
        <Text style={styles.description}>
          Please provide your 11-digit Bank Verification Number (BVN)
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={bvn}
            onChangeText={handleBvnChange}
            keyboardType="numeric"
            maxLength={11}
            secureTextEntry={true}
            placeholder="Enter BVN"
            placeholderTextColor="#666"
          />
          {bvn.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setBvn('')}>
              <AntDesign name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.hint}>
          Your BVN is an 11-digit number that can be found by dialing *565*0#
        </Text>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: bvn.length === 11 ? '#2E2E2E' : PRIMARY_COLOR }]}
          onPress={() => bvn.length === 11 && navigation.navigate('auth/signin')}
          disabled={bvn.length !== 11}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
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
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2E2E2E',
    borderRadius: 8,
    padding: 16,
    color: WHITE,
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    letterSpacing: 1,
    borderWidth: 1.5,
    borderColor: '#232323',
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
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
  }
});
