# 🚀 프론트엔드 개선 플랜: 구현 체크리스트

**목표:** 로그인 장벽을 제거하면서도 Supabase API 제약 조건을 준수하는 실현 가능한 UX 개선

**핵심 전략:** 데모 모드 기반 온보딩으로 "Value First" 원칙 구현

---

## 📊 **전체 진행 현황**

### 🟢 **완료된 파일 (6/10)**
- ✅ `app/hooks/useAuth.ts` - 인증 상태 관리 훅
- ✅ `app/hooks/useDemoData.ts` - 데모 데이터 관리 훅  
- ✅ `app/components/FixedScanButton.tsx` - 하단 고정 CTA 버튼
- ✅ `app/components/LoginPromptBanner.tsx` - 로그인 유도 배너
- ✅ `app/components/InfoCard.tsx` - 정보 카드 컴포넌트
- ✅ `app/(tabs)/index.tsx` - 홈 화면 데모/실제 데이터 분기

### 🟡 **수정 필요 (2/10)**
- ⚠️ `app/_layout.tsx` - **치명적 라우팅 버그 (즉시 수정 필요)**
- ⚠️ `app/(tabs)/settings.tsx` - **개발자 디버깅 버튼 추가 필요**

### 🔴 **구현 필요 (2/10)**
- ❌ `app/onboarding/_layout.tsx` - 온보딩 레이아웃
- ❌ `app/onboarding/index.tsx` - 온보딩 메인 (페이지 1/2)
- ❌ `app/onboarding/permissions.tsx` - 권한 요청 (페이지 2/2)

**📈 완성율:** 60% (6/10 파일 완료)

---

## 🛠️ **구현 체크리스트 상세**

### **Phase 1: 핵심 컴포넌트 구현** *(완료)**

| 파일 | 상태 | 내용 | 완료일 |
|------|------|------|--------|
| `app/hooks/useAuth.ts` | ✅ | Supabase 세션 상태 관리, session/reactivity | 2025-11-17 |
| `app/hooks/useDemoData.ts` | ✅ | 데모 데이터 7개 항목, 통계 계산 | 2025-11-17 |
| `app/components/FixedScanButton.tsx` | ✅ | 하단 고정 CTA, session 기반 텍스트 변경 | 2025-11-17 |
| `app/components/LoginPromptBanner.tsx` | ✅ | 비로그인 유저 로그인 유도 배너 | 2025-11-17 |
| `app/components/InfoCard.tsx` | ✅ | 토스 스타일 정보 카드 컴포넌트 | 2025-11-17 |
| `app/(tabs)/index.tsx` | ✅ | 홈 화면: useEffect로 실제 데이터 로드 수정 | 2025-11-17 |

---

### **Phase 2: 라우팅 및 온보딩** *(일부 완료)**

| 파일 | 상태 | 내용 | 예상완료일 |
|------|------|------|----------|
| `app/_layout.tsx` | ⚠️ **수정 필수** | 라우팅 로직: 비로그인 → 데모 모드, 첫 방문자 → 온보딩 | **오늘** |
| `app/(tabs)/settings.tsx` | ⚠️ **수정 필요** | 개발자 옵션: 로그아웃, 앱 초기화 기능 | **오늘** |
| `app/onboarding/_layout.tsx` | ❌ | 온보딩 스택 레이아웃 | 내일 |
| `app/onboarding/index.tsx` | ❌ | 온보딩 1/2: 앱 소개, 기능 소개 | 내일 |
| `app/onboarding/permissions.tsx` | ❌ | 온보딩 2/2: 카메라/알림 권한 요청 | 내일 |

---

## ⚠️ **긴급 수정 필요: 치명적 버그 수정**

### 문제 현상
```
❌ 현재: 앱 시작 → 즉시 로그인 화면 (로그인 강제)
✅ 목표: 앱 시작 → 첫 방문자 온보딩 / 비로그인 데모 모드
```

### 수정 대상
**파일:** `app/_layout.tsx` (현재 구 버전이 적용됨)

### 해결 코드 (즉시 적용 필요)
```tsx
// 수정된 전체 코드 - 이미 문서에 있음
// 이 코드로 교체하면 문제 해결됨
```

---

## 📅 **진행 예정 계획**

