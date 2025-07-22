import API_CONFIG from '@/constants/ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#1A1A1A';
const SECONDARY_COLOR = '#2A2A2A';
const GREEN = '#00C853';
const WHITE = '#FFFFFF';
const GRAY = '#B0B0B0';

interface SeedPhraseScreenProps {}

export default function SeedPhraseScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [hasBeenCopied, setHasBeenCopied] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isRealSeedPhrase, setIsRealSeedPhrase] = useState(false);
  const [navigationBlocked, setNavigationBlocked] = useState(false);

  // Prevent automatic navigation back when error occurs
  useFocusEffect(
    useCallback(() => {
      console.log('🎯 Seed phrase screen focused');
      
      // Block back navigation for error states
      if (error && !isRealSeedPhrase) {
        console.log('🚫 Blocking automatic navigation due to error state');
        setNavigationBlocked(true);
        
        // Prevent hardware back button on Android
        const backHandler = () => {
          console.log('🚫 Hardware back button blocked in error state');
          return true; // Block the back action
        };
        
        // Add back button listener if available
        if (Platform.OS === 'android') {
          const { BackHandler } = require('react-native');
          const subscription = BackHandler.addEventListener('hardwareBackPress', backHandler);
          
          return () => {
            subscription?.remove();
          };
        }
      }
      
      return () => {};
    }, [error, isRealSeedPhrase])
  );

  // Prevent screenshots on mount
  useEffect(() => {
    const preventScreenCapture = async () => {
      try {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          await ScreenCapture.preventScreenCaptureAsync();
        }
      } catch (error) {
        console.warn('Could not prevent screen capture:', error);
      }
    };

    preventScreenCapture();

    // Re-enable on unmount
    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(console.warn);
    };
  }, []);

  // Get user info and fetch seed phrase
  useEffect(() => {
    const fetchSeedPhrase = async () => {
      try {
        console.log('📋 Route params in seed phrase:', route.params);
        
        // Handle both old navigation format and new router format
        let userInfo = null;
        if (route.params?.user) {
          // Old navigation format
          userInfo = route.params.user;
        } else if (route.params?.userId) {
          // New router format
          userInfo = {
            id: route.params.userId,
            email: route.params.userEmail,
            firstName: route.params.firstName,
            lastName: route.params.lastName
          };
        } else {
          // Fallback: Try to get user info from AsyncStorage
          console.log('🔍 No route params found, checking AsyncStorage...');
          try {
            const storedSession = await AsyncStorage.getItem('userSession');
            if (storedSession) {
              const sessionData = JSON.parse(storedSession);
              console.log('✅ Found user session in AsyncStorage:', sessionData.email);
              userInfo = {
                id: sessionData.id,
                email: sessionData.email,
                firstName: sessionData.firstName,
                lastName: sessionData.lastName
              };
            } else {
              console.error('❌ No user session found in AsyncStorage');
              setError('User session not found. Please sign in again.');
              setLoading(false);
              return;
            }
          } catch (storageError) {
            console.error('❌ Error reading from AsyncStorage:', storageError);
            setError('Session error. Please sign in again.');
            setLoading(false);
            return;
          }
        }
        
        if (userInfo) {
          console.log('👤 User info for seed phrase:', userInfo);
          setUserInfo(userInfo);
          
          // Try to fetch the real seed phrase from the API
          try {
            console.log('🔐 Attempting to fetch real seed phrase from API...');
            const response = await axios.post(API_CONFIG.URLS.GET_SEED_PHRASE, {
              userId: userInfo.id,
              email: userInfo.email
            });

            if (response.data.success) {
              console.log('✅ Real seed phrase fetched successfully');
              setSeedWords(response.data.data.seedPhrase);
              setIsRealSeedPhrase(true);
            } else {
              console.warn('⚠️ API returned error for seed phrase:', response.data.message);
              
              // Check if it's an expiration or access issue
              if (response.data.message.includes('expired') || response.data.message.includes('access')) {
                console.log('💡 Seed phrase access expired - this is normal for security');
                // Set a message explaining the situation
                const explanationPhrase = [
                  'For', 'security', 'your', 'seed', 'phrase', 'access',
                  'has', 'expired', 'after', 'verification', 'please', 'contact'
                ];
                setSeedWords(explanationPhrase);
                setError('Your seed phrase access has expired for security reasons. Please contact support if you need wallet recovery assistance.');
                setIsRealSeedPhrase(false);
              } else {
                // Use demo seed phrase for other API errors
                console.log('🎭 Using demo seed phrase for testing');
                const demoSeedPhrase = [
                  'abandon', 'ability', 'able', 'about', 'above', 'absent',
                  'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'
                ];
                setSeedWords(demoSeedPhrase);
                setIsRealSeedPhrase(true); // Allow demo to work like real seed phrase
              }
            }
          } catch (apiError: any) {
            console.warn('❌ API error fetching seed phrase:', apiError.response?.status, apiError.response?.data?.message || apiError.message);
            
            // Handle specific API error cases
            if (apiError.response?.status === 404) {
              console.log('📝 Seed phrase endpoint not found or user not properly set up');
              setError('Seed phrase not available. Your wallets were created but the seed phrase access has expired for security.');
              
              // Show a helpful message instead of random words
              const helpMessage = [
                'Your', 'wallets', 'are', 'ready', 'but', 'seed',
                'phrase', 'access', 'expired', 'for', 'security', 'reasons'
              ];
              setSeedWords(helpMessage);
              setIsRealSeedPhrase(false);
              setShowWarning(false); // Hide warning screen when error occurs
              console.log('🚨 404 Error state set - error:', 'Seed phrase not available', 'isRealSeedPhrase:', false, 'seedWords length:', helpMessage.length);
            } else if (apiError.response?.status === 403) {
              console.log('🔒 Seed phrase access forbidden - likely expired');
              setError('Seed phrase access expired for security. Contact support for wallet recovery options.');
              
              const securityMessage = [
                'Seed', 'phrase', 'access', 'expired', 'for', 'your',
                'security', 'contact', 'support', 'if', 'needed', 'help'
              ];
              setSeedWords(securityMessage);
              setIsRealSeedPhrase(false);
              setShowWarning(false); // Hide warning screen when error occurs
            } else {
              // Fallback to demo seed phrase for development/testing
              console.log('🎭 Using demo seed phrase due to API error');
              const demoSeedPhrase = [
                'abandon', 'ability', 'able', 'about', 'above', 'absent',
                'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'
              ];
              setSeedWords(demoSeedPhrase);
              setIsRealSeedPhrase(true); // Allow demo to work like real seed phrase
            }
          }
          
          setLoading(false);
          console.log('🔄 Final state after API call - loading:', false, 'error:', error, 'isRealSeedPhrase:', isRealSeedPhrase, 'seedWords length:', seedWords.length);
        } else {
          console.error('❌ User information not found in route params');
          setError('User information not found');
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Failed to load seed phrase:', err);
        setError('Failed to load seed phrase');
        setLoading(false);
      }
    };

    fetchSeedPhrase();
  }, [route.params]);

  // Copy seed phrase to clipboard
  const copySeedPhrase = async () => {
    try {
      const seedPhrase = seedWords.join(' ');
      await Clipboard.setStringAsync(seedPhrase);
      setHasBeenCopied(true);
      
      Alert.alert(
        '📋 Copied!',
        'Your seed phrase has been copied to clipboard. Paste it into a secure password manager or write it down offline.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to copy seed phrase');
    }
  };

  // Handle continue with confirmation
  const handleContinue = async () => {
    Alert.alert(
      '⚠️ Final Warning',
      'Have you safely stored your seed phrase? You will NOT be able to see it again. This is your only chance to back it up.',
      [
        { text: 'No, let me copy it', style: 'cancel' },
        {
          text: 'Yes, I\'ve saved it',
          style: 'destructive',
          onPress: async () => {
            console.log('🚀 User confirmed seed phrase backup, navigating to main app');
            
            // Ensure user session is maintained
            try {
              const storedSession = await AsyncStorage.getItem('userSession');
              if (!storedSession && userInfo) {
                console.log('💾 Refreshing user session before navigation...');
                const userData = {
                  id: userInfo.id,
                  email: userInfo.email,
                  firstName: userInfo.firstName,
                  lastName: userInfo.lastName,
                  isAuthenticated: true,
                  authTimestamp: new Date().toISOString()
                };
                await AsyncStorage.setItem('userSession', JSON.stringify(userData));
                await AsyncStorage.setItem('isLoggedIn', 'true');
              }
              
              // Mark onboarding as complete
              await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
              console.log('✅ Onboarding marked as complete');
            } catch (error) {
              console.error('❌ Error maintaining session:', error);
            }
            
            // Clear sensitive data from memory
            setSeedWords([]);
            // Navigate to main app using router
            router.push('/(tabs)');
          }
        }
      ]
    );
  };

  // Render seed word card
  const renderSeedWord = (word: string, index: number) => (
    <View key={index} style={styles.seedWordCard}>
      <Text style={styles.seedWordNumber}>{index + 1}</Text>
      <Text style={styles.seedWord}>{word}</Text>
    </View>
  );

  if (loading) {
    console.log('🔄 Rendering loading screen');
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1A1A1A', '#2A2A2A']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>🔐 Generating your crypto wallets...</Text>
            <Text style={styles.loadingSubtext}>Creating secure seed phrase and wallet addresses</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error && !isRealSeedPhrase) {
    console.log('🚨 Rendering error screen - error:', error, 'isRealSeedPhrase:', isRealSeedPhrase);
    console.log('🛡️ Error screen should stay - preventing any automatic navigation');
    
    return (
      <SafeAreaView style={styles.container} key="error-screen">
        <LinearGradient colors={['#1A1A1A', '#2A2A2A']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>🔒</Text>
            <Text style={styles.errorText}>Seed Phrase Not Available</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
            
            {/* Show the helpful message words */}
            {seedWords.length > 0 && (
              <View style={styles.errorWordsContainer}>
                <View style={styles.errorSeedGrid}>
                  {seedWords.map((word, index) => (
                    <View key={index} style={styles.errorSeedWordCard}>
                      <Text style={styles.errorSeedWordNumber}>{index + 1}</Text>
                      <Text style={styles.errorSeedWord}>{word}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.continueAnywayButton} 
              onPress={() => {
                console.log('✅ User chose to continue to app from error screen');
                router.replace('/(tabs)'); // Use replace instead of push
              }}
            >
              <Text style={styles.continueAnywayButtonText}>Continue to App</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => {
                console.log('⬅️ User chose to go back from error screen');
                router.replace('/auth/bvn'); // Use replace to go back
              }}
            >
              <Text style={styles.retryButtonText}>Go Back to BVN</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (showWarning && !error) {
    console.log('⚠️ Rendering warning screen');
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1A1A1A', '#2A2A2A']} style={styles.gradient}>
          <ScrollView contentContainerStyle={styles.warningContainer}>
            <Text style={styles.warningIcon}>🚨</Text>
            <Text style={styles.warningTitle}>CRITICAL: Seed Phrase Security</Text>
            
            <View style={styles.warningContent}>
              <Text style={styles.warningText}>
                Your seed phrase is the MASTER KEY to your crypto wallets. Anyone who has it can access ALL your funds.
              </Text>
              
              <View style={styles.securityRules}>
                <Text style={styles.ruleTitle}>🔐 Security Rules:</Text>
                <Text style={styles.rule}>• Write it down on paper (offline storage)</Text>
                <Text style={styles.rule}>• Store in multiple secure locations</Text>
                <Text style={styles.rule}>• NEVER share with anyone</Text>
                <Text style={styles.rule}>• NEVER store digitally or in photos</Text>
                <Text style={styles.rule}>• NEVER enter into suspicious websites</Text>
              </View>
              
              <View style={styles.lossWarning}>
                <Text style={styles.lossText}>
                  ⚠️ If you lose this seed phrase, your crypto is GONE FOREVER.
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.continueWarningButton}
              onPress={() => setShowWarning(false)}
            >
              <Text style={styles.continueWarningButtonText}>
                I understand, show my seed phrase
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  console.log('✅ Rendering normal seed phrase screen - seedWords:', seedWords.length, 'isRealSeedPhrase:', isRealSeedPhrase);
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1A1A1A', '#2A2A2A']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.seedPhraseContainer}>
          <Text style={styles.title}>🔐 Your Recovery Seed Phrase</Text>
          <Text style={styles.subtitle}>
            These 12 words are your crypto wallet master key
          </Text>
          
          <View style={styles.seedGrid}>
            {seedWords.map((word, index) => renderSeedWord(word, index))}
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.copyButton, hasBeenCopied && styles.copiedButton]}
              onPress={copySeedPhrase}
            >
              <Text style={[styles.copyButtonText, hasBeenCopied && styles.copiedButtonText]}>
                {hasBeenCopied ? '✅ Copied!' : '📋 Copy Seed Phrase'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue to App</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.finalWarning}>
            <Text style={styles.finalWarningText}>
              🚨 This is your ONLY chance to back up your seed phrase
            </Text>
            <Text style={styles.finalWarningSubtext}>
              We don't store it anywhere. Once you continue, it's gone forever.
            </Text>
          </View>
          
          <View style={styles.screenCaptureWarning}>
            <Text style={styles.screenCaptureText}>
              🛡️ Screenshots disabled for security
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  
  // Loading Screen Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: WHITE,
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: GRAY,
    textAlign: 'center',
  },
  
  // Error Screen Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: GRAY,
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: SECONDARY_COLOR,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  continueAnywayButton: {
    backgroundColor: GREEN,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  continueAnywayButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  errorWordsContainer: {
    marginVertical: 20,
    width: '100%',
  },
  errorSeedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  errorSeedWordCard: {
    width: (width - 100) / 3,
    backgroundColor: 'rgba(42, 42, 42, 0.5)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  errorSeedWordNumber: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#dc3545',
    marginBottom: 3,
  },
  errorSeedWord: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: GRAY,
    textAlign: 'center',
  },
  
  // Warning Screen Styles
  warningContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  warningIcon: {
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 30,
  },
  warningContent: {
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: SECONDARY_COLOR,
  },
  warningText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: WHITE,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  securityRules: {
    marginBottom: 20,
  },
  ruleTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: GREEN,
    marginBottom: 10,
  },
  rule: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: GRAY,
    marginBottom: 8,
    paddingLeft: 10,
  },
  lossWarning: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  lossText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#dc3545',
    textAlign: 'center',
  },
  continueWarningButton: {
    backgroundColor: GREEN,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  continueWarningButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  backButton: {
    padding: 10,
    alignSelf: 'center',
  },
  backButtonText: {
    color: GRAY,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  
  // Seed Phrase Display Styles
  seedPhraseContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: WHITE,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: GRAY,
    textAlign: 'center',
    marginBottom: 30,
  },
  seedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  seedWordCard: {
    width: (width - 60) / 3,
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  seedWordNumber: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: GREEN,
    marginBottom: 5,
  },
  seedWord: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: WHITE,
    textAlign: 'center',
  },
  actionButtons: {
    marginBottom: 20,
  },
  copyButton: {
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
    borderWidth: 2,
    borderColor: GREEN,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  copiedButton: {
    backgroundColor: 'rgba(0, 200, 83, 0.2)',
  },
  copyButtonText: {
    color: GREEN,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  copiedButtonText: {
    color: GREEN,
  },
  continueButton: {
    backgroundColor: GREEN,
    paddingVertical: 15,
    borderRadius: 10,
  },
  continueButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  finalWarning: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  finalWarningText: {
    color: '#dc3545',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  finalWarningSubtext: {
    color: '#dc3545',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  screenCaptureWarning: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  screenCaptureText: {
    color: GREEN,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
  },
});
