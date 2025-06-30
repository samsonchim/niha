import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
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
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Unmint</Text>
        <TouchableOpacity>
          <FontAwesome name="cog" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

       {/* Warning Box */}
            <View style={styles.noticeBox}>
              <FontAwesome name="exclamation-circle" size={16} color="#FFD700" style={{ marginRight: 8 }} />
                <Text style={styles.noticeText}>
                What does 'Unmint' mean? It allows you to convert your crypto assets into fiat currency, 
                making it possible to transfer funds or spend directly through local banks. 
                Please note, a small network fee may apply for this transaction.
                Once done, your fiat will be credited to your Dedicated Fiat Account. Terms and Conditions Apply.
                <Text
                  style={styles.noticeLink}
                  onPress={() => Linking.openURL('https://niha.com/gas/btc')}
                >
                  Learn more
                </Text>
                </Text>
             
            </View>

      {/* Overlapping Cards */}
      <View style={styles.cardsWrapper}>
        {/* From Section */}
        <View style={styles.card}>
          <Text style={styles.label}>From</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.selectorButtonText}>{selectedCrypto}</Text>
              <FontAwesome name="chevron-down" size={16} color="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              value={cryptoAmount}
              onChangeText={setCryptoAmount}
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
              onChangeText={setFiatAmount}
            />
          </View>
        </View>
      </View>

      {/* Conversion Rate */}
      <View style={styles.rateContainer}>
        <FontAwesome name="refresh" size={10} color="#00C853" />
        <Text style={styles.rateText}>
          1 {selectedCrypto} ≈ 30,000 NGN
        </Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>

      {/* Crypto Selector Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>Select Crypto</Text>
            {CRYPTOS.map((crypto) => (
              <TouchableOpacity
                key={crypto}
                style={styles.sheetItem}
                onPress={() => {
                  setSelectedCrypto(crypto);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.sheetItemText}>{crypto}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const CARD_WIDTH = width - 40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 50,
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
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginRight: 10,
  },
  selectorButtonText: {
    color: '#fff',
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
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -20, 
    marginLeft: 15, 
    marginBottom: 60,
  },
  rateText: {
    fontSize: 9,
    color: '#00C853',
    fontFamily: 'Poppins-Regular',
    marginLeft: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#181818',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 18,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
  },
  sheetItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  sheetItemText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});