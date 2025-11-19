import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

// 정보 카드 컴포넌트의 props 인터페이스 정의
interface InfoCardProps {
  emoji: string
  title: string
  subtitle: string
  children?: React.ReactNode
  variant?: 'default' | 'warning'
}

// 정보 카드 컴포넌트 - 다양한 정보를 시각적으로 표시하는 재사용 가능한 컴포넌트
export default function InfoCard({ emoji, title, subtitle, children, variant = 'default' }: InfoCardProps) {
  return (
    <View style={[styles.card, variant === 'warning' && styles.warningCard]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      {children && <View style={styles.content}>{children}</View>}
    </View>
  )
}

// 스타일 정의
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative', // Add this line
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  content: {
    marginTop: 12,
  }
})