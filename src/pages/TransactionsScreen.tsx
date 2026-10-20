import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Card, CardContent } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { transactionService, Transaction } from '../services/transaction.service';
import { formatAmountWithCurrency } from '../utils/currency';
import Toast from 'react-native-toast-message';

interface TransactionsScreenProps {
  userRole: 'client' | 'company' | 'admin';
  onMenuPress: () => void;
}

export default function TransactionsScreen({ userRole, onMenuPress }: TransactionsScreenProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await transactionService.list({ per_page: 50 });
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load transactions',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
        <View style={styles.content}>

        {transactions.length === 0 ? (
          <Card>
            <CardContent>
              <Text style={styles.emptyText}>No transactions found</Text>
            </CardContent>
          </Card>
        ) : (
          transactions.map((transaction) => (
            <Card key={transaction.id} style={styles.transactionCard}>
              <CardContent>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionType}>
                      {transaction.type.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.created_at).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text style={styles.amountText}>
                      {formatAmountWithCurrency(transaction.amount || transaction.total_amount || 0)}
                    </Text>
                    <StatusBadge status={transaction.status} size="small" />
                  </View>
                </View>
              </CardContent>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748B',
  },
  transactionAmount: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
