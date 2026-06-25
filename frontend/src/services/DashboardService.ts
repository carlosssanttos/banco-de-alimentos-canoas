import { api } from './api'
import type { DashboardResumo, RecebidoPorMes, TopDoador, PorEntidade } from '@/types'

export const DashboardService = {
  resumo: () =>
    api.get<DashboardResumo>('/dashboard/resumo').then((r) => r.data),

  recebidoPorMes: () =>
    api.get<RecebidoPorMes[]>('/dashboard/recebido-por-mes').then((r) => r.data),

  topDoadores: () =>
    api.get<TopDoador[]>('/dashboard/top-doadores').then((r) => r.data),

  porEntidade: () =>
    api.get<PorEntidade[]>('/dashboard/por-entidade').then((r) => r.data),
}
