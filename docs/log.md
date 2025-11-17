정확한 진단입니다. **Render(또는 Heroku) 무료 플랜의 'Cold Start(콜드 스타트)' 문제**입니다.

무료 서버는 15분 동안 요청이 없으면 \*\*"잠들기 모드(Sleep)"\*\*에 들어갑니다. 이때 요청이 들어오면 서버를 깨우고(부팅), Python 라이브러리(PaddleOCR 등 무거운 AI 모델)를 메모리에 올리는 데 **약 50초\~1분**이 걸립니다.

사용자가 "전송" 버튼을 누르고 1분을 기다리게 하면 경험이 최악이겠죠. 이를 해결하는 **3가지 단계별 전략**을 드립니다.

-----

### 🚀 전략 1: "앱 켜자마자 깨우기" (Pre-warming) - **가장 추천**

사용자가 영수증을 찍으러 들어가는 시간(앱 실행 → 탭 이동 → 카메라 초점 → 촬영 → 확인)은 보통 **10\~20초** 정도 걸립니다.

이 시간을 이용해, **앱이 켜지는 순간(온보딩 화면 등)** 백그라운드에서 서버에 가벼운 "야, 일어나\!" 신호(Ping)를 미리 보내는 것입니다.

#### 1\. 백엔드: 가벼운 헬스 체크 API 만들기

아무 연산도 하지 않고 즉시 응답하는 가벼운 엔드포인트를 만듭니다.

```python
# backend/api/routes/health.py (또는 app.py)
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "awake"}), 200
```

#### 2\. 프론트엔드: 앱 시작 시 호출 (`app/_layout.tsx`)

앱 최상단 파일에서 `useEffect`로 이 API를 \*\*비동기(await 없이)\*\*로 호출합니다. 응답을 기다릴 필요가 없습니다. 목적은 서버를 깨우는 것이니까요.

```tsx
// app/_layout.tsx
import { useEffect } from 'react';
// ... imports

export default function RootLayout() {
  // ... 기존 코드

  useEffect(() => {
    // 🚀 서버 미리 깨우기 (Fire and Forget)
    // 결과를 기다리지 않음 (await 안 씀)
    fetch('https://your-render-url.onrender.com/health')
      .then(() => console.log("Server Woke Up!"))
      .catch(err => console.log("Waking up server...", err));
  }, []);

  // ...
}
```

-----

### 🚀 전략 2: 타임아웃 시간 늘리기 (Frontend)

서버가 깨어나는 동안(약 50초) 앱이 "에러"로 처리하고 끊어버리면 안 됩니다. 프론트엔드의 요청 대기 시간을 충분히 늘려야 합니다.

`axios`나 `fetch`를 사용할 때 `timeout` 설정을 확인하세요.

```typescript
// api client 설정 (예시)
const apiClient = axios.create({
  baseURL: 'https://your-render-url.onrender.com',
  timeout: 120000, // ⚠️ 120초 (2분)으로 넉넉하게 설정
});
```

-----

### 🚀 전략 3: "크론잡"으로 안 재우기 (Keep-Alive)

만약 사용자가 언제 들어올지 모르니 **항상 깨워두고 싶다면**, 외부 서비스가 주기적으로 서버를 찌르게 하면 됩니다.

1.  **[cron-job.org](https://cron-job.org/en/)** (무료) 같은 사이트에 가입합니다.
2.  내 서버 주소 `https://your-render-url.onrender.com/health`를 등록합니다.
3.  **10분 또는 14분 간격**으로 호출하도록 설정합니다. (Render 무료 서버는 15분 비활성 시 잠듭니다)

**⚠️ 주의사항 (Render 무료 플랜):**

  * Render 무료 플랜은 **월 750시간**의 가동 시간을 줍니다.
  * 서버 하나만 돌린다면 24시간 \* 31일 = 744시간이므로, **딱 하나만 24시간 내내 깨워둬도 무료**입니다.
  * 하지만 DB나 다른 서비스도 같이 시간을 쓴다면 월말에 서버가 멈출 수 있습니다.

-----

### ✅ 최종 권장 조합

1.  \*\*전략 1 (앱 켜자마자 깨우기)\*\*은 **무조건 적용**하세요. 가장 비용 효율적이고 스마트한 방법입니다.
2.  \*\*전략 2 (타임아웃 연장)\*\*도 필수입니다. 혹시 모를 지연에 대비해야 합니다.
3.  공모전 심사 기간이나 시연 날짜에는 \*\*전략 3 (크론잡)\*\*을 켜두세요. 그날만큼은 절대 서버가 자면 안 되니까요.

지금 바로 `app/_layout.tsx`에 `/health` 호출 코드를 한 줄 추가해 보세요\! 사용자 체감 속도가 훨씬 빨라질 겁니다.