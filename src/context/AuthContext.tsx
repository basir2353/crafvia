import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchCurrentUser,
  login,
  logout,
  register,
  upgradeToPro,
  type User,
} from '../api/auth'
import { getAccessToken } from '../api/client'

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signOut: () => Promise<void>
  goPro: () => Promise<{ message?: string; plan?: string; checkoutUrl?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null)
      return
    }
    try {
      const data = await fetchCurrentUser()
      setUser(data.user)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  const signIn = useCallback(async (email: string, password: string) => {
    const nextUser = await login({ email, password })
    setUser(nextUser)
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      const nextUser = await register({ email, password, name })
      setUser(nextUser)
    },
    [],
  )

  const signOut = useCallback(async () => {
    await logout()
    setUser(null)
  }, [])

  const goPro = useCallback(async () => {
    const result = await upgradeToPro()
    if (result.checkoutUrl) {
      window.open(result.checkoutUrl, '_blank', 'noopener,noreferrer')
      return result
    }
    await refreshUser()
    return result
  }, [refreshUser])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      goPro,
      refreshUser,
    }),
    [user, isLoading, signIn, signUp, signOut, goPro, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
