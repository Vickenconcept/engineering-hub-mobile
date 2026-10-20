import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from '../Card';
import { Project } from '../../services/project.service';
import { formatAmountWithCurrency } from '../../utils/currency';

interface OverviewTabProps {
  project: Project;
}

export function OverviewTab({ project }: OverviewTabProps) {
  const formatBudget = (project: Project): string => {
    if (project.budget_min && project.budget_max) {
      return `${formatAmountWithCurrency(project.budget_min)} - ${formatAmountWithCurrency(project.budget_max)}`;
    }
    if (project.budget_min) {
      return `${formatAmountWithCurrency(project.budget_min)}+`;
    }
    if (project.budget_max) {
      return `Up to ${formatAmountWithCurrency(project.budget_max)}`;
    }
    return 'Not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.tabContent}>
      <Card style={styles.detailsCard}>
        <CardContent>
          <View style={styles.sectionHeader}>
            <Ionicons name="folder-outline" size={20} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Project Details</Text>
          </View>

          {project.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.descriptionText}>{project.description}</Text>
            </View>
          )}

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar" size={20} color="#1E3A8A" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Created Date</Text>
                <Text style={styles.detailValue}>{formatDate(project.created_at)}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="location" size={20} color="#1E3A8A" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{project.location}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="cash" size={20} color="#1E3A8A" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Budget Range</Text>
                <Text style={styles.detailValue}>{formatBudget(project)}</Text>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Company Info */}
      {project.company && (
        <Card style={styles.companyCard}>
          <CardContent>
            <View style={styles.sectionHeader}>
              <Ionicons name="business" size={20} color="#1E3A8A" />
              <Text style={styles.sectionTitle}>Company</Text>
            </View>

            <View style={styles.companyInfo}>
              <View style={styles.companyItem}>
                <Text style={styles.companyLabel}>Company Name</Text>
                <Text style={styles.companyValue}>
                  {project.company.company_name || 'N/A'}
                </Text>
              </View>

              {project.company.user && (
                <>
                  <View style={styles.companyItem}>
                    <Text style={styles.companyLabel}>Contact Person</Text>
                    <Text style={styles.companyValue}>{project.company.user.name}</Text>
                  </View>
                  
                  <View style={styles.companyItem}>
                    <Text style={styles.companyLabel}>Email</Text>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`mailto:${project.company.user?.email}`)}
                    >
                      <Text style={styles.companyLink}>{project.company.user.email}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {project.company.registration_number && (
                <View style={styles.companyItem}>
                  <Text style={styles.companyLabel}>Registration Number</Text>
                  <Text style={styles.companyValue}>{project.company.registration_number}</Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    gap: 16,
  },
  detailsCard: {
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
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  companyCard: {
    marginBottom: 16,
  },
  companyInfo: {
    gap: 16,
  },
  companyItem: {
    marginBottom: 12,
  },
  companyLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  companyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  companyLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E3A8A',
    textDecorationLine: 'underline',
  },
});
