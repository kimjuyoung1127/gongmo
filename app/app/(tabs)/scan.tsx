import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Modal, ActivityIndicator, Vibration } from 'react-native';
import { useCameraPermission, useCameraDevice, Camera, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';

//  중요: 이 URL을 실제 실행 중인 백엔드 서버의 IP 주소로 변경하세요.
const BACKEND_URL = '- 브라우저에서 http://127.0.0.1:5000'; 

export default function ScanScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();

  // --- 상태 변수 추가 ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Code Scanner 훅 구현 ---
  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'qr'],
    onCodeScanned: async (codes) => {
      if (isProcessing || codes.length === 0) {
        return; // 이미 처리 중이거나 코드가 없으면 무시
      }
      
      setIsProcessing(true); // 스캔 잠금
      setIsLoading(true);
      Vibration.vibrate(100); // 사용자에게 피드백

      const barcode = codes[0].value;

      try {
        const response = await axios.post(`${BACKEND_URL}/lookup_barcode`, { barcode });
        if (response.status === 200) {
          setScannedData(response.data.data);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 404) {
            setError('해당 바코드의 상품 정보를 찾을 수 없습니다.');
          } else {
            setError('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
          }
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  });

  const handleCloseModal = () => {
    setScannedData(null);
    setError(null);
    setIsProcessing(false); // 다음 스캔을 위해 잠금 해제
  };

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

  // 3. 모든 조건 충족 시 카메라 및 모달 렌더링
  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && !scannedData && !error} // 모달이 떴을 때 카메라 비활성화
        codeScanner={codeScanner}
      />
      
      {isLoading && <ActivityIndicator size="large" color="#ffffff" />}
      
      <Modal
        transparent={true}
        visible={!!scannedData || !!error}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {scannedData && (
              <>
                <Text style={styles.modalTitle}>상품 정보</Text>
                <Text style={styles.modalText}>이름: {scannedData.name}</Text>
                <Text style={styles.modalText}>카테고리: {scannedData.category_name_kr}</Text>
                {/* TODO: 유통기한 입력 및 재고 추가 로직 */}
                <View style={styles.buttonContainer}>
                  <Button title="재고에 추가" onPress={handleCloseModal} />
                </View>
              </>
            )}
            {error && (
              <>
                <Text style={styles.modalTitle}>오류</Text>
                <Text style={styles.modalText}>{error}</Text>
              </>
            )}
            <View style={styles.buttonContainer}>
              <Button title="닫기" onPress={handleCloseModal} />
            </View>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 15,
    width: '100%',
  },
});