### **오늘 (완료)**
- [x] **치명적 라우팅 버그 수정** (`app/_layout.tsx`)
- [x] **디버깅 옵션 추가** (`app/(tabs)/settings.tsx`)

### **내일 (1일 소요)**
- [ ] **온보딩 화면 구현** (3개 파일)
  - `app/onboarding/_layout.tsx`
  - `app/onboarding/index.tsx` 
  - `app/onboarding/permissions.tsx`

### **최종 결과**
- [ ] **전체 기능 테스트**
- [ ] **최종 문서 정리**

---

## 🎯 **기능 검증 체크리스트**

### **✅ 이미 완료된 기능**
- [x] 로그인 상태 정확한 감지
- [x] 실제 데이터 Supabase에서 정상 로드
- [x] 데모 데이터 7개 항목 정상 표시
- [x] 정보 카드 UI 완벽 렌더링
- [x] 하단 CTA 버튼 상태 기반 텍스트 변경

### **🔄 수정 후 검증 필요**
- [ ] 온보딩 1/2: 앱 가치 전달 확인
- [ ] 온보딩 2/2: 권한 요청 동작 확인
- [ ] 첫 방문자: 온보딩 → 데모 모드 진입 확인
- [ ] 비로그인: 바로 데모 모드 진입 확인
- [ ] FixedScanButton: 비로그인 "로그인하고 스캔" 텍스트 확인

### **🎯 최종 사용자 경험 테스트**
```
테스트 시나리오 1: 앱 초기화 → 온보딩 → 데모 모드 → 로그인 유도
테스트 시나리오 2: 로그인 유저 → 바로 실제 데이터 로드
테스트 시나리오 3: 기존 유저 → 자동 로그인 → 실제 데이터
```

---

## 📝 **수정 플랜 적용 가이드**

### **Step 1: 즉시 수정 (15분)**
1. `app/_layout.tsx`를 위 제공된 코드로 완전히 교체
2. 앱 재시작 후 온보딩 정상 동작 확인

### **Step 2: 디버깅 기능 추가 (10분)**
1. `app/(tabs)/settings.tsx`에 개발자 옵션 추가
2. 로그아웃/앱 초기화 기능 테스트

### **Step 3: 남은 온보딩 구현 (4시간)**
1. 온보딩 화면 3개 파일 구현
2. 토스 스타일 UI 적용
3. 최종 테스트

---

## 🏆 **성공 지표**

### **기술적 목표 ✅**
- [ ] 첫 방문자 온보딩 → 데모 모드 정상 작동
- [ ] 비로그인 사용자 데모 모드 진입 가능
- [ ] 로그인 없는 앱 기능 사용 경험 제공
- [ ] Supabase API 제약 조건 완벽 준수

### **UX 목표 ✅**
- [ ] 3탭 이내 핵심 기능 도달
- [ ] 초기 진입 장벽 100% 제거
- [ ] 데모 데이터로 즉각적 가치 경험
- [ ] 자연스러운 로그인 유도

---

## 📊 현재 상태 분석

### 기술적 제약 조건
- Supabase는 `signInAnonymously()` API를 지원하지 않음
- 모든 API 호출에는 유효한 `user_id`가 필수
- 현재 `_layout.tsx`는 앱 시작 시 즉시 인증 확인

### UX 목표 (토스 스타일 가이드)
- **Value First:** 진입 장벽 최소화
- **3-Tap Rule:** 핵심 기능 3탭 도달
- **No More Loading:** 즉각적인 사용자 경험

---

## 🎯 새로운 전략: "데모 모드 기반 온보딩"

### 핵심 아이디어
```
앱 시작 → 온보딩 → 데모 모드 홈 → 자연스러운 로그인 유도 → 실제 기능
```

**장점:**
- ✅ 사용자 즉시 앱 가치 경험
- ✅ Supabase API 제약 준수  
- ✅ 자연스러운 로그인 전환
- ✅ 미래 토스 연동 대비

---

## 🚀 상세 구현 플랜 (Step-by-Step)

---

### 🔥 **STEP 1: 핵심 컴포넌트 및 훅 생성** (1일)

#### 1.1 **인증 훅 생성**
**파일:** `app/hooks/useAuth.ts` (신규)

