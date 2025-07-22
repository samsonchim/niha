// Example usage of SeedPhraseScreen after user verification
// This shows how to integrate the seed phrase display into your app flow

import API_CONFIG from '@/constants/ApiConfig';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import SeedPhraseScreen from './SeedPhraseScreen';

interface WalletSetupScreenProps {
  userId: string;
  verificationToken: string;
  onWalletSetupComplete: () => void;
}

const WalletSetupScreen: React.FC<WalletSetupScreenProps> = ({
  userId,
  verificationToken,
  onWalletSetupComplete
}) => {
  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch seed phrase from API (only works once, right after verification)
  useEffect(() => {
    const fetchSeedPhrase = async () => {
      try {
        const response = await fetch(API_CONFIG.URLS.GET_SEED_PHRASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            verificationToken
          }),
        });

        const data = await response.json();

        if (data.success) {
          setSeedWords(data.data.seedPhrase);
        } else {
          setError(data.message);
          Alert.alert('Error', data.message);
        }
      } catch (err) {
        setError('Failed to load seed phrase');
        Alert.alert('Error', 'Failed to load seed phrase');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSeedPhrase();
    }
  }, [userId, verificationToken]);

  const handleContinue = () => {
    // Clear sensitive data from memory
    setSeedWords([]);
    onWalletSetupComplete();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <Text style={{ color: 'white', fontSize: 18 }}>🔐 Generating your crypto wallets...</Text>
      </View>
    );
  }

  if (error || seedWords.length !== 12) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e', padding: 20 }}>
        <Text style={{ color: '#FF6B6B', fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
          ❌ Unable to generate seed phrase
        </Text>
        <Text style={{ color: '#CCCCCC', fontSize: 14, textAlign: 'center' }}>
          {error || 'Invalid seed phrase format'}
        </Text>
      </View>
    );
  }

  return (
    <SeedPhraseScreen
      seedWords={seedWords}
      onContinue={handleContinue}
    />
  );
};

export default WalletSetupScreen;

// ===== INTEGRATION EXAMPLE =====
// Use this in your main app after user verification:

/*
import WalletSetupScreen from './components/WalletSetupScreen';

// In your app navigation/routing:
const App = () => {
  const [userVerified, setUserVerified] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [userId, setUserId] = useState('');

  const handleVerificationComplete = (id: string) => {
    setUserId(id);
    setUserVerified(true);
    setShowSeedPhrase(true);
  };

  const handleWalletSetupComplete = () => {
    setShowSeedPhrase(false);
    // Navigate to main app screens
  };

  if (showSeedPhrase && userId) {
    return (
      <WalletSetupScreen
        userId={userId}
        onWalletSetupComplete={handleWalletSetupComplete}
      />
    );
  }

  // Your other app screens...
  return <YourMainApp />;
};
*/
