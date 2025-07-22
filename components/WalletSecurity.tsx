import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WalletSecurityProps {
  userId: string;
  onClose: () => void;
}

interface WalletStatus {
  active: number;
  deactivated: number;
  total: number;
  hasWallets: boolean;
}

interface SecurityStatus {
  seedPhraseAccessible: boolean;
  seedPhraseExpiresAt: string | null;
  canRecoverWallets: boolean;
}

const WalletSecurity: React.FC<WalletSecurityProps> = ({ userId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [confirmationText, setConfirmationText] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showReactivateForm, setShowReactivateForm] = useState(false);
  const [transferGuide, setTransferGuide] = useState<any>(null);

  useEffect(() => {
    loadWalletStatus();
  }, []);

  const loadWalletStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/wallet-security-status/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setWalletStatus(data.data.walletStatus);
        setSecurityStatus(data.data.securityStatus);
      }
    } catch (error) {
      console.error('Failed to load wallet status:', error);
      Alert.alert('Error', 'Failed to load wallet status');
    }
    setLoading(false);
  };

  const handleDeactivateWallets = async () => {
    if (confirmationText !== 'PERMANENTLY DEACTIVATE MY WALLETS') {
      Alert.alert('Error', 'Please type the exact confirmation phrase');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/deactivate-wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          confirmationPhrase: confirmationText
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Wallets deactivated successfully', [
          { text: 'OK', onPress: () => {
            setShowDeactivateConfirm(false);
            setConfirmationText('');
            loadWalletStatus();
          }}
        ]);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Failed to deactivate wallets:', error);
      Alert.alert('Error', 'Failed to deactivate wallets');
    }
    setLoading(false);
  };

  const handleReactivateWallets = async () => {
    if (!seedPhrase || seedPhrase.trim().split(' ').length !== 12) {
      Alert.alert('Error', 'Please enter a valid 12-word seed phrase');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/reactivate-wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          seedPhrase: seedPhrase.trim()
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Wallets reactivated successfully', [
          { text: 'OK', onPress: () => {
            setShowReactivateForm(false);
            setSeedPhrase('');
            loadWalletStatus();
          }}
        ]);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Failed to reactivate wallets:', error);
      Alert.alert('Error', 'Failed to reactivate wallets');
    }
    setLoading(false);
  };

  const loadTransferGuide = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/transfer-and-deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTransferGuide(data.data);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Failed to load transfer guide:', error);
      Alert.alert('Error', 'Failed to load transfer guide');
    }
    setLoading(false);
  };

  const shareTransferGuide = async () => {
    if (!transferGuide) return;

    const message = `🚨 WALLET DEACTIVATION CHECKLIST\n\n` +
      `Wallets to check: ${transferGuide.walletsToTransfer}\n\n` +
      transferGuide.transferGuide.map((wallet: any) => 
        `${wallet.coin} (${wallet.name})\nAddress: ${wallet.fromAddress}\n`
      ).join('\n') +
      '\n📋 NEXT STEPS:\n' +
      transferGuide.nextSteps.map((step: string, index: number) => 
        `${index + 1}. ${step.replace(/^\d+\.\s/, '')}`
      ).join('\n');

    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  if (loading && !walletStatus) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C853" />
            <Text style={styles.loadingText}>Loading wallet status...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🔐 Wallet Security Manager</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ IMPORTANT: Blockchain addresses cannot be truly "deleted". 
              Deactivation hides wallets from your app but they remain on the blockchain.
            </Text>
          </View>

          {/* Wallet Status */}
          {walletStatus && (
            <View style={styles.statusCard}>
              <Text style={styles.sectionTitle}>📊 Wallet Status</Text>
              <View style={styles.statusGrid}>
                <View style={styles.statusItem}>
                  <Text style={styles.statusNumber}>{walletStatus.active}</Text>
                  <Text style={styles.statusLabel}>Active</Text>
                </View>
                <View style={styles.statusItem}>
                  <Text style={[styles.statusNumber, styles.deactivated]}>{walletStatus.deactivated}</Text>
                  <Text style={styles.statusLabel}>Deactivated</Text>
                </View>
                <View style={styles.statusItem}>
                  <Text style={styles.statusNumber}>{walletStatus.total}</Text>
                  <Text style={styles.statusLabel}>Total</Text>
                </View>
              </View>
            </View>
          )}

          {/* Active Wallets Actions */}
          {walletStatus?.active > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>🔴 Deactivate Wallets</Text>
              
              {!showDeactivateConfirm ? (
                <View>
                  <TouchableOpacity 
                    style={styles.dangerButton}
                    onPress={loadTransferGuide}
                  >
                    <Text style={styles.buttonText}>📤 Check Transfer Guide First</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.dangerButton, { marginTop: 10 }]}
                    onPress={() => setShowDeactivateConfirm(true)}
                  >
                    <Text style={styles.buttonText}>🗑️ Deactivate All Wallets</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={styles.confirmationText}>
                    Type the following phrase to confirm deactivation:
                  </Text>
                  <Text style={styles.confirmationPhrase}>
                    PERMANENTLY DEACTIVATE MY WALLETS
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={confirmationText}
                    onChangeText={setConfirmationText}
                    placeholder="Type confirmation phrase here..."
                    placeholderTextColor="#666"
                    autoCapitalize="characters"
                  />
                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowDeactivateConfirm(false);
                        setConfirmationText('');
                      }}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.dangerButton, { opacity: confirmationText === 'PERMANENTLY DEACTIVATE MY WALLETS' ? 1 : 0.5 }]}
                      onPress={handleDeactivateWallets}
                      disabled={confirmationText !== 'PERMANENTLY DEACTIVATE MY WALLETS' || loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.buttonText}>Confirm Deactivation</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Transfer Guide */}
          {transferGuide && (
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📤 Transfer Guide</Text>
                <TouchableOpacity onPress={shareTransferGuide} style={styles.shareButton}>
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.transferWarning}>
                🚨 Transfer ALL funds before deactivating wallets!
              </Text>
              
              {transferGuide.transferGuide.map((wallet: any, index: number) => (
                <View key={index} style={styles.walletCard}>
                  <Text style={styles.walletTitle}>{wallet.coin} - {wallet.name}</Text>
                  <Text style={styles.walletAddress}>Address: {wallet.fromAddress}</Text>
                  <Text style={styles.walletInstructions}>
                    Apps: {wallet.instructions.walletApps.join(', ')}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Deactivated Wallets Recovery */}
          {walletStatus?.deactivated > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>🔄 Reactivate Wallets</Text>
              
              {!showReactivateForm ? (
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => setShowReactivateForm(true)}
                >
                  <Text style={styles.buttonText}>🔓 Reactivate Wallets</Text>
                </TouchableOpacity>
              ) : (
                <View>
                  <Text style={styles.instructions}>
                    Enter your 12-word seed phrase to reactivate your wallets:
                  </Text>
                  <TextInput
                    style={[styles.input, styles.seedInput]}
                    value={seedPhrase}
                    onChangeText={setSeedPhrase}
                    placeholder="word1 word2 word3 ... word12"
                    placeholderTextColor="#666"
                    multiline
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowReactivateForm(false);
                        setSeedPhrase('');
                      }}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.primaryButton, { opacity: seedPhrase.trim().split(' ').length === 12 ? 1 : 0.5 }]}
                      onPress={handleReactivateWallets}
                      disabled={seedPhrase.trim().split(' ').length !== 12 || loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.buttonText}>Reactivate</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Education Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📚 Understanding Wallet "Deletion"</Text>
            <View style={styles.educationList}>
              <Text style={styles.educationItem}>
                • Blockchain addresses are permanent mathematical constructs
              </Text>
              <Text style={styles.educationItem}>
                • "Deactivation" hides wallets from your app interface
              </Text>
              <Text style={styles.educationItem}>
                • Your seed phrase can always recover the addresses
              </Text>
              <Text style={styles.educationItem}>
                • Funds sent to these addresses remain recoverable
              </Text>
              <Text style={styles.educationItem}>
                • True deletion is impossible on blockchain networks
              </Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningBanner: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  warningText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#00C853',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  shareButton: {
    backgroundColor: '#00C853',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C853',
  },
  statusLabel: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  deactivated: {
    color: '#FF5722',
  },
  primaryButton: {
    backgroundColor: '#00C853',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  dangerButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 15,
  },
  confirmationText: {
    color: '#fff',
    marginBottom: 10,
  },
  confirmationPhrase: {
    color: '#00C853',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  seedInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  instructions: {
    color: '#ccc',
    marginBottom: 15,
    lineHeight: 20,
  },
  transferWarning: {
    color: '#FF5722',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  walletCard: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  walletTitle: {
    color: '#00C853',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  walletAddress: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 5,
  },
  walletInstructions: {
    color: '#999',
    fontSize: 12,
  },
  educationList: {
    marginTop: 10,
  },
  educationItem: {
    color: '#ccc',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default WalletSecurity;
