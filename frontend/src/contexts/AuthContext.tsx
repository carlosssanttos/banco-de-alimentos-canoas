import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { AuthService } from '@/services/AuthService'
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/services/api'
import type { Usuario } from '@/types'

interface AuthContextValue {
  usuario: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isDemo: boolean
  login: (email: string, senha: string) => Promise<void>
  loginDemo: () => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const DEMO_TOKEN = '__DEMO__'

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) { setIsLoading(false); return }
    if (token === DEMO_TOKEN) {
      const saved = localStorage.getItem(USER_STORAGE_KEY)
      if (saved) setUsuario(JSON.parse(saved) as Usuario)
      setIsLoading(false)
      return
    }
    AuthService.me()
      .then((user) => setUsuario(user))
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        localStorage.removeItem(USER_STORAGE_KEY)
      })
      .finally(() => setIsLoading(false))
  }, [])

  function loginDemo() {
    const demoUser: Usuario = { id: 0, nome: 'Usuário Demo', email: 'demo@banco.rs', permissao: 'admin' }
    localStorage.setItem(TOKEN_STORAGE_KEY, '__DEMO__')
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(demoUser))
    setUsuario(demoUser)
    navigate('/dashboard')
  }

  async function login(email: string, senha: string) {
    const data = await AuthService.login(email, senha)
    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.usuario))
    setUsuario(data.usuario)
    navigate('/dashboard')
  }

  async function logout() {
    await AuthService.logout()
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    setUsuario(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: !!usuario,
        isLoading,
        isAdmin: usuario?.permissao === 'admin',
        isDemo: localStorage.getItem(TOKEN_STORAGE_KEY) === DEMO_TOKEN,
        login,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
