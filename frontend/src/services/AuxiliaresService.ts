import { api } from './api'
import type { Tipo, Marca, Unidade, PontoColeta } from '@/types'

export const AuxiliaresService = {
  tipos: () =>
    api.get<Tipo[]>('/tipos').then((r) => r.data),

  criarTipo: (data: Omit<Tipo, 'id'>) =>
    api.post<Tipo>('/tipos', data).then((r) => r.data),

  marcas: () =>
    api.get<Marca[]>('/marcas').then((r) => r.data),

  criarMarca: (nome: string) =>
    api.post<Marca>('/marcas', { nome }).then((r) => r.data),

  unidades: () =>
    api.get<Unidade[]>('/unidades').then((r) => r.data),

  criarUnidade: (nome: string) =>
    api.post<Unidade>('/unidades', { nome }).then((r) => r.data),

  pontosColeta: () =>
    api.get<PontoColeta[]>('/pontos-coleta').then((r) => r.data),
}
