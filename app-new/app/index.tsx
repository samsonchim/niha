import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { API_BASE_URL } from '@/lib/config';
import { getLastFetchAttempt } from '@/lib/networkDebug';
import { supabase } from '@/lib/supabase';
import { pingBackend } from '@/services/backend';
import { getCryptoBalances, getFiatBalance } from '@/services/balances';
import { getUserProfile, UserProfile } from '@/services/profile';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [fiatBalance, setFiatBalance] = useState<number>(0);
  const [crypto, setCrypto] = useState<{ symbol: string; amount: number; fiatValue: number }[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pingStatus, setPingStatus] = useState<string>('');
  const [pingDetails, setPingDetails] = useState<string>('');
  const [fetchDetails, setFetchDetails] = useState<string>('');

  const cardColor = useThemeColor({ light: '#f9f9f9', dark: '#1E1E1E' }, 'background');
  const borderColor = useThemeColor({ light: '#eee', dark: '#333' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const updateFetchInfo = () => {
    const attempt = getLastFetchAttempt();
    if (!attempt) {
      setFetchDetails('No fetch attempts recorded (debug maybe disabled).');
      return;
    }
    let line = `Last Fetch: ${attempt.method} ${attempt.url}`;
    if (attempt.status) line += ` | Status: ${attempt.status}`;
    if (attempt.error) line += ` | Error: ${attempt.error}`;
    setFetchDetails(line);
  };

  const load = async () => {
    setRefreshing(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return router.replace('/auth/signup');

      const [fiat, cryptoList, userProfile] = await Promise.all([
        getFiatBalance(user.id),
        getCryptoBalances(user.id),
        getUserProfile(user.id)
      ]);
      setFiatBalance(fiat);
      setCrypto(cryptoList);
      setProfile(userProfile);
      updateFetchInfo();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const testBackend = async () => {
    const res = await pingBackend();
    if (res.ok) {
      setPingStatus('Backend reachable');
      setPingDetails(`URL: ${res.url} | Status: ${res.status}`);
    } else {
      setPingStatus('Backend unreachable');
      let detail = `URL: ${res.url}`;
      if (res.status) detail += ` | Status: ${res.status}`;
      if (res.error) detail += ` | Error: ${res.error}`;
      if (res.lastError) {
        detail += ` | LastError: method=${res.lastError.method} status=${res.lastError.status} code=${res.lastError.code}`;
      }
      setPingDetails(detail);
    }
    updateFetchInfo();
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={tintColor} />}
      >
        <ThemedText type="title" style={styles.title}>Dashboard</ThemedText>

        {/* DVA Account Details */}
        {profile?.dvaAccountNumber && (
          <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
            <ThemedText style={styles.label}>Your Virtual Account (DVA)</ThemedText>
            <Pressable onPress={() => copyToClipboard(profile.dvaAccountNumber!, 'Account number')}>
              <ThemedText type="defaultSemiBold" style={styles.accountNumber}>
                {profile.dvaAccountNumber}
              </ThemedText>
            </Pressable>
            <ThemedText style={styles.bankName}>{profile.dvaBankName || 'Flutterwave'}</ThemedText>
            <ThemedText style={styles.hint}>Tap account number to copy</ThemedText>
          </View>
        )}

        {/* Crypto Wallet Address */}
        {profile?.usdcAddress && (
          <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
            <ThemedText style={styles.label}>USDC Wallet Address</ThemedText>
            <Pressable onPress={() => copyToClipboard(profile.usdcAddress!, 'Wallet address')}>
              <ThemedText style={styles.address} numberOfLines={1} ellipsizeMode="middle">
                {profile.usdcAddress}
              </ThemedText>
            </Pressable>
            <ThemedText style={styles.hint}>Tap address to copy</ThemedText>
          </View>
        )}

        {/* Fiat Balance */}
        <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <ThemedText style={styles.label}>Fiat Balance</ThemedText>
          <ThemedText type="title" style={styles.value}>₦ {fiatBalance.toFixed(2)}</ThemedText>
        </View>

        {/* Crypto Balances */}
        <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <ThemedText style={styles.label}>Crypto Balances</ThemedText>
          {crypto.length === 0 ? (
            <ThemedText style={styles.muted}>No crypto yet</ThemedText>
          ) : (
            crypto.map((c) => (
              <View key={c.symbol} style={styles.row}>
                <ThemedText type="defaultSemiBold">{c.symbol}</ThemedText>
                <ThemedText>{c.amount} (₦ {c.fiatValue.toFixed(2)})</ThemedText>
              </View>
            ))
          )}
        </View>

        <ThemedButton
          title="Send / Withdraw"
          onPress={() => router.push('/send')}
          style={styles.button}
        />

        <ThemedButton
          title="Transaction History"
          onPress={() => router.push('/transactions')}
          style={styles.button}
        />

        <ThemedButton
          title="Ping Backend"
          onPress={testBackend}
          style={styles.button}
        />
        {pingStatus ? <ThemedText style={styles.ping}>{pingStatus}</ThemedText> : null}
        {pingDetails ? <ThemedText style={styles.pingDetail}>{pingDetails}</ThemedText> : null}
        {fetchDetails ? <ThemedText style={styles.fetchDetail}>{fetchDetails}</ThemedText> : null}
        <ThemedText style={styles.baseUrl}>Current API Base: {API_BASE_URL}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { marginBottom: 24 },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  label: { fontSize: 14, opacity: 0.7, marginBottom: 8, fontFamily: 'Poppins-Regular' },
  value: { fontSize: 32, fontFamily: 'Poppins-Bold' },
  accountNumber: { fontSize: 24, fontFamily: 'Poppins-Bold', marginBottom: 4 },
  bankName: { fontSize: 16, opacity: 0.8, fontFamily: 'Poppins-Regular' },
  address: { fontSize: 12, fontFamily: 'Courier', marginTop: 4, marginBottom: 4 },
  hint: { fontSize: 11, opacity: 0.5, marginTop: 4, fontStyle: 'italic', fontFamily: 'Poppins-Regular' },
  muted: { opacity: 0.5, marginTop: 8, fontFamily: 'Poppins-Regular' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#ccc' },
  button: { marginTop: 8 },
  ping: { marginTop: 12, fontSize: 12, opacity: 0.7, fontFamily: 'Poppins-Regular' },
  pingDetail: { marginTop: 4, fontSize: 11, opacity: 0.6, fontFamily: 'Poppins-Regular' },
  baseUrl: { marginTop: 8, fontSize: 11, opacity: 0.5, fontFamily: 'Poppins-Regular', fontStyle: 'italic' },
  fetchDetail: { marginTop: 4, fontSize: 10, opacity: 0.55, fontFamily: 'Poppins-Regular' },
});
