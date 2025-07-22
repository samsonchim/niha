import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface TransferItem {
  id: string;
  type: string;
  description: string;
  amount: string;
  isPositive: boolean;
  icon: string;
  iconColor: string;
  iconBackground: string;
}

const transferData: TransferItem[] = [
  {
    id: '1',
    type: 'Fiat',
    description: 'Inuman Olmankila - Opay',
    amount: '₦12,000.00',
    isPositive: true,
    icon: 'arrow-down',
    iconColor: '#fff',
    iconBackground: '#00C853',
  },
  {
    id: '2',
    type: 'Uniswap',
    description: '',
    amount: '$16.96',
    isPositive: false,
    icon: 'exchange',
    iconColor: '#fff',
    iconBackground: '#FF1744',
  },
  {
    id: '3',
    type: 'Tether',
    description: 'USDT',
    amount: '$0.98',
    isPositive: true,
    icon: 'circle',
    iconColor: '#fff',
    iconBackground: '#26A69A',
  },
];

export function TransferHistory() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Transfer History</Text>

      {/* Transfer Items */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {transferData.map((item) => (
          <View key={item.id} style={styles.transferItem}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: item.iconBackground }]}>
              <FontAwesome name={item.icon} size={16} color={item.iconColor} />
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              <View style={styles.leftContent}>
                <Text style={styles.transferType}>{item.type}</Text>
                {item.description ? (
                  <Text style={styles.description}>{item.description}</Text>
                ) : null}
              </View>

              {/* Amount */}
              <View style={styles.amountContainer}>
                <Text style={[
                  styles.amount, 
                  { color: item.isPositive ? '#00C853' : '#FF1744' }
                ]}>
                  {item.isPositive ? '+' : '-'} {item.amount}
                </Text>
                {!item.isPositive && (
                  <Text style={styles.feeLabel}>+ Gas fees</Text>
                )}
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
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
  },
  transferItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
  },
  transferType: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginBottom: 2,
  },
  description: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
  },
  feeLabel: {
    color: '#888',
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
  },
});