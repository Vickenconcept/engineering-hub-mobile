import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/auth.service';
import { storage } from '../lib/storage';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Re-check auth when screen is focused (after successful login)
  useFocusEffect(
    useCallback(() => {
      const checkIfAuthenticated = async () => {
        const hasToken = await authService.isAuthenticated();
        if (hasToken) {
          await storage.getUser();
        }
      };
      checkIfAuthenticated();
    }, [])
  );

  const handleLogin = async () => {
    setErrors({});
    
    if (!email || !password) {
      setErrors({
        email: !email ? 'Email is required' : undefined,
        password: !password ? 'Password is required' : undefined,
      });
      return;
    }

    setLoading(true);
    try {
      await authService.login({ email, password });
      
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'You have been logged in successfully',
      });
      
      // Small delay to ensure storage is updated, then navigation will happen automatically
      // The AppNavigator will detect the auth state change via periodic check
      setTimeout(() => {
        // Navigation will be handled by AppNavigator detecting auth state change
      }, 100);
    } catch (error: any) {
      if (__DEV__ && error.response?.status !== 422) {
        console.error('Login Error:', error.message);
      }
      if (error.response?.status === 422) {
        const errorData = error.response.data;
        if (errorData.errors) {
          setErrors({
            email: errorData.errors.email?.[0],
            password: errorData.errors.password?.[0],
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>BuildTrust</Text>
          <Text style={styles.subtitle}>Welcome back! Please login to continue.</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            showPasswordToggle
            error={errors.password}
          />

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate('Register' as never)}
            >
              Register
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  linkText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
});
