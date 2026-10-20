import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/auth.service';
import { storage } from '../lib/storage';
import Toast from 'react-native-toast-message';

interface NavItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  adminOnly?: boolean;
}

interface CustomDrawerContentProps {
  userRole: 'client' | 'company' | 'admin';
  onClose: () => void;
}

export default function CustomDrawerContent({ userRole, onClose }: CustomDrawerContentProps) {
  const navigation = useNavigation();
  const [userName, setUserName] = React.useState('User');

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await storage.getUser();
    if (user) {
      setUserName(user.name);
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
      // Navigation will be handled by AppNavigator
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

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'home', route: 'MainTabs' },
    { label: 'Consultations', icon: 'calendar', route: 'MainTabs' },
    { label: 'Projects', icon: 'folder', route: 'MainTabs' },
    { label: 'Transactions', icon: 'receipt', route: 'MainTabs' },
    { label: 'Notifications', icon: 'notifications', route: 'MainTabs' },
    { label: 'Settings', icon: 'settings', route: 'Settings' },
  ];

  if (userRole === 'admin') {
    navItems.push(
      { label: 'Admin Dashboard', icon: 'shield', route: 'AdminDashboard', adminOnly: true },
      { label: 'Users', icon: 'people', route: 'MainTabs', adminOnly: true },
      { label: 'Companies', icon: 'business', route: 'MainTabs', adminOnly: true }
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="home" size={32} color="#1E3A8A" />
        </View>
        <Text style={styles.appName}>BuildTrust</Text>
      </View>

      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userRole}>{userRole}</Text>
        </View>
      </View>

      <View style={styles.navSection}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.navItem}
            onPress={() => {
              onClose();
              
              setTimeout(() => {
                try {
                  const nav = navigation as any;
                  
                  if (item.route === 'MainTabs') {
                    const tabScreen = item.label === 'Dashboard' ? 'Dashboard' :
                                    item.label === 'Consultations' ? 'Consultations' :
                                    item.label === 'Projects' ? 'Projects' :
                                    item.label === 'Transactions' ? 'Transactions' :
                                    'Notifications';
                    
                    // Get parent navigator (MainStack) and navigate to MainTabs with specific tab
                    const parentNav = nav.getParent();
                    if (parentNav) {
                      parentNav.navigate('MainTabs', {
                        screen: tabScreen,
                      });
                    } else {
                      // Fallback: navigate through root
                      nav.dispatch(
                        CommonActions.navigate({
                          name: 'Main',
                          params: {
                            screen: 'MainTabs',
                            params: {
                              screen: tabScreen,
                            },
                          },
                        })
                      );
                    }
                  } else {
                    // Navigate to stack screens (Settings, AdminDashboard, etc.)
                    const parentNav = nav.getParent();
                    if (parentNav) {
                      parentNav.navigate(item.route);
                    } else {
                      // Fallback: navigate through root
                      nav.dispatch(
                        CommonActions.navigate({
                          name: 'Main',
                          params: {
                            screen: item.route,
                          },
                        })
                      );
                    }
                  }
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }, 100);
            }}
          >
            <Ionicons name={item.icon} size={24} color="#64748B" />
            <Text style={styles.navItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#DC2626" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  userSection: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  userRole: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'capitalize',
  },
  navSection: {
    flex: 1,
    paddingTop: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  navItemText: {
    fontSize: 16,
    color: '#64748B',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E7FF',
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '500',
  },
});
