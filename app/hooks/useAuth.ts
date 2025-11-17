import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// 인증 상태를 관리하는 훅 - Supabase 인증 상태를 구독하고 현재 세션을 반환
export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 인증 상태 변경을 감지하는 이벤트 리스너 등록
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setLoading(false)
    })

    // 컴포넌트 언마운트 시 이벤트 리스너 해제
    return () => data.subscription.unsubscribe()
  }, [])

  return { session, loading }
}