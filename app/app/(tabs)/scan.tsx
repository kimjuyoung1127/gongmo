import React, { useState, useRef,useEffect } from 'react';
import { Platform } from 'react-native';
import { View, Text, StyleSheet, Button, Modal, ActivityIndicator, Vibration, TextInput, Alert, TouchableOpacity, Pressable, Image, ImageBackground } from 'react-native';

import { useCameraPermission, useCameraDevice, Camera, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native'; // useNavigation 임포트
import axios from 'axios';
import { supabase } from '../../lib/supabase'; // Supabase 클라이언트 임포트

//  중요: 이 URL을 실제 실행 중인 백엔드 서버의 IP 주소로 변경하세요.
const BACKEND_URL = 'http://172.30.1.59:5000'; 

export default function ScanScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();
  const navigation = useNavigation(); // navigation 객체 가져오기

  // 컴포넌트 마운트 시 권한 요청
  useEffect(() => {
    const requestPermissions = async () => {
      if (!hasPermission) {
        console.log('[PERMISSION] 카메라 권한 요청');
        const granted = await requestPermission();
        console.log('[PERMISSION] 권한 결과:', granted);
      } else {
        console.log('[PERMISSION] 카메라 권한 이미 있음');
      }
    };

    requestPermissions();
  }, [hasPermission]);
  
  // Camera ref
  const camera = useRef<Camera>(null);
  
  // 스캔 모드 상태 ('barcode' | 'receipt')
  const [scanMode, setScanMode] = useState<'barcode' | 'receipt'>('barcode');

// 컴포넌트 마운트 시 권한 요청
useEffect(() => {
  // 컴포넌트 마운트 시 권한 요청 로직
  const requestPermissions = async () => {
    if (!hasPermission) {
      console.log('[PERMISSION] 카메라 권한 요청');
      const granted = await requestPermission();
      console.log('[PERMISSION] 권한 결과:', granted);
    } else {
      console.log('[PERMISSION] 카메라 권한 이미 있음');
    }
  };
  
  requestPermissions();
}, [hasPermission]);
  
  // 영수증 촬영 관련 상태
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPhotoConfirm, setShowPhotoConfirm] = useState(false);
  
  // 바코드 직접 입력 상태
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

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

  // --- 사진 촬영 핸들러 ---
  const takePhoto = async () => {
    console.log('\n--- [PHOTO] 영수증 사진 촬영 시작 ---');
    
    try {
      // react-native-vision-camera로 사진 촬영
      const photo = await camera.current?.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'auto',
        enableShutterSound: true,
        photo: true, // 👈 사진 촬영 활성화
      });

      console.log('[PHOTO-1] 사진 촬영 결과:', photo);
      
      if (photo) {
        console.log('[PHOTO-2] 촬영된 이미지 URI:', photo.path);
        
        // 안드로이드에서는 file:// 프로토콜 추가
        const imageUri = Platform.OS === 'android' ? `file://${photo.path}` : photo.path;
        console.log('[PHOTO-2-1] 최종 이미지 URI:', imageUri);
        
        setCapturedImage(imageUri);
        setShowPhotoConfirm(true);
        console.log('[PHOTO-3] 사진 확인 화면 표시');
      } else {
        console.log('[PHOTO-4] 사진 촬영 실패');
        Alert.alert('오류', '사진 촬영에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('[PHOTO-ERROR] 사진 촬영 중 오류:', error);
      Alert.alert('오류', '사진 촬영 중 문제가 발생했습니다.');
    }
    
    console.log('--- [PHOTO] 영수증 사진 촬영 완료 ---\n');
  };

  const uploadReceiptToBackend = async (imageUri: string) => {
    console.log('\n--- [OCR] 영수증 업로드 시작 ---');
    
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    } as any);
    
    try {
      const response = await fetch(`${BACKEND_URL}/upload_receipt`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('[OCR-DEBUG] 응답 상태:', response.status);
      console.log('[OCR-DEBUG] 응답 헤더:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('[OCR-ERROR] 서버 오류:', data.error);
        Alert.alert('오류', `영수증 처리 중 문제가 발생했습니다: ${data.error}`);
        return null;
      }
      
      console.log('[OCR-SUCCESS] 처리 완료:', data.items.length, '개 품목');
      
      return data;
    } catch (error) {
      console.error('[OCR-ERROR] 업로드 실패:', error);
      Alert.alert('오류', '영수증을 업로드하는 중 문제가 발생했습니다.');
      return null;
    } finally {
      console.log('--- [OCR] 영수증 업로드 완료 ---\n');
    }
  };

  const handleUsePhoto = async () => {
    console.log('\n--- [PHOTO-CONFIRM] 사진 사용 선택 ---');
    setShowPhotoConfirm(false);
    
    if (!capturedImage) {
      Alert.alert('오류', '촬영된 사진이 없습니다.');
      return;
    }
    
    // 실제 OCR 처리 시작
    const receiptData = await uploadReceiptToBackend(capturedImage);
    
    if (receiptData) {
      // 결과 화면으로 이동 
      console.log(`[NAV] receipt-review로 이동: ${receiptData.items.length}개 품목`);
      navigation.navigate('receipt-review', { 
        receiptData: receiptData,
        imageUri: capturedImage 
      });
    }
    
    console.log('--- [PHOTO-CONFIRM] 처리 완료 ---\n');
  };

  const handleRetakePhoto = () => {
    console.log('\n--- [PHOTO-CONFIRM] 재촬영 선택 ---');
    setCapturedImage(null);
    setShowPhotoConfirm(false);
    console.log('--- [PHOTO-CONFIRM] 재촬영 준비 완료 ---\n');
  };

  // --- 모드 전환 핸들러 ---
  const handleModeChange = (value: string) => {
    const newMode = value === '바코드' ? 'barcode' : 'receipt';
    console.log(`\n--- [MODE] 모드 전환: ${newMode} ---`);
    setScanMode(newMode);
    
    // 모드 전환 시 기존 상태 초기화
    setScannedData(null);
    setError(null);
    setExpiryDate('');
    setIsProcessing(false);
    setCapturedImage(null);
    setShowPhotoConfirm(false);
    setShowManualEntry(false);
    setManualName('');
    setManualCategory('');
    setScannedBarcode(null);
    console.log('[MODE] 모드 전환 완료, 상태 초기화됨\n');
  };
  
  

  // --- 카테고리 조회 함수 ---
  const getCategoryIdByName = async (categoryName: string): Promise<number | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id')
        .eq('category_name_kr', categoryName)
        .single();
      
      if (error || !data) {
        console.warn('[CATEGORY] 카테고리를 찾을 수 없음:', categoryName);
        return null;
      }
      
      return data.id;
    } catch (error) {
      console.error('[CATEGORY] 카테고리 조회 오류:', error);
      return null;
    }
  };

  // --- 직접 입력 핸들러 ---
  const handleShowManualEntry = () => {
    console.log('\n--- [MANUAL] 직접 입력 화면 표시 ---');
    setShowManualEntry(true);
    console.log('[MANUAL] 직접 입력 화면 활성화\n');
  };

  const handleManualSubmission = async () => {
    console.log('\n--- [MANUAL] 직접 입력 데이터 제출 ---');
    
    if (!manualName || !manualCategory) {
      Alert.alert('입력 오류', '상품 이름과 카테고리를 모두 입력해주세요.');
      return;
    }
    
    try {
      const categoryId = await getCategoryIdByName(manualCategory);
      
      // 1. 먼저 products 테이블에 상품 정보 저장 (캐싱용)
      console.log('[STEP-1] products 테이블에 상품 정보 저장');
      const { error: productError } = await supabase
        .from('products')
        .upsert([{
          barcode: scannedBarcode,
          product_name: manualName,
          category_id: categoryId,
          source: 'user_contribution',
          verified: false,
        }], {
          onConflict: 'barcode'
        });

      if (productError) {
        console.error('[PRODUCT-ERROR] products 테이블 저장 오류:', productError);
      } else {
        console.log('[PRODUCT-SUCCESS] products 테이블 저장 성공');
      }

      // 2. inventory 테이블에 개인 재고 저장
      console.log('[STEP-2] inventory 테이블에 재고 저장');
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .insert([{
          name: manualName,
          barcode: scannedBarcode,
          category_id: categoryId,
          expiry_date: expiryDate,
          quantity: 1,
        }])
        .select();

      if (inventoryError) {
        console.error('[MANUAL-ERROR] inventory 테이블 저장 오류:', inventoryError);
        Alert.alert('저장 실패', '재고 정보를 저장하는 중 문제가 발생했습니다.');
      } else {
        console.log('[MANUAL-SUCCESS] 재고 정보 저장 성공:', inventoryData);
        Alert.alert('저장 성공', '상품이 재고에 추가되었습니다. 다른 사용자도 이 상품 정보를 공유받을 수 있습니다.');
        
        // 상태 초기화 및 모달 닫기
        setShowManualEntry(false);
        setManualName('');
        setManualCategory('');
        setScannedBarcode(null);
        setExpiryDate('');
        setError(null);
        
        // 재고 목록 탭으로 이동
        navigation.navigate('index');
      }
    } catch (error) {
      console.error('[MANUAL-ERROR] 제출 중 오류:', error);
      Alert.alert('오류', '상품 정보 제출 중 문제가 발생했습니다.');
    }
    
    console.log('--- [MANUAL] 직접 데이터 제출 완료 ---\n');
  };

  // --- Code Scanner 훅 구현 ---
  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13'],  // 바코드만 스캔 (QR 코드 제외)
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

            // 💡 FIX: API 응답에 제품 이름이 있는지 확인 (product_name 사용)
            if (productData && productData.product_name) {
              console.log('[API-4] 제품 정보 수신:');
              console.log('  - 이름:', productData.product_name); // product_name 사용
              console.log('  - 카테고리 ID:', productData.category_id);
              console.log('  - 카테고리 이름:', productData.category_name_kr);
              console.log('  - 소스:', productData.source);
              
              setScannedData({ ...productData, name: productData.product_name, barcode }); // name 필드 명시적 매핑
              console.log('[API-5] 스캔 데이터 상태 업데이트 완료');
            } else {
              console.log('[API-6] 오류: API가 제품 이름 없이 응답함');
              setError('해당 바코드의 상품 정보를 찾을 수 없습니다 (이름 없음).');
            }
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
          console.error('  - 응답 데이터:', JSON.stringify(err.response?.data, null, 2));
          
          if (err.response?.status === 404) {
            console.error('[ERR-2] 404 오류: 해당 바코드의 상품 정보를 찾을 수 없음');
            // 저장된 바코드 설정
            setScannedBarcode(barcode);
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
          console.error('  - 전체 오류 객체:', JSON.stringify(err, null, 2));
          setError('네트워크 연결을 확인해주세요.');
        }
        setIsProcessing(false);
        console.log('[ERR-6] isProcessing 상태 초기화');
      } finally {
        setIsLoading(false);
        setIsProcessing(false);
        console.log(`[SCAN-5] 로딩 상태 변경: isLoading=false, isProcessing=false`);
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

    // Validate category_id exists in the categories_proper table
    const validCategoryIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]; // IDs from categories_proper.csv

    let categoryId = scannedData.category_id;
    if (!validCategoryIds.includes(categoryId)) {
      console.warn(`[INV-VALIDATION] Invalid category_id received: ${categoryId}. Using fallback category.`);
      categoryId = 30; // Using "과자/스낵" as a fallback (ID 30 exists in categories_proper.csv)
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
        navigation.navigate('index'); // 재고 목록 탭으로 이동
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
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && !scannedData && !error && !showPhotoConfirm}
        codeScanner={scanMode === 'barcode' ? codeScanner : undefined}
        photo={scanMode === 'receipt'} // 👈 영수증 모드일 때 사진 촬영 활성화
      />
      
      {isLoading && <ActivityIndicator size="large" color="#ffffff" />}
      
      {/* 모드 전환 버튼 */}
      <View style={styles.segmentContainer}>
        <View style={styles.segmentButtons}>
          <TouchableOpacity 
            style={[
              styles.segmentButton, 
              scanMode === 'barcode' ? styles.segmentButtonActive : styles.segmentButtonInactive
            ]}
            onPress={() => handleModeChange('바코드')}
          >
            <Text style={[
              styles.segmentButtonText,
              scanMode === 'barcode' ? styles.segmentButtonTextActive : styles.segmentButtonTextInactive
            ]}>
              바코드
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.segmentButton, 
              scanMode === 'receipt' ? styles.segmentButtonActive : styles.segmentButtonInactive
            ]}
            onPress={() => handleModeChange('영수증')}
          >
            <Text style={[
              styles.segmentButtonText,
              scanMode === 'receipt' ? styles.segmentButtonTextActive : styles.segmentButtonTextInactive
            ]}>
              영수증
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 영수증 모드일 때 셔터 버튼 */}
      {scanMode === 'receipt' && (
        <View style={styles.shutterButtonContainer}>
          <TouchableOpacity style={styles.shutterButton} onPress={takePhoto}>
            <Text style={styles.shutterButtonText}>사진 촬영</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* 바코드 스캔 결과 모달 */}
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
                {error.includes('해당 바코드의 상품 정보를 찾을 수 없습니다') && (
                  <>
                    <Text style={styles.modalSubText}>상품 정보를 직접 입력하고 재고에 추가할까요?</Text>
                    <View style={styles.errorButtonContainer}>
                      <Button title="직접 입력" onPress={handleShowManualEntry} />
                      <Button title="취소" onPress={handleCloseModal} />
                    </View>
                  </>
                )}
              </>
            )}
            {!error && (
              <View style={styles.buttonContainer}>
                <Button title="닫기" onPress={handleCloseModal} />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 사진 확인 모달 */}
      <Modal visible={showPhotoConfirm} animationType="slide" onRequestClose={handleRetakePhoto}>
        <View style={styles.photoConfirmContainer}>
          <Text style={styles.photoConfirmTitle}>사진 확인</Text>
          
          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          )}
          
          <View style={styles.photoConfirmButtons}>
            <TouchableOpacity 
              style={[styles.photoConfirmButton, styles.retakeButton]} 
              onPress={handleRetakePhoto}
            >
              <Text style={styles.photoConfirmButtonText}>다시 찍기</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.photoConfirmButton, styles.usePhotoButton]} 
              onPress={handleUsePhoto}
            >
              <Text style={styles.photoConfirmButtonText}>이 사진 사용</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.photoGuideContainer}>
            <Text style={styles.photoGuideTitle}>촬영 가이드</Text>
            <Text style={styles.photoGuideText}>• 영수증 전체가 한 화면에 나오게 촬영</Text>
            <Text style={styles.photoGuideText}>• 그림자나 반사가 없는 밝은 곳에서 촬영</Text>
            <Text style={styles.photoGuideText}>• 글씨이 선명하게 읽혀야 합니다</Text>
          </View>
        </View>
      </Modal>

      {/* 직접 입력 모달 */}
      <Modal visible={showManualEntry} animationType="slide" onRequestClose={() => setShowManualEntry(false)}>
        <View style={styles.manualEntryContainer}>
          <Text style={styles.manualEntryTitle}>상품 정보 직접 입력</Text>
          
          <Text style={styles.manualEntryLabel}>바코드</Text>
          <Text style={styles.manualEntryBarcode}>{scannedBarcode}</Text>
          
          <Text style={styles.manualEntryLabel}>상품 이름</Text>
          <TextInput
            style={styles.manualInput}
            placeholder="상품 이름을 입력하세요"
            value={manualName}
            onChangeText={setManualName}
          />
          
          <Text style={styles.manualEntryLabel}>카테고리</Text>
          <TextInput
            style={styles.manualInput}
            placeholder="카테고리를 입력하세요 (예: 과일, 채소, 유제품)"
            value={manualCategory}
            onChangeText={setManualCategory}
          />
          
          <Text style={styles.manualEntryLabel}>유통기한</Text>
          <TextInput
            style={styles.manualInput}
            placeholder="유통기한 입력 (YYYY-MM-DD)"
            value={expiryDate}
            onChangeText={setExpiryDate}
          />
          
          <View style={styles.manualEntryButtons}>
            <TouchableOpacity 
              style={[styles.manualButton, styles.manualCancelButton]} 
              onPress={() => setShowManualEntry(false)}
            >
              <Text style={styles.manualButtonText}>취소</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.manualButton, styles.manualSubmitButton]} 
              onPress={handleManualSubmission}
            >
              <Text style={styles.manualButtonText}>재고에 추가</Text>
            </TouchableOpacity>
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
  
  // 세그먼트 버튼 스타일
  segmentContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
  },
  segmentButtons: {
    flexDirection: 'row',
    borderRadius: 6,
    backgroundColor: 'rgba(200, 200, 200, 0.5)',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#007AFF',
  },
  segmentButtonInactive: {
    backgroundColor: 'transparent',
  },
  segmentButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentButtonTextActive: {
    color: '#fff',
  },
  segmentButtonTextInactive: {
    color: '#333',
  },
  
  // 셔터 버튼 스타일
  shutterButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  shutterButtonText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  
  // 사진 확인 화면 스타일
  photoConfirmContainer: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
  },
  photoConfirmTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  capturedImage: {
    width: '100%',
    height: '50%',
    resizeMode: 'contain',
    borderRadius: 10,
    marginBottom: 20,
  },
  photoConfirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  photoConfirmButton: {
    flex: 0.45,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#666',
  },
  usePhotoButton: {
    backgroundColor: '#4CAF50',
  },
  photoConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoGuideContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  photoGuideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  photoGuideText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
    lineHeight: 20,
  },
  
  // 직접 입력 화면 스타일
  manualEntryContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  manualEntryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  manualEntryLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  manualEntryBarcode: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    textAlign: 'center',
  },
  manualInput: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  manualEntryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  manualButton: {
    flex: 0.45,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  manualCancelButton: {
    backgroundColor: '#666',
  },
  manualSubmitButton: {
    backgroundColor: '#007AFF',
  },
  manualButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  errorButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});
