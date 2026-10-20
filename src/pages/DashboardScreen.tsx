import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { consultationService, Consultation } from '../services/consultation.service';
import { projectService, Project } from '../services/project.service';
import { storage } from '../lib/storage';
import { formatAmountWithCurrency, parseFormattedAmount } from '../utils/currency';
import Toast from 'react-native-toast-message';

interface DashboardScreenProps {
  userRole: 'client' | 'company' | 'admin';
  onMenuPress: () => void;
}

export default function DashboardScreen({ userRole, onMenuPress }: DashboardScreenProps) {
  const navigation = useNavigation();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Wait a bit to ensure token is available after login
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [userRole]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Ensure token is available before making requests
      const token = await storage.getToken();
      if (!token) {
        console.warn('No token available, skipping dashboard data load');
        setIsLoading(false);
        setRefreshing(false);
        return;
      }
      
      if (userRole === 'company') {
        const [consultationsData, projectsData] = await Promise.all([
          consultationService.listForCompany({ per_page: 5 }),
          projectService.listForCompany({ per_page: 5 }),
        ]);
        setConsultations(consultationsData.consultations);
        setProjects(projectsData.projects);
      } else if (userRole === 'client') {
        const [consultationsData, projectsData] = await Promise.all([
          consultationService.list({ per_page: 5 }),
          projectService.list({ per_page: 5 }),
        ]);
        setConsultations(consultationsData.consultations);
        setProjects(projectsData.projects);
      }
    } catch (error: any) {
      // Don't show error toast for 401/403 if it's just a timing issue
      // The auth interceptor will handle navigation
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Auth error loading dashboard data - may be timing issue:', error.response?.status);
        // Don't show toast, let the auth interceptor handle it
      } else {
        console.error('Failed to load dashboard data:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load dashboard data',
        });
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const activeConsultations = consultations.filter(
    (c) => c.status === 'scheduled' && !c.is_completed
  ).length;

  const activeProjects = projects.filter(
    (p) => p.status === 'active' || p.status === 'draft'
  ).length;

  const escrowBalance = projects.reduce((total, project) => {
    if (!project.milestones) return total;
    return total + project.milestones.reduce((milestoneTotal, milestone) => {
      if (milestone.escrow && milestone.escrow.status === 'held') {
        return milestoneTotal + (typeof milestone.escrow.amount === 'number' 
          ? milestone.escrow.amount 
          : parseFormattedAmount(milestone.escrow.amount));
      }
      return milestoneTotal;
    }, 0);
  }, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
        <View style={styles.content}>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statContent}>
                <Ionicons name="calendar" size={24} color="#1E3A8A" />
                <Text style={styles.statValue}>{activeConsultations}</Text>
                <Text style={styles.statLabel}>Active Consultations</Text>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statContent}>
                <Ionicons name="folder" size={24} color="#1E3A8A" />
                <Text style={styles.statValue}>{activeProjects}</Text>
                <Text style={styles.statLabel}>Active Projects</Text>
              </View>
            </CardContent>
          </Card>
        </View>

        {userRole === 'client' && (
          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statContent}>
                <Ionicons name="shield" size={24} color="#1E3A8A" />
                <Text style={styles.statValue}>{formatAmountWithCurrency(escrowBalance)}</Text>
                <Text style={styles.statLabel}>Escrow Balance</Text>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Recent Consultations */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text style={styles.sectionTitle}>Recent Consultations</Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {consultations.length === 0 ? (
              <Text style={styles.emptyText}>No consultations yet</Text>
            ) : (
              consultations.map((consultation) => (
                <TouchableOpacity
                  key={consultation.id}
                  style={styles.listItem}
                  onPress={() => navigation.navigate('ConsultationDetail' as never, { id: consultation.id } as never)}
                >
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>
                      {consultation.company?.company_name || 'Consultation'}
                    </Text>
                    <Text style={styles.listItemSubtitle}>
                      {new Date(consultation.scheduled_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <StatusBadge status={consultation.status} />
                </TouchableOpacity>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Text style={styles.sectionTitle}>Recent Projects</Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <Text style={styles.emptyText}>No projects yet</Text>
            ) : (
              projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.listItem}
                  onPress={() => navigation.navigate('ProjectDetail' as never, { id: project.id } as never)}
                >
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{project.title}</Text>
                    <Text style={styles.listItemSubtitle}>{project.location}</Text>
                  </View>
                  <StatusBadge status={project.status} />
                </TouchableOpacity>
              ))
            )}
          </CardContent>
        </Card>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
