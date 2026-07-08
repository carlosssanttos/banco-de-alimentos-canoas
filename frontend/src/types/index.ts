// Auth
export interface Usuario {
  id: string
  nome: string
  email: string
  nivel: 'admin' | 'operador'
}

export interface LoginResponse {
  access_token: string
  token_type: string
  usuario: Usuario
}

// Auxiliares
export interface Tipo {
  id: string
  nome: string
  descricao?: string
}

export interface Marca {
  id: string
  nome: string
}

export interface Unidade {
  id: string
  nome: string
  sigla?: string
}

export interface Parceiro {
  id: string
  nome: string
  tipo?: string
  contato?: string
  descricao?: string
}

export interface PontoColeta {
  id: string
  nome: string
  local?: string
  descricao?: string
  id_parceiro: string
}

export interface Entidade {
  id: string
  nome: string
  contato?: string
  endereco?: string
}

// Alimentos
export interface Alimento {
  id: string
  nome: string
  id_tipo?: string
  tipo_nome?: string
  id_marca?: string
  marca_nome?: string
  id_unidade?: string
  unidade_nome?: string
  descricao?: string
}

export interface AlimentoForm {
  nome: string
  id_tipo?: string
  id_marca?: string
  id_unidade?: string
  descricao?: string
}

// Lotes
export type LoteStatus = 'ok' | 'vencendo' | 'estragado'

export interface Lote {
  id: string
  id_alimento: string
  alimento_nome?: string
  id_parceiro?: string
  parceiro_nome?: string
  id_ponto_coleta?: string
  quantidade: number
  data_chegada: string
  data_validade?: string
  foi_comprado: boolean
  preco?: number
  esta_estragado: boolean
  criado_em?: string
  dias_restantes?: number
}

export interface LoteForm {
  id_alimento: string
  id_parceiro?: string
  id_ponto_coleta?: string
  quantidade: number
  data_chegada: string
  data_validade?: string
  foi_comprado?: boolean
  preco?: number
  esta_estragado?: boolean
}

// Distribuições
export interface Distribuicao {
  id: string
  id_lote: string
  alimento_nome?: string
  id_entidade: string
  entidade_nome?: string
  id_usuario: string
  usuario_nome?: string
  quantidade: number
  data: string
  criado_em?: string
}

export interface DistribuicaoForm {
  id_lote: string
  id_entidade: string
  quantidade: number
  data: string
}

// Usuários
export interface UsuarioCompleto {
  id: string
  nome: string
  sobrenome?: string
  email: string
  nivel?: string
  criado_em?: string
}

export interface UsuarioForm {
  nome: string
  sobrenome?: string
  email: string
  senha?: string
  nivel?: string
}

// Dashboard
export interface DashboardResumo {
  total_alimentos: number
  total_lotes: number
  total_distribuicoes: number
  lotes_vencendo: number
}

export interface RecebidoPorMes {
  mes: string
  quantidade: number
}

export interface TopDoador {
  parceiro: string
  total: number
}

export interface PorEntidade {
  entidade: string
  total: number
}

// WebSocket / Notificações
export interface Notificacao {
  id: string
  tipo: 'vencimento' | 'estoque_baixo' | 'distribuicao' | 'lote' | 'sistema'
  mensagem: string
  lida: boolean
  criadaEm: string
  dados?: Record<string, unknown>
}
