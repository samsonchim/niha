import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const CoinChart: React.FC = () => {
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1'
        );
        const data = await response.json();
        const prices = data.prices.map((item: [number, number]) => item[1]);
        setChartData(prices.slice(-6)); // Reduce the number of data points
      } catch (e: any) {
        setError(`Failed to load chart data: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading chart data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: ['10:00', '12:00', '14:00', '16:00'], // Reduced time labels
          datasets: [
            {
              data: chartData.length > 0 ? chartData : [0],
              color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Red line
              strokeWidth: 2,
            },
          ],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisLabel="$"
        chartConfig={{
          backgroundColor: 'transparent',
          backgroundGradientFrom: 'transparent',
          backgroundGradientTo: 'transparent',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForDots: {
            r: '0', // Hide dots
          },
          propsForBackgroundLines: {
            strokeWidth: 0, // Remove gridlines
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 250,
  },
  loadingText: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 250,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  container: {
    marginVertical: 20,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
});

export default CoinChart;