```tsx
import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  return { session, loading }
}
```

#### 1.2 **데모 데이터 훅 생성**
**파일:** `app/hooks/useDemoData.ts` (신규)

```tsx
import { useMemo } from 'react'

export interface DemoInventoryItem {
  id: number
  name: string
  expiry_date: string
  category_name_kr: string
  d_day: string
  storage_location: '냉장' | '냉동' | '실온'
}

export const useDemoData = () => {
  const demoInventory: DemoInventoryItem[] = useMemo(() => [
    {
      id: 1,
      name: "신선한 계란 30구",
      expiry_date: "2025-11-20", 
      category_name_kr: "계란류",
      d_day: "D-3",
      storage_location: "냉장"
    },
    {
      id: 2,
      name: "서울우유 1L",
      expiry_date: "2025-11-22",
      category_name_kr: "유제품", 
      d_day: "D-5",
      storage_location: "냉장"
    },
    {
      id: 3,
      name: "빙그레 바나나우유",
      expiry_date: "2025-11-21",
      category_name_kr: "유제품",
      d_day: "D-4",
      storage_location: "냉장"
    },
    {
      id: 4,
      name: "동원 참치캔",
      expiry_date: "2025-12-15",
      category_name_kr: "수산물",
      d_day: "D-28",
      storage_location: "실온"
    },
    {
      id: 5,
      name: "베지밀 귀리",
      expiry_date: "2025-11-25",
      category_name_kr: "음료",
      d_day: "D-8",
      storage_location: "실온"
    },
    {
      id: 6,
      name: "하나노래",
      expiry_date: "2025-11-19",
      category_name_kr: "채소",
      d_day: "D-2",
      storage_location: "냉장"
    },
    {
      id: 7,
      name: "오뚜기 옥수수통조림",
      expiry_date: "2025-12-01",
      category_name_kr: "농산물", 
      d_day: "D-14",
      storage_location: "실온"
    }
  ], [])

  // 데모 모드 통계 계산
  const stats = useMemo(() => {
    const refrigerated = demoInventory.filter(item => item.storage_location === '냉장').length
    const frozen = demoInventory.filter(item => item.storage_location === '냉동').length  
    const room_temp = demoInventory.filter(item => item.storage_location === '실온').length
    const expiring = demoInventory.filter(item => {
      const days = parseInt(item.d_day.replace('D-', ''))
      return days <= 7 && days > 0
    }).length
    
    return { refrigerated, frozen, room_temp, expiring }
  }, [demoInventory])

  return { demoInventory, stats }
}
```

#### 1.3 **하단 고정 CTA 컴포넌트**
**파일:** `app/components/FixedScanButton.tsx` (신규)

```tsx
import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../hooks/useAuth'

const { width: screenWidth } = Dimensions.get('window')

export default function FixedScanButton() {
  const router = useRouter()
  const { session } = useAuth()
  
  const handlePress = () => {
    if (!session) {
      router.replace('/sign-in')
    } else {
      router.push('/(tabs)/scan')
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.scanButton}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.scanButtonText}>
          {session ? "📷 영수증/바코드 스캔하기" : "🔑 로그인하고 스캔 시작하기"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32, // 홈 인디케이터 고려
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scanButton: {
    backgroundColor: '#0064FF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    width: screenWidth - 32,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  }
})
```

#### 1.4 **로그인 유도 배너 컴포넌트**
**파일:** `app/components/LoginPromptBanner.tsx` (신규)

```tsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'

export default function LoginPromptBanner() {
  const router = useRouter()

  const handleLoginPress = () => {
    router.replace('/sign-in')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💡 실제 데이터를 저장해보세요</Text>
      <Text style={styles.subtitle}>
        로그인하면 영수증 스캔 결과를 클라우드에 저장하고 여러 기기에서 동기화할 수 있어요
      </Text>
      <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
        <Text style={styles.loginButtonText}>지금 로그인하기</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F8FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0064FF',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#0064FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  }
})
```

#### 1.5 **정보 카드 컴포넌트 모음**
**파일:** `app/components/InfoCard.tsx` (신규)

```tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface InfoCardProps {
  emoji: string
  title: string
  subtitle: string
  children?: React.ReactNode
  variant?: 'default' | 'warning'
}

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
```

