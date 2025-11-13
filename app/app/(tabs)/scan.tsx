import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Modal, ActivityIndicator, Vibration, TextInput, Alert } from 'react-native';
import { useCameraPermission, useCameraDevice, Camera, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { supabase } from '../../lib/supabase'; // Supabase 클라이언트 임포트

//  중요: 이 URL을 실제 실행 중인 백엔드 서버의 IP 주소로 변경하세요.
const BACKEND_URL = 'http://172.30.1.16:5000'; 

export default function ScanScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();

  // --- 타입 정의 ---
  type ScannedProductData = {
    name: string;
    category_id: number;
    category_name_kr: string;
    source: string;
    barcode: string;
  } & Record<string, any>; // Allow additional properties

  // --- 상태 변수 추가 ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      console.log(`\n--- [BARCODE-SCAN] 바코드 인식 시작 ---`);
      console.log(`[SCAN-1] 인식된 바코드: ${barcode}`);
      console.log(`[SCAN-2] 바코드 타입: ${codes[0].type}`);

      setIsProcessing(true);
      setIsLoading(true);
      Vibration.vibrate(100);
      console.log(`[SCAN-3] 처리 상태 변경: isProcessing=true, isLoading=true`);
      console.log(`[SCAN-4] 백엔드 API 호출 준비: ${BACKEND_URL}/lookup_barcode`);

      try {
        console.log(`[API-1] API 요청 시작 - 바코드: ${barcode}`);
        const response = await axios.post(`${BACKEND_URL}/lookup_barcode`, { barcode });
        
        if (response.status === 200) {
          console.log('[API-2] API 응답 수신 - 상태 코드: ${response.status}');

          console.log('[API-3] API 호출 성공 - 응답 데이터:', response.data);
          
          if (response.data && response.data.data) {
            const productData = response.data.data;
            console.log('[API-4] 제품 정보 수신:');
            console.log('  - 이름:', productData.name);
            console.log('  - 카테고리 ID:', productData.category_id);
            console.log('  - 카테고리 이름:', productData.category_name_kr);
            console.log('  - 소스:', productData.source);
            
            setScannedData({ ...productData, barcode });
            console.log('[API-5] 스캔 데이터 상태 업데이트 완료');
          } else {
            console.log('[API-6] 경고: 응답에 data 필드가 없음');
            setError('서버 응답 형식이 올바르지 않습니다.');
          }
        } else {
          console.log(`[API-7] 예기치 않은 응답 상태 코드: ${response.status}`);
          setError('서버 응답이 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('\n--- [ERROR] 바코드 API 호출 실패 ---');
        if (axios.isAxiosError(err)) {
          console.error('[ERR-1] Axios 오류 발생:');
          console.error('  - 메시지:', err.message);
          console.error('  - 상태 코드:', err.response?.status);
          console.error('  - 응답 데이터:', err.response?.data);
          
          if (err.response?.status === 404) {
            console.error('[ERR-2] 404 오류: 해당 바코드의 상품 정보를 찾을 수 없음');
            setError('해당 바코드의 상품 정보를 찾을 수 없습니다.');
          } else if (err.response?.status === 500) {
            console.error('[ERR-3] 500 오류: 서버 내부 오류 발생');
            setError('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
          } else {
            console.error('[ERR-4] 기타 API 오류:', err.response?.status);
            setError('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
          }
        } else {
          console.error('[ERR-5] 네트워크 오류 또는 알 수 없는 오류:');
          console.error('  - 오류:', err);
          setError('네트워크 연결을 확인해주세요.');
        }
      } finally {
        setIsLoading(false);
        console.log(`[SCAN-5] 로딩 상태 변경: isLoading=false`);
        console.log(`--- [BARCODE-SCAN] 바코드 인식 완료 ---\n`);
      }
    }
  });

  const handleCloseModal = () => {
    console.log('\n--- [MODAL] 모달 닫기 시작 ---');
    console.log('[MODAL-1] 상태 초기화 시작');
    setScannedData(null);
    setError(null);
    setExpiryDate('');
    setIsProcessing(false);
    console.log('[MODAL-2] 상태 초기화 완료');
    console.log('--- [MODAL] 모달 닫기 완료 ---\n');
  };

  const handleAddToInventory = async () => {
    console.log('\n--- [INVENTORY] 재고 추가 시작 ---');
    
    if (!scannedData) {
      console.log('[INV-1] 오류: 스캔된 상품 정보 없음');
      Alert.alert('오류', '상품 정보가 없습니다.');
      return;
    }
    
    if (!expiryDate) {
      console.log('[INV-2] 오류: 유통기한 미입력');
      Alert.alert('입력 오류', '유통기한을 입력해주세요. (예: 2025-12-31)');
      return;
    }

    // Validate category_id exists in the categories table
    const validCategoryIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]; // IDs from categories.csv

    let categoryId = scannedData.category_id;
    if (!validCategoryIds.includes(categoryId)) {
      console.warn(`[INV-VALIDATION] Invalid category_id received: ${categoryId}. Using fallback category.`);
      categoryId = 36; // Using "반조리/냉동 HMR" as a fallback
    }

    const newInventoryItem: {
      name: string;
      category_id: number;
      expiry_date: string;
      barcode: string;
      quantity: number;
    } = {
      name: scannedData.name,
      category_id: categoryId,
      expiry_date: expiryDate,
      barcode: scannedData.barcode,
      quantity: 1,
    };

    console.log('[INV-3] 재고 추가 시도 - 보낼 데이터:');
    console.log('  - 이름:', newInventoryItem.name);
    console.log('  - 카테고리 ID:', newInventoryItem.category_id);
    console.log('  - 유통기한:', newInventoryItem.expiry_date);
    console.log('  - 바코드:', newInventoryItem.barcode);
    console.log('  - 수량:', newInventoryItem.quantity);

    try {
      console.log('[INV-4] Supabase INSERT 쿼리 실행 중...');
      const { data, error: dbError } = await supabase
        .from('inventory')
        .insert([newInventoryItem])
        .select();

      if (dbError) {
        console.error('[INV-5] Supabase 저장 오류 발생:', dbError);
        console.error('  - 오류 코드:', dbError.code);
        console.error('  - 오류 메시지:', dbError.message);
        console.error('  - HTTP 응답 코드:', dbError.code); // PostgrestError는 statusCode 대신 code 사용
        Alert.alert('저장 실패', `${dbError.message} (코드: ${dbError.code})`);
      } else {
        console.log('[INV-6] Supabase 저장 성공!');
        console.log('  - 삽입된 데이터:', data);
        Alert.alert('저장 성공', '재고에 상품이 추가되었습니다.');
        handleCloseModal();
      }
    } catch (error: any) {
      console.error('[INV-7] 재고 추가 중 예외 발생:', error);
      Alert.alert('오류', '재고 추가 중 문제가 발생했습니다.');
    } finally {
      console.log('--- [INVENTORY] 재고 추가 완료 ---\n');
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
