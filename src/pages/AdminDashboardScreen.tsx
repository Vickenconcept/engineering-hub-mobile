import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Card, CardContent } from '../components/Card';
import { storage } from '../lib/storage';

interface AdminDashboardScreenProps {
  userRole?: 'client' | 'company' | 'admin';
  onMenuPress?: () => void;
}

export default function AdminDashboardScreen({ userRole, onMenuPress }: AdminDashboardScreenProps = {}) {
  const [currentUserRole, setCurrentUserRole] = useState<'client' | 'company' | 'admin'>('admin');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await storage.getUser();
    if (user) {
      setCurrentUserRole(user.role);
    }
  };

  const effectiveUserRole = userRole || currentUserRole;
  const effectiveOnMenuPress = onMenuPress || (() => {});

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
        <Card>
          <CardContent>
            <Text style={styles.infoText}>Admin features coming soon...</Text>
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
  infoText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