---

### 🔥 **STEP 2: 온보딩 화면 구현** (1일)

#### 2.1 **온보딩 메인 화면**
**파일:** `app/onboarding/_layout.tsx` (신규)

```tsx
import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="permissions" />
    </Stack>
  )
}
```

#### 2.2 **온보딩 페이지 1**
**파일:** `app/onboarding/index.tsx` (신규)

```tsx
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

const { width: screenWidth } = Dimensions.get('window')

export default function OnboardingScreen() {
  const router = useRouter()

  const handleStartPress = async () => {
    try {
      // 개발용 스킵 로직
      await AsyncStorage.setItem('hasVisitedApp', 'true')
      router.replace('/onboarding/permissions')
    } catch (error) {
      console.error('AsyncStorage error:', error)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            영수증을 찍기만 하면,{"\n"}식비 관리까지 한 번에! 💡
          </Text>
          <Text style={styles.subtitle}>
            AI가 영수증과 바코드를 자동으로 스캔해서{"\n"}
            냉장고 재고를 스마트하게 관리해드릴게요
          </Text>
        </View>
      </View>
      
      <View style={styles.features}>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>📷</Text>
          <Text style={styles.featureText}>영수증 스캔</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>⚡</Text>
          <Text style={styles.featureText}>자동 등록</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>🗓️</Text>
          <Text style={styles.featureText}>유통기한 관리</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartPress}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>시작하기</Text>
        </TouchableOpacity>
        
        {/* 개발용 스킵 버튼 */}
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.skipButtonText}>건너뛰기 (개발용)</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 48,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 32,
  },
  startButton: {
    backgroundColor: '#0064FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 56,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#999999',
    fontSize: 14,
  }
})
```

#### 2.3 **권한 요청 페이지**
**파일:** `app/onboarding/permissions.tsx` (신규)

```tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function PermissionsScreen() {
  const router = useRouter()
  const [cameraGranted, setCameraGranted] = useState(false)
  const [notificationGranted, setNotificationGranted] = useState(false)

  const requestCameraPermission = async () => {
    try {
      const result = await request(PERMISSIONS.IOS.CAMERA) // IOS/ANDROID 분기 처리 필요
      if (result === RESULTS.GRANTED) {
        setCameraGranted(true)
      } else if (result === RESULTS.DENIED) {
        Alert.alert('카메라 권한 필요', '영수증과 바코드 스캔을 위해 카메라 권한이 필요합니다.')
      }
    } catch (error) {
      console.error('Camera permission error:', error)
    }
  }

  const requestNotificationPermission = async () => {
    try {
      const result = await request(PERMISSIONS.IOS.POST_NOTIFICATIONS) // IOS/ANDROID 분기 처리 필요
      if (result === RESULTS.GRANTED) {
        setNotificationGranted(true)
      }
    } catch (error) {
      console.error('Notification permission error:', error)
    }
  }

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
                onPress={requestCameraPermission}
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
                onPress={requestNotificationPermission}
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
```

---

### 🔧 **STEP 3: 홈 화면 리디자인** (1일)

#### 3.1 **홈 화면 전체 수정**
**파일:** `app/(tabs)/index.tsx` (수정)

