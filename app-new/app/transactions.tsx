import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase } from '@/lib/supabase';
import { getTransactions, Transaction } from '@/services/transactions';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function TransactionsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const cardColor = useThemeColor({ light: '#f9f9f9', dark: '#1E1E1E' }, 'background');
    const borderColor = useThemeColor({ light: '#eee', dark: '#333' }, 'icon');
    const tintColor = useThemeColor({}, 'tint');
    const creditColor = '#10b981';
    const debitColor = '#ef4444';

    const load = async () => {
        setRefreshing(true);
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return router.replace('/auth/signup');

            const txs = await getTransactions(user.id);
            setTransactions(txs);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => { load(); }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionLabel = (tx: Transaction) => {
        if (tx.metadata?.kind === 'dva_credit') return 'DVA Deposit';
        if (tx.metadata?.kind === 'crypto_deposit') return `${tx.metadata.symbol} Deposit`;
        if (tx.metadata?.kind === 'fiat_transfer') return 'Fiat Transfer';
        if (tx.metadata?.kind === 'crypto_transfer') return 'Crypto Transfer';
        return tx.type === 'credit' ? 'Credit' : 'Debit';
    };

    return (
        <ThemedView style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={tintColor} />}
            >
                <ThemedText type="title" style={styles.title}>Transaction History</ThemedText>

                {transactions.length === 0 ? (
                    <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
                        <ThemedText style={styles.muted}>No transactions yet</ThemedText>
                    </View>
                ) : (
                    transactions.map((tx) => (
                        <View key={tx.id} style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
                            <View style={styles.row}>
                                <View style={styles.txInfo}>
                                    <ThemedText type="defaultSemiBold">{getTransactionLabel(tx)}</ThemedText>
                                    <ThemedText style={styles.date}>{formatDate(tx.createdAt)}</ThemedText>
                                    <ThemedText style={styles.reference}>Ref: {tx.reference.substring(0, 12)}...</ThemedText>
                                </View>
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={[styles.amount, { color: tx.type === 'credit' ? creditColor : debitColor }]}
                                >
                                    {tx.type === 'credit' ? '+' : '-'}₦ {tx.amount.toFixed(2)}
                                </ThemedText>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 24 },
    title: { marginBottom: 24 },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    txInfo: { flex: 1 },
    date: { fontSize: 12, opacity: 0.6, marginTop: 4, fontFamily: 'Poppins-Regular' },
    reference: { fontSize: 10, opacity: 0.5, marginTop: 2, fontFamily: 'Courier' },
    amount: { fontSize: 18, fontFamily: 'Poppins-Bold' },
    muted: { opacity: 0.5, textAlign: 'center', fontFamily: 'Poppins-Regular' },
});
