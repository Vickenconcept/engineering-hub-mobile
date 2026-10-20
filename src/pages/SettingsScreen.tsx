import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { StatusBadge } from '../components/StatusBadge';
import { authService } from '../services/auth.service';
import { storage } from '../lib/storage';
import { User } from '../types';
import Toast from 'react-native-toast-message';
import { companyProfileService, CompanyProfile } from '../services/company-profile.service';
import { paymentAccountService, PaymentAccount, CreatePaymentAccountData } from '../services/payment-account.service';

interface SettingsScreenProps {
  userRole?: 'client' | 'company' | 'admin';
  onMenuPress?: () => void;
}

export default function SettingsScreen({ userRole, onMenuPress }: SettingsScreenProps = {}) {
  const [user, setUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'client' | 'company' | 'admin'>('client');

  // Company Profile State
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    registration_number: '',
    portfolio_links: [] as string[],
    specialization: [] as string[],
    consultation_fee: 0,
  });
  const [licenseFiles, setLicenseFiles] = useState<any[]>([]);
  const [newPortfolioLink, setNewPortfolioLink] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');

  // Payment Accounts State
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [banks, setBanks] = useState<Array<{ code: string; name: string }>>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [accountFormData, setAccountFormData] = useState<CreatePaymentAccountData>({
    account_name: '',
    account_number: '',
    bank_code: '',
    bank_name: '',
    is_default: false,
  });

  useEffect(() => {
    loadUser();
    if (currentUserRole === 'company') {
      loadProfile();
    }
    loadPaymentAccounts();
    loadBanks();
  }, [currentUserRole]);

  const loadUser = async () => {
    const userData = await storage.getUser();
    setUser(userData);
    if (userData) {
      setCurrentUserRole(userData.role);
    }
  };

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const fetchedProfile = await companyProfileService.get();
      if (fetchedProfile) {
        setProfile(fetchedProfile);
        setFormData({
          company_name: fetchedProfile.company_name || '',
          registration_number: fetchedProfile.registration_number || '',
          portfolio_links: fetchedProfile.portfolio_links || [],
          specialization: fetchedProfile.specialization || [],
          consultation_fee: fetchedProfile.consultation_fee ?? 0,
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadPaymentAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const accounts = await paymentAccountService.list();
      setPaymentAccounts(accounts);
    } catch (error) {
      console.error('Failed to load payment accounts:', error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const loadBanks = async () => {
    try {
      setIsLoadingBanks(true);
      const bankList = await paymentAccountService.getBanks();
      setBanks(bankList);
    } catch (error) {
      console.error('Failed to load banks:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load banks list',
      });
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const handlePickDocuments = async () => {
    try {
      // Dynamically import DocumentPicker to handle cases where it might not be available
      const DocumentPicker = await import('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const validFiles = result.assets.filter(file => {
          const isValidSize = file.size ? file.size <= 5 * 1024 * 1024 : true; // 5MB
          if (!isValidSize) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: `${file.name} exceeds 5MB limit.`,
            });
            return false;
          }
          return true;
        });

        setLicenseFiles(prev => [...prev, ...validFiles]);
      }
    } catch (error) {
      console.error('Error picking documents:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick documents. Please make sure expo-document-picker is installed.',
      });
    }
  };

  const removeFile = (index: number) => {
    setLicenseFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addPortfolioLink = () => {
    if (newPortfolioLink.trim() && isValidUrl(newPortfolioLink)) {
      setFormData(prev => ({
        ...prev,
        portfolio_links: [...prev.portfolio_links, newPortfolioLink.trim()],
      }));
      setNewPortfolioLink('');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid URL',
      });
    }
  };

  const removePortfolioLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolio_links: prev.portfolio_links.filter((_, i) => i !== index),
    }));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      setFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, newSpecialization.trim()],
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter((_, i) => i !== index),
    }));
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);

    try {
      const profileData: any = {};
      const isApproved = profile?.is_approved || profile?.status === 'approved';

      if (!isApproved) {
        if (!formData.company_name || !formData.registration_number) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Company name and registration number are required',
          });
          setIsSavingProfile(false);
          return;
        }
        profileData.company_name = formData.company_name;
        profileData.registration_number = formData.registration_number;
        if (formData.portfolio_links.length > 0) {
          profileData.portfolio_links = formData.portfolio_links;
        }
        if (formData.specialization.length > 0) {
          profileData.specialization = formData.specialization;
        }
        if (licenseFiles.length > 0) {
          profileData.license_documents = licenseFiles;
        }
      }

      if (formData.consultation_fee !== undefined && formData.consultation_fee !== null) {
        const feeValue = typeof formData.consultation_fee === 'string'
          ? (formData.consultation_fee === '' ? null : parseFloat(formData.consultation_fee))
          : formData.consultation_fee;

        if (feeValue !== null && !isNaN(feeValue)) {
          profileData.consultation_fee = feeValue;
        }
      }

      if (Object.keys(profileData).length === 0) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No changes to save',
        });
        setIsSavingProfile(false);
        return;
      }

      if (profile) {
        await companyProfileService.update(profileData);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Company profile updated successfully!',
        });
      } else {
        await companyProfileService.create(profileData);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Company profile created successfully! Awaiting admin approval.',
        });
      }

      await loadProfile();
      setLicenseFiles([]);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!accountFormData.account_number || !accountFormData.bank_code) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter account number and select a bank',
      });
      return;
    }

    try {
      setIsVerifyingAccount(true);
      const verified = await paymentAccountService.verifyAccount(
        accountFormData.account_number,
        accountFormData.bank_code
      );

      setAccountFormData(prev => ({
        ...prev,
        account_name: verified.account_name,
      }));

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Account verified successfully!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to verify account. Please check the account number and bank.',
      });
    } finally {
      setIsVerifyingAccount(false);
    }
  };

  const handleAddAccount = async () => {
    try {
      await paymentAccountService.create(accountFormData);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Payment account added successfully',
      });
      setShowAccountForm(false);
      setAccountFormData({
        account_name: '',
        account_number: '',
        bank_code: '',
        bank_name: '',
        is_default: false,
      });
      loadPaymentAccounts();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to add payment account',
      });
    }
  };

  const handleDeleteAccount = (id: string) => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete this payment account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentAccountService.delete(id);
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Payment account deleted successfully',
              });
              loadPaymentAccounts();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to delete payment account',
              });
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (id: string) => {
    try {
      await paymentAccountService.setDefault(id);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Default account updated',
      });
      loadPaymentAccounts();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to set default account',
      });
    }
  };

  const handleAppealSuspension = async () => {
    try {
      await companyProfileService.appealSuspension();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Appeal submitted successfully. Our support team will review your request and contact you soon.',
      });
      loadProfile();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to submit appeal',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      // Show success message - logout always succeeds (clears local storage even if API fails)
      Toast.show({
        type: 'success',
        text1: 'Logged out',
        text2: 'You have been logged out successfully',
      });
    } catch (error) {
      // Logout should always succeed (clears local storage)
      // Only log unexpected errors
      if (__DEV__) {
        console.error('Unexpected logout error:', error);
      }
      // Still show success since local auth is cleared
      Toast.show({
        type: 'success',
        text1: 'Logged out',
        text2: 'You have been logged out successfully',
      });
    }
  };

  const effectiveUserRole = userRole || currentUserRole;
  const effectiveOnMenuPress = onMenuPress || (() => {});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'rejected':
        return 'red';
      case 'suspended':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.content}>
        {/* Account Information */}
        {user && (
          <Card>
            <CardContent>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={24} color="#1E3A8A" />
                <Text style={styles.sectionTitle}>Account Information</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{user.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{user.email}</Text>
              </View>
              {user.phone && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Phone:</Text>
                  <Text style={styles.value}>{user.phone}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.label}>Role:</Text>
                <Text style={styles.value}>{user.role}</Text>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Company Profile Section */}
        {effectiveUserRole === 'company' && (
          <>
            {isLoadingProfile ? (
              <Card>
                <CardContent>
                  <ActivityIndicator size="large" color="#1E3A8A" />
                  <Text style={styles.loadingText}>Loading profile...</Text>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Status Banner */}
                {profile && (
                  <>
                    {profile.status === 'suspended' && (
                      <Card style={styles.suspensionCard}>
                        <CardContent>
                          <View style={styles.suspensionHeader}>
                            <Ionicons name="alert-circle" size={24} color="#DC2626" />
                            <Text style={styles.suspensionTitle}>Account Suspended</Text>
                          </View>
                          {profile.suspension_reason && (
                            <View style={styles.suspensionReason}>
                              <Text style={styles.suspensionReasonLabel}>Suspension Reason:</Text>
                              <Text style={styles.suspensionReasonText}>{profile.suspension_reason}</Text>
                            </View>
                          )}
                          <Text style={styles.suspensionText}>
                            Your company account has been suspended. You cannot receive new consultations or projects until the suspension is lifted.
                          </Text>
                          <Button
                            title="Contact Support / Appeal Suspension"
                            onPress={handleAppealSuspension}
                            variant="outline"
                            style={styles.appealButton}
                          />
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardContent>
                        <View style={styles.statusContainer}>
                          <View style={styles.statusIcon}>
                            {profile.is_approved ? (
                              <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                            ) : profile.status === 'suspended' ? (
                              <Ionicons name="alert-circle" size={24} color="#DC2626" />
                            ) : (
                              <Ionicons name="time" size={24} color="#F59E0B" />
                            )}
                          </View>
                          <View style={styles.statusInfo}>
                            <Text style={styles.statusLabel}>
                              Status: <StatusBadge status={profile.status} />
                            </Text>
                            <Text style={styles.statusDescription}>
                              {profile.is_approved
                                ? 'Your profile is verified and active'
                                : profile.status === 'suspended'
                                ? 'Your account has been suspended'
                                : profile.is_verified
                                ? 'Your profile is verified and awaiting approval'
                                : 'Your profile is pending admin review'}
                            </Text>
                          </View>
                        </View>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Company Profile Form */}
                <Card>
                  <CardContent>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="business" size={24} color="#1E3A8A" />
                      <Text style={styles.sectionTitle}>Company Information</Text>
                    </View>

                    <Input
                      label="Company Name *"
                      value={formData.company_name}
                      onChangeText={(text) => setFormData({ ...formData, company_name: text })}
                      placeholder="Enter company name"
                      editable={!profile?.is_approved}
                    />

                    <Input
                      label="Registration Number *"
                      value={formData.registration_number}
                      onChangeText={(text) => setFormData({ ...formData, registration_number: text })}
                      placeholder="Enter registration number (e.g., RC123456)"
                      editable={!profile?.is_approved}
                    />

                    <Input
                      label="Consultation Fee (NGN)"
                      value={formData.consultation_fee === 0 ? '' : formData.consultation_fee.toString()}
                      onChangeText={(text) => {
                        const numValue = text === '' ? 0 : (parseFloat(text) || 0);
                        setFormData({ ...formData, consultation_fee: numValue });
                      }}
                      placeholder="e.g., 25000"
                      keyboardType="numeric"
                    />

                    {/* License Documents */}
                    <View style={styles.fileUploadSection}>
                      <Text style={styles.label}>License Documents</Text>
                      <TouchableOpacity
                        style={[
                          styles.fileUploadButton,
                          (profile?.is_approved || profile?.status === 'suspended') && styles.disabledButton,
                        ]}
                        onPress={handlePickDocuments}
                        disabled={profile?.is_approved || profile?.status === 'suspended'}
                      >
                        <Ionicons name="document-attach" size={20} color="#1E3A8A" />
                        <Text style={styles.fileUploadText}>Choose Files (PDF, JPG, PNG - Max 5MB)</Text>
                      </TouchableOpacity>

                      {licenseFiles.length > 0 && (
                        <View style={styles.filesList}>
                          {licenseFiles.map((file, index) => (
                            <View key={index} style={styles.fileItem}>
                              <Text style={styles.fileName} numberOfLines={1}>
                                {file.name}
                              </Text>
                              <TouchableOpacity onPress={() => removeFile(index)}>
                                <Ionicons name="close-circle" size={20} color="#DC2626" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}

                      {profile?.license_documents && profile.license_documents.length > 0 && (
                        <View style={styles.existingFiles}>
                          <Text style={styles.existingFilesLabel}>Current Documents:</Text>
                          {profile.license_documents.map((doc, index) => (
                            <View key={index} style={styles.fileItem}>
                              <Text style={styles.fileName} numberOfLines={1}>
                                {doc}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Portfolio Links */}
                    <View style={styles.arraySection}>
                      <Text style={styles.label}>Portfolio Links</Text>
                      <View style={styles.arrayInputRow}>
                        <Input
                          value={newPortfolioLink}
                          onChangeText={setNewPortfolioLink}
                          placeholder="https://example.com/portfolio"
                          editable={!profile?.is_approved}
                          containerStyle={styles.arrayInput}
                        />
                        <TouchableOpacity
                          style={[styles.addButton, profile?.is_approved && styles.disabledButton]}
                          onPress={addPortfolioLink}
                          disabled={profile?.is_approved}
                        >
                          <Ionicons name="add" size={24} color="#1E3A8A" />
                        </TouchableOpacity>
                      </View>
                      {formData.portfolio_links.length > 0 && (
                        <View style={styles.arrayItems}>
                          {formData.portfolio_links.map((link, index) => (
                            <View key={index} style={styles.arrayItem}>
                              <Text style={styles.arrayItemText} numberOfLines={1}>
                                {link}
                              </Text>
                              <TouchableOpacity
                                onPress={() => removePortfolioLink(index)}
                                disabled={profile?.is_approved}
                              >
                                <Ionicons name="close-circle" size={20} color="#DC2626" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Specialization */}
                    <View style={styles.arraySection}>
                      <Text style={styles.label}>Specialization</Text>
                      <View style={styles.arrayInputRow}>
                        <Input
                          value={newSpecialization}
                          onChangeText={setNewSpecialization}
                          placeholder="e.g., Residential, Commercial"
                          editable={!profile?.is_approved}
                          containerStyle={styles.arrayInput}
                        />
                        <TouchableOpacity
                          style={[styles.addButton, profile?.is_approved && styles.disabledButton]}
                          onPress={addSpecialization}
                          disabled={profile?.is_approved}
                        >
                          <Ionicons name="add" size={24} color="#1E3A8A" />
                        </TouchableOpacity>
                      </View>
                      {formData.specialization.length > 0 && (
                        <View style={styles.specializationTags}>
                          {formData.specialization.map((spec, index) => (
                            <View key={index} style={styles.specializationTag}>
                              <Text style={styles.specializationTagText}>{spec}</Text>
                              <TouchableOpacity
                                onPress={() => removeSpecialization(index)}
                                disabled={profile?.is_approved}
                              >
                                <Ionicons name="close" size={16} color="#1E40AF" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Submit Button */}
                    {profile?.is_approved ? (
                      <View style={styles.approvedMessage}>
                        <Text style={styles.approvedText}>
                          Your profile has been approved. Contact admin to make changes.
                        </Text>
                      </View>
                    ) : (
                      <Button
                        title={isSavingProfile ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
                        onPress={handleSaveProfile}
                        disabled={isSavingProfile}
                        loading={isSavingProfile}
                        style={styles.saveButton}
                      />
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {/* Payment Accounts Section */}
        <Card>
          <CardContent>
            <View style={styles.sectionHeader}>
              <Ionicons name="card" size={24} color="#1E3A8A" />
              <Text style={styles.sectionTitle}>Payment Accounts</Text>
              {!showAccountForm && (
                <TouchableOpacity
                  style={styles.addAccountButton}
                  onPress={() => setShowAccountForm(true)}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addAccountButtonText}>Add Account</Text>
                </TouchableOpacity>
              )}
            </View>

            {showAccountForm && (
              <View style={styles.accountForm}>
                <Text style={styles.formTitle}>Add Payment Account</Text>

                {/* Bank Selection */}
                <View style={styles.selectContainer}>
                  <Text style={styles.label}>Bank *</Text>
                  <TouchableOpacity
                    style={styles.bankSelector}
                    onPress={() => setShowBankModal(true)}
                  >
                    <Text style={[
                      styles.bankSelectorText,
                      !accountFormData.bank_name && styles.bankSelectorPlaceholder
                    ]}>
                      {accountFormData.bank_name || 'Select a bank'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Bank Selection Modal */}
                <Modal
                  visible={showBankModal}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowBankModal(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Bank</Text>
                        <TouchableOpacity
                          onPress={() => setShowBankModal(false)}
                          style={styles.modalCloseButton}
                        >
                          <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                      </View>

                      {/* Search Bar */}
                      <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
                        <TextInput
                          style={styles.searchInput}
                          placeholder="Search banks..."
                          placeholderTextColor="#94A3B8"
                          value={bankSearchQuery}
                          onChangeText={setBankSearchQuery}
                        />
                        {bankSearchQuery.length > 0 && (
                          <TouchableOpacity
                            onPress={() => setBankSearchQuery('')}
                            style={styles.searchClearButton}
                          >
                            <Ionicons name="close-circle" size={20} color="#64748B" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Bank List */}
                      <ScrollView style={styles.modalBankList} nestedScrollEnabled>
                        {isLoadingBanks ? (
                          <View style={styles.modalLoading}>
                            <ActivityIndicator size="small" color="#1E3A8A" />
                            <Text style={styles.modalLoadingText}>Loading banks...</Text>
                          </View>
                        ) : (
                          (() => {
                            const filteredBanks = banks.filter(bank =>
                              bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
                            );
                            
                            if (filteredBanks.length === 0) {
                              return (
                                <View style={styles.modalEmpty}>
                                  <Ionicons name="search-outline" size={48} color="#94A3B8" />
                                  <Text style={styles.modalEmptyText}>No banks found</Text>
                                  <Text style={styles.modalEmptySubtext}>Try a different search term</Text>
                                </View>
                              );
                            }

                            return filteredBanks.map((bank, index) => (
                              <TouchableOpacity
                                key={`${bank.code}-${index}-${bank.name}`}
                                style={[
                                  styles.modalBankOption,
                                  accountFormData.bank_code === bank.code && styles.modalBankOptionSelected,
                                ]}
                                onPress={() => {
                                  setAccountFormData(prev => ({
                                    ...prev,
                                    bank_code: bank.code,
                                    bank_name: bank.name,
                                  }));
                                  setShowBankModal(false);
                                  setBankSearchQuery('');
                                }}
                              >
                                <Text
                                  style={[
                                    styles.modalBankOptionText,
                                    accountFormData.bank_code === bank.code && styles.modalBankOptionTextSelected,
                                  ]}
                                >
                                  {bank.name}
                                </Text>
                                {accountFormData.bank_code === bank.code && (
                                  <Ionicons name="checkmark" size={20} color="#1E3A8A" />
                                )}
                              </TouchableOpacity>
                            ));
                          })()
                        )}
                      </ScrollView>
                    </View>
                  </View>
                </Modal>

                {/* Account Number */}
                <View style={styles.verifyRow}>
                  <Input
                    label="Account Number *"
                    value={accountFormData.account_number}
                    onChangeText={(text) => setAccountFormData(prev => ({ ...prev, account_number: text }))}
                    placeholder="0123456789"
                    keyboardType="numeric"
                    containerStyle={styles.verifyInput}
                  />
                  <Button
                    title={isVerifyingAccount ? 'Verifying...' : 'Verify'}
                    onPress={handleVerifyAccount}
                    disabled={!accountFormData.account_number || !accountFormData.bank_code || isVerifyingAccount}
                    loading={isVerifyingAccount}
                    variant="secondary"
                    size="small"
                    style={styles.verifyButton}
                  />
                </View>

                <Input
                  label="Account Name"
                  value={accountFormData.account_name}
                  onChangeText={(text) => setAccountFormData(prev => ({ ...prev, account_name: text }))}
                  placeholder="Will be auto-filled after verification"
                  editable={!!accountFormData.account_name}
                />

                <View style={styles.checkboxRow}>
                  <Switch
                    value={accountFormData.is_default}
                    onValueChange={(value) => setAccountFormData(prev => ({ ...prev, is_default: value }))}
                    trackColor={{ false: '#E5E7EB', true: '#1E3A8A' }}
                    thumbColor="#fff"
                  />
                  <Text style={styles.checkboxLabel}>Set as default account</Text>
                </View>

                <View style={styles.formButtons}>
                  <Button
                    title="Add Account"
                    onPress={handleAddAccount}
                    disabled={!accountFormData.account_name}
                    style={styles.formButton}
                  />
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setShowAccountForm(false);
                      setAccountFormData({
                        account_name: '',
                        account_number: '',
                        bank_code: '',
                        bank_name: '',
                        is_default: false,
                      });
                    }}
                    variant="outline"
                    style={styles.formButton}
                  />
                </View>
              </View>
            )}

            {isLoadingAccounts ? (
              <ActivityIndicator size="large" color="#1E3A8A" />
            ) : paymentAccounts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={48} color="#64748B" />
                <Text style={styles.emptyStateText}>No payment accounts added yet</Text>
                <Text style={styles.emptyStateSubtext}>Add a payment account to receive payments</Text>
                {!showAccountForm && (
                  <Button
                    title="Add Your First Account"
                    onPress={() => setShowAccountForm(true)}
                    variant="secondary"
                    style={styles.emptyStateButton}
                  />
                )}
              </View>
            ) : (
              <View style={styles.accountsList}>
                {paymentAccounts.map((account) => (
                  <View
                    key={account.id}
                    style={[
                      styles.accountItem,
                      account.is_default && styles.accountItemDefault,
                    ]}
                  >
                    <View style={styles.accountInfo}>
                      <View style={styles.accountHeader}>
                        <Text style={styles.accountName}>{account.account_name}</Text>
                        {account.is_default && (
                          <View style={styles.defaultBadge}>
                            <Ionicons name="star" size={12} color="#fff" />
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                        {account.is_verified && (
                          <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedBadgeText}>Verified</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.accountDetails}>
                        {account.account_number} • {account.bank_name || `Bank Code: ${account.bank_code}`}
                      </Text>
                    </View>
                    <View style={styles.accountActions}>
                      {!account.is_default && (
                        <TouchableOpacity
                          style={styles.accountActionButton}
                          onPress={() => handleSetDefault(account.id)}
                        >
                          <Text style={styles.accountActionText}>Set Default</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteAccount(account.id)}
                      >
                        <Ionicons name="trash" size={20} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Card>
          <CardContent>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#DC2626" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#64748B',
  },
  suspensionCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  suspensionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  suspensionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
  },
  suspensionReason: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  suspensionReasonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#DC2626',
    marginBottom: 4,
  },
  suspensionReasonText: {
    fontSize: 14,
    color: '#DC2626',
  },
  suspensionText: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 12,
  },
  appealButton: {
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  fileUploadSection: {
    marginBottom: 16,
  },
  fileUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E7FF',
    borderStyle: 'dashed',
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  fileUploadText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  filesList: {
    marginTop: 12,
    gap: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    marginRight: 8,
  },
  existingFiles: {
    marginTop: 12,
  },
  existingFilesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  arraySection: {
    marginBottom: 16,
  },
  arrayInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
  },
  arrayInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderRadius: 8,
    marginTop: 8,
  },
  arrayItems: {
    marginTop: 12,
    gap: 8,
  },
  arrayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  arrayItemText: {
    flex: 1,
    fontSize: 14,
    color: '#1E3A8A',
    marginRight: 8,
  },
  specializationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  specializationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    gap: 6,
  },
  specializationTagText: {
    fontSize: 14,
    color: '#1E40AF',
  },
  approvedMessage: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 16,
  },
  approvedText: {
    fontSize: 14,
    color: '#92400E',
  },
  saveButton: {
    marginTop: 16,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addAccountButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  accountForm: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 16,
  },
  selectContainer: {
    marginBottom: 16,
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  bankSelectorText: {
    fontSize: 16,
    color: '#1E3A8A',
    flex: 1,
  },
  bankSelectorPlaceholder: {
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  modalCloseButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E3A8A',
    padding: 0,
  },
  searchClearButton: {
    padding: 4,
    marginLeft: 8,
  },
  modalBankList: {
    maxHeight: 400,
  },
  modalLoading: {
    padding: 32,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
  },
  modalEmpty: {
    padding: 32,
    alignItems: 'center',
  },
  modalEmptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  modalEmptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },
  modalBankOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalBankOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  modalBankOptionText: {
    fontSize: 16,
    color: '#334155',
    flex: 1,
  },
  modalBankOptionTextSelected: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  verifyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  verifyInput: {
    flex: 1,
    marginBottom: 0,
  },
  verifyButton: {
    marginTop: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  formButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  emptyStateButton: {
    marginTop: 8,
  },
  accountsList: {
    gap: 12,
  },
  accountItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  accountItemDefault: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EFF6FF',
  },
  accountInfo: {
    flex: 1,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedBadgeText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '600',
  },
  accountDetails: {
    fontSize: 14,
    color: '#64748B',
  },
  accountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  accountActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1E3A8A',
    borderRadius: 6,
  },
  accountActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
});
