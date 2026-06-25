import { api } from './api'
import type { Distribuicao, DistribuicaoForm } from '@/types'

export const DistribuicoesService = {
  listar: (params?: { data_inicio?: string; data_fim?: string; id_entidade?: string }) =>
    api.get<Distribuicao[]>('/distribuicoes', { params }).then((r) => r.data),

  criar: (data: DistribuicaoForm) =>
    api.post<Distribuicao>('/distribuicoes', data).then((r) => r.data),

  atualizar: (id: string, data: DistribuicaoForm) =>
    api.put<Distribuicao>(`/distribuicoes/${id}`, data).then((r) => r.data),

  excluir: (id: string) =>
    api.delete(`/distribuicoes/${id}`).then((r) => r.data),

  resumoMensal: (ano: number, mes: number) =>
    api.get('/distribuicoes/resumo-mensal', { params: { ano, mes } }).then((r) => r.data),
}
