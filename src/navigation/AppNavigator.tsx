import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { authService } from '../services/auth.service';
import { storage } from '../lib/storage';
import { User } from '../types';
import { DrawerProvider, useDrawer } from '../contexts/DrawerContext';
import { useAuthReady } from '../hooks/useAuthReady';

// Auth Screens
import LoginScreen from '../pages/LoginScreen';
import RegisterScreen from '../pages/RegisterScreen';

// Main Screens
import DashboardScreen from '../pages/DashboardScreen';
import ConsultationsScreen from '../pages/ConsultationsScreen';
import ConsultationDetailScreen from '../pages/ConsultationDetailScreen';
import ProjectsScreen from '../pages/ProjectsScreen';
import ProjectDetailScreen from '../pages/ProjectDetailScreen';
import TransactionsScreen from '../pages/TransactionsScreen';
import NotificationsScreen from '../pages/NotificationsScreen';
import SettingsScreen from '../pages/SettingsScreen';
import AdminDashboardScreen from '../pages/AdminDashboardScreen';

// Components
import { Header } from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Layout wrapper that includes header for all screens
function ScreenWithHeader({ 
  children, 
  title, 
  userRole 
}: { 
  children: React.ReactNode; 
  title: string; 
  userRole: 'client' | 'company' | 'admin';
}) {
  const { openDrawer } = useDrawer();
  
  return (
    <View style={{ flex: 1 }}>
      <Header title={title} onMenuPress={openDrawer} userRole={userRole} />
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  );
}

// Create individual tab screen components - each is a separate stable component
function DashboardTabScreen() {
  const { openDrawer } = useDrawer();
  const [userRole, setUserRole] = useState<'client' | 'company' | 'admin'>('client');
  const isAuthReady = useAuthReady();

  React.useEffect(() => {
    const loadUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = await storage.getUser();
      if (user) {
        setUserRole(user.role);
      }
    };
    loadUser();
  }, []);

  if (!isAuthReady) {
    return (
      <ScreenWithHeader title="Dashboard" userRole={userRole}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      </ScreenWithHeader>
    );
  }

  return (
    <ScreenWithHeader title="Dashboard" userRole={userRole}>
      <DashboardScreen userRole={userRole} onMenuPress={openDrawer} />
    </ScreenWithHeader>
  );
}

function ConsultationsTabScreen() {
  const { openDrawer } = useDrawer();
  const [userRole, setUserRole] = useState<'client' | 'company' | 'admin'>('client');
  const isAuthReady = useAuthReady();

  React.useEffect(() => {
    const loadUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = await storage.getUser();
      if (user) {
        setUserRole(user.role);
      }
    };
    loadUser();
  }, []);

  if (!isAuthReady) {
    return (
      <ScreenWithHeader title="Consultations" userRole={userRole}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      </ScreenWithHeader>
    );
  }

  return (
    <ScreenWithHeader title="Consultations" userRole={userRole}>
      <ConsultationsScreen userRole={userRole} onMenuPress={openDrawer} />
    </ScreenWithHeader>
  );
}

function ProjectsTabScreen() {
  const { openDrawer } = useDrawer();
  const [userRole, setUserRole] = useState<'client' | 'company' | 'admin'>('client');
  const isAuthReady = useAuthReady();

  React.useEffect(() => {
    const loadUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = await storage.getUser();
      if (user) {
        setUserRole(user.role);
      }
    };
    loadUser();
  }, []);

  if (!isAuthReady) {
    return (
      <ScreenWithHeader title="Projects" userRole={userRole}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      </ScreenWithHeader>
    );
  }

  return (
    <ScreenWithHeader title="Projects" userRole={userRole}>
      <ProjectsScreen userRole={userRole} onMenuPress={openDrawer} />
    </ScreenWithHeader>
  );
}

function TransactionsTabScreen() {
  const { openDrawer } = useDrawer();
  const [userRole, setUserRole] = useState<'client' | 'company' | 'admin'>('client');
  const isAuthReady = useAuthReady();

  React.useEffect(() => {
    const loadUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = await storage.getUser();
      if (user) {
        setUserRole(user.role);
      }
    };
    loadUser();
  }, []);

  if (!isAuthReady) {
    return (
      <ScreenWithHeader title="Transactions" userRole={userRole}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      </ScreenWithHeader>
    );
  }

  return (
    <ScreenWithHeader title="Transactions" userRole={userRole}>
      <TransactionsScreen userRole={userRole} onMenuPress={openDrawer} />
    </ScreenWithHeader>
  );
}

function NotificationsTabScreen() {
  const { openDrawer } = useDrawer();
  const [userRole, setUserRole] = useState<'client' | 'company' | 'admin'>('client');
  const isAuthReady = useAuthReady();

  React.useEffect(() => {
    const loadUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = await storage.getUser();
      if (user) {
        setUserRole(user.role);
      }
    };
    loadUser();
  }, []);

  if (!isAuthReady) {
    return (
      <ScreenWithHeader title="Notifications" userRole={userRole}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      </ScreenWithHeader>
    );
  }

  return (
    <ScreenWithHeader title="Notifications" userRole={userRole}>
      <NotificationsScreen userRole={userRole} onMenuPress={openDrawer} />
    </ScreenWithHeader>
  );
}

// Create MainTabs using useMemo to ensure it's only created once
let MainTabsInstance: React.ComponentType | null = null;

