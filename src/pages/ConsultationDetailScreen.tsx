import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { consultationService, Consultation } from '../services/consultation.service';
import { projectService } from '../services/project.service';
import { formatAmountWithCurrency, parseFormattedAmount } from '../utils/currency';
import { storage } from '../lib/storage';
import Toast from 'react-native-toast-message';

interface ConsultationDetailScreenProps {
  userRole?: 'client' | 'company' | 'admin';
  onMenuPress?: () => void;
}

export default function ConsultationDetailScreen({ userRole, onMenuPress }: ConsultationDetailScreenProps = {}) {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<'client' | 'company' | 'admin'>('client');
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    location: '',
    budget_min: '',
    budget_max: '',
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (id) {
      loadConsultation();
    }
  }, [id, currentUserRole, userRole]);

  const loadUser = async () => {
    const user = await storage.getUser();
    if (user) {
      setCurrentUserRole(user.role);
    }
  };

  const loadConsultation = async () => {
    try {
      setIsLoading(true);
      
      const token = await storage.getToken();
      if (!token) {
        console.warn('No token available, skipping consultation load');
        setIsLoading(false);
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const effectiveRole = userRole || currentUserRole;
      const data = effectiveRole === 'company'
        ? await consultationService.getForCompany(id)
        : await consultationService.get(id);
      setConsultation(data);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Auth error loading consultation:', error.response?.status);
      } else {
        console.error('Failed to load consultation:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response?.data?.message || 'Failed to load consultation details',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async () => {
    if (!consultation) return;
    
    try {
      const payment = await consultationService.pay(consultation.id);
      if (await Linking.canOpenURL(payment.payment_url)) {
        await Linking.openURL(payment.payment_url);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
    }
  };

  const handleComplete = async () => {
    if (!consultation) return;
    
    try {
      await consultationService.complete(consultation.id);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Consultation marked as completed',
      });
      loadConsultation();
    } catch (error: any) {
      console.error('Failed to complete consultation:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to mark consultation as completed',
      });
    }
  };

  const handleCreateProject = async () => {
    if (!consultation || !projectForm.title || !projectForm.location) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    try {
      setIsCreatingProject(true);
      const project = await projectService.create({
        consultation_id: consultation.id,
        title: projectForm.title,
        description: projectForm.description || undefined,
        location: projectForm.location,
        budget_min: projectForm.budget_min ? parseFloat(projectForm.budget_min) : undefined,
        budget_max: projectForm.budget_max ? parseFloat(projectForm.budget_max) : undefined,
      });
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Project created successfully!',
      });
      setShowCreateProjectModal(false);
      navigation.navigate('ProjectDetail' as never, { id: project.id } as never);
    } catch (error: any) {
      console.error('Failed to create project:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to create project',
      });
    } finally {
      setIsCreatingProject(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeStatus = (status: string): 'pending' | 'approved' | 'rejected' | 'scheduled' | 'completed' | 'active' => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'scheduled';
      case 'completed':
        return 'completed';
      case 'active':
      case 'in_progress':
        return 'active';
      case 'pending':
        return 'pending';
      case 'approved':
        return 'approved';
      case 'rejected':
      case 'cancelled':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const getPaymentStatusBadgeStatus = (status: string): 'pending' | 'approved' | 'rejected' => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'approved';
      case 'pending':
      case 'unpaid':
        return 'pending';
      case 'refunded':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const effectiveUserRole = userRole || currentUserRole;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (!consultation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Consultation not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <CardContent>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="calendar" size={24} color="#1E3A8A" />
                <View style={styles.headerText}>
                  <Text style={styles.title}>
                    Consultation with {effectiveUserRole === 'company' 
                      ? (consultation.client?.name || 'Client')
                      : (consultation.company?.company_name || 'Company')}
                  </Text>
                  <Text style={styles.subtitle}>
                    ID: {consultation.id.slice(0, 8)}...
                  </Text>
                </View>
              </View>
              <View style={styles.badgeContainer}>
                <StatusBadge status={getStatusBadgeStatus(consultation.status)} />
                <StatusBadge status={getPaymentStatusBadgeStatus(consultation.payment_status)} />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card style={styles.detailsCard}>
          <CardContent>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={20} color="#1E3A8A" />
              <Text style={styles.sectionTitle}>Session Details</Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="calendar" size={20} color="#1E3A8A" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Scheduled Date</Text>
                  <Text style={styles.detailValue}>{formatDate(consultation.scheduled_at)}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="time" size={20} color="#1E3A8A" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Time & Duration</Text>
                  <Text style={styles.detailValue}>
                    {formatTime(consultation.scheduled_at)} ({consultation.duration_minutes} min)
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="cash" size={20} color="#1E3A8A" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Consultation Fee</Text>
                  <Text style={styles.detailValue}>{formatAmountWithCurrency(consultation.price)}</Text>
                  {effectiveUserRole !== 'client' && consultation.platform_fee && consultation.platform_fee > 0 && consultation.is_paid && (
                    <View style={styles.feeBreakdown}>
                      <View style={styles.feeRow}>
                        <Text style={styles.feeBreakdownLabel}>
                          Platform Fee ({consultation.platform_fee_percentage || 0}%)
                        </Text>
                        <Text style={styles.feeBreakdownValue}>
                          -{formatAmountWithCurrency(consultation.platform_fee)}
                        </Text>
                      </View>
                      <View style={styles.feeRow}>
                        <Text style={styles.feeBreakdownTotalLabel}>Amount You'll Receive</Text>
                        <Text style={styles.feeBreakdownTotalValue}>
                          {formatAmountWithCurrency(consultation.net_amount || (parseFormattedAmount(consultation.price) - parseFormattedAmount(consultation.platform_fee)))}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="card" size={20} color="#1E3A8A" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Payment Status</Text>
                  <StatusBadge status={getPaymentStatusBadgeStatus(consultation.payment_status)} />
                </View>
              </View>
            </View>

            {consultation.meeting_link && (
              <View style={styles.meetingSection}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="videocam" size={20} color="#1E3A8A" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Meeting Link</Text>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(consultation.meeting_link!)}
                    >
                      <Text style={styles.meetingLink}>{consultation.meeting_link}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsSection}>
              {consultation.status === 'scheduled' && consultation.is_paid && consultation.meeting_link && (
                <Button
                  title="Join Meeting"
                  onPress={() => Linking.openURL(consultation.meeting_link!)}
                  style={styles.actionButton}
                />
              )}

              {effectiveUserRole === 'client' && consultation.status === 'scheduled' && !consultation.is_paid && consultation.payment_status !== 'paid' && (
                <Button
                  title={`Pay Consultation Fee (${formatAmountWithCurrency(consultation.price)})`}
                  onPress={handlePay}
                  style={styles.actionButton}
                />
              )}

              {effectiveUserRole === 'client' && (consultation.is_paid || consultation.payment_status === 'paid') && (
                <View style={styles.paidBadge}>
                  <Text style={styles.paidText}>✓ Payment Completed</Text>
                </View>
              )}

              {effectiveUserRole === 'company' && 
               consultation.status === 'scheduled' && 
               (consultation.is_paid || consultation.payment_status === 'paid') && 
               !consultation.is_completed && (
                <Button
                  title="Mark as Completed"
                  onPress={handleComplete}
                  style={styles.actionButton}
                />
              )}

              {effectiveUserRole === 'client' && 
               consultation.status === 'completed' && 
               (consultation.is_paid || consultation.payment_status === 'paid') && (
                <Button
                  title="Create Project from Consultation"
                  onPress={() => setShowCreateProjectModal(true)}
                  style={styles.actionButton}
                />
              )}
            </View>
          </CardContent>
        </Card>

        {/* Company Contact Info */}
        {effectiveUserRole === 'client' && consultation.company && (
          <Card style={styles.contactCard}>
            <CardContent>
              <View style={styles.sectionHeader}>
                <Ionicons name="business" size={20} color="#1E3A8A" />
                <Text style={styles.sectionTitle}>Company Contact</Text>
              </View>

              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Text style={styles.contactLabel}>Company Name</Text>
                  <Text style={styles.contactValue}>
                    {consultation.company.company_name || 'N/A'}
                  </Text>
                </View>

                {consultation.company.user && (
                  <>
                    <View style={styles.contactItem}>
                      <Text style={styles.contactLabel}>Contact Person</Text>
                      <Text style={styles.contactValue}>{consultation.company.user.name}</Text>
                    </View>
                    
                    <View style={styles.contactItem}>
                      <Text style={styles.contactLabel}>Email</Text>
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`mailto:${consultation.company.user?.email}`)}
                      >
                        <Text style={styles.contactLink}>{consultation.company.user.email}</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {consultation.company.registration_number && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>Registration Number</Text>
                    <Text style={styles.contactValue}>{consultation.company.registration_number}</Text>
                  </View>
                )}

                {consultation.company.specialization && consultation.company.specialization.length > 0 && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>Specialization</Text>
                    <View style={styles.specializationContainer}>
                      {consultation.company.specialization.map((spec, idx) => (
                        <View key={idx} style={styles.specializationTag}>
                          <Text style={styles.specializationText}>{spec}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Payment Info Card */}
        <Card style={styles.paymentCard}>
          <CardContent>
            <View style={styles.sectionHeader}>
              <Ionicons name="cash-outline" size={20} color="#1E3A8A" />
              <Text style={styles.sectionTitle}>Payment</Text>
            </View>

            <View style={styles.paymentInfo}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Consultation Fee</Text>
                <Text style={styles.paymentValue}>
                  {formatAmountWithCurrency(consultation.price)}
                </Text>
              </View>

              {effectiveUserRole !== 'client' && consultation.platform_fee && consultation.platform_fee > 0 && (
                <>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabelSmall}>
                      Platform Fee ({consultation.platform_fee_percentage || 0}%)
                    </Text>
                    <Text style={styles.paymentValueSmall}>
                      -{formatAmountWithCurrency(consultation.platform_fee)}
                    </Text>
                  </View>
                  <View style={styles.paymentDivider} />
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentTotalLabel}>Amount You'll Receive</Text>
                    <Text style={styles.paymentTotalValue}>
                      {formatAmountWithCurrency(consultation.net_amount || (consultation.price - consultation.platform_fee))}
                    </Text>
                  </View>
                </>
              )}

              <View style={styles.paymentStatusRow}>
                <Text style={styles.paymentLabel}>Payment Status</Text>
                <StatusBadge status={getPaymentStatusBadgeStatus(consultation.payment_status)} />
              </View>

              {effectiveUserRole === 'client' && !consultation.is_paid && consultation.payment_status !== 'paid' && (
                <View style={styles.paymentAction}>
                  <Button
                    title="Pay Now"
                    onPress={handlePay}
                  />
                </View>
              )}

              {effectiveUserRole === 'client' && (consultation.is_paid || consultation.payment_status === 'paid') && (
                <View style={styles.paidBadge}>
                  <Text style={styles.paidText}>✓ Payment Completed</Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Create Project Modal */}
      <Modal
        visible={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        title="Create New Project"
      >
        <View style={styles.modalForm}>
          <Input
            label="Project Title *"
            value={projectForm.title}
            onChangeText={(text) => setProjectForm({ ...projectForm, title: text })}
            placeholder="e.g., 3-Bedroom House Construction"
          />

          <Input
            label="Description"
            value={projectForm.description}
            onChangeText={(text) => setProjectForm({ ...projectForm, description: text })}
            placeholder="Describe your project requirements..."
            multiline
            numberOfLines={4}
          />

          <Input
            label="Location *"
            value={projectForm.location}
            onChangeText={(text) => setProjectForm({ ...projectForm, location: text })}
            placeholder="e.g., Lagos, Nigeria"
          />

          <View style={styles.budgetRow}>
            <Input
              label="Budget Min (₦)"
              value={projectForm.budget_min}
              onChangeText={(text) => setProjectForm({ ...projectForm, budget_min: text })}
              placeholder="0"
              keyboardType="numeric"
              containerStyle={styles.budgetInput}
            />
            <Input
              label="Budget Max (₦)"
              value={projectForm.budget_max}
              onChangeText={(text) => setProjectForm({ ...projectForm, budget_max: text })}
              placeholder="0"
              keyboardType="numeric"
              containerStyle={styles.budgetInput}
            />
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={() => setShowCreateProjectModal(false)}
              variant="outline"
              disabled={isCreatingProject}
            />
            <Button
              title={isCreatingProject ? 'Creating...' : 'Create Project'}
              onPress={handleCreateProject}
              disabled={isCreatingProject}
              loading={isCreatingProject}
            />
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
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
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
  feeBreakdown: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  feeBreakdownLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  feeBreakdownValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F97316',
  },
  feeBreakdownTotalLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },
  feeBreakdownTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
  },
  meetingSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  meetingLink: {
    fontSize: 14,
    color: '#1E3A8A',
    textDecorationLine: 'underline',
  },
  actionsSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  paidBadge: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
  },
  paidText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#065F46',
  },
  contactCard: {
    marginBottom: 16,
  },
  contactInfo: {
    gap: 16,
  },
  contactItem: {
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  contactLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E3A8A',
    textDecorationLine: 'underline',
  },
  specializationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  specializationTag: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  specializationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  paymentCard: {
    marginBottom: 16,
  },
  paymentInfo: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  paymentLabelSmall: {
    fontSize: 12,
    color: '#64748B',
  },
  paymentValueSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F97316',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  paymentTotalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  paymentTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
  },
  paymentStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paymentAction: {
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 24,
  },
  modalForm: {
    gap: 16,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
