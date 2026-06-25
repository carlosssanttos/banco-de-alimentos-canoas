import { api } from './api'
import type { UsuarioCompleto, UsuarioForm } from '@/types'

export const UsuariosService = {
  listar: () =>
    api.get<UsuarioCompleto[]>('/usuarios').then((r) => r.data),

  criar: (data: UsuarioForm) =>
    api.post<UsuarioCompleto>('/usuarios', data).then((r) => r.data),

  atualizar: (id: string, data: UsuarioForm) =>
    api.put<UsuarioCompleto>(`/usuarios/${id}`, data).then((r) => r.data),

  excluir: (id: string) =>
    api.delete(`/usuarios/${id}`).then((r) => r.data),
}
