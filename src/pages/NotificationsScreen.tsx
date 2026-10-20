import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card, CardContent } from '../components/Card';
import notificationService, { Notification } from '../services/notification.service';
import Toast from 'react-native-toast-message';

interface NotificationsScreenProps {
  userRole: 'client' | 'company' | 'admin';
  onMenuPress: () => void;
}

export default function NotificationsScreen({ userRole, onMenuPress }: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications({ per_page: 50 });
      setNotifications(data.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load notifications',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
        <View style={styles.content}>

        {notifications.length === 0 ? (
          <Card>
            <CardContent>
              <Text style={styles.emptyText}>No notifications</Text>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => !notification.read_at && handleMarkAsRead(notification.id)}
            >
              <Card
                style={[
                  styles.notificationCard,
                  !notification.read_at && styles.unreadNotification,
                ]}
              >
                <CardContent>
                  <Text style={styles.notificationTitle}>
                    {notification.data.title}
                  </Text>
                  <Text style={styles.notificationMessage}>
                    {notification.data.message}
                  </Text>
                  <Text style={styles.notificationDate}>
                    {new Date(notification.created_at).toLocaleString()}
                  </Text>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))
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
  notificationCard: {
    marginBottom: 12,
  },
  unreadNotification: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#1E3A8A',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
