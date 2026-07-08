import type {
  DashboardResumo, RecebidoPorMes, TopDoador, PorEntidade,
  Parceiro, Entidade, Tipo, Marca, Unidade, Alimento,
  Lote, Distribuicao, UsuarioCompleto,
} from '@/types'

// ── Dashboard ────────────────────────────────────────────────────────────────

export const DEMO_RESUMO: DashboardResumo = {
  total_alimentos: 24,
  total_lotes: 38,
  total_distribuicoes: 112,
  lotes_vencendo: 5,
}

export const DEMO_RECEBIDO_POR_MES: RecebidoPorMes[] = [
  { mes: 'Jul/24', quantidade: 1050 },
  { mes: 'Ago/24', quantidade: 1320 },
  { mes: 'Set/24', quantidade: 890 },
  { mes: 'Out/24', quantidade: 1540 },
  { mes: 'Nov/24', quantidade: 2100 },
  { mes: 'Dez/24', quantidade: 1780 },
  { mes: 'Jan/25', quantidade: 960 },
  { mes: 'Fev/25', quantidade: 1130 },
  { mes: 'Mar/25', quantidade: 1410 },
  { mes: 'Abr/25', quantidade: 1680 },
  { mes: 'Mai/25', quantidade: 1290 },
  { mes: 'Jun/25', quantidade: 1450 },
]

export const DEMO_TOP_DOADORES: TopDoador[] = [
  { parceiro: 'Supermercado Zaffari', total: 4800 },
  { parceiro: 'Cooperativa Languiru', total: 3950 },
  { parceiro: 'Rede Bourbon', total: 3200 },
  { parceiro: 'Nestlé Brasil', total: 2700 },
  { parceiro: 'Panificadora Central', total: 1850 },
]

export const DEMO_POR_ENTIDADE: PorEntidade[] = [
  { entidade: 'CRAS Mathias Velho', total: 2400 },
  { entidade: 'Casa Lar São Francisco', total: 1800 },
  { entidade: 'Abrigo Municipal Canoas', total: 1500 },
  { entidade: 'APAE Canoas', total: 1100 },
  { entidade: 'Lar das Crianças', total: 900 },
]

// ── Auxiliares ────────────────────────────────────────────────────────────────

export const DEMO_TIPOS: Tipo[] = [
  { id: 't1', nome: 'Grãos e Cereais' },
  { id: 't2', nome: 'Laticínios' },
  { id: 't3', nome: 'Enlatados' },
  { id: 't4', nome: 'Massas e Farinhas' },
  { id: 't5', nome: 'Óleos e Condimentos' },
]

export const DEMO_MARCAS: Marca[] = [
  { id: 'm1', nome: 'Camil' },
  { id: 'm2', nome: 'Nestlé' },
  { id: 'm3', nome: 'Quaker' },
  { id: 'm4', nome: 'Fugini' },
  { id: 'm5', nome: 'Soya' },
]

export const DEMO_UNIDADES: Unidade[] = [
  { id: 'u1', nome: 'Quilograma', sigla: 'kg' },
  { id: 'u2', nome: 'Litro', sigla: 'L' },
  { id: 'u3', nome: 'Unidade', sigla: 'un' },
  { id: 'u4', nome: 'Caixa', sigla: 'cx' },
]

// ── Parceiros ────────────────────────────────────────────────────────────────

export const DEMO_PARCEIROS: Parceiro[] = [
  { id: 'p1', nome: 'Supermercado Zaffari', tipo: 'Supermercado', contato: '(51) 3234-5678' },
  { id: 'p2', nome: 'Cooperativa Languiru', tipo: 'Cooperativa', contato: '(54) 3711-1000' },
  { id: 'p3', nome: 'Rede Bourbon', tipo: 'Supermercado', contato: '(51) 3320-2000' },
  { id: 'p4', nome: 'Nestlé Brasil', tipo: 'Indústria', contato: '(11) 2111-9200' },
  { id: 'p5', nome: 'Panificadora Central', tipo: 'Panificadora', contato: '(51) 3476-1122' },
  { id: 'p6', nome: 'Prefeitura de Canoas', tipo: 'Órgão Público', contato: '(51) 3475-7000' },
]

// ── Entidades ────────────────────────────────────────────────────────────────

