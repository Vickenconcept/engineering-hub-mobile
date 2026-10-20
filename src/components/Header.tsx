import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  onMenuPress: () => void;
  userRole: 'client' | 'company' | 'admin';
}

export function Header({ title, onMenuPress, userRole }: HeaderProps) {
  const insets = useSafeAreaInsets();

  const getRoleColor = (role: 'client' | 'company' | 'admin') => {
    switch (role) {
      case 'admin':
        return '#DC2626'; // Red for admin
      case 'company':
        return '#F59E0B'; // Orange for company
      case 'client':
        return '#10B981'; // Green for client
      default:
        return '#64748B';
    }
  };

  const getRoleLabel = (role: 'client' | 'company' | 'admin') => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) + 8 }]}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        activeOpacity={0.7}
      >
        <Ionicons name="menu" size={24} color="#1E3A8A" />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(userRole) }]}>
        <Text style={styles.roleText}>{getRoleLabel(userRole)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
