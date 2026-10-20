import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { Button } from '../Button';
import { Milestone } from '../../types';

interface NotesModalProps {
  visible: boolean;
  milestone: Milestone | null;
  notes: string;
  userRole: 'client' | 'company' | 'admin';
  isProcessing: boolean;
  onClose: () => void;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
}

export function NotesModal({
  visible,
  milestone,
  notes,
  userRole,
  isProcessing,
  onClose,
  onNotesChange,
  onSave,
}: NotesModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`${userRole === 'client' ? 'Client' : 'Company'} Notes`}
    >
      {milestone && (
        <View style={styles.modalContent}>
          <View style={styles.modalMilestoneInfo}>
            <Ionicons name="chatbubble" size={24} color="#1E3A8A" />
            <View style={styles.modalMilestoneText}>
              <Text style={styles.modalMilestoneLabel}>Milestone</Text>
              <Text style={styles.modalMilestoneTitle}>{milestone.title}</Text>
            </View>
          </View>
          
          {milestone.client_notes && (
            <View style={styles.existingNotes}>
              <Text style={styles.existingNotesLabel}>Client Notes</Text>
              <Text style={styles.existingNotesText}>{milestone.client_notes}</Text>
            </View>
          )}
          
          {milestone.company_notes && (
            <View style={[styles.existingNotes, styles.companyNotes]}>
              <Text style={styles.existingNotesLabel}>Company Notes</Text>
              <Text style={styles.existingNotesText}>{milestone.company_notes}</Text>
            </View>
          )}
          
          <Input
            label={userRole === 'client' ? 'Your Notes' : 'Company Notes'}
            value={notes}
            onChangeText={onNotesChange}
            placeholder="Add your notes or comments about this milestone..."
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
              title={isProcessing ? 'Saving...' : 'Save Notes'}
              onPress={onSave}
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
  existingNotes: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    opacity: 0.2,
  },
  companyNotes: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
    opacity: 0.2,
  },
  existingNotesLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
  },
  existingNotesText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