export const DEMO_ENTIDADES: Entidade[] = [
  { id: 'e1', nome: 'CRAS Mathias Velho', contato: '(51) 3462-3300', endereco: 'Rua Cel. Niederauer, 350 — Mathias Velho' },
  { id: 'e2', nome: 'Casa Lar São Francisco', contato: '(51) 3477-4411', endereco: 'Av. Victor Barreto, 2040 — Centro' },
  { id: 'e3', nome: 'Abrigo Municipal Canoas', contato: '(51) 3475-7500', endereco: 'Rua Dom Pedro II, 120 — Niterói' },
  { id: 'e4', nome: 'APAE Canoas', contato: '(51) 3472-1010', endereco: 'Rua Luiz Pasteur, 75 — Marechal Rondon' },
  { id: 'e5', nome: 'Lar das Crianças', contato: '(51) 3461-2233', endereco: 'Rua dos Andradas, 480 — Guajuviras' },
]

// ── Alimentos ────────────────────────────────────────────────────────────────

export const DEMO_ALIMENTOS: Alimento[] = [
  { id: 'a1', nome: 'Arroz Branco', id_tipo: 't1', tipo_nome: 'Grãos e Cereais', id_marca: 'm1', marca_nome: 'Camil', id_unidade: 'u1', unidade_nome: 'Quilograma' },
  { id: 'a2', nome: 'Feijão Carioca', id_tipo: 't1', tipo_nome: 'Grãos e Cereais', id_marca: 'm1', marca_nome: 'Camil', id_unidade: 'u1', unidade_nome: 'Quilograma' },
  { id: 'a3', nome: 'Macarrão Espaguete', id_tipo: 't4', tipo_nome: 'Massas e Farinhas', id_marca: 'm2', marca_nome: 'Nestlé', id_unidade: 'u1', unidade_nome: 'Quilograma' },
  { id: 'a4', nome: 'Farinha de Trigo', id_tipo: 't4', tipo_nome: 'Massas e Farinhas', id_unidade: 'u1', unidade_nome: 'Quilograma' },
  { id: 'a5', nome: 'Leite Integral UHT', id_tipo: 't2', tipo_nome: 'Laticínios', id_marca: 'm2', marca_nome: 'Nestlé', id_unidade: 'u2', unidade_nome: 'Litro' },
  { id: 'a6', nome: 'Óleo de Soja', id_tipo: 't5', tipo_nome: 'Óleos e Condimentos', id_marca: 'm5', marca_nome: 'Soya', id_unidade: 'u2', unidade_nome: 'Litro' },
  { id: 'a7', nome: 'Aveia em Flocos', id_tipo: 't1', tipo_nome: 'Grãos e Cereais', id_marca: 'm3', marca_nome: 'Quaker', id_unidade: 'u1', unidade_nome: 'Quilograma' },
  { id: 'a8', nome: 'Molho de Tomate', id_tipo: 't3', tipo_nome: 'Enlatados', id_marca: 'm4', marca_nome: 'Fugini', id_unidade: 'u3', unidade_nome: 'Unidade' },
  { id: 'a9', nome: 'Sardinha em Lata', id_tipo: 't3', tipo_nome: 'Enlatados', id_unidade: 'u3', unidade_nome: 'Unidade' },
  { id: 'a10', nome: 'Açúcar Cristal', id_tipo: 't5', tipo_nome: 'Óleos e Condimentos', id_unidade: 'u1', unidade_nome: 'Quilograma' },
]

// ── Lotes ────────────────────────────────────────────────────────────────────
// Datas relativas a junho de 2025

export const DEMO_LOTES: Lote[] = [
  { id: 'l1', id_alimento: 'a1', alimento_nome: 'Arroz Branco', id_parceiro: 'p1', parceiro_nome: 'Supermercado Zaffari', quantidade: 500, data_chegada: '2025-04-10', data_validade: '2026-04-10', foi_comprado: false, esta_estragado: false },
  { id: 'l2', id_alimento: 'a2', alimento_nome: 'Feijão Carioca', id_parceiro: 'p2', parceiro_nome: 'Cooperativa Languiru', quantidade: 300, data_chegada: '2025-03-15', data_validade: '2026-03-15', foi_comprado: false, esta_estragado: false },
  { id: 'l3', id_alimento: 'a5', alimento_nome: 'Leite Integral UHT', id_parceiro: 'p3', parceiro_nome: 'Rede Bourbon', quantidade: 240, data_chegada: '2025-05-20', data_validade: '2025-07-05', foi_comprado: false, esta_estragado: false },
  { id: 'l4', id_alimento: 'a3', alimento_nome: 'Macarrão Espaguete', id_parceiro: 'p4', parceiro_nome: 'Nestlé Brasil', quantidade: 180, data_chegada: '2025-05-01', data_validade: '2025-06-28', foi_comprado: false, esta_estragado: false },
  { id: 'l5', id_alimento: 'a6', alimento_nome: 'Óleo de Soja', id_parceiro: 'p1', parceiro_nome: 'Supermercado Zaffari', quantidade: 120, data_chegada: '2025-04-22', data_validade: '2026-04-22', foi_comprado: false, esta_estragado: false },
  { id: 'l6', id_alimento: 'a8', alimento_nome: 'Molho de Tomate', id_parceiro: 'p2', parceiro_nome: 'Cooperativa Languiru', quantidade: 96, data_chegada: '2025-05-10', data_validade: '2025-06-20', foi_comprado: false, esta_estragado: false },
  { id: 'l7', id_alimento: 'a7', alimento_nome: 'Aveia em Flocos', id_parceiro: 'p5', parceiro_nome: 'Panificadora Central', quantidade: 60, data_chegada: '2025-06-01', data_validade: '2026-06-01', foi_comprado: false, esta_estragado: false },
  { id: 'l8', id_alimento: 'a10', alimento_nome: 'Açúcar Cristal', id_parceiro: 'p6', parceiro_nome: 'Prefeitura de Canoas', quantidade: 200, data_chegada: '2025-05-28', data_validade: '2027-05-28', foi_comprado: true, esta_estragado: false },
]

