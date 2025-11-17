import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Modal, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { session } = useAuth();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets(); // Get safe area insets
  const { bottom } = safeAreaInsets;
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [nextRoute, setNextRoute] = useState<string | null>(null);

  // 데모 모드일 때 로그인 필요 모달 표시
  const handleNavigation = (routeName: string) => {
    if (!session) { // 데모 모드 (비로그인 상태)
      setNextRoute(routeName);
      setShowLoginModal(true);
    } else {
      // 로그인 상태면 바로 이동
      router.push(`/(tabs)/${routeName}`);
    }
  };

  // 로그인 모달에서 계속하기 버튼 클릭
  const handleContinueToLogin = () => {
    setShowLoginModal(false);
    router.push('/sign-in');
  };

  // 로그인 모달에서 취소 버튼 클릭
  const handleCancel = () => {
    setShowLoginModal(false);
    // 원래 위치 유지 (탭 변경하지 않음)
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            paddingBottom: Math.max(12, bottom),
            paddingTop: Math.max(16, safeAreaInsets.top || 0),
            height: Math.max(100, bottom + 80),
            backgroundColor: '#ffffff',
            borderTopColor: '#e1e5e9',
            borderTopWidth: 1,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
          },
          tabBarLabelStyle: {
            display: 'none', // 탭 레이블 숨기기
          },
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            borderBottomWidth: 1,
            borderBottomColor: '#e1e5e9',
          },
          headerLeft: () => (
            <View style={{ marginLeft: 20, marginBottom: 4 }}>
              <Image 
                source={require('../../assets/images/logo.png')}
                style={{ width: 32, height: 32, resizeMode: 'contain' }}
              />
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/settings')}
              style={{ marginRight: 20, marginBottom: 4 }}
            >
              <Ionicons name="settings-outline" size={24} color="#666" />
            </TouchableOpacity>
          ),
        }}
        sceneContainerStyle={{
          backgroundColor: '#F5F5F5',
          paddingBottom: Math.max(16, bottom), // 화면 콘텐츠와 탭 사이 여백
        }}
      >
        <Tabs.Screen
          name="index" // app/(tabs)/index.tsx 에 매핑
          options={{
            title: '홈',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name="archive-outline" 
                size={focused ? 28 : 24} 
                color={focused ? '#0064FF' : '#999'} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="scan" // app/(tabs)/scan.tsx 에 매핑
          options={{
            title: '스캔',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name="camera-outline" 
                size={focused ? 28 : 24} 
                color={focused ? '#0064FF' : '#999'} 
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); // 기본 탭 이동 방지
              handleNavigation('scan');
            },
          }}
        />
        <Tabs.Screen
          name="recipe" // app/(tabs)/recipe.tsx 에 매핑 (예정)
          options={{
            title: '레시피',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name="restaurant-outline" 
                size={focused ? 28 : 24} 
                color={focused ? '#0064FF' : '#999'} 
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); // 기본 탭 이동 방지
              if (!session) { // 데모 모드 (비로그인 상태)
                setNextRoute('recipe');
                setShowLoginModal(true);
              } else {
                router.push(`/(tabs)/recipe`);
              }
            },
          }}
        />
        
      </Tabs>

      {/* 로그인 필요 모달 */}
      <Modal
        visible={showLoginModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>로그인이 필요합니다</Text>
            <Text style={styles.modalMessage}>
              {'이 기능을 사용하려면 로그인이 필요합니다.\n로그인 후 이용해 주세요.'}
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.loginButton]}
                onPress={handleContinueToLogin}
              >
                <Text style={styles.modalButtonText}>로그인 하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  loginButton: {
    backgroundColor: '#0064FF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButtonText: {
    color: '#333',
  },
});