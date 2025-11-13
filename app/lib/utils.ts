// 유틸리티 함수들을 여기에 추가할 수 있습니다.
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// D-Day 계산 함수
export const calculateDDay = (expiryDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간 초기화
  
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// 안정적인 D-Day 계산 함수 (setIssues 방지)
export const calculateDdayStable = (expiryDate: string | null): number => {
  if (!expiryDate) return Infinity;
  
  const today = new Date();
  // 날짜 초기화 (변경 불가 오류 방지)
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - todayDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
