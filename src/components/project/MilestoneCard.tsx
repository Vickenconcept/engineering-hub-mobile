import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from '../Card';
import { StatusBadge } from '../StatusBadge';
import { Button } from '../Button';
import { Milestone, Project } from '../../types';
import { formatAmountWithCurrency } from '../../utils/currency';

interface MilestoneCardProps {
  milestone: Milestone;
  project: Project;
  userRole: 'client' | 'company' | 'admin';
  onVerify?: (milestone: Milestone) => void;
  onFund?: (milestoneId: string) => void;
  onNotes?: (milestone: Milestone) => void;
}

export function MilestoneCard({
  milestone,
  project,
  userRole,
  onVerify,
  onFund,
  onNotes,
}: MilestoneCardProps) {
  const milestoneDispute = project.disputes?.find(d => d.milestone_id === milestone.id);

  const getMilestoneStatusIcon = (status: string) => {
    switch (status) {
      case 'released':
      case 'approved':
        return <Ionicons name="checkmark-circle" size={20} color="#16A34A" />;
      case 'submitted':
        return <Ionicons name="alert-circle" size={20} color="#F59E0B" />;
      case 'rejected':
        return <Ionicons name="close-circle" size={20} color="#DC2626" />;
      default:
        return <Ionicons name="time" size={20} color="#64748B" />;
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'released':
      case 'approved':
        return '#D1FAE5';
      case 'submitted':
        return '#FEF3C7';
      case 'funded':
        return '#DBEAFE';
      case 'rejected':
        return '#FEE2E2';
      default:
        return '#F8FAFC';
    }
  };

  return (
    <Card style={styles.milestoneCard}>
      <CardContent>
        <View style={styles.milestoneHeader}>
          <View style={[styles.milestoneIconContainer, { backgroundColor: getMilestoneStatusColor(milestone.status) }]}>
            {getMilestoneStatusIcon(milestone.status)}
          </View>
          <View style={styles.milestoneInfo}>
            <Text style={styles.milestoneTitle}>{milestone.title}</Text>
            {milestone.description && (
              <Text style={styles.milestoneDescription}>{milestone.description}</Text>
            )}
          </View>
          <View style={styles.milestoneAmountContainer}>
            <Text style={styles.milestoneAmountLabel}>Amount</Text>
            <Text style={styles.milestoneAmount}>
              {formatAmountWithCurrency(milestone.amount)}
            </Text>
          </View>
        </View>

        <View style={styles.milestoneBadges}>
          <StatusBadge status={milestone.status} />
          {milestone.verified_at && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#065F46" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          {(milestone.client_notes || milestone.company_notes) && (
            <View style={styles.notesBadge}>
              <Ionicons name="chatbubble" size={14} color="#64748B" />
              <Text style={styles.notesText}>
                {milestone.client_notes && milestone.company_notes 
                  ? 'Both have notes' 
                  : milestone.client_notes 
                    ? 'Client notes' 
                    : 'Company notes'}
              </Text>
            </View>
          )}
          <View style={styles.sequenceBadge}>
            <View style={styles.sequenceIcon}>
              <Text style={styles.sequenceNumber}>{milestone.sequence_order}</Text>
            </View>
            <Text style={styles.sequenceText}>Sequence</Text>
          </View>
          {milestone.escrow && (
            <View style={styles.escrowBadge}>
              <Ionicons name="shield" size={14} color="#1E3A8A" />
              <Text style={styles.escrowText}>Escrow: {milestone.escrow.status}</Text>
            </View>
          )}
        </View>

        {userRole === 'company' && milestone.status === 'rejected' && milestoneDispute && (
          <View style={styles.rejectionNotice}>
            <Text style={styles.rejectionLabel}>Rejection Reason</Text>
            <Text style={styles.rejectionText}>{milestoneDispute.reason}</Text>
          </View>
        )}

        <View style={styles.milestoneActions}>
          {userRole === 'client' && project.status === 'draft' && !milestone.verified_at && onVerify && (
            <Button
              title="Verify Milestone"
              onPress={() => onVerify(milestone)}
              size="small"
            />
          )}
          {userRole === 'client' && project.status === 'active' && milestone.status === 'pending' && !milestone.escrow && onFund && (
            <Button
              title="Fund Escrow"
              onPress={() => onFund(milestone.id)}
              size="small"
            />
          )}
          {(userRole === 'client' || userRole === 'company') && onNotes && (
            <Button
              title="Notes"
              onPress={() => onNotes(milestone)}
              variant="outline"
              size="small"
            />
          )}
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  milestoneCard: {
    marginBottom: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  milestoneIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  milestoneAmountContainer: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 120,
  },
  milestoneAmountLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  milestoneAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  milestoneBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#065F46',
  },
  notesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  notesText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  sequenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  sequenceIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#1E3A8A',
    opacity: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sequenceNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  sequenceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  escrowText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  rejectionNotice: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 16,
  },
  rejectionLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 14,
    color: '#334155',
  },
  milestoneActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