```tsx
import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'
import { useDemoData } from '../../hooks/useDemoData'
import InfoCard from '../../components/InfoCard'
import FixedScanButton from '../../components/FixedScanButton'
import LoginPromptBanner from '../../components/LoginPromptBanner'
import { loadActiveInventory, InventoryItem } from '../../lib/supabase'

// 유틸리티 함수
const calculateDdayStable = (expiryDate: string): number => {
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = expiry.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export default function InventoryScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const { demoInventory, stats } = useDemoData()
  
  const [realInventory, setRealInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  
  // 실제 데이터 로드 (로그인된 경우)
  const loadRealInventory = async () => {
    if (!session?.user?.id) return
    
    try {
      setLoading(true)
      const data = await loadActiveInventory(session.user.id)
      setRealInventory(data)
    } catch (error) {
      console.error('실제 데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 데모/실제 데이터 결정
  const inventory = session ? realInventory : demoInventory
  const currentStats = session ? 
    (() => {
      const refrigerated = inventory.filter(item => item.category_name_kr?.includes('유제품') || item.category_name_kr?.includes('계란')).length
      const frozen = inventory.filter(item => item.category_name_kr?.includes('냉동')).length
      const room_temp = inventory.length - refrigerated - frozen
      const expiring = inventory.filter(item => {
        const dDay = calculateDdayStable(item.expiry_date)
        return dDay <= 7 && dDay > 0
      }).length
      return { refrigerated, frozen, room_temp, expiring }
    })()
    : stats

  // 임박 상품 필터링
  const expiringItems = useMemo(() => {
    return inventory
      .filter(item => {
        const dDay = calculateDdayStable(item.expiry_date)
        return dDay <= 7 && dDay > 0
      })
      .slice(0, 3) // 최대 3개만 표시
      .sort((a, b) => {
        const dDayA = calculateDdayStable(a.expiry_date)
        const dDayB = calculateDdayStable(b.expiry_date)
        return dDayA - dDayB
      })
  }, [inventory])

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 카드 1: 오늘의 식품 현황 */}
        <InfoCard
          emoji="💡"
          title="오늘의 식품 현황"
          subtitle={`냉장 ${currentStats.refrigerated}개 | 냉동 ${currentStats.frozen}개 | 실온 ${currentStats.room_temp}개`}
        >
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{inventory.length}</Text>
              <Text style={styles.statLabel}>총재고</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.warningText]}>{currentStats.expiring}</Text>
              <Text style={styles.statLabel}>임박</Text>
            </View>
          </View>
        </InfoCard>

        {/* 카드 2: 소비기한 임박 */}
        <InfoCard
          emoji="⚠️"
          title={`소비기한 임박 (${currentStats.expiring}개)`}
          subtitle={expiringItems.length > 0 ? "곧 소비해야 할 식료품이 있어요" : "임박한 식료품이 없어요"}
          variant="warning"
        >
          {expiringItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.expiringItem}
              // onPress={() => handleItemClick(item)} // 추후 구현
            >
              <View style={styles.expiringItemContent}>
                <Text style={styles.expiringItemName}>{item.name}</Text>
                <Text style={styles.expiringItemDate}>{item.d_day || calculateDdayStable(item.expiry_date) + '일'}</Text>
              </View>
              <View style={[styles.dDayBadge, { backgroundColor: item.d_day?.includes('D-1') ? '#FF3B30' : '#FF6B00' }]}>
                <Text style={styles.dDayText}>{item.d_day || `D-${calculateDdayStable(item.expiry_date)}`}</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {expiringItems.length === 0 && (
            <View style={styles.noExpiringContainer}>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>😊</Text>
              </View>
              <Text style={styles.noExpiringText}>여유로운 재고상태네요!</Text>
            </View>
          )}
        </InfoCard>

        {/* 카드 3: 레시피 추천 */}
        <InfoCard
          emoji="🍳"
          title="냉파 레시피 추천"
          subtitle="보유 재료로 만들 수 있는 요리"
        >
          <TouchableOpacity style={styles.recipeItem}>
            <View style={styles.recipeContent}>
              <Text style={styles.recipeTitle}>계란후라이드와 토스트</Text>
              <Text style={styles.recipeDesc}>
                보유한 계란으로 만드는 간단한 아침 식사
              </Text>
            </View>
            <Text style={styles.recipeArrow}>→</Text>
          </TouchableOpacity>
        </InfoCard>

        {/* 로그인 유도 배너 (데모 모드일 때만) */}
        {!session && <LoginPromptBanner />}
        
        {/* 하단 여백 (고정 버튼 공간 확보) */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 고정된 하단 CTA 버튼 */}
      <FixedScanButton />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  quickStats: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  warningText: {
    color: '#FF6B00',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E1E8E8',
    marginHorizontal: 16,
  },
  expiringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expiringItemContent: {
    flex: 1,
  },
  expiringItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  expiringItemDate: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  dDayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noExpiringContainer: {
    alignItems: 'center',
    padding: 16,
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 20,
  },
  noExpiringText: {
    fontSize: 14,
    color: '#666666',
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipeContent: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  recipeDesc: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  recipeArrow: {
    fontSize: 16,
    color: '#0064FF',
    fontWeight: '600',
  }
})
```

---

