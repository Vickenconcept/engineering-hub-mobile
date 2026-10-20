import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('active') || normalizedStatus.includes('approved') || normalizedStatus === 'paid') {
      return '#10B981';
    }
    if (normalizedStatus.includes('pending') || normalizedStatus.includes('draft') || normalizedStatus === 'scheduled') {
      return '#F59E0B';
    }
    if (normalizedStatus.includes('completed') || normalizedStatus.includes('released')) {
      return '#3B82F6';
    }
    if (normalizedStatus.includes('cancelled') || normalizedStatus.includes('rejected') || normalizedStatus === 'failed') {
      return '#DC2626';
    }
    if (normalizedStatus.includes('disputed')) {
      return '#EF4444';
    }
    return '#64748B';
  };

  const backgroundColor = getStatusColor(status);
  const textColor = '#fff';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor },
        size === 'small' && styles.small,
      ]}
    >
      <Text style={[styles.text, { color: textColor }, size === 'small' && styles.smallText]}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  smallText: {
    fontSize: 10,
  },
});