// ── Distribuições ─────────────────────────────────────────────────────────────

export const DEMO_DISTRIBUICOES: Distribuicao[] = [
  { id: 'd1',  id_lote: 'l1', alimento_nome: 'Arroz Branco',     id_entidade: 'e1', entidade_nome: 'CRAS Mathias Velho',   id_usuario: '1', quantidade: 80,  data: '2025-06-02' },
  { id: 'd2',  id_lote: 'l2', alimento_nome: 'Feijão Carioca',   id_entidade: 'e2', entidade_nome: 'Casa Lar São Francisco', id_usuario: '1', quantidade: 50,  data: '2025-06-02' },
  { id: 'd3',  id_lote: 'l5', alimento_nome: 'Óleo de Soja',     id_entidade: 'e3', entidade_nome: 'Abrigo Municipal Canoas', id_usuario: '1', quantidade: 30, data: '2025-06-05' },
  { id: 'd4',  id_lote: 'l3', alimento_nome: 'Leite Integral UHT', id_entidade: 'e4', entidade_nome: 'APAE Canoas',         id_usuario: '1', quantidade: 60,  data: '2025-06-05' },
  { id: 'd5',  id_lote: 'l1', alimento_nome: 'Arroz Branco',     id_entidade: 'e5', entidade_nome: 'Lar das Crianças',      id_usuario: '1', quantidade: 40,  data: '2025-06-09' },
  { id: 'd6',  id_lote: 'l8', alimento_nome: 'Açúcar Cristal',   id_entidade: 'e1', entidade_nome: 'CRAS Mathias Velho',   id_usuario: '1', quantidade: 50,  data: '2025-06-10' },
  { id: 'd7',  id_lote: 'l2', alimento_nome: 'Feijão Carioca',   id_entidade: 'e3', entidade_nome: 'Abrigo Municipal Canoas', id_usuario: '1', quantidade: 30, data: '2025-06-12' },
  { id: 'd8',  id_lote: 'l7', alimento_nome: 'Aveia em Flocos',  id_entidade: 'e2', entidade_nome: 'Casa Lar São Francisco', id_usuario: '1', quantidade: 20,  data: '2025-06-12' },
  { id: 'd9',  id_lote: 'l4', alimento_nome: 'Macarrão Espaguete', id_entidade: 'e4', entidade_nome: 'APAE Canoas',         id_usuario: '1', quantidade: 40,  data: '2025-06-15' },
  { id: 'd10', id_lote: 'l6', alimento_nome: 'Molho de Tomate',  id_entidade: 'e5', entidade_nome: 'Lar das Crianças',      id_usuario: '1', quantidade: 24,  data: '2025-06-15' },
]

// ── Usuários ──────────────────────────────────────────────────────────────────

export const DEMO_USUARIOS: UsuarioCompleto[] = [
  { id: '1', nome: 'Admin', sobrenome: 'Sistema', email: 'admin@bancoalimentos.rs', nivel: 'admin', criado_em: '2024-01-10T08:00:00' },
  { id: '2', nome: 'Maria', sobrenome: 'Oliveira', email: 'maria.oliveira@bancoalimentos.rs', nivel: 'operador', criado_em: '2024-03-15T09:30:00' },
  { id: '3', nome: 'João', sobrenome: 'Silva', email: 'joao.silva@bancoalimentos.rs', nivel: 'operador', criado_em: '2024-06-20T14:00:00' },
]
