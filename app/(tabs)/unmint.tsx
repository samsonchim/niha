import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CRYPTOS = ['BTC', 'ETH', 'SOL', 'BNB', 'USDT'];

export default function UnmintScreen() {
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [fiatAmount, setFiatAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Unmint</Text>
        <TouchableOpacity>
          <FontAwesome name="cog" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Overlapping Cards */}
      <View style={styles.cardsWrapper}>
        {/* From Section */}
        <View style={styles.card}>
          <Text style={styles.label}>From</Text>
          <View style={styles.row}>
            {/* Dropdown */}
            <View style={{ position: 'relative' }}>
              <TouchableOpacity
                style={styles.cryptoSelector}
                onPress={() => setDropdownOpen((open) => !open)}
                activeOpacity={0.7}
              >
                <Text style={styles.cryptoText}>{selectedCrypto}</Text>
                <FontAwesome
                  name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#fff"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
              {dropdownOpen && (
                <View style={styles.dropdown}>
                  {CRYPTOS.filter((c) => c !== selectedCrypto).map((crypto) => (
                    <TouchableOpacity
                      key={crypto}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCrypto(crypto);
                        setDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{crypto}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              value={cryptoAmount}
              onChangeText={(text) => setCryptoAmount(text)}
            />
          </View>
        </View>

        {/* Swap Icon Overlap */}
        <View style={styles.swapIconContainer}>
          <View style={styles.swapCircle}>
            <FontAwesome name="exchange" size={20} color="#fff" />
          </View>
        </View>

        {/* To Section */}
        <View style={[styles.card, styles.toCard]}>
          <Text style={styles.label}>To</Text>
          <View style={styles.row}>
            <Text style={styles.cryptoText}>NGN</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              value={fiatAmount}
              onChangeText={(text) => setFiatAmount(text)}
            />
          </View>
        </View>
      </View>

      {/* Conversion Rate */}
      <View style={styles.rateContainer}>
        <FontAwesome name="refresh" size={12} color="#fff" />
        <Text style={styles.rateText}>
          1 {selectedCrypto} ≈ 30,000 NGN
        </Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const CARD_WIDTH = width - 40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  cardsWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    padding: 16,
    width: CARD_WIDTH,
    zIndex: 1,
  },
  toCard: {
    marginTop: 15,
    zIndex: 1,
  },
  swapIconContainer: {
    position: 'absolute',
    top: CARD_WIDTH / 4.1,
    left: (CARD_WIDTH / 2) - 28,
    zIndex: 2,
  },
  swapCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    color: '#bbb',
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cryptoSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cryptoText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    marginLeft: 0,
  },
  input: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  dropdown: {
    position: 'absolute',
    top: 32,
    left: 0,
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 70,
    zIndex: 10,
    elevation: 10,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Move to left
    marginBottom: 20,
    marginLeft: 4,
  },
  rateText: {
    fontSize: 12, // Smaller text
    color: '#bbb',
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#333',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  continueButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
});