import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'

interface DemoGuideModalProps {
  visible: boolean
  onClose: () => void
  itemType: 'expiry' | 'storage' | 'recipe' // 가이드 종류
  onCTAPress?: () => void // 즉시 전환 버튼 클릭 핸들러
  ctaText?: string // CTA 버튼 텍스트 (기본값: "신기하네요! 닫기")
}

export default function DemoGuideModal({ visible, onClose, itemType, onCTAPress, ctaText = "신기하네요! 닫기" }: DemoGuideModalProps) {
  const getContent = () => {
    switch(itemType) {
      case 'expiry':
        return {
          emoji: '📅',
          title: '유통기한, 외우지 마세요',
          desc: '영수증만 찍으면 AI가 품목별 적절한 소비기한을 자동으로 계산해서 D-Day를 알려드려요.'
        }
      case 'storage':
        return {
          emoji: '❄️',
          title: '냉장? 냉동? AI가 척척!',
          desc: '식품별로 어디에 보관해야 가장 신선한지 AI가 자동으로 분류해서 추천해드려요.'
        }
      case 'recipe':
        return {
          emoji: '🍳',
          title: '남은 재료로 뭐 해먹지?',
          desc: '냉장고 속 재료들을 조합해서 지금 바로 만들 수 있는 맛있는 레시피를 추천해드려요.'
        }
    }
  }

  const content = getContent()

  const handlePress = () => {
    if (onCTAPress) {
      onCTAPress()
    } else {
      onClose()
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          <Text style={styles.emoji}>{content?.emoji}</Text>
          <Text style={styles.title}>{content?.title}</Text>
          <Text style={styles.desc}>{content?.desc}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{ctaText}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#333' },
  desc: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  button: {
    backgroundColor: '#0064FF', // 토스 블루
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' }
})