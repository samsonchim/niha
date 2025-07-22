import API_CONFIG from '@/constants/ApiConfig';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PRIMARY_COLOR = '#000000';
const WHITE = '#fff';
const GREEN = '#00C853';

export default function BVNScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [bvn, setBvn] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState({ firstName: '', lastName: '' });

  // Get user data from navigation params or previous screens
  React.useEffect(() => {
    if (route.params?.email) {
      setUserEmail(route.params.email);
    }
    if (route.params?.firstName && route.params?.lastName) {
      setUserName({
        firstName: route.params.firstName,
        lastName: route.params.lastName
      });
    }
  }, [route.params]);

  const handleBvnChange = (text: string) => {
    if (/^\d*$/.test(text) && text.length <= 11) {
      setBvn(text);
    }
  };

  const createVirtualAccount = async () => {
    if (bvn.length !== 11) {
      Alert.alert('Invalid BVN', 'Please enter a valid 11-digit BVN');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API_CONFIG.URLS.CREATE_VIRTUAL_ACCOUNT, {
        email: userEmail,
        bvn: bvn,
        firstName: userName.firstName,
        lastName: userName.lastName
      });

      if (response.data.success) {
        const isMockAccount = response.data.data.isMockAccount;
        const mockText = isMockAccount ? ' (Development Mode)' : '';
        const isExisting = response.data.message.includes('already exists');
        
        Alert.alert(
          'Success!',
          isExisting 
            ? `Your virtual account is ready!\n\nAccount Number: ${response.data.data.accountNumber}\nBank: ${response.data.data.bankName}`
            : `Virtual account created successfully!${mockText}\n\nAccount Number: ${response.data.data.accountNumber}\nBank: ${response.data.data.bankName}${isMockAccount ? '\n\n📝 This is a mock account for development. Your app is ready for real Flutterwave integration.' : ''}`,
          [
            {
              text: 'Continue',
              onPress: () => navigation.navigate('(tabs)', {
                user: {
                  email: userEmail,
                  firstName: userName.firstName,
                  lastName: userName.lastName
                },
                virtualAccount: response.data.data
              })
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create virtual account');
      }
    } catch (error: any) {
      console.error('Virtual account creation error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Add more specific error messages
      if (errorMessage.includes('Invalid Contract Code')) {
        errorMessage = 'Payment service configuration issue. Please contact support or try again later.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
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
          style={[styles.button, { 
            backgroundColor: bvn.length === 11 && !loading ? '#2E2E2E' : PRIMARY_COLOR,
            opacity: loading ? 0.7 : 1
          }]}
          onPress={createVirtualAccount}
          disabled={bvn.length !== 11 || loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={WHITE} />
              <Text style={[styles.buttonText, { marginLeft: 8 }]}>Creating Account...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
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
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
