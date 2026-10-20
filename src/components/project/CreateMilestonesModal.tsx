import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { Button } from '../Button';
import { formatAmountWithCurrency } from '../../utils/currency';

interface MilestoneForm {
  title: string;
  description: string;
  amount: string;
  sequence_order: number;
}

interface CreateMilestonesModalProps {
  visible: boolean;
  projectTitle: string;
  milestoneForms: MilestoneForm[];
  isProcessing: boolean;
  onClose: () => void;
  onAddMilestone: () => void;
  onRemoveMilestone: (index: number) => void;
  onUpdateMilestone: (index: number, field: string, value: string | number) => void;
  onSubmit: () => void;
}

export function CreateMilestonesModal({
  visible,
  projectTitle,
  milestoneForms,
  isProcessing,
  onClose,
  onAddMilestone,
  onRemoveMilestone,
  onUpdateMilestone,
  onSubmit,
}: CreateMilestonesModalProps) {
  const calculateTotal = () => {
    return milestoneForms.reduce((total, milestone) => {
      const amount = parseFloat(milestone.amount) || 0;
      return total + amount;
    }, 0);
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Create Milestones"
    >
      <View style={styles.modalContent}>
        <Text style={styles.createMilestonesInfo}>
          Define project milestones for {projectTitle}. The project will become active once the client verifies all milestones.
        </Text>

        <View style={styles.milestonesFormContainer}>
          {milestoneForms.map((milestone, index) => (
            <View key={index} style={styles.milestoneFormCard}>
              <View style={styles.milestoneFormHeader}>
                <View style={styles.milestoneFormHeaderLeft}>
                  <View style={styles.milestoneFormNumber}>
                    <Text style={styles.milestoneFormNumberText}>{milestone.sequence_order}</Text>
                  </View>
                  <Text style={styles.milestoneFormLabel}>Milestone {index + 1}</Text>
                </View>
                {milestoneForms.length > 1 && (
                  <TouchableOpacity
                    onPress={() => onRemoveMilestone(index)}
                    disabled={isProcessing}
                  >
                    <Ionicons name="trash" size={20} color="#DC2626" />
                  </TouchableOpacity>
                )}
              </View>

              <Input
                label="Milestone Title *"
                value={milestone.title}
                onChangeText={(text) => onUpdateMilestone(index, 'title', text)}
                placeholder="e.g., Foundation, Roofing, Finishing"
                containerStyle={styles.milestoneFormInput}
              />

              <View style={styles.milestoneFormRow}>
                <Input
                  label="Amount (₦) *"
                  value={milestone.amount}
                  onChangeText={(text) => onUpdateMilestone(index, 'amount', text)}
                  placeholder="0.00"
                  keyboardType="numeric"
                  containerStyle={[styles.milestoneFormInput, styles.milestoneFormInputHalf]}
                />
                <Input
                  label="Sequence Order *"
                  value={milestone.sequence_order.toString()}
                  onChangeText={(text) => {
                    const order = parseInt(text) || 1;
                    onUpdateMilestone(index, 'sequence_order', order);
                  }}
                  keyboardType="numeric"
                  containerStyle={[styles.milestoneFormInput, styles.milestoneFormInputHalf]}
                />
              </View>
              <Text style={styles.sequenceHelpText}>
                Order in which this milestone should be completed
              </Text>

              <Input
                label="Description (Optional)"
                value={milestone.description}
                onChangeText={(text) => onUpdateMilestone(index, 'description', text)}
                placeholder="Describe what work will be completed in this milestone..."
                multiline
                numberOfLines={3}
                containerStyle={styles.milestoneFormInput}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.addMilestoneButton}
          onPress={onAddMilestone}
          disabled={isProcessing}
        >
          <Ionicons name="add-circle" size={20} color="#1E3A8A" />
          <Text style={styles.addMilestoneButtonText}>Add Milestone</Text>
        </TouchableOpacity>

        <View style={styles.totalSummary}>
          <Text style={styles.totalLabel}>Total Project Value</Text>
          <Text style={styles.totalValue}>
            {formatAmountWithCurrency(calculateTotal())}
          </Text>
        </View>

        <View style={styles.modalActions}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            disabled={isProcessing}
          />
          <Button
            title={isProcessing ? 'Creating...' : 'Create Milestones'}
            onPress={onSubmit}
            disabled={isProcessing}
            loading={isProcessing}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    gap: 16,
  },
  createMilestonesInfo: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  milestonesFormContainer: {
    gap: 16,
    marginBottom: 16,
  },
  milestoneFormCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  milestoneFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneFormHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  milestoneFormNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneFormNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  milestoneFormLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  milestoneFormInput: {
    marginBottom: 12,
  },
  milestoneFormRow: {
    flexDirection: 'row',
    gap: 12,
  },
  milestoneFormInputHalf: {
    flex: 1,
  },
  sequenceHelpText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -8,
    marginBottom: 12,
  },
  addMilestoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    backgroundColor: '#EFF6FF',
    marginBottom: 16,
  },
  addMilestoneButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E3A8A',
  },
  totalSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
