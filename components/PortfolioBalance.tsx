import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PortfolioBalanceProps {
  title: string;
  amount: string;
  subtitle?: string;
  accountNumber: string;
}

export function PortfolioBalance({
  title,
  amount,
  subtitle,
  accountNumber,
}: PortfolioBalanceProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const copyAccountNumber = async () => {
    try {
      await Clipboard.setStringAsync(accountNumber);
      Alert.alert('Copied!', 'Account number copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy account number');
    }
  };

  const formatBalanceForDisplay = (text: string) => {
    if (!isBalanceVisible) {
      // Replace digits with asterisks, keep symbols and spaces
      return text.replace(/\d/g, '*');
    }
    return text;
  };

  return (
    <View style={styles.container}>
      {/* Header row: Title + Eye + Transaction History */}
      <View style={styles.topRow}>
        <View style={styles.leftHeader}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={toggleBalanceVisibility} activeOpacity={0.7}>
            <FontAwesome 
              name={isBalanceVisible ? "eye" : "eye-slash"} 
              size={14} 
              color="#00C853" 
              style={styles.icon} 
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.transactionHistory}
          onPress={() => router.push('/screens/transaction-history')}
          activeOpacity={0.7}
        >
          <Text style={styles.historyText}>Transaction History</Text>
          <FontAwesome name="chevron-right" size={12} color="#aaa" />
        </TouchableOpacity>
      </View>

      {/* Main content with amount, subtitle and transfer button */}
      <View style={styles.mainContent}>
        <View style={styles.leftContent}>
          {/* Amount */}
          <Text style={styles.amount}>
            {formatBalanceForDisplay(amount)}
          </Text>
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {formatBalanceForDisplay(subtitle || '')}
          </Text>
        </View>
        
        {/* Transfer Button - spans both rows */}
        <TouchableOpacity style={styles.transferButton}>
          <FontAwesome name="exchange" size={14} color="#000" />
          <Text style={styles.transferText}>Fiat Transfer</Text>
        </TouchableOpacity>
      </View>

      {/* Footer: Account Number & Copy */}
      <View style={styles.footer}>
        <Text style={styles.accountLabel}>Fiat Account Number</Text>
        <View style={styles.accountRight}>
          <Text style={styles.accountNumber}>{accountNumber}</Text>
          <TouchableOpacity onPress={copyAccountNumber} activeOpacity={0.7}>
            <FontAwesome name="copy" size={12} color="#00FF57" style={styles.copyIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginRight: 6,
  },
  icon: {
    marginTop: 2,
  },
  transactionHistory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyText: {
    color: '#aaa',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  leftContent: {
    flex: 1,
  },
  amount: {
    color: '#fff',
    fontSize: 26,
    fontFamily: 'Poppins-Bold',
    marginBottom: 0,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C853',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    height: 36,
  },
  transferText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 10,
  },
  accountLabel: {
    color: '#999',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
  accountRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountNumber: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    marginRight: 6,
  },
  copyIcon: {
    marginTop: 1,
  },
});
