import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Tables } from '@/integrations/supabase/types'

interface UserWithMeta extends User {
  client_id?: string
  role?: string
}

export function useAuth() {
  const [user, setUser] = useState<UserWithMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userWithMeta = {
          ...session.user,
          client_id: session.user.user_metadata.client_id,
          role: session.user.user_metadata.role
        }
        setUser(userWithMeta)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userWithMeta = {
          ...session.user,
          client_id: session.user.user_metadata.client_id,
          role: session.user.user_metadata.role
        }
        setUser(userWithMeta)
      } else {
        setUser(null)
        navigate('/auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return {
    user,
    loading
  }
}