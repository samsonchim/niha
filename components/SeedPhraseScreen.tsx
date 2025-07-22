import { LinearGradient } from 'expo-linear-gradient';
import * as ScreenCapture from 'expo-screen-capture';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Clipboard,
    Dimensions,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * SeedPhraseScreen - Displays the 12-word seed phrase in a secure, beautiful interface
 * Features:
 * - Beautiful 3x4 grid layout
 * - Copy functionality
 * - Screenshot prevention
 * - Security warnings
 * - One-time display
 */

interface SeedPhraseScreenProps {
  seedWords: string[]; // Array of 12 seed words
  onContinue: () => void; // Callback when user continues
  onBack?: () => void; // Optional back callback
}

const SeedPhraseScreen: React.FC<SeedPhraseScreenProps> = ({
  seedWords,
  onContinue,
  onBack
}) => {
  const [hasBeenCopied, setHasBeenCopied] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [isScreenCaptureEnabled, setIsScreenCaptureEnabled] = useState(false);

  // Prevent screenshots on mount
  useEffect(() => {
    const preventScreenCapture = async () => {
      try {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          await ScreenCapture.preventScreenCaptureAsync();
          setIsScreenCaptureEnabled(false);
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

  // Copy seed phrase to clipboard
  const copySeedPhrase = async () => {
    try {
      const seedPhrase = seedWords.join(' ');
      await Clipboard.setString(seedPhrase);
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
  const handleContinue = () => {
    Alert.alert(
      '⚠️ Final Warning',
      'Have you safely stored your seed phrase? You will NOT be able to see it again. This is your only chance to back it up.',
      [
        { text: 'No, let me copy it', style: 'cancel' },
        {
          text: 'Yes, I\'ve saved it',
          style: 'destructive',
          onPress: onContinue
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

  if (showWarning) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.gradient}
        >
          <View style={styles.warningContainer}>
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
            
            {onBack && (
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <View style={styles.seedPhraseContainer}>
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
              <Text style={styles.copyButtonText}>
                {hasBeenCopied ? '✅ Copied!' : '📋 Copy Seed Phrase'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
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
          
          {!isScreenCaptureEnabled && (
            <View style={styles.screenCaptureWarning}>
              <Text style={styles.screenCaptureText}>
                🛡️ Screenshots disabled for security
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  
  // Warning Screen Styles
  warningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  warningIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 30,
  },
  warningContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  warningText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  securityRules: {
    marginBottom: 20,
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 10,
  },
  rule: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    paddingLeft: 10,
  },
  lossWarning: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  lossText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  continueWarningButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  continueWarningButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  
  // Seed Phrase Display Styles
  seedPhraseContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  seedWordNumber: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  seedWord: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtons: {
    marginBottom: 20,
  },
  copyButton: {
    backgroundColor: 'rgba(76, 205, 196, 0.2)',
    borderWidth: 2,
    borderColor: '#4ECDC4',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  copiedButton: {
    backgroundColor: 'rgba(76, 205, 196, 0.3)',
  },
  copyButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    borderRadius: 10,
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  finalWarning: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  finalWarningText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  finalWarningSubtext: {
    color: '#FFAAAA',
    fontSize: 12,
    textAlign: 'center',
  },
  screenCaptureWarning: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  screenCaptureText: {
    color: '#4ECDC4',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default SeedPhraseScreen;
