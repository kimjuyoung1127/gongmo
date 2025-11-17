# 🚀 Render 백엔드 배포 완벽 가이드

## 📋 목차
- [🎯 배포 목표](#-배포-목표)
- [🔧 사전 준비 사항](#-사전-준비-사항)
- [📦 백엔드 배포 설정](#-백엔드-배포-설정)
- [⚙️ 환경 변수 설정](️-환경-변수-설정)
- [🚀 배포 단계](#-배포-단계)
- [🔄 자동 배포 설정](#-자동-배포-설정)
- [✅ 배포 후 테스트](#-배포-후-테스트)
- [📱 APK 연동](#-apk-연동)
- [⚡ 문제 해결](#-문제-해결)

---

## 🎯 배포 목표

**🚨 현재 문제점:** APK 배포 시 로컬 IP로 인한 스캔 기능 불능
```javascript
// 현재 문제 코드
export const BACKEND_URL = 'http://172.30.1.59:5000'; // ❌ 배포 시 작동 안 함
```

**✅ 해결 목표:** 
- 무료 클라우드 서버로 백엔드 배포
- HTTPS 프로토콜 보안 통신
- 앱에서 정상적인 API 연동
- 자동 배포 시스템 구축

---

## 🔧 사전 준비 사항

### **1. 최소 요구사항**
```
- RAM: 512MB (PaddleOCR 때문에 1GB 권장)
- CPU: 1 코어
- 스토리지: 1GB
- 비용: 무료 플랜으로 시작 가능
```

### **2. 필요 계정**
- [x] GitHub 계정 (이전 보유)
- [ ] Render 계정 (https://render.com/signup)
- [x] Expo 계정 (APK 빌드용)

### **3. 기술 스택 확인**
```python
# 현재 백엔드 기술 스택
Flask==2.3.3
PaddleOCR==2.7.3        # OCR 처리
opencv-python-headless   # 이미지 처리
Supabase==1.0.4         # DB 연동
requests==2.31.0        # 외부 API 호출
```

---

## 📦 백엔드 배포 설정

### **1. 프로젝트 구조**
```
backend/
├── api/app.py           # 메인 애플리케이션
├── run.py              # 서버 시작 파일
├── requirements.txt    # 의존성 목록
├── render.yaml         # Render 설정 파일 (신규)
└── .env               # 환경 변수
```

### **2. render.yaml 생성**
```yaml
services:
  - type: web
    name: scanner-backend
    env: python
    plan: free
    buildCommand: "pip install -r requirements.txt"
    startCommand: "gunicorn --bind 0.0.0.0:$PORT api.app:app"
    envVars:
      - key: PYTHON_VERSION
        value: "3.9"
      - key: CLOVA_OCR_SECRET_KEY
        sync: false
      - key: CLOVA_OCR_API_URL
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
```

### **3. requirements.txt 최적화**
```python
# 기존
opencv-python==4.8.1.78     # GUI 포함

# 수정
opencv-python-headless==4.8.1.78     # GUI 제거 (더 가볍게)
```

### **4. 서버 시작 확인**
```python
# run.py 확인
from api.app import app

if __name__ == "__main__":
    import os
    port = int(os.environ.get('PORT', 5000))  # Render 환경 변수 지원
    app.run(debug=True, host='0.0.0.0', port=port)
```

---

## ⚙️ 환경 변수 설정

### **1. Render 대시보드 환경 변수**
```
# 대시보드 설정 필수 항목
CLOVA_OCR_SECRET_KEY=your_secret_key
CLOVA_OCR_API_URL=your_api_url
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
PYTHON_VERSION=3.9
FLASK_ENV=production
```

### **2. 프론트엔드 환경 변수 수정**
```typescript
// app/components/scan/ScanUtils.ts
// 기존 코드
export const BACKEND_URL = 'http://172.30.1.59:5000';

// 수정 코드
export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://scanner-backend.onrender.com';
```

### **3. .env 파일 업데이트**
```bash
# app/.env
# Supabase 설정 (기존 유지)
EXPO_PUBLIC_SUPABASE_URL=https://vccraknbnltbdswzpkbh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API URL (Render 배포용) - 신규 추가
EXPO_PUBLIC_BACKEND_URL=https://scanner-backend.onrender.com
```

---

## 🚀 배포 단계

### **Step 1: 코드 준비**
```bash
# 프로젝트 루트에서
cd backend

# git 초기화 (필요 시)
git init
git add .
git commit -m "Prepare backend for Render deployment"
```

### **Step 2: GitHub에 푸시**
```bash
git branch -M main
git remote add origin https://github.com/username/scanner-project.git
git push -u origin main
```

### **Step 3: Render 배포**
1. **Render 대시보드 접속**
   - [https://render.com](https://render.com) 로그인
   - "New Web Service" 클릭

2. **GitHub 리포지토리 연동**
   - "Connect a repository" 선택
   - `scanner-project` 리포지토리 선택

3. **배포 설정**
   ```
   Name: scanner-backend
   Plan: Free (시작)
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn --bind 0.0.0.0:$PORT api.app:app
   ```

4. **환경 변수 설정**
   - Service의 Environment 탭에서 위 5개 항목 입력

5. **배포 시작**
   - "Create Web Service" 클릭
   - 약 3-5분 후 배포 완료

---

## 🔄 자동 배포 설정

### **백엔드 자동 배포 (✅ 이미 완료)**
`render.yaml` 파일이 있어 **main 브랜치 푸시 시 자동 배포**됩니다.

```
GitHub Push → Render 자동 감지 → 자동 빌드 → 자동 배포 (1-2분)
```

### **프론트엔드 APK 자동 빌드**
```yaml
# .github/workflows/build-apk.yml 생성
name: Build and Distribute APK

on:
  push:
    branches: [ main ]
    paths: [ 'app/**' ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    - name: Setup Expo CLI
      run: npm install -g @expo/cli
    - name: Setup EAS CLI
      run: npm install -g eas-cli
    - name: Login to Expo
      run: eas login --non-interactive
      env:
        EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
    - name: Build APK
      run: |
        cd app
        eas build --platform android --profile preview --non-interactive
      env:
        EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
        EXPO_PUBLIC_BACKEND_URL: ${{ secrets.EXPO_PUBLIC_BACKEND_URL }}
```

### **GitHub Secrets 설정**
```
# Repository → Settings → Secrets
EXPO_TOKEN:                  # Expo 계정 토큰
EXPO_PUBLIC_BACKEND_URL:     # Render 배포 URL
EXPO_PUBLIC_SUPABASE_URL:    # Supabase URL  
EXPO_PUBLIC_SUPABASE_ANON_KEY: # Supabase 키
```

---

## ✅ 배포 후 테스트

### **1. 헬스 체크**
```
curl https://your-backend.onrender.com/
# 예상 응답: {"status": "ok", "message": "Scanner Backend API"}
```

### **2. API 엔드포인트 테스트**
```bash
# 바코드 조회 API
curl -X POST \
  https://your-backend.onrender.com/lookup_barcode \
  -H 'Content-Type: application/json' \
  -d '{"barcode": "8801234567890"}'

# 영수증 분석 API  
curl -X POST \
  https://your-backend.onrender.com/upload_receipt \
  -H 'Content-Type: application/json' \
  -d '{"image": "base64_image_data"}'
```

### **3. 앱 테스트**
1. **APK 빌드**: `cd app && eas build --platform android --profile preview`
2. **설치 및 테스트**
   - 📸 바코드 스캔 작동 확인
   - 🧾 영수증 촬영 작동 확인  
   - 💾 DB 저장 확인
   - 🔄 실시간 업데이트 확인

---

## 📱 APK 연동

### **최종 URL 설정**
```typescript
// ScanUtils.ts 최종 버전
export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://scanner-backend.onrender.com';

// 사용 예시
const response = await fetch(`${BACKEND_URL}/lookup_barcode`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ barcode })
});
```

### **테스트 시나리오**
```
테스트 순서:
1. 바코드 스캔 → API 호출 → 응답 확인
2. 영수증 촬영 → OCR 처리 → DB 저장
3. 재고 목록 새로고침 → 데이터 확인
4. 네트워크 오류 시 에러 메시지 확인
```

---

## ⚡ 문제 해결

### **🚨 공통 문제**

**1. 배포 시간 초과**
```
원인: PaddleOCR 용량이 큼
해결: 
- 무료 플랜 15분 제한 확인
- 필요 시 Standard 플랜으로 업그레이드
```

**2. 메모리 부족**
```
원인: OCR 처리에 메모리 필요
해결:
- render.yaml에서 RAM 1GB로 설정
- plan: "starter" (유료) 고려
```

**3. API 통신 실패**
```
원인: CORS 또는 방화벽
해결:
- app.py에서 CORS 설정 확인
- 방화벽 규칙 확인
```

### **📱 앱 연동 문제**

**1. HTTPS 보안 문제**
```
원인: HTTP 통신 제한
해결: Render는 자동 HTTPS 적용됨
```

**2. 타임아웃**
```
원인: OCR 처리 시간 길음
해결: 
- 클라이언트 타임아웃 30초로 설정
- 로딩 UI 개선
```

**3. 권한 문제**
```
원인: 카메라 권한 누락
해결: app.json 권한 설정 확인 (✅ 이미 완료)
```

---

## 🎯 성공 확인 체크리스트

- [ ] GitHub 레파지토리에 코드 푸시
- [ ] Render 웹 서비스 생성 완료
- [ ] 환경 변수 5개 항목 등록
- [ ] 배포 성공 메시지 확인
- [ ] API 헬스체크 통과
- [ ] 프론트엔드 URL 업데이트
- [ ] APK 빌드 성공
- [ ] 바코드 스캔 기능 작동
- [ ] 영수증 OCR 기능 작동  
- [ ] Supabase DB 연동 확인
- [ ] 자동 배포 테스트 통과

---

## ⚡ 예상 타임라인

| 단계 | 시간 | 설명 |
|------|------|------|
| 준비 | 10분 | 코드 정리, 파일 생성 |
| GitHub 푸시 | 2분 | 코드 업로드 |
| Render 배포 | 5분 | 자동 빌드 및 배포 |
| 테스트 | 10분 | API 및 기능 확인 |
| APK 빌드 | 15분 | Expo 빌드 |
| **총합** | **42분** | **전체 배포 완료** |

---

## 🔄 향후 개발 워크플로우

### **자동화 완료시**
```bash
# 백엔드 수정
git add backend/
git commit -m "API 개선"
git push origin main
# → 1-2분 후 자동 배포 완료

# 프론트엔드 수정  
git add app/
git commit -m "UI 개선"
git push origin main
# → 15분 후 APK 자동 빌드 완료
```

### **개발 스피드 개선**
- **기존**: 수동 배포 1-2시간
- **개선**: 자동 배포 15-20분
- **효율**: **80% 시간 단축**

---

## 📝 LLM 아키텍처 전환에 따른 업데이트 제안 (2025-11-16)

- [ ] **기술 스택 업데이트:** `requirements.txt`의 변경 사항을 이 문서에 반영해야 합니다.
  - [ ] `PaddleOCR` 및 `opencv-python-headless` 의존성 제거.
  - [ ] `google-generativeai` 라이브러리를 핵심 의존성으로 추가.
- [ ] **배포 고려사항 수정:**
  - [ ] `PaddleOCR`로 인한 메모리 부족(RAM 1GB 권장) 섹션은 더 이상 유효하지 않으므로 삭제 또는 수정. LLM API 호출 방식으로 변경되어 백엔드 서버의 메모리 요구사항이 크게 감소했음을 명시.
- [ ] **환경 변수 추가:**
  - [ ] `render.yaml` 및 Render 대시보드에 `GEMINI_API_KEY` 환경 변수 설정이 필요함을 추가.
