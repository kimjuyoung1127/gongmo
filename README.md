
# 🥫  AI 스마트 식품 관리 서비스 : 음식물 쓰레기 제로 솔루션  (냉장고 제로)

> **"영수증 한 장, 바코드 한 번 스캔으로 집 안 식료품·유통기한·레시피까지 한 번에 관리하는 스마트 솔루션"**

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

---

## 📱 App Preview

| 영수증/바코드 스캔 | AI 레시피 추천 |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/ee47d7d7-6f64-4e41-b115-1b770b312421" width="300" /> | <img src="https://github.com/user-attachments/assets/6473058c-3b3c-4887-876d-d3499df49e62" width="300" /> |
| 정확한 상품 정보 인식 + 유통기한 자동 계산 | 현재 재고 기반 AI 레시피 추천 |

---

## 💡 Problem & Solution

### 🛑 Problem
* **기억의 한계:** 냉장고/팬트리 깊숙한 곳의 재고를 잊어버려 중복 구매 발생
  
* **폐기물의 증가:** 유통기한 관리가 안 되어 버려지는 음식물 쓰레기 증가
  
* **관리의 단절:** 장보기(영수증)와 재고 관리(냉장고)가 연결되지 않는 불편함

### ✅ Solution
* **자동화된 등록:** 영수증 촬영 및 바코드 스캔만으로 식료품 정보 자동 등록

* **스마트 관리:** 카테고리별 유통기한 자동 계산 및 D-Day 알림 제공
  
* **가치 연결:** 현재 재고를 활용한 AI 맞춤 레시피 추천으로 '소비'까지 연결

---

## ✨ Key Features

* 📸 **AI 영수증 스캔 (Hybrid OCR)**
    * Clova OCR로 텍스트 추출 후 Gemini LLM이 상품명만 정교하게 필터링
      
* 📦 **정밀 바코드 스캔** 
    * 식품안전나라 API + Open Food Facts 연동으로 정확한 상품 정보 매칭
      
* ⏰ **자동 유통기한 관리**
    * 품목별 최적 유통기한 자동 설정 및 임박 알림 제공
      
* 📊 **실시간 재고 대시보드**
    * D-Day 기준 정렬, 소비기한 임박 품목 시각적 강조
      
* 👩‍🍳 **AI 레시피 추천**
    * 보유 재료 기반 레시피 추천 및 요리 후 재고 자동 차감 연동

* ☁️ **클라우드 동기화**
    * Supabase 기반 실시간 데이터 동기화로 가족 간 냉장고 공유 가능
      
* 🤖 **MLOps 파이프라인**
    * 사용자 피드백(수정 데이터)을 기반으로 한 AI 모델 지속적 개선

---

## 🏛 Architecture

### System Overview
![System Architecture](https://github.com/user-attachments/assets/1516302a-0058-4697-b507-9712f4ae21ea)

### Detailed Diagrams
<details>
<summary>📂 1. 파일/폴더 구조도 (Click to Expand)</summary>

![File Structure](https://github.com/user-attachments/assets/56cab7bf-3196-4c74-ba08-8c7bef87eefc)
</details>

<details>
<summary>🔄 2. 화면 이동 흐름도 (Click to Expand)</summary>

![User Flow](https://github.com/user-attachments/assets/30e4a642-228b-4f7e-be78-02adde308d22)
</details>

<details>
<summary>🗄️ 3. 데이터베이스 관계도 (ERD) (Click to Expand)</summary>

![ERD](https://github.com/user-attachments/assets/8f4c4798-04a8-4f28-91a7-d361d7ffbe94)
</details>

<details>
<summary>🍳 4. 레시피 생성 프로세스 (Click to Expand)</summary>

![Recipe Process](https://github.com/user-attachments/assets/c5199563-4423-4cf8-9bb3-0db7990c6728)
</details>

---

## 🧰 Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Expo, React Native, Vision Camera, Recoil |
| **Backend** | Python 3.x, Flask (Blueprint), Pydantic |
| **Database** | Supabase (PostgreSQL, Realtime) |
| **AI / ML** | Clova OCR, Gemini LLM, MLflow, Label Studio |
| **Infra** | Render (Server Hosting) |

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js (>= 18)
* Python 3.10+
* Supabase Project
* API Keys (Clova OCR, Gemini, etc.)

### 2. Environment Setup
Create `.env` file in `backend/` directory:
```bash
CLOVA_OCR_SECRET_KEY=your_key
GEMINI_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
FOOD_SAFETY_API_KEY=your_key
````

### 3\. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m api.app
```

### 4\. Frontend Setup

```bash
cd app
yarn install
yarn start
```

-----

## 🔄 Usage Flow

1.  **📸 Scan:** 영수증 촬영 또는 바코드 스캔
2.  **🤖 Analyze:** Clova OCR(텍스트) + Gemini LLM(구조화) 분석
3.  **📥 Register:** 자동 입력된 정보 확인 및 저장
4.  **⏰ Manage:** D-Day 알림 및 유통기한 관리
5.  **🍳 Cook:** 재고 기반 레시피 추천 및 요리

-----

## 📌 Roadmap

  - [x] **Phase 1: Core Features**
      - [x] 백엔드 리팩토링 (Flask Blueprint)
      - [x] 바코드 스캔 & DB 캐싱
      - [x] 서버 콜드 스타트 해결 (Pre-warming)
            
  - [ ] **Phase 2: Experience**
      - [ ] 프론트엔드 스캔 화면 모듈화
      - [ ] 영수증 검토 UI 개선
      - [ ] 레시피 추천 알고리즘 고도화
            
  - [ ] **Phase 3: Intelligence**
      - [ ] MLOps 피드백 루프 구축
      - [ ] 오프라인 모드 지원
      - [ ] 가계부 연동 및 소비 분석

-----

## 👩‍💻 Team & Contact

| Role | Name | Contact | GitHub |
| :--- | :--- | :--- | :--- |
| **Frontend** | 전혜성 | jkmsss0270@gmail.com | [[@username](https://github.com/]) |
| **Backend** | 김주영 | gmdqn2tp@example.com |(https://github.com/kimjuyoung1127)|
| **AI/ML** | 김택광 | rhkddl1128@gmail.com | [@username](https://github.com/) |

-----

## 📄 License


