import { CryptoPortfolio } from '@/components/CryptoAssets';
import { PortfolioBalance } from '@/components/PortfolioBalance';
import { ReferAction } from '@/components/ReferAction';
import { ThemedView } from '@/components/ThemedView';
import { TransferHistory } from '@/components/TransferHistory';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const handleNotificationPress = () => {
    console.log('Notification pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        {/* Header - Fixed */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('@/assets/images/avatars/avatar_1.png')}
              style={styles.avatar}
            />
          </View>
          <TouchableOpacity onPress={handleNotificationPress} activeOpacity={0.7}>
            <IconSymbol name="bell" size={20} color="#00C853" />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Portfolio Balance Section */}
          <View style={styles.content}>
            <PortfolioBalance
              title="Portfolio Balance"
              amount="₦100,700.50"
              subtitle="Unminted Balance: 45,000.00"
              accountNumber="6770548913"
            />
          </View>

          {/* Crypto Portfolio Section */}
          <CryptoPortfolio />
          
          {/* Refer Action Section */}
          <ReferAction />
          
          {/* Transfer History Section */}
          <TransferHistory />
          
          {/* Bottom spacing for tab bar */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: 'inherit', // Keeps header background consistent
  },
  avatarContainer: {
    width: 25,
    height: 25,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20, // Extra padding at bottom
  },
  content: {
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 5,
  },
  bottomSpacing: {
    height: 100, // Space for the tab bar
  },
});
