import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { projectService, Project } from '../services/project.service';
import { milestoneService } from '../services/milestone.service';
import { Milestone } from '../types';
import { parseFormattedAmount } from '../utils/currency';
import { storage } from '../lib/storage';
import Toast from 'react-native-toast-message';
import { Linking } from 'react-native';
import { OverviewTab } from '../components/project/OverviewTab';
import { MilestonesTab } from '../components/project/MilestonesTab';
import { EscrowTab } from '../components/project/EscrowTab';
import { VerifyMilestoneModal } from '../components/project/VerifyMilestoneModal';
import { NotesModal } from '../components/project/NotesModal';
import { CreateMilestonesModal } from '../components/project/CreateMilestonesModal';
import { ProjectHeader } from '../components/project/ProjectHeader';
import { ProjectProgressBar } from '../components/project/ProjectProgressBar';
import { ProjectTabs } from '../components/project/ProjectTabs';
import { calculateProjectProgress } from '../utils/projectUtils';
import { useMilestoneForms } from '../hooks/useMilestoneForms';

interface ProjectDetailScreenProps {
  userRole?: 'client' | 'company' | 'admin';
  onMenuPress?: () => void;
}

type TabType = 'overview' | 'milestones' | 'escrow';

export default function ProjectDetailScreen({ userRole, onMenuPress }: ProjectDetailScreenProps = {}) {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<'client' | 'company' | 'admin'>('client');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [createMilestonesModalOpen, setCreateMilestonesModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [milestoneNotes, setMilestoneNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    milestoneForms,
    addMilestoneForm,
    removeMilestoneForm,
    updateMilestoneForm,
    resetMilestoneForms,
    validateMilestones,
  } = useMilestoneForms();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id, currentUserRole, userRole]);

  const loadUser = async () => {
    const user = await storage.getUser();
    if (user) {
      setCurrentUserRole(user.role);
    }
  };

  const loadProject = async () => {
    try {
      setIsLoading(true);
      
      const token = await storage.getToken();
      if (!token) {
        console.warn('No token available, skipping project load');
        setIsLoading(false);
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const effectiveRole = userRole || currentUserRole;
      let data: Project;
      if (effectiveRole === 'admin') {
        data = await projectService.getShared(id);
      } else if (effectiveRole === 'company') {
        data = await projectService.getForCompany(id);
      } else {
        data = await projectService.get(id);
      }
      setProject(data);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Auth error loading project:', error.response?.status);
      } else {
        console.error('Failed to load project:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response?.data?.message || 'Failed to load project details',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleFundMilestone = async (milestoneId: string) => {
    try {
      const payment = await milestoneService.fundEscrow(milestoneId);
      if (await Linking.canOpenURL(payment.payment_url)) {
        await Linking.openURL(payment.payment_url);
      }
    } catch (error: any) {
      console.error('Failed to fund milestone:', error);
    }
  };

  const handleVerifyMilestone = async () => {
    if (!selectedMilestone) return;
    
    setIsProcessing(true);
    try {
      await milestoneService.verify(selectedMilestone.id, verificationNotes || undefined);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Milestone verified successfully!',
      });
      setVerifyModalOpen(false);
      setVerificationNotes('');
      setSelectedMilestone(null);
      await loadProject();
    } catch (error: any) {
      console.error('Failed to verify milestone:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to verify milestone',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedMilestone) return;
    
    setIsProcessing(true);
    try {
      const effectiveRole = userRole || currentUserRole;
      if (effectiveRole === 'client') {
        await milestoneService.updateClientNotes(selectedMilestone.id, milestoneNotes);
      } else if (effectiveRole === 'company') {
        await milestoneService.updateCompanyNotes(selectedMilestone.id, milestoneNotes);
      }
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Notes updated successfully!',
      });
      setNotesModalOpen(false);
      setMilestoneNotes('');
      setSelectedMilestone(null);
      await loadProject();
    } catch (error: any) {
      console.error('Failed to update notes:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to update notes',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteProject = async () => {
    if (!project) return;
    
    setIsProcessing(true);
    try {
      const effectiveRole = userRole || currentUserRole;
      if (effectiveRole === 'client') {
        await projectService.complete(project.id);
      } else if (effectiveRole === 'company') {
        await projectService.completeForCompany(project.id);
      }
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Project marked as completed!',
      });
      await loadProject();
    } catch (error: any) {
      console.error('Failed to complete project:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to mark project as completed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openVerifyModal = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setVerificationNotes(milestone.client_notes || '');
    setVerifyModalOpen(true);
  };

  const openNotesModal = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    const effectiveRole = userRole || currentUserRole;
    if (effectiveRole === 'client') {
      setMilestoneNotes(milestone.client_notes || '');
    } else if (effectiveRole === 'company') {
      setMilestoneNotes(milestone.company_notes || '');
    }
    setNotesModalOpen(true);
  };

  const handleCreateMilestones = async () => {
    if (!project) return;
    
    if (!validateMilestones()) {
      return;
    }
    
    setIsProcessing(true);
    try {
      const milestonesData = milestoneForms.map(m => ({
        title: m.title.trim(),
        description: m.description.trim() || undefined,
        amount: parseFloat(m.amount),
        sequence_order: m.sequence_order,
      }));
      
      await projectService.createMilestones(project.id, milestonesData);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Milestones created successfully! The project will become active once the client verifies all milestones.',
      });
      setCreateMilestonesModalOpen(false);
      resetMilestoneForms();
      await loadProject();
    } catch (error: any) {
      console.error('Failed to create milestones:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to create milestones',
      });
    } finally {
      setIsProcessing(false);
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

  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Project not found</Text>
      </View>
    );
  }

  const progress = calculateProjectProgress(project);
  const milestones = project.milestones || [];

  // Calculate escrow totals
  const escrowTotals = {
    funded: milestones.reduce((total, m) => {
      if (m.escrow && (m.escrow.status === 'held' || m.escrow.status === 'released')) {
        return total + parseFormattedAmount(m.escrow.amount);
      }
      return total;
    }, 0),
    released: milestones.reduce((total, m) => {
      if (m.escrow && m.escrow.status === 'released') {
        return total + parseFormattedAmount(m.escrow.amount);
      }
      return total;
    }, 0),
  };

  const safeFunded = typeof escrowTotals.funded === 'number' && !isNaN(escrowTotals.funded) ? escrowTotals.funded : 0;
  const safeReleased = typeof escrowTotals.released === 'number' && !isNaN(escrowTotals.released) ? escrowTotals.released : 0;
  const safeRemaining = safeFunded - safeReleased;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <ProjectHeader
          project={project}
          milestones={milestones}
          userRole={effectiveUserRole}
          isProcessing={isProcessing}
          onComplete={handleCompleteProject}
        />

        <ProjectProgressBar progress={progress} />

        <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab project={project} />
        )}

        {activeTab === 'milestones' && (
          <MilestonesTab
            project={project}
            userRole={effectiveUserRole}
            onVerify={openVerifyModal}
            onFund={handleFundMilestone}
            onNotes={openNotesModal}
            onCreateMilestones={() => setCreateMilestonesModalOpen(true)}
          />
        )}

        {activeTab === 'escrow' && (
          <EscrowTab
            funded={safeFunded}
            released={safeReleased}
            remaining={safeRemaining}
          />
        )}
      </View>

      {/* Modals */}
      <VerifyMilestoneModal
        visible={verifyModalOpen}
        milestone={selectedMilestone}
        notes={verificationNotes}
        isProcessing={isProcessing}
        onClose={() => {
          setVerifyModalOpen(false);
          setSelectedMilestone(null);
          setVerificationNotes('');
        }}
        onNotesChange={setVerificationNotes}
        onVerify={handleVerifyMilestone}
      />
      
      <NotesModal
        visible={notesModalOpen}
        milestone={selectedMilestone}
        notes={milestoneNotes}
        userRole={effectiveUserRole}
        isProcessing={isProcessing}
        onClose={() => {
          setNotesModalOpen(false);
          setSelectedMilestone(null);
          setMilestoneNotes('');
        }}
        onNotesChange={setMilestoneNotes}
        onSave={handleUpdateNotes}
      />

      <CreateMilestonesModal
        visible={createMilestonesModalOpen}
        projectTitle={project.title}
        milestoneForms={milestoneForms}
        isProcessing={isProcessing}
        onClose={() => {
          if (!isProcessing) {
            setCreateMilestonesModalOpen(false);
            resetMilestoneForms();
          }
        }}
        onAddMilestone={addMilestoneForm}
        onRemoveMilestone={removeMilestoneForm}
        onUpdateMilestone={updateMilestoneForm}
        onSubmit={handleCreateMilestones}
      />
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
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 24,
  },
});