function createMainTabs() {
  if (MainTabsInstance) {
    return MainTabsInstance;
  }

  function MainTabsComponent() {
    return (
      <Tab.Navigator
        key="main-tabs-navigator"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Consultations') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Projects') {
              iconName = focused ? 'folder' : 'folder-outline';
            } else if (route.name === 'Transactions') {
              iconName = focused ? 'receipt' : 'receipt-outline';
            } else if (route.name === 'Notifications') {
              iconName = focused ? 'notifications' : 'notifications-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#1E3A8A',
          tabBarInactiveTintColor: '#64748B',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardTabScreen} />
        <Tab.Screen name="Consultations" component={ConsultationsTabScreen} />
        <Tab.Screen name="Projects" component={ProjectsTabScreen} />
        <Tab.Screen name="Transactions" component={TransactionsTabScreen} />
        <Tab.Screen name="Notifications" component={NotificationsTabScreen} />
      </Tab.Navigator>
    );
  }

  MainTabsInstance = MainTabsComponent;
  return MainTabsInstance;
}

const MainTabs = createMainTabs();

// Stack screen components
function ConsultationDetailStackScreen({ route, navigation }: any) {
  const { openDrawer } = useDrawer();
  const [userRole, setUserRole] = useState<'client' | 'company' | 'admin'>('client');

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await storage.getUser();
      if (user) {
        setUserRole(user.role);
      }
    };
    loadUser();
  }, []);

  return (
    <ScreenWithHeader title="Consultation Details" userRole={userRole}>
      <ConsultationDetailScreen route={route} navigation={navigation} userRole={userRole} onMenuPress={openDrawer} />
    </ScreenWithHeader>
  );
}

function ProjectDetailStackScreen({ route, navigation }: any) {
  const { openDrawer } = useDrawer();
  const [userRole, setUserRole] = useState<'client' | 'company' | 'admin'>('client');

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await storage.getUser();
      if (user) {
        setUserRole(user.role);
      }
    };
    loadUser();
  }, []);

  return (
    <ScreenWithHeader title="Project Details" userRole={userRole}>
      <ProjectDetailScreen route={route} navigation={navigation} userRole={userRole} onMenuPress={openDrawer} />
    </ScreenWithHeader>
  );
}

function SettingsStackScreen() {
  const { openDrawer } = useDrawer();
  const [userRole, setUserRole] = useState<'client' | 'company' | 'admin'>('client');

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await storage.getUser();
      if (user) {
        setUserRole(user.role);
      }
    };
    loadUser();
  }, []);

  return (
    <ScreenWithHeader title="Settings" userRole={userRole}>
      <SettingsScreen userRole={userRole} onMenuPress={openDrawer} />
    </ScreenWithHeader>
  );
}

function AdminDashboardStackScreen() {
  const { openDrawer } = useDrawer();
  const [userRole, setUserRole] = useState<'client' | 'company' | 'admin'>('client');

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await storage.getUser();
      if (user) {
        setUserRole(user.role);
      }
    };
    loadUser();
  }, []);

  return (
    <ScreenWithHeader title="Admin Dashboard" userRole={userRole}>
      <AdminDashboardScreen userRole={userRole} onMenuPress={openDrawer} />
    </ScreenWithHeader>
  );
}

// MainStack component
function MainStackComponent() {
  const [userRole, setUserRole] = useState<'client' | 'company' | 'admin'>('client');

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await storage.getUser();
      if (user) {
        setUserRole(user.role);
      }
    };
    loadUser();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ConsultationDetail" component={ConsultationDetailStackScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailStackScreen} />
      <Stack.Screen name="Settings" component={SettingsStackScreen} />
      {userRole === 'admin' && (
        <Stack.Screen name="AdminDashboard" component={AdminDashboardStackScreen} />
      )}
    </Stack.Navigator>
  );
}

const MainStack = React.memo(MainStackComponent);

const AuthenticatedApp = React.memo(function AuthenticatedAppComponent({ user }: { user: User }) {
  return (
    <DrawerProvider userRole={user.role}>
      <MainStack />
    </DrawerProvider>
  );
});

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigationRef = useNavigationContainerRef();
  const initialLoadComplete = React.useRef(false);
  const authCheckIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const checkAuth = useCallback(async (isInitialLoad = false) => {
    try {
      const hasToken = await authService.isAuthenticated();
      
      if (hasToken) {
        const storedUser = await storage.getUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          await storage.clearAuth();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      if (isInitialLoad || !initialLoadComplete.current) {
        setIsLoading(false);
        initialLoadComplete.current = true;
      }
    }
  }, []);

  useEffect(() => {
    checkAuth(true);
  }, [checkAuth]);

  // Check auth periodically when authenticated (to catch logout)
  useEffect(() => {
    if (isAuthenticated && initialLoadComplete.current) {
      // Clear any existing interval
      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current);
      }
      
      // Check auth every 2 seconds when authenticated
      authCheckIntervalRef.current = setInterval(() => {
        checkAuth(false);
      }, 2000);

      return () => {
        if (authCheckIntervalRef.current) {
          clearInterval(authCheckIntervalRef.current);
        }
      };
    } else if (!isAuthenticated && initialLoadComplete.current) {
      // Also check periodically when NOT authenticated (to catch login)
      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current);
      }
      
      // Check auth every 1 second when not authenticated (faster for login)
      authCheckIntervalRef.current = setInterval(() => {
        checkAuth(false);
      }, 1000);

      return () => {
        if (authCheckIntervalRef.current) {
          clearInterval(authCheckIntervalRef.current);
        }
      };
    } else {
      // Clear interval during initial load
      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current);
        authCheckIntervalRef.current = null;
      }
    }
  }, [isAuthenticated, checkAuth]);

  // Check auth when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && initialLoadComplete.current) {
        checkAuth(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkAuth]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <NavigationContainer 
      ref={navigationRef}
      onStateChange={() => {
        // Check auth when navigation state changes (e.g., after logout)
        if (initialLoadComplete.current) {
          checkAuth(false);
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated && user ? (
          <Stack.Screen name="Main">
            {() => <AuthenticatedApp user={user} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
