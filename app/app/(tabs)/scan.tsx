import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Modal, ActivityIndicator, Vibration, TextInput, Alert } from 'react-native';
import { useCameraPermission, useCameraDevice, Camera, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { supabase } from '../../lib/supabase'; // Supabase 클라이언트 임포트

//  중요: 이 URL을 실제 실행 중인 백엔드 서버의 IP 주소로 변경하세요.
const BACKEND_URL = 'http://172.30.1.93:5000'; 

export default function ScanScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();

  // --- 상태 변수 추가 ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expiryDate, setExpiryDate] = useState(''); // 유통기한 상태 추가

  // --- Code Scanner 훅 구현 ---
  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'qr'],
    onCodeScanned: async (codes) => {
      if (isProcessing || codes.length === 0) {
        return;
      }
      
      const barcode = codes[0].value;
      console.log(`[1] 바코드 인식 성공: ${barcode}`);

      setIsProcessing(true);
      setIsLoading(true);
      Vibration.vibrate(100);

      try {
        console.log(`[2] API 호출 시도: ${BACKEND_URL}/lookup_barcode`);
        const response = await axios.post(`${BACKEND_URL}/lookup_barcode`, { barcode });
        
        if (response.status === 200) {
          console.log('[3] API 호출 성공:', response.data.data);
          setScannedData({ ...response.data.data, barcode });
        }
      } catch (err) {
        console.error('[4] API 호출 오류 발생!');
        if (axios.isAxiosError(err) && err.response) {
          console.error('오류 데이터:', err.response.data);
          console.error('오류 상태 코드:', err.response.status);
          if (err.response.status === 404) {
            setError('해당 바코드의 상품 정보를 찾을 수 없습니다.');
          } else {
            setError('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
          }
        } else {
          console.error('네트워크 오류 또는 알 수 없는 오류:', err);
          setError('네트워크 연결을 확인해주세요.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  });

  const handleCloseModal = () => {
    setScannedData(null);
    setError(null);
    setExpiryDate('');
    setIsProcessing(false);
  };

  const handleAddToInventory = async () => {
    if (!scannedData || !expiryDate) {
      Alert.alert('입력 오류', '유통기한을 입력해주세요. (예: 2025-12-31)');
      return;
    }

    const newInventoryItem = {
      name: scannedData.name,
      category_id: scannedData.category_id,
      expiry_date: expiryDate,
      barcode: scannedData.barcode,
      quantity: 1,
    };

    console.log('[DB-1] 재고 추가 시도. 보낼 데이터:', newInventoryItem);

    const { error: dbError } = await supabase.from('inventory').insert([newInventoryItem]);

    if (dbError) {
      console.error('[DB-2] Supabase 저장 오류:', dbError);
      Alert.alert('저장 실패', dbError.message);
    } else {
      console.log('[DB-3] Supabase 저장 성공!');
      Alert.alert('저장 성공', '재고에 상품이 추가되었습니다.');
      handleCloseModal();
    }
  };

  // 1. 카메라 디바이스 확인
  if (device == null) {
    return <View style={styles.container}><Text style={styles.message}>카메라를 찾을 수 없습니다.</Text></View>;
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
        isActive={isFocused && !scannedData && !error}
        codeScanner={codeScanner}
      />
      
      {isLoading && <ActivityIndicator size="large" color="#ffffff" />}
      
      <Modal transparent={true} visible={!!scannedData || !!error} animationType="slide" onRequestClose={handleCloseModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {scannedData && (
              <>
                <Text style={styles.modalTitle}>상품 정보</Text>
                <Text style={styles.modalText}>이름: {scannedData.name}</Text>
                <Text style={styles.modalText}>카테고리: {scannedData.category_name_kr}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="유통기한 입력 (YYYY-MM-DD)"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                />
                <View style={styles.buttonContainer}>
                  <Button title="재고에 추가" onPress={handleAddToInventory} />
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
  message: { fontSize: 18, color: 'white', marginBottom: 20, textAlign: 'center' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 22, borderRadius: 10, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  modalText: { fontSize: 16, marginBottom: 8 },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: { marginTop: 15, width: '100%' },
});
