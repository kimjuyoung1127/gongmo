import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ✅ VisionCamera 훅 사용 (react-native-permissions 대체)
import { useCameraPermission } from 'react-native-vision-camera'
import * as Notifications from 'expo-notifications'

// 권한 요청 화면 - 앱 사용을 위해 필요한 권한(카메라, 알림 등)을 요청
export default function PermissionsScreen() {
  const router = useRouter()

  // 카메라 권한 훅 사용 (scan.tsx와 동일한 방식)
  const { hasPermission: cameraGranted, requestPermission: requestCameraPermission } = useCameraPermission()
  const [notificationStatus, setNotificationStatus] = useState<Notifications.PermissionStatus | null>(null)

  // 알림 권한 상태 확인
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationStatus(status);
    })();
  }, []);

  // 카메라 권한 요청 함수
  const handleCameraRequest = async () => {
    try {
      console.log("[PERMISSION] 카메라 권한 요청 시작");
      const granted = await requestCameraPermission();
      console.log("[PERMISSION] 카메라 권한 결과:", granted);

      if (granted) {
        console.log("[PERMISSION] 카메라 권한 허용됨");
      } else {
        // 거부된 경우 설정창으로 유도
        Alert.alert("카메라 권한 필요", "설정에서 카메라 권한을 허용해주세요.", [
          { text: "설정으로 이동", onPress: () => Linking.openSettings() },
          { text: "취소" }
        ]);
      }
    } catch (error) {
      console.error("Camera permission request error:", error);
      Alert.alert("오류", "카메라 권한 요청 중 문제가 발생했습니다.");
    }
  };

  // 알림 권한 요청 함수
  const handleNotificationRequest = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationStatus(status);
  };

  const handleCompletePress = async () => {
    if (!cameraGranted) {
      Alert.alert('카메라 권한 필요', '필수 권한인 카메라를 허용해주세요.')
      return
    }

    try {
      await AsyncStorage.setItem('permissionRequested', 'true')
      router.replace('/(tabs)')
    } catch (error) {
      console.error('AsyncStorage error:', error)
    }
  }

  const notificationGranted = notificationStatus === 'granted';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>앱 사용을 위해{"\n"}권한이 필요해요</Text>
        <Text style={styles.subtitle}>아래 권한을 허용해주세요</Text>

        <View style={styles.permissionList}>
          <View style={styles.permissionItem}>
            <View style={styles.permissionHeader}>
              <Text style={styles.emoji}>📷</Text>
              <Text style={styles.permissionTitle}>카메라 권한</Text>
              <Text style={[styles.status, cameraGranted && styles.granted]}>
                {cameraGranted ? '✅ 허용됨' : '❌ 필요'}
              </Text>
            </View>
            <Text style={styles.permissionDesc}>
              영수증과 바코드를 스캔하기 위해 필요해요
            </Text>
            {!cameraGranted && (
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={handleCameraRequest}
              >
                <Text style={styles.permissionButtonText}>권한 허용하기</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.permissionItem, styles.optionalPermission]}>
            <View style={styles.permissionHeader}>
              <Text style={styles.emoji}>🔔</Text>
              <Text style={styles.permissionTitle}>알림 권한</Text>
              <Text style={[styles.status, notificationGranted && styles.granted]}>
                {notificationGranted ? '✅ 허용됨' : '🔒 선택'}
              </Text>
            </View>
            <Text style={styles.permissionDesc}>
              유통기한 임박 알림을 받기 위해 필요해요 (선택)
            </Text>
            {!notificationGranted && (
              <TouchableOpacity
                style={[styles.permissionButton, styles.optionalButton]}
                onPress={handleNotificationRequest}
              >
                <Text style={[styles.permissionButtonText, styles.optionalButtonText]}>
                  알림 허용하기
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.completeButton, !cameraGranted && styles.disabledButton]}
          onPress={handleCompletePress}
          disabled={!cameraGranted}
        >
          <Text style={styles.completeButtonText}>
            카메라 권한만 허용하고 시작하기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionList: {
    gap: 16,
  },
  permissionItem: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0064FF',
  },
  optionalPermission: {
    borderLeftColor: '#CCCCCC',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 20,
    marginRight: 12,
  },
  permissionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  status: {
    fontSize: 12,
    color: '#FF6B00',
    fontWeight: '500',
  },
  granted: {
    color: '#00C851',
  },
  permissionDesc: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 32,
    marginBottom: 12,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#0064FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginLeft: 32,
  },
  optionalButton: {
    backgroundColor: '#F0F0F0',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  optionalButtonText: {
    color: '#666666',
  },
  footer: {
    paddingBottom: 32,
    paddingTop: 16,
  },
  completeButton: {
    backgroundColor: '#0064FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
})