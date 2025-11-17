import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      console.log('🔒 로그아웃 성공');
      Alert.alert('로그아웃', '성공적으로 로그아웃되었습니다.');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      Alert.alert('오류', '로그아웃에 실패했습니다.');
    }
  };

  const resetAppData = async () => {
    Alert.alert(
      '앱 초기화 확인',
      '모든 데이터를 초기화하고 온보딩부터 다시 시작하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              await AsyncStorage.removeItem('hasVisitedApp');
              await AsyncStorage.removeItem('permissionRequested');
              console.log('🔄 모든 데이터 초기화 완료');
              Alert.alert('초기화 완료', '앱을 다시 시작하여 온보딩을 확인하세요.');
            } catch (error) {
              console.error('초기화 실패:', error);
              Alert.alert('오류', '데이터 초기화에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>설정</Text>
      
      <View style={styles.developerSection}>
        <Text style={styles.sectionTitle}>🔧 개발자 옵션</Text>
        
        <TouchableOpacity style={styles.debugButton} onPress={handleLogout}>
          <Text style={styles.debugButtonText}>🔒 로그아웃</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.debugButton, { backgroundColor: '#FF3B30' }]} onPress={resetAppData}>
          <Text style={styles.debugButtonText}>🔄 앱 초기화 (온보딩 테스트)</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          {'💡 힌트: 로그아웃 후 앱을 완전히 종료했다가 다시 시작하세요'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  developerSection: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8E8',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  debugButton: {
    backgroundColor: '#0064FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
});
