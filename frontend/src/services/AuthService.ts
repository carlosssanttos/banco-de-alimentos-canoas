import { api } from './api'
import type { LoginResponse, Usuario } from '@/types'

export const AuthService = {
  login: (email: string, senha: string) =>
    api.post<LoginResponse>('/auth/login', { email, senha }).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').catch(() => undefined),

  me: () =>
    api.get<Usuario>('/auth/me').then((r) => r.data),

  alterarSenha: (senha_atual: string, nova_senha: string) =>
    api.put('/auth/alterar-senha', { senha_atual, nova_senha }).then((r) => r.data),
}
