# 🚀 자동 배포 워크플로우

## 📋 배포 프로세스

### **백엔드 (Render)** ✅ 자동화 완료
```
GitHub Push → Render 자동 감지 → 자동 빌드 → 자동 배포
```
- main 브랜치에 푸시하면 **1-2분 내** 자동 배포됨
- render.yaml 설정으로 자동화 구성됨

### **프론트엔드 (APK)** ⚙️ 설정 필요
```
GitHub Push → GitHub Actions → APK 빌드 → 자동 배포
```

## 🔄 개발 시나리오

### **시나리오 1: 백엔드 API 수정**
```bash
git add backend/
git commit -m "API 기능 개선"
git push origin main
```
→ **자동 반영됨** (1-2분)

### **시나리오 2: 앱 UI 수정**
```bash
git add app/
git commit -m "UI 개선"
git push origin main
```
→ **APK 자동 빌드됨** (10-15분)

### **시나리오 3: 둘 다 수정**
```bash
git add backend/ app/
git commit -m "전체 기능 개선"
git push origin main
```
→ **둘 다 자동 반영됨**

## ⚙️ 설정 필요한 항목

### **1. GitHub Secrets**
```
EXPO_TOKEN:                # Expo 계정 토큰
EXPO_PUBLIC_BACKEND_URL:   # Render 배포 URL
EXPO_PUBLIC_SUPABASE_URL:  # Supabase URL
EXPO_PUBLIC_SUPABASE_ANON_KEY: # Supabase 키
```

### **2. 설정 방법**
1. GitHub → Repository → Settings → Secrets
2. 위 4개 항목 등록
3. 푸시하면 자동 빌드 시작

## 📱 APK 다운로드
- GitHub Actions 탭에서 빌드된 APK 다운로드
- 매번 최신 버전 자동 생성
- 이전 버전 보관 가능

## ⚡ 팁
- **핫픽스:** 개발 브랜치에서 테스트 후 main 머지
- **버전 관리:** Git 태그로 버전 기록
- **테스트:** 스테이징용 별도 워크플로우 가능
