import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router'
import { LogOut, KeyRound, ChevronDown } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useAuth } from '@/contexts/AuthContext'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { AuthService } from '@/services/AuthService'

const routeTitles: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/alimentos':     'Alimentos',
  '/lotes':         'Estoque / Lotes',
  '/distribuicoes': 'Distribuições',
  '/parceiros':     'Parceiros',
  '/entidades':     'Entidades Beneficiárias',
  '/vencendo':      'Lotes Vencendo',
  '/notifications': 'Notificações',
  '/usuarios':      'Usuários',
}

interface HeaderProps {
  notifsCount: number
}

export function Header({ notifsCount }: HeaderProps) {
  const { usuario, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [senhaModalOpen, setSenhaModalOpen] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [senhaError, setSenhaError] = useState('')
  const [senhaSuccess, setSenhaSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const title = routeTitles[location.pathname] || 'Banco de Alimentos'
  const initials = usuario?.nome
    ? usuario.nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleAlterarSenha() {
    setSenhaError('')
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setSenhaError('Preencha todos os campos.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setSenhaError('As senhas não coincidem.')
      return
    }
    if (novaSenha.length < 6) {
      setSenhaError('A nova senha deve ter ao menos 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      await AuthService.alterarSenha(senhaAtual, novaSenha)
      setSenhaSuccess(true)
      setTimeout(() => {
        setSenhaModalOpen(false)
        setSenhaAtual('')
        setNovaSenha('')
        setConfirmarSenha('')
        setSenhaSuccess(false)
      }, 1500)
    } catch {
      setSenhaError('Senha atual incorreta ou erro ao alterar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-surface-border bg-white px-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

        <div className="flex items-center gap-2">
          <NotificationBell count={notifsCount} />

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-muted transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {initials}
              </div>
              <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {usuario?.nome}
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-surface-border bg-white shadow-lg z-10">
                <div className="px-4 py-3 border-b border-surface-border">
                  <p className="text-sm font-medium text-gray-900 truncate">{usuario?.nome}</p>
                  <p className="text-xs text-gray-500 truncate">{usuario?.email}</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); setSenhaModalOpen(true) }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-surface-muted transition-colors"
                >
                  <KeyRound size={16} />
                  Alterar senha
                </button>
                <button
                  onClick={() => { setMenuOpen(false); void logout() }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-status-danger hover:bg-red-50 transition-colors rounded-b-xl"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={senhaModalOpen}
        onClose={() => { setSenhaModalOpen(false); setSenhaError('') }}
        title="Alterar Senha"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSenhaModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAlterarSenha} loading={loading}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {senhaError && <Alert variant="danger">{senhaError}</Alert>}
          {senhaSuccess && <Alert variant="success">Senha alterada com sucesso!</Alert>}
          <Input
            label="Senha atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="Nova senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </Modal>
    </>
  )
}
