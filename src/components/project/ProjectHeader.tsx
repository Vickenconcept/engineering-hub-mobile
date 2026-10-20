import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from '../Card';
import { StatusBadge } from '../StatusBadge';
import { Button } from '../Button';
import { Project, Milestone } from '../../types';

interface ProjectHeaderProps {
  project: Project;
  milestones: Milestone[];
  userRole: 'client' | 'company' | 'admin';
  isProcessing: boolean;
  onComplete: () => void;
}

export function ProjectHeader({
  project,
  milestones,
  userRole,
  isProcessing,
  onComplete,
}: ProjectHeaderProps) {
  return (
    <>
      <Card style={styles.headerCard}>
        <CardContent>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="folder" size={24} color="#1E3A8A" />
              <View style={styles.headerText}>
                <Text style={styles.title}>{project.title}</Text>
                <Text style={styles.subtitle}>ID: {project.id.slice(0, 8)}...</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <StatusBadge status={project.status} />
              {(userRole === 'client' || userRole === 'company') && 
               project.status !== 'completed' && 
               milestones.length > 0 &&
               milestones.every(m => m.status === 'released') && (
                <Button
                  title={isProcessing ? 'Completing...' : 'Mark as Completed'}
                  onPress={onComplete}
                  disabled={isProcessing}
                  loading={isProcessing}
                  style={styles.completeButton}
                />
              )}
            </View>
          </View>
        </CardContent>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  completeButton: {
    marginTop: 8,
  },
});
