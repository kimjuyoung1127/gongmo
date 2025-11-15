import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Image } from 'react-native';

interface PhotoConfirmModalProps {
  visible: boolean;
  imageUri: string | null;
  onRetake: () => void;
  onUsePhoto: () => void;
}

export const PhotoConfirmModal: React.FC<PhotoConfirmModalProps> = ({
  visible,
  imageUri,
  onRetake,
  onUsePhoto
}) => {
  if (!visible) return null;

  // 이미지 소스 처리
  const getImageSource = () => {
    if (!imageUri) return null;
    console.log('[PHOTO] 이미지 원본 URI:', imageUri);
    
    // URI에 이미 프로토콜이 포함된 경우
    if (imageUri.startsWith('file://')) {
      console.log('[PHOTO] file:// 프로토콜 있음, 그대로 사용');
      return { uri: imageUri };
    }
    
    // 안드로이드 캐시 경로인 경우
    if (Platform.OS === 'android' && imageUri.startsWith('/data/user/')) {
      console.log('[PHOTO] 안드로이드 캐시 경로, file:// 추가');
      return { uri: `file://${imageUri}` };
    }
    
    // 그 외의 경우는 그대로 사용
    console.log('[PHOTO] 일반 경로, 그대로 사용');
    return { uri: imageUri };
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onRetake}>
      <View style={styles.photoConfirmContainer}>
        <Text style={styles.photoConfirmTitle}>사진 확인</Text>
        
        {imageUri && (
          <Image 
            source={getImageSource()} 
            style={styles.capturedImage}
            onError={(error) => console.log('[PHOTO] 이미지 로드 오류:', error.nativeEvent?.error || error)}
            onLoad={() => console.log('[PHOTO] 이미지 로드 성공:', imageUri)}
          />
        )}
        
        <View style={styles.photoConfirmButtons}>
          <TouchableOpacity 
            style={[styles.photoConfirmButton, styles.retakeButton]} 
            onPress={onRetake}
          >
            <Text style={styles.photoConfirmButtonText}>다시 찍기</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.photoConfirmButton, styles.usePhotoButton]} 
            onPress={onUsePhoto}
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
  );
};

const styles = StyleSheet.create({
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
});
