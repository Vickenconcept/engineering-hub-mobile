import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardContent } from '../Card';

interface ProjectProgressBarProps {
  progress: number;
}

export function ProjectProgressBar({ progress }: ProjectProgressBarProps) {
  return (
    <Card style={styles.progressCard}>
      <CardContent>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  progressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 6,
  },
});