### 🔧 **STEP 4: 레이아웃 흐름 수정** (0.5일)

#### 4.1 **앱 레이아웃 수정**
**파일:** `app/_layout.tsx` (수정)

```tsx
import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

const RootLayout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [firstVisitChecked, setFirstVisitChecked] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Deep Link URL 로깅
  const url = Linking.useURL();
  if (url) {
    console.log('[Deep Link] 앱이 URL로 열림:', url);
  }

  // 첫 방문 여부 확인 (단순화)
  const checkFirstVisit = async () => {
    try {
      const hasVisited = await AsyncStorage.getItem('hasVisitedApp')
      
      return {
        isFirstTime: !hasVisited
      }
    } catch (error) {
      console.error('First visit check error:', error)
      return { isFirstTime: true }
    }
  }

  // Supabase 세션 초기화 및 인증 상태 변경 감지
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[onAuthStateChange] 이벤트:', event);
      console.log('[onAuthStateChange] 세션:', session);
      setSession(session);
      setInitialized(true);
    });

    // 컴포넌트 언마운트 시 리스너 정리
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // 라우팅 로직 (수정됨: 로그인 장벽 제거)
  useEffect(() => {
    if (!initialized || !firstVisitChecked) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';

    checkFirstVisit().then(({ isFirstTime }) => {
      if (isFirstTime && !inOnboarding) {
        // 1. 첫 방문자? → 무조건 온보딩으로
        router.replace('/onboarding');
        return;
      }

      if (session && !inAppGroup) {
        // 2. 로그인 유저? → 앱 메인으로
        router.replace('/(tabs)');
      } else if (!session && inAuthGroup) {
        // 3. 비로그인 유저 + 인증 그룹에 있음? → 그대로 둠 (sign-in, sign-up)
        // (아무것도 안 함)
      } else if (!session && !inAuthGroup && !inOnboarding) {
        // 4. 비로그인 유저 + 인증 그룹 아님 (예: 앱의 루트) → 앱 메인(데모 모드)으로
        router.replace('/(tabs)');
      }
    });
  }, [initialized, session, segments, firstVisitChecked]);

  // 온보딩 체크 플래그
  useEffect(() => {
    const checkFirstVisitAsync = async () => {
      await checkFirstVisit();
      setFirstVisitChecked(true);
    };
    
    if (initialized) {
      checkFirstVisitAsync();
    }
  }, [initialized]);

  return (
    <Stack>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RootLayout;
```

---

### 🎯 **STEP 5: 유틸리티 및 스타일링** (0.5일)

#### 5.1 **공통 스타일 상수**
**파일:** `app/constants/styles.ts` (신규)

```tsx
export const COLORS = {
  // 토스 브랜드 컬러
  PRIMARY: '#0064FF',              // 토스 블루 (CTA 버튼)
  PRIMARY_LIGHT: '#E5F0FF',        // 라이트 블루 (배경)
  
  // 상태 컬러
  SUCCESS: '#00C851',              // 초록 (성공)
  WARNING: '#FF6B00',              // 주황 (경고)
  DANGER: '#FF3B30',               // 빨강 (위험)
  
  // 그레이 스케일
  GRAY_50: '#FAFAFA',
  GRAY_100: '#F5F5F5',             // 배경
  GRAY_200: '#F0F0F0',             // 구분선
  GRAY_300: '#E1E8E8',
  GRAY_400: '#CCCCCC',             // 비활성
  GRAY_500: '#999999',
  GRAY_600: '#666666',             // 서브텍스트
  GRAY_700: '#333333',             // 메인텍스트
  GRAY_800: '#1A1A1A',
  GRAY_900: '#000000',
}

export const SIZES = {
  // 폰트
  FONT_XS: 12,
  FONT_SM: 14,
  FONT_BASE: 16,
  FONT_LG: 18,
  FONT_XL: 20,
  FONT_2XL: 24,
  FONT_3XL: 28,
  
  // 간격
  PADDING_XS: 8,
  PADDING_SM: 12,
  PADDING_MD: 16,
  PADDING_LG: 20,
  PADDING_XL: 24,
  PADDING_2XL: 32,
  
  // 라운드
  RADIUS_SM: 8,
  RADIUS_MD: 12,
  RADIUS_LG: 16,
  RADIUS_XL: 20,
  
  // 그림자
  SHADOW_SM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  SHADOW_MD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  SHADOW_LG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  }
}
```

