import { CopyToClipboard } from '@/components/ui/CopyToClipboard';
import CustomSuccessPopup from '@/components/ui/CustomSuccessPopup';
import API_CONFIG from '@/constants/ApiConfig';
import WalletBalanceFetcher from '@/utils/WalletBalanceFetcher';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


// During Serverside handling, I will be Extracting only wallet.id then fetching data from a central state and 
// also Making wallet-details.tsx responsive to route changes


interface Wallet {
  symbol: string;
  name: string;
  network: string;
  address: string;
  balance?: string;
  usdValue?: string;
  icon: string;
  category: 'Crypto' | 'Fiat';
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const ICONS: Record<string, any> = {
  BTC: require('@/assets/images/icons/bitcoin.png'),
  ETH: require('@/assets/images/icons/etherum.png'), 
  BNB: require('@/assets/images/icons/bnb.png'),
  SOL: require('@/assets/images/icons/solana.png'),
  USDT: require('@/assets/images/icons/usdt.png'),
  USDC: require('@/assets/images/icons/usdc.png'),
  MATIC: require('@/assets/images/icons/matic.png'), 
  TRX: require('@/assets/images/icons/tron.png'),
  DAI: require('@/assets/images/icons/dai.png'),
  DOGE: require('@/assets/images/icons/doge.png'),
};



type FilterType = 'Crypto' | 'Fiat';

export default function WalletsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Crypto');
  const [showFiatModal, setShowFiatModal] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorPopupData, setErrorPopupData] = useState({ title: '', message: '' });

  // Helper function to show error popup
  const showError = (title: string, message: string) => {
    setErrorPopupData({ title, message });
    setShowErrorPopup(true);
  };

  // Handle error popup actions
  const handleErrorPopupContinue = () => {
    setShowErrorPopup(false);
    if (errorPopupData.title === 'Authentication Required') {
      router.replace('/auth');
    }
  };

  // Load user data and wallets on component mount
  useEffect(() => {
    loadUserAndWallets();
  }, []);

  const loadUserAndWallets = async () => {
    try {
      // Get user data from AsyncStorage
      const userData = await AsyncStorage.getItem('user');
      console.log('📱 User data from AsyncStorage:', userData);
      
      if (!userData) {
        console.log('❌ No user data found, redirecting to auth');
        showError('Authentication Required', 'Please log in to view your wallets');
        return;
      }

      const parsedUser = JSON.parse(userData);
      console.log('👤 Parsed user:', parsedUser);
      setUser(parsedUser);

      // Fetch user's wallets from API
      await fetchUserWallets(parsedUser.id);
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      showError('Error', 'Failed to load user data');
    }
  };

  const fetchUserWallets = async (userId: string) => {
    try {
      setLoading(true);
      const apiUrl = `${API_CONFIG.URLS.USER_WALLETS}/${userId}`;
      console.log('🔍 Fetching wallets from:', apiUrl);
      console.log('👤 User ID:', userId);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      console.log('📡 API Response:', data);

      if (data.success) {
        // Convert API wallet data to component format
        const formattedWallets: Wallet[] = Object.values(data.data.wallets).map((wallet: any) => ({
          symbol: wallet.symbol,
          name: wallet.name,
          network: wallet.network,
          address: wallet.address,
          balance: '0.00', // Will be fetched from blockchain
          usdValue: '$0.00', // Will be calculated
          icon: wallet.symbol,
          category: 'Crypto' as const,
          createdAt: wallet.createdAt
        }));

        console.log('💰 Formatted wallets:', formattedWallets);
        setWallets(formattedWallets);
        
        // Fetch real balances for each wallet (optional - in background)
        fetchWalletBalances(formattedWallets);
      } else {
        console.log('⚠️ API returned error:', data.message);
        if (data.message?.includes('No wallets found')) {
          setWallets([]);
        } else {
          throw new Error(data.message);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching wallets:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError('Error', `Failed to load wallets: ${errorMessage}. Check console for details.`);
      setWallets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch real-time wallet balances from blockchain
  const fetchWalletBalances = async (walletList: Wallet[]) => {
    try {
      console.log('🔄 Fetching real wallet balances from blockchain...');
      
      // Option 1: Use your backend API to fetch balances (recommended)
      try {
        const response = await fetch(API_CONFIG.URLS.WALLET_BALANCES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallets: walletList.map(wallet => ({
              address: wallet.address,
              symbol: wallet.symbol,
              network: wallet.network || 'mainnet'
            }))
          })
        });

        const data = await response.json();
        
        if (data.success && data.balances) {
          console.log('✅ Received balances from backend:', data.balances);
          
          // Update wallet balances with backend response
          setWallets(prevWallets => 
            prevWallets.map(wallet => {
              const balanceData = data.balances.find((b: any) => b.address === wallet.address);
              if (balanceData) {
                return {
                  ...wallet,
                  balance: balanceData.balance || '0.00',
                  usdValue: balanceData.usdValue || '$0.00'
                };
              }
              return wallet;
            })
          );
          return; // Exit early if backend API works
        }
      } catch (backendError) {
        console.log('⚠️ Backend balance API not available, falling back to direct blockchain calls');
      }

      // Option 2: Fallback to direct blockchain API calls
      console.log('🔗 Fetching balances directly from blockchain APIs...');
      
      for (let i = 0; i < walletList.length; i++) {
        const wallet = walletList[i];
        
        try {
          console.log(`🔍 Fetching balance for ${wallet.symbol} at ${wallet.address}`);
          
          const balanceResult = await WalletBalanceFetcher.getWalletBalance(
            wallet.address, 
            wallet.symbol, 
            wallet.network || 'mainnet'
          );
          
          if (balanceResult.success) {
            setWallets(prevWallets => 
              prevWallets.map(w => 
                w.address === wallet.address 
                  ? { ...w, balance: balanceResult.balance, usdValue: balanceResult.usdValue }
                  : w
              )
            );
            console.log(`✅ ${wallet.symbol} balance updated: ${balanceResult.balance}`);
          } else {
            console.error(`❌ Failed to fetch ${wallet.symbol} balance:`, balanceResult.error);
          }
        } catch (error) {
          console.error(`❌ Error fetching balance for ${wallet.symbol}:`, error);
        }
        
        // Add delay between requests to avoid rate limiting
        if (i < walletList.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
      
      console.log('✅ Real wallet balance fetching completed');
      
    } catch (error) {
      console.error('❌ Error fetching wallet balances:', error);
      showError('Balance Error', 'Failed to fetch wallet balances. Please try again.');
    }
  };

  // Function to refresh wallets
  const handleRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await fetchUserWallets(user.id);
    }
  };

  const filteredWallets = wallets.filter(wallet => 
    wallet.category === selectedFilter
  );

  const handleFilterPress = (filter: FilterType) => {
    if (filter === 'Fiat') {
      setShowFiatModal(true);
    } else {
      setSelectedFilter(filter);
      setShowFiatModal(false);
    }
  };

  const closeFiatModal = () => {
    setShowFiatModal(false);
    setSelectedFilter('Crypto');
  };

  const handleWalletPress = (wallet: Wallet) => {
    router.push({
      pathname: '/screens/wallet-details',
      params: {
        name: wallet.name,
        symbol: wallet.symbol,
        balance: wallet.balance || '0.00',
        usdValue: wallet.usdValue || '$0.00',
        icon: wallet.icon,
        address: wallet.address,
      },
    });
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Wallets</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <View style={styles.qrContainer}>
              <Image
                source={require('@/assets/images/icons/qr-scanner.png')}
                style={{ width: 24, height: 24, tintColor: '#00C853' }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C853" />
          <Text style={styles.loadingText}>Loading your wallets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wallets</Text>
        <View style={styles.headerRight}>
          {user && (
            <Text style={styles.userWelcome}>Hi, {user.firstName}</Text>
          )}
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <View style={styles.qrContainer}>
              {refreshing ? (
                <ActivityIndicator size="small" color="#00C853" />
              ) : (
                <Image
                  source={require('@/assets/images/icons/qr-scanner.png')}
                  style={{ width: 24, height: 24, tintColor: '#00C853' }}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        {(['Crypto', 'Fiat'] as FilterType[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, selectedFilter === filter && styles.activeFilterTab]}
            onPress={() => handleFilterPress(filter)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, selectedFilter === filter && styles.activeFilterText]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#00C853']}
            tintColor="#00C853"
          />
        }
      >
        {filteredWallets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Wallets Found</Text>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'Crypto' 
                ? 'You don\'t have any crypto wallets yet. Complete your account setup to generate wallets.'
                : 'No fiat accounts available.'
              }
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <Text style={styles.refreshButtonText}>
                {refreshing ? 'Refreshing...' : 'Refresh Wallets'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredWallets.map((wallet, index) => (
            <TouchableOpacity 
              key={`${wallet.symbol}-${index}`}
              style={styles.walletItem}
              onPress={() => handleWalletPress(wallet)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={ICONS[wallet.icon] || ICONS['BTC']}
                  style={styles.coinIcon}
                />
              </View>

              <View style={styles.walletInfo}>
                <View style={styles.topRow}>
                  <Text style={styles.coinName}>{wallet.symbol}</Text>
                  <Text style={styles.balance}>{wallet.balance || '0.00'}</Text>
                </View>

                <View style={styles.bottomRow}>
                  <View style={styles.networkBadge}>
                    <Text style={styles.networkText}>{wallet.network}</Text>
                  </View>
                  <Text style={styles.usdValue}>{wallet.usdValue || '$0.00'}</Text>
                </View>

                <View style={styles.addressRow}>
                  <Text style={styles.address} numberOfLines={1}>{wallet.address}</Text>
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent wallet navigation when copy is pressed
                    }}
                    activeOpacity={0.7}
                  >
                    <CopyToClipboard text={wallet.address} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Fiat Virtual Account Modal */}
      <Modal
        visible={showFiatModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeFiatModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={closeFiatModal}
          />
          
          <View style={styles.modalContainer}>
            {/* Virtual Account Card */}
            <View style={styles.virtualAccountCard}>
              <View style={styles.cardHeader}>
                <View style={styles.bankIconContainer}>
                  <FontAwesome name="bank" size={16} color="#fff" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Dedicated Virtual Account</Text>
                  <Text style={styles.cardSubtitle}>Make transfers using this account number</Text>
                </View>
              </View>
              
              <Text style={styles.accountNumber}>615 398 9490</Text>
              <Text style={styles.bankName}>Access Microfinance Bank</Text>
              
              <TouchableOpacity style={styles.shareButton}>
                <Text style={styles.shareButtonText}>Share Details</Text>
              </TouchableOpacity>
            </View>

            {/* OR Divider */}
            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            {/* Cash Deposit Options */}
            <View style={styles.depositOptions}>
              <TouchableOpacity style={styles.depositOption}>
                <View style={styles.depositIconContainer}>
                  <FontAwesome name="money" size={16} color="#fff" />
                </View>
                <View style={styles.depositTextContainer}>
                  <Text style={styles.depositTitle}>Cash Deposit</Text>
                  <Text style={styles.depositSubtitle}>Deposit the money to your dedicated virtual account</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.depositOption}>
                <View style={styles.depositIconContainer}>
                  <FontAwesome name="money" size={16} color="#fff" />
                </View>
                <View style={styles.depositTextContainer}>
                  <Text style={styles.depositTitle}>Cash Deposit</Text>
                  <Text style={styles.depositSubtitle}>Deposit the money to your dedicated virtual account</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.depositOption}>
                <View style={styles.depositIconContainer}>
                  <FontAwesome name="money" size={16} color="#fff" />
                </View>
                <View style={styles.depositTextContainer}>
                  <Text style={styles.depositTitle}>Cash Deposit</Text>
                  <Text style={styles.depositSubtitle}>Deposit the money to your dedicated virtual account</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Error Popup */}
      <CustomSuccessPopup
        visible={showErrorPopup}
        type="error"
        title={errorPopupData.title}
        message={errorPopupData.message}
        buttonText="OK"
        onButtonPress={handleErrorPopupContinue}
        onClose={() => setShowErrorPopup(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userWelcome: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateText: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#00C853',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
  },
  qrContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrGrid: {
    width: 16,
    height: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  qrDot: {
    width: 6,
    height: 6,
    backgroundColor: '#00C853',
    margin: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeFilterTab: {
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
    borderRadius: 0,
  },
  filterText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  activeFilterText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  coinIcon: {
    width: 36, 
    height: 36,
    borderRadius: 18,
    resizeMode: 'contain', 
  },
  walletInfo: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  coinName: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  balance: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  networkBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00C853',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  networkText: {
    color: '#00C853',
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
  },
  usdValue: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  address: {
    color: '#666',
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    flex: 1,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  virtualAccountCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bankIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginBottom: 2,
  },
  cardSubtitle: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
  accountNumber: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  bankName: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  shareButton: {
    backgroundColor: '#00C853',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  orText: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginHorizontal: 15,
  },
  depositOptions: {
    gap: 12,
  },
  depositOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
  },
  depositIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00C853',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  depositTextContainer: {
    flex: 1,
  },
  depositTitle: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginBottom: 2,
  },
  depositSubtitle: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    lineHeight: 16,
  },
});
