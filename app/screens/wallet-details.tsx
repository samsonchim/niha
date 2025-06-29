import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


// During Backend, I will be Extracting only wallet.id then fetching data from a central state and 
// also Making wallet-details.tsx responsive to route changes



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

export default function WalletDetailScreen() {
  const { name, symbol, balance, usdValue, icon, address } = useLocalSearchParams();
  const router = useRouter();

  // If you need to hide the header, configure it in your route options or layout file.

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#00C853" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="info-circle" size={20} color="#00C853" />
        </TouchableOpacity>
      </View>

      {/* Icon & Balance */}
      <View style={styles.centerBox}>
        <Image 
          source={ICONS[icon as string] || ICONS['btc']} 
          style={styles.coinIcon} 
        />
        <Text style={styles.balance}>{balance} {name}</Text>
        <Text style={styles.usdValue}>{usdValue}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <ActionButton icon="bolt" label="Unmint" />
        <ActionButton icon="exchange" label="Swap" />
        <ActionButton icon="arrow-down" label="Receive" />
      </View>

      {/* Send Button */}
      <TouchableOpacity style={styles.sendButton}>
        <Text style={styles.sendButtonText}>Send {name}</Text>
      </TouchableOpacity>

      {/* Notice */}
      <View style={styles.noticeBox}>
        <FontAwesome name="exclamation-circle" size={16} color="#FFD700" style={{ marginRight: 8 }} />
        <Text style={styles.noticeText}>
          You might see higher fees for {name} transactions if the network experiences heavy traffic.{' '}
          <Text
            style={styles.noticeLink}
            onPress={() => Linking.openURL('https://niha.com/gas/btc')}
          >
            Learn more
          </Text>
        </Text>
        <TouchableOpacity>
          <FontAwesome name="close" size={14} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {/* Wallet Address */}
      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Wallet Address:</Text>
        <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
      </View>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label }: { icon: any; label: string }) {
  return (
    <TouchableOpacity style={styles.actionButton}>
      <FontAwesome name={icon} size={20} color="#00C853" />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  name: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  symbol: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 13,
    marginBottom: 20,
  },
  centerBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  coinIcon: {
    width: 60,
    height: 60,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  balance: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  usdValue: {
    fontSize: 16,
    color: '#bbb',
    fontFamily: 'Poppins-Regular',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionLabel: {
    marginTop: 6,
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  sendButton: {
    backgroundColor: '#00C853',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  sendButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#9E8B3D',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  noticeText: {
    flex: 1,
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
  noticeLink: {
    color: '#00C853',
    textDecorationLine: 'underline',
  },
  addressContainer: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
  },
  addressLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
  },
  addressText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
  },
});
