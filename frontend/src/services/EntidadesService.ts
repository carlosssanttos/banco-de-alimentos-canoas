import { api } from './api'
import type { Entidade } from '@/types'

export const EntidadesService = {
  listar: () =>
    api.get<Entidade[]>('/entidades').then((r) => r.data),

  criar: (data: Omit<Entidade, 'id'>) =>
    api.post<Entidade>('/entidades', data).then((r) => r.data),

  atualizar: (id: string, data: Omit<Entidade, 'id'>) =>
    api.put<Entidade>(`/entidades/${id}`, data).then((r) => r.data),

  excluir: (id: string) =>
    api.delete(`/entidades/${id}`).then((r) => r.data),
}
