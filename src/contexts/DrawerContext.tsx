import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Animated, Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import CustomDrawerContent from '../components/CustomDrawerContent';

interface DrawerContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
  isOpen: boolean;
}

const DrawerContext = createContext<DrawerContextType | null>(null);

export function DrawerProvider({ children, userRole }: { children: React.ReactNode; userRole: 'client' | 'company' | 'admin' }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerOpen(false);
    });
  }, [slideAnim, opacityAnim]);

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, isOpen: drawerOpen }}>
      {children}
      {drawerOpen && (
        <Modal
          visible={drawerOpen}
          transparent={true}
          animationType="none"
          onRequestClose={closeDrawer}
        >
          <View style={styles.drawerWrapper}>
            <TouchableOpacity
              style={styles.drawerOverlay}
              activeOpacity={1}
              onPress={closeDrawer}
            >
              <Animated.View
                style={[
                  styles.drawerOverlayAnimated,
                  { opacity: opacityAnim },
                ]}
              />
            </TouchableOpacity>
            <Animated.View
              style={[
                styles.drawerContainer,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <CustomDrawerContent
                userRole={userRole}
                onClose={closeDrawer}
              />
            </Animated.View>
          </View>
        </Modal>
      )}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within DrawerProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  drawerWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerOverlayAnimated: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    width: 280,
    height: '100%',
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
});
