import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
  icon: string;
  iconColor: string;
  chartPath: string;
  chartColor: string;
}

const cryptoData: CryptoAsset[] = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: '$67,800.00',
    change: '11.75%',
    isPositive: true,
    icon: 'bitcoin',
    iconColor: '#FF6B35',
    chartPath: 'M10 40 Q20 30, 30 35 T50 30 T70 25 T90 30',
    chartColor: '#FF6B35'
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    price: '$1,478.10',
    change: '4.75%',
    isPositive: true,
    icon: 'diamond',
    iconColor: '#627EEA',
    chartPath: 'M10 35 Q20 25, 30 30 T50 35 T70 20 T90 25',
    chartColor: '#627EEA'
  },
  {
    id: '3',
    name: 'Dogecoin',
    symbol: 'DOGE',
    price: '$0.075',
    change: '2.15%',
    isPositive: true,
    icon: 'paw',
    iconColor: '#C2A633',
    chartPath: 'M10 30 Q20 28, 30 29 T50 30 T70 31 T90 32',
    chartColor: '#C2A633'
  },
  {
    id: '4',
    name: 'Solana',
    symbol: 'SOL',
    price: '$154.20',
    change: '-3.20%',
    isPositive: false,
    icon: 'bolt',
    iconColor: '#9945FF',
    chartPath: 'M10 40 Q20 42, 30 41 T50 38 T70 35 T90 33',
    chartColor: '#9945FF'
  },
  {
    id: '5',
    name: 'Polygon',
    symbol: 'MATIC',
    price: '$0.89',
    change: '1.55%',
    isPositive: true,
    icon: 'circle',
    iconColor: '#8247E5',
    chartPath: 'M10 35 Q20 30, 30 33 T50 34 T70 32 T90 33',
    chartColor: '#8247E5'
  },
  {
    id: '6',
    name: 'BNB',
    symbol: 'BNB',
    price: '$585.10',
    change: '0.85%',
    isPositive: true,
    icon: 'cube',
    iconColor: '#F3BA2F',
    chartPath: 'M10 40 Q20 39, 30 38 T50 40 T70 41 T90 42',
    chartColor: '#F3BA2F'
  },
  {
    id: '7',
    name: 'Litecoin',
    symbol: 'LTC',
    price: '$89.43',
    change: '-0.62%',
    isPositive: false,
    icon: 'level-down',
    iconColor: '#B8B8B8',
    chartPath: 'M10 45 Q20 44, 30 43 T50 42 T70 41 T90 40',
    chartColor: '#B8B8B8'
  },
  {
    id: '8',
    name: 'XRP',
    symbol: 'XRP',
    price: '$0.52',
    change: '3.20%',
    isPositive: true,
    icon: 'random',
    iconColor: '#25A768',
    chartPath: 'M10 40 Q20 38, 30 37 T50 36 T70 37 T90 38',
    chartColor: '#25A768'
  }
];

export function CryptoPortfolio() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Assets</Text>
        <TouchableOpacity />
      </View>

      {/* Crypto Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {cryptoData.map((crypto) => (
          <View key={crypto.id} style={styles.card}>
            {/* Header with icon and name */}
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: crypto.iconColor }]}>
                <FontAwesome name={crypto.icon as any} size={20} color="#fff" />
              </View>
              <View style={styles.cryptoInfo}>
                <Text style={styles.cryptoName}>{crypto.name}</Text>
                <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
              </View>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
              <Svg height="60" width="150" viewBox="0 0 100 50">
                <Path
                  d={crypto.chartPath}
                  stroke={crypto.chartColor}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </Svg>
            </View>

            {/* Price and change */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{crypto.price}</Text>
              <View style={styles.changeContainer}>
                <FontAwesome
                  name={crypto.isPositive ? 'caret-up' : 'caret-down'}
                  size={12}
                  color={crypto.isPositive ? '#00FF57' : '#FF4444'}
                />
                <Text
                  style={[
                    styles.change,
                    { color: crypto.isPositive ? '#00FF57' : '#FF4444' }
                  ]}
                >
                  {crypto.change}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Regular'
  },
  scrollContainer: {
    paddingLeft: 20,
    paddingRight: 10
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    width: 180,
    marginRight: 12,
    height: 160
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  cryptoInfo: {
    flex: 1
  },
  cryptoName: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Medium'
  },
  cryptoSymbol: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Poppins-Regular'
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold'
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  change: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium'
  }
});