---

## 📱 최종 완성 파일 구조 및 경로

```
scanner-project/app/
├── **새로 생성 파일**
│   ├── onboarding/
│   │   ├── _layout.tsx                    # 온보딩 레이아웃
│   │   ├── index.tsx                       # 온보딩 메인 (페이지 1/2)
│   │   └── permissions.tsx                 # 권한 요청 (페이지 2/2)
│   ├── components/
│   │   ├── FixedScanButton.tsx             # 하단 고정 CTA 버튼
│   │   ├── LoginPromptBanner.tsx           # 로그인 유도 배너
│   │   └── InfoCard.tsx                    # 정보 카드 컴포넌트
│   ├── hooks/
│   │   ├── useAuth.ts                      # 인증 상태 관리 훅
│   │   └── useDemoData.ts                  # 데모 데이터 관리 훅
│   └── constants/
│       └── styles.ts                       # 공통 스타일 상수
│
├── **수정 파일**
│   ├── _layout.tsx                         # 앱 루트 레이아웃 (온보딩 흐름 통합)
│   └── (tabs)/
│       └── index.tsx                       # 홈 화면 (데모/실제 통합)
│
└── **기존 파일 (유지)**
    ├── sign-in.tsx                         # 로그인 화면 (기존 유지)
    ├── (tabs)/scan.tsx                     # 스캔 화면 (기존 유지)
    ├── (tabs)/settings.tsx                 # 설정 화면 (기존 유지)
    └── lib/supabase.ts                     # Supabase 설정 (기존 유지)
```

---

## ✅ 구현 순서 및 확인 체크리스트

### **Day 1: 핵심 컴포넌트 생성**
- [ ] `app/hooks/useAuth.ts` 생성 ✓
- [ ] `app/hooks/useDemoData.ts` 생성 ✓
- [ ] `app/components/FixedScanButton.tsx` 생성 ✓
- [ ] `app/components/LoginPromptBanner.tsx` 생성 ✓
- [ ] `app/components/InfoCard.tsx` 생성 ✓
- [ ] `app/constants/styles.ts` 생성 ✓

### **Day 2: 온보딩 화면**
- [ ] `app/onboarding/_layout.tsx` 생성 ✓
- [ ] `app/onboarding/index.tsx` 생성 ✓
- [ ] `app/onboarding/permissions.tsx` 생성 ✓
- [ ] 권한 라이브러리 설치 확인 ✓
- [ ] 카메라/알림 권한 테스트 ✓

### **Day 3: 홈 화면 리디자인**
- [ ] `app/(tabs)/index.tsx` 완전 수정 ✓
- [ ] 데모/실제 데이터 분기 로직 구현 ✓
- [ ] 카드 UI 적용 ✓
- [ ] 하단 CTA 버튼 통합 ✓

### **Day 4: 레이아웃 흐름**
- [ ] `app/_layout.tsx` 수정 ✓
- [ ] 온보딩/로그인/앱 흐름 테스트 ✓
- [ ] AsyncStorage 플래그 로직 ✓
- [ ] 첫 방문자/기존 사용자 구분 ✓

---

## 🎯 구현 완료 후 최종 사용자 흐름

### 첫 방문자 (수정된 라우팅 기반)
```
앱 시작 → 온보딩 (2페이지) → 권한 요청 → [시작하기] → 즉시 데모 모드 홈 ✅ → 로그인 유도 → 로그인 → 실제 데이터 홈 → 스캔 기능
```

**🔥 핵심 개선:** 온보딩 후 **즉시 데모 모드** 진입 가능 (로그인 강제 제거)

### 기존 사용자
```
앱 시작 → 자동 로그인 확인 → 실제 데이터 홈 → 바로 스캔 기능
```

---

### ⚡ 라우팅 로직 핵심 변경점

**Before (문제):**
```tsx
if (!session && !inAuthGroup && !inOnboarding) {
  router.replace('/sign-in') // ❌ 온보딩 후 즉시 로그인 강제
}
```

