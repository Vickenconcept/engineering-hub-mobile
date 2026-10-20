import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { consultationService, Consultation } from '../services/consultation.service';
import { companyService, Company } from '../services/company.service';
import { storage } from '../lib/storage';
import { formatAmountWithCurrency } from '../utils/currency';
import Toast from 'react-native-toast-message';

interface ConsultationsScreenProps {
  userRole: 'client' | 'company' | 'admin';
  onMenuPress: () => void;
}

export default function ConsultationsScreen({ userRole, onMenuPress }: ConsultationsScreenProps) {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'companies' | 'consultations'>('companies');
  const [searchQuery, setSearchQuery] = useState('');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Booking modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [bookingForm, setBookingForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    durationMinutes: 30,
  });
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userRole === 'client' && activeTab === 'companies') {
        loadCompanies();
      }
      loadConsultations();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [userRole, activeTab]);

  const loadCompanies = async () => {
    try {
      setIsLoadingCompanies(true);
      const token = await storage.getToken();
      if (!token) {
        setIsLoadingCompanies(false);
        return;
      }
      
      const { companies: fetchedCompanies } = await companyService.listVerified({
        per_page: 20,
        ...(searchQuery && { search: searchQuery }),
      });
      setCompanies(fetchedCompanies);
    } catch (error: any) {
      console.error('Failed to load companies:', error);
      setCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const loadConsultations = async () => {
    try {
      setIsLoading(true);
      const token = await storage.getToken();
      if (!token) {
        setIsLoading(false);
        setRefreshing(false);
        return;
      }
      
      const data = userRole === 'company'
        ? await consultationService.listForCompany({ per_page: 50 })
        : await consultationService.list({ per_page: 50 });
      setConsultations(data.consultations);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Auth error loading consultations:', error.response?.status);
      } else {
        console.error('Failed to load consultations:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load consultations',
        });
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (userRole === 'client' && activeTab === 'companies') {
      loadCompanies();
    }
    loadConsultations();
  };

  const handleBookConsultation = (company: Company) => {
    setSelectedCompany(company);
    setBookingForm({
      scheduledDate: '',
      scheduledTime: '',
      durationMinutes: 30,
    });
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedCompany) return;
    
    if (!bookingForm.scheduledDate || !bookingForm.scheduledTime) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select date and time for consultation',
      });
      return;
    }
    
    const companyFee = selectedCompany.consultation_fee;
    if (!companyFee || companyFee <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'This company has not set a consultation fee. Please contact them before booking.',
      });
      return;
    }
    
    setIsBooking(true);
    
    try {
      const scheduledAt = new Date(`${bookingForm.scheduledDate}T${bookingForm.scheduledTime}`).toISOString();
      
      const consultation = await consultationService.create({
        company_id: selectedCompany.id,
        scheduled_at: scheduledAt,
        duration_minutes: bookingForm.durationMinutes,
      });
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Consultation booked successfully!',
      });
      
      setBookingModalOpen(false);
      
      // Initialize payment
      const payment = await consultationService.pay(consultation.id);
      
      // Open payment URL
      if (await Linking.canOpenURL(payment.payment_url)) {
        await Linking.openURL(payment.payment_url);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
    } finally {
      setIsBooking(false);
    }
  };

  const handlePay = async (consultationId: string) => {
    try {
      const payment = await consultationService.pay(consultationId);
      if (await Linking.canOpenURL(payment.payment_url)) {
        await Linking.openURL(payment.payment_url);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  return (
    <View style={styles.container}>
      {/* Tabs - Only for clients */}
      {userRole === 'client' && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'companies' && styles.tabActive]}
            onPress={() => setActiveTab('companies')}
          >
            <Text style={[styles.tabText, activeTab === 'companies' && styles.tabTextActive]}>
              Browse Companies
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'consultations' && styles.tabActive]}
            onPress={() => setActiveTab('consultations')}
          >
            <Text style={[styles.tabText, activeTab === 'consultations' && styles.tabTextActive]}>
              My Consultations {consultations.length > 0 && `(${consultations.length})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {userRole === 'client' && activeTab === 'companies' ? (
          <View style={styles.content}>
            {/* Search */}
            <Card style={styles.searchCard}>
              <CardContent>
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
                  <Input
                    placeholder="Search companies by name, specialization..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={loadCompanies}
                    containerStyle={styles.searchInput}
                  />
                </View>
                <Button
                  title="Search"
                  onPress={loadCompanies}
                  variant="outline"
                  size="small"
                  disabled={isLoadingCompanies}
                />
              </CardContent>
            </Card>

            {/* Companies List */}
            {isLoadingCompanies ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={styles.loadingText}>Loading companies...</Text>
              </View>
            ) : companies.length === 0 ? (
              <Card>
                <CardContent>
                  <Text style={styles.emptyText}>No verified companies found</Text>
                </CardContent>
              </Card>
            ) : (
              companies.map((company) => (
                <Card key={company.id} style={styles.companyCard}>
                  <CardContent>
                    <View style={styles.companyHeader}>
                      <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>{company.company_name}</Text>
                        {company.is_verified && (
                          <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>✓ Verified</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    {company.specialization && company.specialization.length > 0 && (
                      <View style={styles.specializationContainer}>
                        {company.specialization.slice(0, 3).map((spec, idx) => (
                          <View key={idx} style={styles.specializationTag}>
                            <Text style={styles.specializationText}>{spec}</Text>
                          </View>
                        ))}
                        {company.specialization.length > 3 && (
                          <Text style={styles.moreText}>+{company.specialization.length - 3} more</Text>
                        )}
                      </View>
                    )}

                    <View style={styles.companyDetails}>
                      {company.registration_number && (
                        <View style={styles.detailItem}>
                          <Ionicons name="business" size={16} color="#1E3A8A" />
                          <Text style={styles.detailText}>{company.registration_number}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.bookingSection}>
                      <View style={styles.feeContainer}>
                        <Text style={styles.feeLabel}>Consultation Fee</Text>
                        <Text style={styles.feeAmount}>
                          {formatAmountWithCurrency(company.consultation_fee || 0)}
                        </Text>
                        {(!company.consultation_fee || company.consultation_fee <= 0) && (
                          <Text style={styles.feeWarning}>⚠️ Fee not set</Text>
                        )}
                      </View>
                      <Button
                        title="Book Consultation"
                        onPress={() => handleBookConsultation(company)}
                        disabled={!company.consultation_fee || company.consultation_fee <= 0}
                      />
                    </View>
                  </CardContent>
                </Card>
              ))
            )}
          </View>
        ) : (
          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={styles.loadingText}>Loading consultations...</Text>
              </View>
            ) : consultations.length === 0 ? (
              <Card>
                <CardContent>
                  <Text style={styles.emptyText}>No consultations found</Text>
                </CardContent>
              </Card>
            ) : (
              consultations.map((consultation) => (
                <Card key={consultation.id} style={styles.consultationCard}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ConsultationDetail' as never, { id: consultation.id } as never)}
                  >
                    <CardContent>
                      <View style={styles.consultationHeader}>
                        <View style={styles.consultationInfo}>
                          <Text style={styles.consultationTitle}>
                            {userRole === 'company'
                              ? (consultation.client?.name || 'Client')
                              : (consultation.company?.company_name || 'Company')}
                          </Text>
                          <View style={styles.badgeContainer}>
                            <StatusBadge status={getStatusBadgeStatus(consultation.status)} />
                            <StatusBadge status={getPaymentStatusBadgeStatus(consultation.payment_status)} />
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.consultationDetails}>
                        <View style={styles.detailRow}>
                          <Ionicons name="calendar" size={16} color="#1E3A8A" />
                          <Text style={styles.detailText}>{formatDate(consultation.scheduled_at)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Ionicons name="time" size={16} color="#1E3A8A" />
                          <Text style={styles.detailText}>
                            {formatTime(consultation.scheduled_at)} ({consultation.duration_minutes} min)
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Ionicons name="cash" size={16} color="#1E3A8A" />
                          <Text style={styles.detailText}>{formatAmountWithCurrency(consultation.price)}</Text>
                        </View>
                      </View>

                      <View style={styles.actionButtons}>
                        <Button
                          title="View Details"
                          onPress={() => navigation.navigate('ConsultationDetail' as never, { id: consultation.id } as never)}
                          variant="outline"
                          size="small"
                        />
                        {userRole === 'client' && !consultation.is_paid && consultation.payment_status !== 'paid' && (
                          <Button
                            title="Pay Now"
                            onPress={() => handlePay(consultation.id)}
                            size="small"
                          />
                        )}
                        {userRole === 'client' && (consultation.is_paid || consultation.payment_status === 'paid') && (
                          <View style={styles.paidBadge}>
                            <Text style={styles.paidText}>✓ Paid</Text>
                          </View>
                        )}
                      </View>
                    </CardContent>
                  </TouchableOpacity>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={bookingModalOpen}
        onClose={() => !isBooking && setBookingModalOpen(false)}
        title="Book Consultation"
      >
        {selectedCompany && (
          <View style={styles.modalCompanyInfo}>
            <Text style={styles.modalCompanyName}>{selectedCompany.company_name}</Text>
          </View>
        )}
        
        <View style={styles.modalForm}>
          <Input
            label="Preferred Date"
            value={bookingForm.scheduledDate}
            onChangeText={(text) => setBookingForm({ ...bookingForm, scheduledDate: text })}
            placeholder="YYYY-MM-DD"
          />
          
          <Input
            label="Preferred Time"
            value={bookingForm.scheduledTime}
            onChangeText={(text) => setBookingForm({ ...bookingForm, scheduledTime: text })}
            placeholder="HH:MM"
          />
          
          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>Duration</Text>
            <View style={styles.durationOptions}>
              {[15, 30, 45, 60].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationOption,
                    bookingForm.durationMinutes === duration && styles.durationOptionActive,
                  ]}
                  onPress={() => setBookingForm({ ...bookingForm, durationMinutes: duration })}
                >
                  <Text
                    style={[
                      styles.durationOptionText,
                      bookingForm.durationMinutes === duration && styles.durationOptionTextActive,
                    ]}
                  >
                    {duration} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedCompany && selectedCompany.consultation_fee && selectedCompany.consultation_fee > 0 ? (
            <View style={styles.feeDisplay}>
              <Text style={styles.feeDisplayLabel}>Consultation Fee</Text>
              <Text style={styles.feeDisplayAmount}>
                {formatAmountWithCurrency(selectedCompany.consultation_fee)}
              </Text>
            </View>
          ) : (
            <View style={styles.feeWarningContainer}>
              <Text style={styles.feeWarningText}>
                ⚠️ This company has not set a consultation fee. Please contact them before booking.
              </Text>
            </View>
          )}

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={() => setBookingModalOpen(false)}
              variant="outline"
              disabled={isBooking}
            />
            <Button
              title={isBooking ? 'Processing...' : 'Confirm & Pay'}
              onPress={handleConfirmBooking}
              disabled={isBooking}
              loading={isBooking}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#1E3A8A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  searchCard: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
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
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 24,
  },
  companyCard: {
    marginBottom: 16,
  },
  companyHeader: {
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E40AF',
  },
  specializationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
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
  moreText: {
    fontSize: 12,
    color: '#64748B',
    alignSelf: 'center',
  },
  companyDetails: {
    marginBottom: 16,
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
  },
  bookingSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E7FF',
    paddingTop: 16,
    marginTop: 16,
  },
  feeContainer: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  feeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  feeAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  feeWarning: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 4,
    fontWeight: '500',
  },
  consultationCard: {
    marginBottom: 12,
  },
  consultationHeader: {
    marginBottom: 12,
  },
  consultationInfo: {
    flex: 1,
  },
  consultationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  consultationDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E7FF',
  },
  paidBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  paidText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#065F46',
  },
  modalCompanyInfo: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  modalCompanyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  modalForm: {
    gap: 16,
  },
  durationContainer: {
    marginBottom: 16,
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  durationOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    alignItems: 'center',
  },
  durationOptionActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  durationOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  durationOptionTextActive: {
    color: '#fff',
  },
  feeDisplay: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  feeDisplayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  feeDisplayAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  feeWarningContainer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 16,
  },
  feeWarningText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
