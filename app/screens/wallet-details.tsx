import PreLoader from '@/components/ui/PreLoader'; // Import PreLoader component
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const COINGECKO_IDS: Record<string, string> = {
  btc: 'bitcoin',
  ethereum: 'ethereum',
  bnb: 'binancecoin',
  solana: 'solana',
  usdt: 'tether',
  usdc: 'usd-coin',
  polygon: 'matic-network',
  tron: 'tron',
  dai: 'dai',
  doge: 'dogecoin',
};

export default function WalletDetailScreen() {
  const { name, symbol, balance, usdValue, icon } = useLocalSearchParams();
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const coinId = COINGECKO_IDS[icon as string];
        if (!coinId) throw new Error('Coin ID not found');
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`
        );
        const data = await res.json();
        const prices = data.prices.map((p: number[]) => parseFloat(p[1].toFixed(2)));
        setChartData(prices.slice(-6));
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.gasFeeContainer}>
          <FontAwesome name="fire" size={16} color="#FFD700" />
          <Text style={styles.gasFeeText}>$2 Gas fee</Text>
        </View>
        <TouchableOpacity>
          <FontAwesome name="line-chart" size={20} color="#00C853" />
        </TouchableOpacity>
      </View>

      {/* Warning Box */}
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

      {/* Icon & Balance */}
      <View style={styles.centerBox}>
        <Image
          source={ICONS[icon as string] || ICONS['btc']}
          style={styles.coinIcon}
        />
        <Text style={styles.balance}>{balance} {name}</Text>
        <Text style={styles.usdValue}>{usdValue}</Text>
      </View>

      {/* Trading Chart */}
      <View style={styles.chartContainer}>
        {loading ? (
          <PreLoader /> // Use PreLoader component for loading state
        ) : (
          <LineChart
            data={{
              labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'], // Time labels at the bottom
              datasets: [
                {
                  data: chartData.length > 0 ? chartData : [0, 0, 0, 0, 0, 0],
                  color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Red line
                  strokeWidth: 2, // Line thickness
                },
              ],
            }}
            width={350}
            height={220}
            yAxisSuffix="K" // Add 'K' to price values
            yAxisInterval={1} // Interval between price values
            chartConfig={{
              backgroundColor: '#000',
              backgroundGradientFrom: '#000',
              backgroundGradientTo: '#333',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Axis color
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Label color
              fillShadowGradient: 'rgba(255, 0, 0, 0.3)', // Red gradient fill
              fillShadowGradientOpacity: 1,
              propsForDots: {
                r: '3',
                strokeWidth: '1',
                stroke: '#fff',
              },
            }}
            bezier
            style={styles.chart}
          />
        )}
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
    alignItems: 'center',
    marginVertical: 20,
  },
  gasFeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gasFeeText: {
    color: '#FFD700',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginLeft: 6,
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
  chartContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
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
    backgroundColor: '#333',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 24,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});
