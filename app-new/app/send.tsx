import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { API_BASE_URL } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import { transferCrypto, transferFiat } from '@/services/backend';
import { getCryptoBalances, getFiatBalance } from '@/services/balances';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

export default function SendScreen() {
  const [fiatAmount, setFiatAmount] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [fiatBalance, setFiatBalance] = useState(0);
  const [cryptoBalance, setCryptoBalance] = useState(0);

  const errorColor = useThemeColor({ light: '#ef4444', dark: '#f87171' }, 'text');

  useEffect(() => {
    loadBalances();
  }, []);

  const loadBalances = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const [fiat, crypto] = await Promise.all([
        getFiatBalance(user.id),
        getCryptoBalances(user.id)
      ]);
      setFiatBalance(fiat);

      const usdcBalance = crypto.find(c => c.symbol === 'USDC');
      setCryptoBalance(usdcBalance?.amount || 0);
    } catch (e) {
      console.error('Failed to load balances:', e);
    }
  };

  const validateFiatTransfer = (): string | null => {
    if (!fiatAmount || Number(fiatAmount) <= 0) {
      return 'Please enter a valid amount';
    }
    if (Number(fiatAmount) > fiatBalance) {
      return `Insufficient balance. You have ₦${fiatBalance.toFixed(2)}`;
    }
    if (!recipientAccount || recipientAccount.length < 10) {
      return 'Please enter a valid account number (min 10 digits)';
    }
    if (!bankCode || bankCode.length < 3) {
      return 'Please enter a valid bank code';
    }
    return null;
  };

  const validateCryptoTransfer = (): string | null => {
    if (!cryptoAmount || Number(cryptoAmount) <= 0) {
      return 'Please enter a valid amount';
    }
    if (Number(cryptoAmount) > cryptoBalance) {
      return `Insufficient balance. You have ${cryptoBalance.toFixed(6)} USDC`;
    }
    if (!toAddress || toAddress.length < 42) {
      return 'Please enter a valid Ethereum address (0x...)';
    }
    if (!toAddress.startsWith('0x')) {
      return 'Address must start with 0x';
    }
    return null;
  };

  const onSendFiat = async () => {
    const validationError = validateFiatTransfer();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      setLoading(true);
      await transferFiat({
        userId: user.id,
        amount: Number(fiatAmount),
        recipientAccount,
        bankCode,
      });

      Alert.alert('Success', 'Fiat transfer initiated successfully');

      // Reset form and reload balances
      setFiatAmount('');
      setRecipientAccount('');
      setBankCode('');
      await loadBalances();
    } catch (e: any) {
      Alert.alert('Transfer Failed', (e.message || 'Failed to send fiat') + `\nBackend: ${API_BASE_URL}`);
    } finally {
      setLoading(false);
    }
  };

  const onSendCrypto = async () => {
    const validationError = validateCryptoTransfer();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      setLoading(true);
      await transferCrypto({
        userId: user.id,
        toAddress,
        amount: cryptoAmount,
        blockchain: 'base'
      });

      Alert.alert('Success', 'Crypto transfer initiated successfully');

      // Reset form and reload balances
      setCryptoAmount('');
      setToAddress('');
      await loadBalances();
    } catch (e: any) {
      Alert.alert('Transfer Failed', (e.message || 'Failed to send crypto') + `\nBackend: ${API_BASE_URL}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title" style={styles.title}>Send / Withdraw</ThemedText>

        {/* Fiat Transfer Section */}
        <ThemedText type="subtitle" style={styles.section}>Fiat Transfer (Flutterwave)</ThemedText>
        <ThemedText style={styles.balance}>Available: ₦{fiatBalance.toFixed(2)}</ThemedText>

        <ThemedTextInput
          placeholder="Amount (NGN)"
          keyboardType="numeric"
          style={styles.input}
          value={fiatAmount}
          onChangeText={setFiatAmount}
          editable={!loading}
        />
        <ThemedTextInput
          placeholder="Recipient Account Number"
          keyboardType="numeric"
          style={styles.input}
          value={recipientAccount}
          onChangeText={setRecipientAccount}
          editable={!loading}
        />
        <ThemedTextInput
          placeholder="Bank Code (e.g., 044 for Access Bank)"
          style={styles.input}
          value={bankCode}
          onChangeText={setBankCode}
          editable={!loading}
        />

        <ThemedButton
          title={loading ? "Processing..." : "Send Fiat"}
          onPress={onSendFiat}
          loading={loading}
          style={styles.button}
          disabled={loading}
        />

        {/* Crypto Transfer Section */}
        <ThemedText type="subtitle" style={styles.section}>Crypto Transfer (USDC)</ThemedText>
        <ThemedText style={styles.balance}>Available: {cryptoBalance.toFixed(6)} USDC</ThemedText>
        <ThemedText style={styles.hint}>Sending USDC on Base network</ThemedText>

        <ThemedTextInput
          placeholder="Amount (USDC)"
          keyboardType="numeric"
          style={styles.input}
          value={cryptoAmount}
          onChangeText={setCryptoAmount}
          editable={!loading}
        />
        <ThemedTextInput
          placeholder="Recipient Address (0x...)"
          style={styles.input}
          value={toAddress}
          onChangeText={setToAddress}
          autoCapitalize="none"
          editable={!loading}
        />

        <ThemedButton
          title={loading ? "Processing..." : "Send Crypto"}
          onPress={onSendCrypto}
          loading={loading}
          style={styles.button}
          disabled={loading}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8 },
  title: { marginBottom: 12 },
  section: { marginTop: 24, marginBottom: 8 },
  balance: { fontSize: 14, fontWeight: '600', marginBottom: 12, opacity: 0.8, fontFamily: 'Poppins-SemiBold' },
  hint: { fontSize: 12, opacity: 0.6, marginBottom: 8, fontFamily: 'Poppins-Regular' },
  input: { marginBottom: 8 },
  button: { marginTop: 8, marginBottom: 16 },
});
