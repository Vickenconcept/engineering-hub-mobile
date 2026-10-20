import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from '../Card';
import { formatAmountWithCurrency } from '../../utils/currency';

interface EscrowTabProps {
  funded: number;
  released: number;
  remaining: number;
}

export function EscrowTab({ funded, released, remaining }: EscrowTabProps) {
  return (
    <View style={styles.tabContent}>
      <Card style={styles.escrowCard}>
        <CardContent>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield" size={20} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Escrow Summary</Text>
          </View>

          <View style={styles.escrowTotal}>
            <Text style={styles.escrowTotalLabel}>Total Funded</Text>
            <Text style={styles.escrowTotalValue}>
              {formatAmountWithCurrency(funded)}
            </Text>
          </View>

          <View style={styles.escrowDetails}>
            <View style={styles.escrowDetailRow}>
              <Text style={styles.escrowDetailLabel}>Released to Date</Text>
              <Text style={styles.escrowDetailValueReleased}>
                {formatAmountWithCurrency(released)}
              </Text>
            </View>
            
            <View style={styles.escrowDetailRow}>
              <Text style={styles.escrowDetailLabel}>Remaining in Escrow</Text>
              <Text style={styles.escrowDetailValue}>
                {formatAmountWithCurrency(remaining)}
              </Text>
            </View>
          </View>

          {funded > 0 && (
            <View style={styles.escrowProgress}>
              <View style={styles.escrowProgressBarContainer}>
                <View 
                  style={[
                    styles.escrowProgressBar, 
                    { width: `${(released / funded) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.escrowProgressText}>
                {((released / funded) * 100).toFixed(0)}% of funds released
              </Text>
            </View>
          )}
        </CardContent>
      </Card>

      <Card style={styles.protectionCard}>
        <CardContent>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield" size={20} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Escrow Protection</Text>
          </View>

          <Text style={styles.protectionText}>
            Your funds are held securely in escrow and only released when you approve completed milestones.
          </Text>

          <View style={styles.protectionFeatures}>
            <View style={styles.protectionFeature}>
              <View style={styles.protectionIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              </View>
              <View style={styles.protectionContent}>
                <Text style={styles.protectionTitle}>Funds Protected</Text>
                <Text style={styles.protectionDescription}>Funds protected until milestone approval</Text>
              </View>
            </View>
            
            <View style={styles.protectionFeature}>
              <View style={styles.protectionIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              </View>
              <View style={styles.protectionContent}>
                <Text style={styles.protectionTitle}>Evidence-Based</Text>
                <Text style={styles.protectionDescription}>Evidence-based approval process</Text>
              </View>
            </View>
            
            <View style={styles.protectionFeature}>
              <View style={styles.protectionIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              </View>
              <View style={styles.protectionContent}>
                <Text style={styles.protectionTitle}>Dispute Resolution</Text>
                <Text style={styles.protectionDescription}>Dispute resolution available</Text>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    gap: 16,
  },
  escrowCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginLeft: 8,
  },
  escrowTotal: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  escrowTotalLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
  },
  escrowTotalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  escrowDetails: {
    gap: 12,
    marginBottom: 16,
  },
  escrowDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  escrowDetailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  escrowDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  escrowDetailValueReleased: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  escrowProgress: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  escrowProgressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  escrowProgressBar: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 6,
  },
  escrowProgressText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  protectionCard: {
    marginBottom: 16,
  },
  protectionText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  protectionFeatures: {
    gap: 16,
  },
  protectionFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  protectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  protectionContent: {
    flex: 1,
  },
  protectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4,
  },
  protectionDescription: {
    fontSize: 12,
    color: '#64748B',
  },
});
