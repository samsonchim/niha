import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: string;
  isPositive: boolean;
  status: string;
  icon: string;
  iconColor: string;
  iconBackground: string;
  category: 'All' | 'Crypto' | 'Fiat';
}

const transactionData: Transaction[] = [
  {
    id: '1',
    type: 'Fiat',
    description: 'Inuman Olmankila - Opay',
    amount: '₦12,000.00',
    isPositive: true,
    status: 'Received',
    icon: 'arrow-down',
    iconColor: '#fff',
    iconBackground: '#00C853',
    category: 'Fiat',
  },
  {
    id: '2',
    type: 'Uniswap',
    description: '',
    amount: '$16.96',
    isPositive: false,
    status: 'Gas fees',
    icon: 'exchange',
    iconColor: '#fff',
    iconBackground: '#FF1744',
    category: 'Crypto',
  },
  {
    id: '3',
    type: 'Tether',
    description: 'USDT',
    amount: '$0.98',
    isPositive: false,
    status: 'Sent',
    icon: 'circle',
    iconColor: '#fff',
    iconBackground: '#26A69A',
    category: 'Crypto',
  },
  {
    id: '4',
    type: 'Minted Fiat to BTC',
    description: '305.BTC',
    amount: '₦900,070',
    isPositive: true,
    status: 'Minted',
    icon: 'check-circle',
    iconColor: '#fff',
    iconBackground: '#00C853',
    category: 'Crypto',
  },
  {
    id: '5',
    type: 'Unminted SOL to Fiat',
    description: 'Fee (₦85,500)',
    amount: '$50.9',
    isPositive: false,
    status: 'Unminted',
    icon: 'check-circle',
    iconColor: '#fff',
    iconBackground: '#00C853',
    category: 'Crypto',
  },
  {
    id: '6',
    type: 'Swap SOL to USDT',
    description: '0.351%',
    amount: '$50.9',
    isPositive: false,
    status: 'Worth',
    icon: 'exchange',
    iconColor: '#fff',
    iconBackground: '#00C853',
    category: 'Crypto',
  },
  {
    id: '7',
    type: 'Gas Fee',
    description: 'SOL - UGS Swap',
    amount: '$5.9',
    isPositive: false,
    status: 'Worth',
    icon: 'fire',
    iconColor: '#fff',
    iconBackground: '#FF6B35',
    category: 'Crypto',
  },
];

type FilterType = 'All' | 'Crypto' | 'Fiat';

export default function TransactionHistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const filteredTransactions = transactionData.filter(transaction => 
    selectedFilter === 'All' || transaction.category === selectedFilter
  );

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const showCalendar = () => {
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <TouchableOpacity onPress={showCalendar} activeOpacity={0.7}>
          <FontAwesome name="calendar" size={20} color="#00C853" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['All', 'Crypto', 'Fiat'] as FilterType[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.activeFilterTab
            ]}
            onPress={() => setSelectedFilter(filter)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.activeFilterText
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: transaction.iconBackground }]}>
              <FontAwesome name={transaction.icon} size={16} color={transaction.iconColor} />
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              <View style={styles.leftContent}>
                <Text style={styles.transactionType}>{transaction.type}</Text>
                {transaction.description ? (
                  <Text style={styles.description}>{transaction.description}</Text>
                ) : null}
              </View>

              {/* Amount and Status */}
              <View style={styles.rightContent}>
                <Text style={[
                  styles.amount,
                  { color: transaction.isPositive ? '#00C853' : '#FF1744' }
                ]}>
                  {transaction.isPositive ? '+' : '-'} {transaction.amount}
                </Text>
                <Text style={[
                  styles.status,
                  { 
                    color: transaction.status === 'Received' || transaction.status === 'Minted' 
                      ? '#00C853' 
                      : transaction.status === 'Gas fees' || transaction.status === 'Sent'
                      ? '#FF1744'
                      : '#00C853'
                  }
                ]}>
                  {transaction.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
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
    fontFamily: 'Poppins-SemiBold',
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
    borderBottomColor: '#00C853',
    borderRadius: 0,
  },
  filterText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  activeFilterText: {
    color: '#00C853',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  transactionItem: {
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
  transactionType: {
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
  rightContent: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
  },
  status: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
  },
});