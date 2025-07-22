import { CopyToClipboard } from '@/components/ui/CopyToClipboard';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


// During Serverside handling, I will be Extracting only wallet.id then fetching data from a central state and 
// also Making wallet-details.tsx responsive to route changes


interface Wallet {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  usdValue: string;
  address: string;
  icon: string;
  category: 'Crypto' | 'Fiat';
}

const ICONS: Record<string, any> = {
  btc: require('@/assets/images/icons/bitcoin.png'),
  ethereum: require('@/assets/images/icons/etherum.png'), 
  bnb: require('@/assets/images/icons/bnb.png'),
  solana: require('@/assets/images/icons/solana.png'),
  usdt: require('@/assets/images/icons/usdt.png'),
  usdc: require('@/assets/images/icons/usdc.png'),
  polygon: require('@/assets/images/icons/matic.png'), 
  tron: require('@/assets/images/icons/tron.png'),
  dai: require('@/assets/images/icons/dai.png'),
  doge: require('@/assets/images/icons/doge.png'),
};



const walletData: Wallet[] = [
  {
    id: '1',
    name: 'BTC',
    symbol: 'Bitcoin',
    balance: '0.08',
    usdValue: '$3,314',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    icon: 'btc',
    category: 'Crypto',
  },
  {
    id: '2',
    name: 'ETHEREUM',
    symbol: 'Ethereum',
    balance: '0.08',
    usdValue: '$314',
    address: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    icon: 'ethereum',
    category: 'Crypto',
  },
  {
    id: '3',
    name: 'BNB',
    symbol: 'BNB',
    balance: '0.08',
    usdValue: '$45.14',
    address: 'bnb136ns6lfw4zs5hg4n85vdthaad7hq5m4gtkgf23',
    icon: 'bnb',
    category: 'Crypto',
  },
  {
    id: '4',
    name: 'SOLANA',
    symbol: 'Solana',
    balance: '0.08',
    usdValue: '$43.14',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    icon: 'solana',
    category: 'Crypto',
  },
  {
    id: '5',
    name: 'USDT',
    symbol: 'Tether',
    balance: '0.08',
    usdValue: '$0.08',
    address: '0x55d398326f99059fF775485246999027B3197955',
    icon: 'usdt',
    category: 'Crypto',
  },
  {
    id: '6',
    name: 'USDT',
    symbol: 'Ethereum',
    balance: '0.08',
    usdValue: '$0.08',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    icon: 'usdt',
    category: 'Crypto',
  },
  {
    id: '7',
    name: 'USDC',
    symbol: 'Ethereum',
    balance: '0.08',
    usdValue: '$0.08',
    address: '0xA0b86a33E6411a3456d7b9Dc24D66E9f2e7Bb0A4',
    icon: 'usdc',
    category: 'Crypto',
  },
  {
    id: '8',
    name: 'POLYGON',
    symbol: 'Polygon',
    balance: '0.08',
    usdValue: '$0.08',
    address: '0x0000000000000000000000000000000000001010',
    icon: 'polygon',
    category: 'Crypto',
  },
  {
    id: '9',
    name: 'TRON',
    symbol: 'Tron',
    balance: '0.08',
    usdValue: '$0.08',
    address: 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7',
    icon: 'tron',
    category: 'Crypto',
  },
  {
    id: '10',
    name: 'Dai',
    symbol: 'Dai',
    balance: '0.08',
    usdValue: '$0.08',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    icon: 'dai',
    category: 'Crypto',
  },
  {
    id: '11',
    name: 'Doge',
    symbol: 'Dogecoin',
    balance: '0.08',
    usdValue: '$0.08',
    address: 'DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L',
    icon: 'doge',
    category: 'Crypto',
  },
];

type FilterType = 'Crypto' | 'Fiat';

export default function WalletsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Crypto');
  const [showFiatModal, setShowFiatModal] = useState(false);

  const filteredWallets = walletData.filter(wallet => 
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
        balance: wallet.balance,
        usdValue: wallet.usdValue,
        icon: wallet.icon,
        address: wallet.address,
      },
    });
  };

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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredWallets.map((wallet) => (
          <TouchableOpacity 
            key={wallet.id} 
            style={styles.walletItem}
            onPress={() => handleWalletPress(wallet)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Image
                source={ICONS[wallet.icon] || ICONS['btc']}
                style={styles.coinIcon}
              />
            </View>

            <View style={styles.walletInfo}>
              <View style={styles.topRow}>
                <Text style={styles.coinName}>{wallet.name}</Text>
                <Text style={styles.balance}>{wallet.balance}</Text>
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.networkBadge}>
                  <Text style={styles.networkText}>{wallet.symbol}</Text>
                </View>
                <Text style={styles.usdValue}>{wallet.usdValue}</Text>
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
        ))}
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
