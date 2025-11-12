import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useCameraPermission, useCameraDevice, Camera } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';

export default function ScanScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();

  // 1. 카메라 디바이스 확인
  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>카메라를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  // 2. 카메라 권한 확인
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>카메라 권한이 필요합니다.</Text>
        <Button onPress={requestPermission} title="권한 요청" />
      </View>
    );
  }

  // 3. 모든 조건 충족 시 카메라 렌더링
  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused} // 화면이 활성화될 때만 카메라 켜기
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  message: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
});