import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from '../Card';
import { Button } from '../Button';
import { MilestoneCard } from './MilestoneCard';
import { Project, Milestone } from '../../types';

interface MilestonesTabProps {
  project: Project;
  userRole: 'client' | 'company' | 'admin';
  onVerify?: (milestone: Milestone) => void;
  onFund?: (milestoneId: string) => void;
  onNotes?: (milestone: Milestone) => void;
  onCreateMilestones?: () => void;
}

export function MilestonesTab({
  project,
  userRole,
  onVerify,
  onFund,
  onNotes,
  onCreateMilestones,
}: MilestonesTabProps) {
  const milestones = project.milestones || [];

  return (
    <View style={styles.tabContent}>
      {/* Client: Verification Notice for Draft Projects */}
      {userRole === 'client' && project.status === 'draft' && milestones.length > 0 && (
        <Card style={styles.noticeCard}>
          <CardContent>
            <View style={styles.noticeContent}>
              <Ionicons name="alert-circle" size={20} color="#F59E0B" />
              <View style={styles.noticeText}>
                <Text style={styles.noticeTitle}>Verify Milestones to Activate Project</Text>
                <Text style={styles.noticeDescription}>
                  Please review and verify all milestones. The project will become active once all milestones are verified.
                </Text>
                <Text style={styles.noticeCount}>
                  Verified: {milestones.filter(m => m.verified_at).length} / {milestones.length}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Company: Create Milestones for Draft Projects */}
      {userRole === 'company' && project.status === 'draft' && milestones.length === 0 && (
        <Card style={styles.createMilestonesCard}>
          <CardContent>
            <View style={styles.createMilestonesContent}>
              <Ionicons name="folder-outline" size={48} color="#64748B" />
              <Text style={styles.createMilestonesTitle}>No milestones yet</Text>
              <Text style={styles.createMilestonesDescription}>
                Create milestones to activate this project. The project will become active once the client verifies all milestones.
              </Text>
              {onCreateMilestones && (
                <Button
                  title="Create Milestones"
                  onPress={onCreateMilestones}
                  style={styles.createMilestonesButton}
                />
              )}
            </View>
          </CardContent>
        </Card>
      )}

      {milestones.length === 0 && !(userRole === 'company' && project.status === 'draft') ? (
        <Card>
          <CardContent>
            <Text style={styles.emptyText}>No milestones yet</Text>
          </CardContent>
        </Card>
      ) : milestones.length > 0 ? (
        milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            project={project}
            userRole={userRole}
            onVerify={onVerify}
            onFund={onFund}
            onNotes={onNotes}
          />
        ))
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    gap: 16,
  },
  noticeCard: {
    marginBottom: 16,
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  noticeDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  noticeCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  createMilestonesCard: {
    marginBottom: 16,
  },
  createMilestonesContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  createMilestonesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
  },
  createMilestonesDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createMilestonesButton: {
    minWidth: 200,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
