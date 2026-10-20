import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { Button } from '../Button';
import { Milestone } from '../../types';

interface VerifyMilestoneModalProps {
  visible: boolean;
  milestone: Milestone | null;
  notes: string;
  isProcessing: boolean;
  onClose: () => void;
  onNotesChange: (notes: string) => void;
  onVerify: () => void;
}

export function VerifyMilestoneModal({
  visible,
  milestone,
  notes,
  isProcessing,
  onClose,
  onNotesChange,
  onVerify,
}: VerifyMilestoneModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Verify Milestone"
    >
      {milestone && (
        <View style={styles.modalContent}>
          <View style={styles.modalMilestoneInfo}>
            <Ionicons name="checkmark-circle" size={24} color="#1E3A8A" />
            <View style={styles.modalMilestoneText}>
              <Text style={styles.modalMilestoneLabel}>Milestone</Text>
              <Text style={styles.modalMilestoneTitle}>{milestone.title}</Text>
            </View>
          </View>
          
          <Input
            label="Notes (Optional)"
            value={notes}
            onChangeText={onNotesChange}
            placeholder="Add any notes or comments about this milestone..."
            multiline
            numberOfLines={4}
          />

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              disabled={isProcessing}
            />
            <Button
              title={isProcessing ? 'Verifying...' : 'Verify Milestone'}
              onPress={onVerify}
              disabled={isProcessing}
              loading={isProcessing}
            />
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    gap: 16,
  },
  modalMilestoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalMilestoneText: {
    marginLeft: 12,
    flex: 1,
  },
  modalMilestoneLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  modalMilestoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