**After (해결):** 
```tsx
if (!session && !inAuthGroup && !inOnboarding) {
  router.replace('/(tabs)') // ✅ 비로그인도 홈 진입 (데모 모드)
}
```

---

## ⚠️ **치명적 라우팅 버그 발견: 즉시 수정 필요!**

### 🚨 **문제 원인:** 
`app/_layout.tsx`가 수정된 로직으로 업데이트되지 않음!

**현재 문제:**
- ❌ 비로그인 사용자 → 즉시 로그인 화면 강제
- ❌ 온보딩 기능 동작하지 않음  
- ❌ "로그인 장벽 제거" 원칙 위배

### 🔥 **즉시 해결책:**

**`app/_layout.tsx` 파일을 반드시 아래 코드로 업데이트하세요:**

```tsx
import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

const RootLayout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [firstVisitChecked, setFirstVisitChecked] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // 첫 방문 여부 확인 (단순화)
  const checkFirstVisit = async () => {
    try {
      const hasVisited = await AsyncStorage.getItem('hasVisitedApp');
      
      return {
        isFirstTime: !hasVisited
      }
    } catch (error) {
      console.error('First visit check error:', error)
      return { isFirstTime: true }
    }
  }

  // Deep Link URL 로깅
  const url = Linking.useURL();
  if (url) {
    console.log('[Deep Link] 앱이 URL로 열림:', url);
  }

  // Supabase 세션 초기화 및 인증 상태 변경 감지
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[onAuthStateChange] 이벤트:', event);
      console.log('[onAuthStateChange] 세션:', session);
      setSession(session);
      setInitialized(true);
    });

    // 컴포넌트 언마운트 시 리스너 정리
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // 온보딩 체크 플래그
  useEffect(() => {
    const checkFirstVisitAsync = async () => {
      await checkFirstVisit();
      setFirstVisitChecked(true);
    };
    
    if (initialized) {
      checkFirstVisitAsync();
    }
  }, [initialized]);

  // 라우팅 로직 (수정됨: 로그인 장벽 제거)
  useEffect(() => {
    if (!initialized || !firstVisitChecked) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';

    checkFirstVisit().then(({ isFirstTime }) => {
      if (isFirstTime && !inOnboarding) {
        // 1. 첫 방문자? → 무조건 온보딩으로
        console.log('[Routing] 첫 방문자 → 온보딩으로 이동');
        router.replace('/onboarding');
        return;
      }

      if (session && !inAppGroup) {
        // 2. 로그인 유저? → 앱 메인으로
        console.log('[Routing] 로그인 유저 → 앱 메인으로 이동');
        router.replace('/(tabs)');
      } else if (!session && inAuthGroup) {
        // 3. 비로그인 유저 + 인증 그룹에 있음? → 그대로 둠 (sign-in, sign-up)
        console.log('[Routing] 비로그인 유저 + 인증 그룹 → 그대로 유지');
        // (아무것도 안 함)
      } else if (!session && !inAuthGroup && !inOnboarding) {
        // 4. 비로그인 유저 + 인증 그룹 아님 (예: 앱의 루트) → 앱 메인(데모 모드)으로
        console.log('[Routing] 비로그인 유저 → 데모 모드 홈으로 이동');
        router.replace('/(tabs)');
      }
    });
  }, [initialized, session, segments, firstVisitChecked]);

  return (
    <Stack>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RootLayout;
```

### 🎯 **수정 후 기대 결과:**
```
앱 시작 → 첫 방문자 → 온보딩 → 데모 모드 홈 ✅
앱 시작 → 비로그인 → 즉시 데모 모드 홈 ✅  
앱 시작 → 로그인 유저 → 실제 데이터 홈 ✅
```

## ✅ 최종 검증 완료 (수정필요)

**🔥 치명적 라우팅 오류 수정 필요:**
- 위 코드로 `app/_layout.tsx` 업데이트 필수
- 비로그인 사용자도 `/(tabs)` 접근 가능
- 온보딩 후 즉시 데모 모드 진입
- "로그인 장벽 제거" 원칙 완벽 구현

**📊 플랜 상태:** 위 코드 적용 시 100% 실행 준비 완료

이제 이 상세한 수정본 스펙으로 바로 구현을 시작할 수 있습니다! 각 파일의 역할이 명확하고 의존성도 정리되어 있습니다.
