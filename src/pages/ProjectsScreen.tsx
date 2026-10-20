import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { projectService, Project } from '../services/project.service';
import { formatAmountWithCurrency, parseFormattedAmount } from '../utils/currency';
import { storage } from '../lib/storage';
import Toast from 'react-native-toast-message';

interface ProjectsScreenProps {
  userRole: 'client' | 'company' | 'admin';
  onMenuPress: () => void;
}

export default function ProjectsScreen({ userRole, onMenuPress }: ProjectsScreenProps) {
  const navigation = useNavigation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [userRole]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      
      const token = await storage.getToken();
      if (!token) {
        console.warn('No token available, skipping projects load');
        setIsLoading(false);
        setRefreshing(false);
        return;
      }
      
      const data = userRole === 'company'
        ? await projectService.listForCompany({ per_page: 50 })
        : await projectService.list({ per_page: 50 });
      setProjects(data.projects);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Auth error loading projects:', error.response?.status);
      } else {
        console.error('Failed to load projects:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load projects',
        });
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };

  const calculateProjectProgress = (project: Project): number => {
    if (!project.milestones || project.milestones.length === 0) return 0;
    
    const completedMilestones = project.milestones.filter(
      (m) => m.status === 'approved' || m.status === 'released'
    ).length;
    
    return Math.round((completedMilestones / project.milestones.length) * 100);
  };

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

  const formatInvestment = (amount: number): string => {
    if (!amount || isNaN(amount) || amount === 0) {
      return '₦0';
    }
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(0)}K`;
    }
    return formatAmountWithCurrency(amount);
  };

  // Calculate stats
  const activeProjects = projects.filter(
    (p) => p.status === 'active' || p.status === 'draft'
  ).length;

  const completedProjects = projects.filter(
    (p) => p.status === 'completed'
  ).length;

  // Calculate total investment from actual milestone escrow payments
  const totalInvestment = projects.reduce((total, project) => {
    if (!project.milestones || project.milestones.length === 0) {
      return total;
    }
    
    const projectTotal = project.milestones.reduce((milestoneTotal, milestone) => {
      if (milestone.escrow && (milestone.escrow.status === 'held' || milestone.escrow.status === 'released')) {
        return milestoneTotal + parseFormattedAmount(milestone.escrow.amount);
      }
      return milestoneTotal;
    }, 0);
    
    return total + projectTotal;
  }, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Active Projects Card */}
          <View style={[styles.statCard, styles.activeCard]}>
            <View style={styles.statCardContent}>
              <View style={styles.statCardLeft}>
                <Text style={styles.statLabel}>Active Projects</Text>
                <Text style={styles.statValue}>{activeProjects}</Text>
                <Text style={styles.statSubtext}>{projects.length} total</Text>
              </View>
              <View style={styles.statIconContainer}>
                <Ionicons name="folder" size={32} color="#fff" />
              </View>
            </View>
          </View>

          {/* Total Investment Card */}
          <View style={[styles.statCard, styles.investmentCard]}>
            <View style={styles.statCardContent}>
              <View style={styles.statCardLeft}>
                <Text style={[styles.statLabel, styles.investmentLabel]}>Total Investment</Text>
                <Text style={[styles.statValue, styles.investmentValue]}>
                  {formatInvestment(totalInvestment)}
                </Text>
                <Text style={styles.statSubtext}>Across all projects</Text>
              </View>
              <View style={[styles.statIconContainer, styles.investmentIcon]}>
                <Ionicons name="cash" size={32} color="#1E3A8A" />
              </View>
            </View>
          </View>

          {/* Completed Projects Card */}
          <View style={[styles.statCard, styles.completedCard]}>
            <View style={styles.statCardContent}>
              <View style={styles.statCardLeft}>
                <Text style={[styles.statLabel, styles.completedLabel]}>Completed</Text>
                <Text style={[styles.statValue, styles.completedValue]}>{completedProjects}</Text>
                <Text style={styles.statSubtext}>Successfully finished</Text>
              </View>
              <View style={[styles.statIconContainer, styles.completedIcon]}>
                <Ionicons name="checkmark-circle" size={32} color="#F59E0B" />
              </View>
            </View>
          </View>
        </View>

        {/* Projects List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingText}>Loading projects...</Text>
          </View>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent>
              <Text style={styles.emptyText}>No projects found</Text>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => {
            const progress = calculateProjectProgress(project);
            return (
              <Card key={project.id} style={styles.projectCard}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ProjectDetail' as never, { id: project.id } as never)}
                >
                  <CardContent>
                    <View style={styles.projectHeader}>
                      <View style={styles.projectInfo}>
                        <Text style={styles.projectTitle}>{project.title}</Text>
                        {project.company && (
                          <Text style={styles.projectCompany}>
                            {project.company.company_name || 'Company'}
                          </Text>
                        )}
                        <Text style={styles.projectLocation}>{project.location}</Text>
                      </View>
                      <StatusBadge status={project.status} />
                    </View>

                    {project.description && (
                      <Text style={styles.projectDescription} numberOfLines={2}>
                        {project.description}
                      </Text>
                    )}

                    <View style={styles.projectDetails}>
                      <View style={styles.detailItem}>
                        <Ionicons name="cash-outline" size={16} color="#64748B" />
                        <Text style={styles.detailText}>{formatBudget(project)}</Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    {project.milestones && project.milestones.length > 0 && (
                      <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>Progress</Text>
                          <Text style={styles.progressValue}>{progress}%</Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                          <View style={[styles.progressBar, { width: `${progress}%` }]} />
                        </View>
                      </View>
                    )}
                  </CardContent>
                </TouchableOpacity>
              </Card>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  statsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  activeCard: {
    backgroundColor: '#1E3A8A',
  },
  investmentCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completedCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statCardLeft: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  investmentLabel: {
    color: '#1E3A8A',
  },
  completedLabel: {
    color: '#F59E0B',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  investmentValue: {
    color: '#1E3A8A',
  },
  completedValue: {
    color: '#F59E0B',
  },
  statSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  investmentIcon: {
    backgroundColor: '#1E3A8A',
    opacity: 0.1,
  },
  completedIcon: {
    backgroundColor: '#F59E0B',
    opacity: 0.1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  projectCard: {
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  projectCompany: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 14,
    color: '#64748B',
  },
  projectDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  projectDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
    fontWeight: '500',
  },
  progressSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E7FF',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
