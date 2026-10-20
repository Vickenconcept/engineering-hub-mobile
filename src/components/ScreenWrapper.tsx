import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Header } from './Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  title: string;
  onMenuPress: () => void;
  userRole: 'client' | 'company' | 'admin';
}

export function ScreenWrapper({ children, title, onMenuPress, userRole }: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Header title={title} onMenuPress={onMenuPress} userRole={userRole} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
});
