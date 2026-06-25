import { useState } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Mail, Lock } from 'lucide-react'

export function Login() {
  const { login, loginDemo, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !senha) {
      setError('Preencha e-mail e senha.')
      return
    }
    setLoading(true)
    try {
      await login(email, senha)
    } catch {
      setError('E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — form */}
      <div className="flex w-full max-w-md flex-col justify-center px-10 bg-white">
        <div className="mb-8 text-center">
          <img
            src="/Logotipo Banco de Alimentos SVG.png"
            alt="Banco de Alimentos Canoas"
            className="mx-auto mb-5 w-52 object-contain"
          />
          <p className="text-sm text-gray-500">Canoas — RS · Sistema de Gestão</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && <Alert variant="danger">{error}</Alert>}

          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            leftIcon={<Mail size={16} />}
          />

          <Input
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            leftIcon={<Lock size={16} />}
          />

          <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
            Entrar
          </Button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">ou</span>
            </div>
          </div>
          <button
            onClick={loginDemo}
            className="mt-4 w-full rounded-lg border border-dashed border-brand-300 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
          >
            Entrar em Modo Demo (sem backend)
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Banco de Alimentos Canoas
        </p>
      </div>

      {/* Right panel — brand */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-brand-600 lg:flex">
        <img
          src="/Logo Banco de Alimentos - Branco.png"
          alt="Banco de Alimentos Canoas"
          className="w-72 object-contain drop-shadow-xl"
        />
        <div className="mt-8 text-center text-white">
          <p className="text-brand-200 mt-2 text-sm">Uma ação empresarial pela cidadania</p>
          <p className="text-brand-300 font-semibold mt-1">Canoas — RS</p>
        </div>
      </div>
    </div>
  )
}
