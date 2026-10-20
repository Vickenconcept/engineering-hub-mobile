import { useState } from 'react';
import Toast from 'react-native-toast-message';

interface MilestoneForm {
  title: string;
  description: string;
  amount: string;
  sequence_order: number;
}

export function useMilestoneForms() {
  const [milestoneForms, setMilestoneForms] = useState<MilestoneForm[]>([{
    title: '',
    description: '',
    amount: '',
    sequence_order: 1,
  }]);

  const addMilestoneForm = () => {
    setMilestoneForms([
      ...milestoneForms,
      {
        title: '',
        description: '',
        amount: '',
        sequence_order: milestoneForms.length + 1,
      },
    ]);
  };

  const removeMilestoneForm = (index: number) => {
    if (milestoneForms.length === 1) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'At least one milestone is required',
      });
      return;
    }
    
    const updated = milestoneForms.filter((_, i) => i !== index);
    updated.forEach((milestone, i) => {
      milestone.sequence_order = i + 1;
    });
    setMilestoneForms(updated);
  };

  const updateMilestoneForm = (index: number, field: string, value: string | number) => {
    const updated = [...milestoneForms];
    updated[index] = { ...updated[index], [field]: value };
    setMilestoneForms(updated);
  };

  const resetMilestoneForms = () => {
    setMilestoneForms([{
      title: '',
      description: '',
      amount: '',
      sequence_order: 1,
    }]);
  };

  const validateMilestones = (): boolean => {
    for (const milestone of milestoneForms) {
      if (!milestone.title.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'All milestones must have a title',
        });
        return false;
      }
      if (!milestone.amount || parseFloat(milestone.amount) <= 0) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'All milestones must have a valid amount',
        });
        return false;
      }
    }
    
    const sequenceOrders = milestoneForms.map(m => m.sequence_order);
    const uniqueOrders = new Set(sequenceOrders);
    if (uniqueOrders.size !== sequenceOrders.length) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Sequence orders must be unique',
      });
      return false;
    }
    
    return true;
  };

  return {
    milestoneForms,
    setMilestoneForms,
    addMilestoneForm,
    removeMilestoneForm,
    updateMilestoneForm,
    resetMilestoneForms,
    validateMilestones,
  };
}
