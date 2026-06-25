import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AuthService } from '../services/AuthService'

export default function Layout() {
  const { usuario, isAdmin, isDemo, logout } = useAuth()
  const navigate = useNavigate()
  const [showSenhaModal, setShowSenhaModal] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [senhaErr, setSenhaErr] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault()
    setSenhaErr('')
    try {
      await AuthService.alterarSenha(senhaAtual, novaSenha)
      setShowSenhaModal(false)
      setSenhaAtual('')
      setNovaSenha('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setSenhaErr(msg || 'Erro ao alterar senha')
    }
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-600 text-white'
        : 'text-slate-600 hover:bg-surface-muted hover:text-slate-900'
    }`

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-surface-border flex flex-col">
        <div className="p-4 border-b border-surface-border">
          <h1 className="text-base font-bold text-brand-700 leading-tight">
            Banco de Alimentos
            <br />
            <span className="text-xs font-normal text-slate-500">Canoas</span>
          </h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/" end className={navClass}>Dashboard</NavLink>
          <NavLink to="/alimentos" className={navClass}>Alimentos</NavLink>
          <NavLink to="/lotes" className={navClass}>Lotes</NavLink>
          <NavLink to="/distribuicoes" className={navClass}>Distribuições</NavLink>
          <NavLink to="/parceiros" className={navClass}>Parceiros</NavLink>
          {isAdmin && <NavLink to="/usuarios" className={navClass}>Usuários</NavLink>}
        </nav>
        <div className="p-3 border-t border-surface-border">
          {isDemo && (
            <p className="text-xs text-status-warning bg-amber-50 rounded px-2 py-1 mb-2">
              Modo Demo
            </p>
          )}
          <p className="text-xs text-slate-500 truncate mb-1">{usuario?.nome}</p>
          <div className="flex gap-1">
            {!isDemo && (
              <button
                onClick={() => setShowSenhaModal(true)}
                className="text-xs text-brand-600 hover:underline"
              >
                Alterar senha
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-status-danger hover:underline ml-auto"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Modal alterar senha */}
      {showSenhaModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Alterar Senha</h2>
            <form onSubmit={handleAlterarSenha} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Senha atual</label>
                <input
                  type="password"
                  value={senhaAtual}
                  onChange={e => setSenhaAtual(e.target.value)}
                  className="w-full border border-surface-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Nova senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  className="w-full border border-surface-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  required
                  minLength={6}
                />
              </div>
              {senhaErr && <p className="text-xs text-status-danger">{senhaErr}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowSenhaModal(false); setSenhaErr('') }}
                  className="px-4 py-2 text-sm rounded-lg border border-surface-border hover:bg-surface-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
