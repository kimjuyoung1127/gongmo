import React, { useState, useRef,useEffect } from 'react';
import { Platform } from 'react-native';
import { View, Text, StyleSheet, Button, Modal, ActivityIndicator, Vibration, TextInput, Alert, TouchableOpacity, Pressable, Image, ImageBackground, FlatList, SafeAreaView, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';

import { useCameraPermission, useCameraDevice, Camera, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native'; // useNavigation 임포트
import axios from 'axios';
import { supabase } from '../../lib/supabase'; // Supabase 클라이언트 임포트

import { ModeToggle } from '../../components/scan/ModeToggle';
import { PhotoConfirmModal } from '../../components/scan/PhotoConfirmModal';
import { ScannedProductData, BACKEND_URL } from '../../components/scan/ScanUtils';
import { getAllCategories, getCategoryInfo, Category } from '../../lib/categories'; 

export default function ScanScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();
  const navigation = useNavigation(); // navigation 객체 가져오기

  // Camera ref
  const camera = useRef<Camera>(null);
  
  // 스캔 모드 상태 ('barcode' | 'receipt')
  const [scanMode, setScanMode] = useState<'barcode' | 'receipt'>('barcode');
  
  // 영수증 촬영 관련 상태
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPhotoConfirm, setShowPhotoConfirm] = useState(false);
  
  // 바코드 직접 입력 상태
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [manualCategoryId, setManualCategoryId] = useState<number | null>(null);
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null); // 선택된 카테고리 ID
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  // 컴포넌트 마운트 또는 포커스 시 권한 요청 및 카테고리 로드
  useEffect(() => {
    const requestAndFetch = async () => {
      if (isFocused) {
        if (!hasPermission) {
          console.log('[PERMISSION] 카메라 권한 요청');
          await requestPermission();
        }
        console.log('[DATA] 카테고리 목록 로드');
        const categories = await getAllCategories();
        setCategoryList(categories);
      }
    };
    requestAndFetch();
  }, [hasPermission, isFocused]);
  
  // 카테고리별 기본 유통기한 (일수 기준) - 이 함수는 DB와 연동되지 않아 잠재적 버그가 있음
  const getDefaultExpiryDays = (categoryId: number): number => {
    const category = categoryList.find(c => c.id === categoryId);
    // A more robust solution would be to have default_expiry_days in the category object
    // For now, we use a fallback map if not found.
    const fallbackMap: { [key: number]: number } = { 1: 14, 2: 30, 5: 14, 8: 21, 9: 14, 10: 14, 13: 21, 15: 14, 17: 7, 20: 3, 23: 14, 25: 90, 29: 30, 30: 180, 31: 365, 32: 180 };
    return fallbackMap[categoryId] || 30;
  };

  // 스캔된 데이터가 변경되거나 선택된 카테고리가 변경될 때 기본 유통기한 설정
  useEffect(() => {
    if (scannedData) {
      const categoryId = selectedCategoryId || scannedData.category_id;
      if (categoryId) {
        const defaultDays = getDefaultExpiryDays(categoryId);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + defaultDays);
        const formattedDate = futureDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        setExpiryDate(formattedDate);
      }
    }
  }, [scannedData, selectedCategoryId]);

  // --- 사진 촬영 핸들러 ---
  const takePhoto = async () => {
    console.log('\n--- [PHOTO] 영수증 사진 촬영 시작 ---');
    try {
      const photo = await camera.current?.takePhoto({ qualityPrioritization: 'quality', flash: 'auto', enableShutterSound: true });
      if (photo) {
        const imageUri = Platform.OS === 'android' ? `file://${photo.path}` : photo.path;
        setCapturedImage(imageUri);
        setShowPhotoConfirm(true);
      } else {
        Alert.alert('오류', '사진 촬영에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('[PHOTO-ERROR] 사진 촬영 중 오류:', error);
      Alert.alert('오류', '사진 촬영 중 문제가 발생했습니다.');
    }
  };

  const uploadReceiptToBackend = async (imageUri: string) => {
    console.log('\n--- [OCR] 영수증 업로드 시작 ---');
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const formData = new FormData();
      formData.append('image', { uri: imageUri, type: 'image/jpeg', name: 'receipt.jpg' } as any);
      formData.append('user_id', user.id);

      const response = await fetch(`${BACKEND_URL}/upload_receipt`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      Alert.alert('성공', `${data.processed_count || 0}개 품목이 재고에 추가되었습니다.`, [
        { text: '확인', onPress: () => navigation.navigate('index' as never) }
      ]);
    } catch (error: any) {
      console.error('[OCR-ERROR] 업로드 실패:', error);
      Alert.alert('오류', '영수증 업로드 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsePhoto = () => {
    setShowPhotoConfirm(false);
    if (capturedImage) {
      uploadReceiptToBackend(capturedImage);
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setShowPhotoConfirm(false);
  };

  // --- 모드 전환 핸들러 ---
  const handleModeChange = (value: string) => {
    const newMode = value as 'barcode' | 'receipt';
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
    setScanMode(newMode);
  };
  
  // --- 직접 입력 핸들러 ---
  const handleShowManualEntry = () => {
    setShowManualEntry(true);
  };

  const handleManualSubmission = async () => {
    if (!manualName || !manualCategoryId) {
      Alert.alert('입력 오류', '상품 이름과 카테고리를 모두 선택해주세요.');
      return;
    }
    
    try {
      await supabase.from('products').upsert([{
        barcode: scannedBarcode,
        product_name: manualName,
        category_id: manualCategoryId,
        source: 'user_contribution',
        verified: false,
      }], { onConflict: 'barcode' });

      await supabase.from('inventory').insert([{
        name: manualName,
        barcode: scannedBarcode,
        category_id: manualCategoryId,
        expiry_date: expiryDate,
        quantity: 1,
      }]);

      Alert.alert('저장 성공', '상품이 재고에 추가되었습니다.');
      setShowManualEntry(false);
      handleCloseModal();
      navigation.navigate('index' as never);
    } catch (error: any) {
      console.error('[MANUAL-ERROR] 제출 중 오류:', error);
      Alert.alert('오류', '상품 정보 제출 중 문제가 발생했습니다.');
    }
  };

  // --- Code Scanner 훅 구현 ---
  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13'],
    onCodeScanned: async (codes) => {
      if (isProcessing || codes.length === 0) return;
      
      const barcode = codes[0].value;
      setIsProcessing(true);
      setIsLoading(true);
      Vibration.vibrate(100);

      try {
        const response = await axios.post(`${BACKEND_URL}/lookup_barcode`, { barcode });
        if (response.data.status === 'not_found') {
          setScannedBarcode(barcode);
          setError('해당 바코드의 상품 정보를 찾을 수 없습니다.');
        } else if (response.data && response.data.data?.product_name) {
          setScannedData({ ...response.data.data, name: response.data.data.product_name, barcode });
        } else {
          setError('서버 응답 형식이 올바르지 않습니다.');
        }
      } catch (err: any) {
        console.error('[ERROR] 바코드 API 호출 실패:', err.response?.data || err.message);
        setScannedBarcode(barcode);
        setError('해당 바코드의 상품 정보를 찾을 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  const handleCloseModal = () => {
    setScannedData(null);
    setError(null);
    setExpiryDate('');
    setSelectedCategoryId(null);
    setIsProcessing(false);
  };

  const handleAddToInventory = async () => {
    if (!scannedData || !expiryDate) {
      Alert.alert('입력 오류', '유통기한을 입력해주세요.');
      return;
    }

    const categoryId = selectedCategoryId || scannedData.category_id;
    const newInventoryItem = {
      name: scannedData.name,
      category_id: categoryId,
      expiry_date: expiryDate,
      barcode: scannedData.barcode,
      quantity: 1,
    };

    try {
      const { error: dbError } = await supabase.from('inventory').insert([newInventoryItem]);
      if (dbError) throw dbError;
      Alert.alert('저장 성공', '재고에 상품이 추가되었습니다.');
      handleCloseModal();
      navigation.navigate('index' as never);
    } catch (error: any) {
      console.error('[INVENTORY-ERROR] 재고 추가 중 예외 발생:', error);
      Alert.alert('오류', '재고 추가 중 문제가 발생했습니다.');
    }
  };

  if (device == null) return <View style={styles.container}><Text style={styles.message}>카메라를 찾을 수 없습니다.</Text></View>;
  if (!hasPermission) return <View style={styles.container}><Text style={styles.message}>카메라 권한이 필요합니다.</Text><Button onPress={requestPermission} title="권한 요청" /></View>;

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && !scannedData && !error && !showPhotoConfirm}
        codeScanner={scanMode === 'barcode' ? codeScanner : undefined}
        photo={scanMode === 'receipt' ? true : undefined} // Explicitly undefined
        key={`camera-${scanMode}`}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <LottieView source={require('../../assets/images/loading/Cooking - Frying Pan.json')} autoPlay loop style={styles.lottieAnimation} />
        </View>
      )}
      
      <ModeToggle scanMode={scanMode} onModeChange={handleModeChange} />
      
      {scanMode === 'receipt' && (
        <View style={styles.shutterButtonContainer}>
          <TouchableOpacity style={styles.shutterButton} onPress={takePhoto} />
        </View>
      )}
      
      <Modal transparent={true} visible={!!scannedData || !!error} animationType="slide" onRequestClose={handleCloseModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {scannedData && (
              <>
                <Text style={styles.modalTitle}>상품 정보</Text>
                <Text style={styles.modalText}>{scannedData.name}</Text>
                <Text style={styles.modalLabel}>카테고리 수정</Text>
                <FlatList
                  data={categoryList}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item: cat }) => (
                    <TouchableOpacity
                      style={[(selectedCategoryId || scannedData.category_id) === cat.id ? styles.selectedCategory : styles.categoryItem]}
                      onPress={() => setSelectedCategoryId(cat.id)}
                    >
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text style={styles.categoryText}>{cat.name}</Text>
                    </TouchableOpacity>
                  )}
                />
                <Text style={styles.modalLabel}>유통기한</Text>
                <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={expiryDate} onChangeText={setExpiryDate} />
                <View style={styles.expiryButtonsContainer}>
                  {/* Expiry buttons */}
                </View>
                <Button title="재고에 추가" onPress={handleAddToInventory} />
              </>
            )}
            {error && (
              <>
                <Text style={styles.modalTitle}>오류</Text>
                <Text style={styles.modalText}>{error}</Text>
                {error.includes('상품 정보를 찾을 수 없습니다') && (
                  <View style={styles.errorButtonContainer}>
                    <Button title="직접 입력" onPress={handleShowManualEntry} />
                    <Button title="취소" onPress={handleCloseModal} />
                  </View>
                )}
              </>
            )}
            {!error && <Button title="닫기" onPress={handleCloseModal} />}
          </View>
        </View>
      </Modal>

      <PhotoConfirmModal visible={showPhotoConfirm} imageUri={capturedImage} onRetake={handleRetakePhoto} onUsePhoto={handleUsePhoto} />

      <Modal visible={showManualEntry} animationType="slide" onRequestClose={() => setShowManualEntry(false)}>
        <SafeAreaView style={styles.manualEntrySafeArea}>
          <ScrollView style={styles.manualEntryScrollView}>
            <View style={styles.manualEntryContainer}>
              <Text style={styles.manualEntryTitle}>상품 정보 직접 입력</Text>
              <Text style={styles.manualEntryLabel}>바코드</Text>
              <Text style={styles.manualEntryBarcode}>{scannedBarcode}</Text>
              <Text style={styles.manualEntryLabel}>상품 이름</Text>
              <TextInput style={styles.manualInput} placeholder="상품 이름을 입력하세요" value={manualName} onChangeText={setManualName} />
              <Text style={styles.manualEntryLabel}>카테고리</Text>
              <FlatList
                data={categoryList}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item: cat }) => (
                  <TouchableOpacity
                    style={[manualCategoryId === cat.id ? styles.selectedCategory : styles.categoryItem]}
                    onPress={() => setManualCategoryId(cat.id)}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={styles.categoryText}>{cat.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <Text style={styles.manualEntryLabel}>유통기한</Text>
              <TextInput style={styles.manualInput} placeholder="YYYY-MM-DD" value={expiryDate} onChangeText={setExpiryDate} />
              <View style={styles.manualEntryButtons}>
                <TouchableOpacity style={[styles.manualButton, styles.manualCancelButton]} onPress={() => setShowManualEntry(false)}>
                  <Text style={styles.manualButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.manualButton, styles.manualSubmitButton]} onPress={handleManualSubmission}>
                  <Text style={styles.manualButtonText}>재고에 추가</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
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
  modalLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 15, marginBottom: 8, alignSelf: 'flex-start' },
  modalText: { fontSize: 16, marginBottom: 8 },
  input: { width: '100%', height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginTop: 10, paddingHorizontal: 10 },
  expiryButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 10, marginBottom: 15 },
  expiryButton: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#BBDEFB' },
  expiryButtonText: { color: '#1976D2', fontSize: 12, fontWeight: '600' },
  buttonContainer: { marginTop: 15, width: '100%' },
  shutterButtonContainer: { position: 'absolute', bottom: 40, alignSelf: 'center' },
  shutterButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'white' },
  manualEntryScrollView: {
    flex: 1,
  },
  manualEntryContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40, // Ensure space for buttons
    backgroundColor: 'white'
  },
  manualEntryTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  manualEntryLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  manualEntryBarcode: { fontSize: 18, color: '#007AFF', marginBottom: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8, textAlign: 'center' },
  manualInput: { width: '100%', height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 8, marginBottom: 20, paddingHorizontal: 15, fontSize: 16 },
  manualEntryButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  manualButton: { flex: 0.48, paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  manualCancelButton: { backgroundColor: '#6c757d' },
  manualSubmitButton: { backgroundColor: '#007bff' },
  manualButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  loadingContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  manualEntrySafeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  categorySelector: {},
  categoryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, margin: 5, borderRadius: 20, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0' },
  selectedCategory: { backgroundColor: '#E3F2FD', borderColor: '#2196F3' },
  categoryIcon: { fontSize: 18, marginRight: 6 },
  categoryText: { fontSize: 12 },
});
