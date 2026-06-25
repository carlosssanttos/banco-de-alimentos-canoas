CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── TABELAS AUXILIARES ────────────────────────────────────────────────────

CREATE TABLE tipos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

CREATE TABLE marcas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE unidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(50) NOT NULL
);

-- ── USUÁRIOS E PERMISSÕES ─────────────────────────────────────────────────

CREATE TABLE permissoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    nivel VARCHAR(20) NOT NULL DEFAULT 'operador',
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usuarios_permissoes (
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    id_permissao UUID NOT NULL REFERENCES permissoes(id) ON DELETE CASCADE,
    PRIMARY KEY (id_usuario, id_permissao)
);

-- ── PARCEIROS E PONTOS DE COLETA ──────────────────────────────────────────

CREATE TABLE parceiros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(100),
    contato VARCHAR(150),
    descricao TEXT
);

CREATE TABLE pontos_coleta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_parceiro UUID NOT NULL REFERENCES parceiros(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    local VARCHAR(255),
    descricao TEXT
);

-- ── ALIMENTOS E LOTES ─────────────────────────────────────────────────────

CREATE TABLE alimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    id_tipo UUID REFERENCES tipos(id),
    id_marca UUID REFERENCES marcas(id),
    id_unidade UUID REFERENCES unidades(id),
    descricao TEXT
);

CREATE TABLE lotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_alimento UUID NOT NULL REFERENCES alimentos(id),
    id_parceiro UUID REFERENCES parceiros(id),
    id_ponto_coleta UUID REFERENCES pontos_coleta(id),
    quantidade NUMERIC(10, 3) NOT NULL,
    data_chegada DATE NOT NULL DEFAULT CURRENT_DATE,
    data_validade DATE,
    foi_comprado BOOLEAN DEFAULT FALSE,
    preco NUMERIC(10, 2),
    esta_estragado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ── ENTIDADES E DISTRIBUIÇÕES ─────────────────────────────────────────────

CREATE TABLE entidades_beneficiarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    contato VARCHAR(150),
    endereco TEXT
);

CREATE TABLE distribuicoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_lote UUID NOT NULL REFERENCES lotes(id),
    id_entidade UUID NOT NULL REFERENCES entidades_beneficiarias(id),
    id_usuario UUID NOT NULL REFERENCES usuarios(id),
    quantidade NUMERIC(10, 3) NOT NULL,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ── EVENTOS ───────────────────────────────────────────────────────────────

CREATE TABLE eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    data DATE,
    local VARCHAR(255),
    realizador_id UUID REFERENCES usuarios(id)
);

CREATE TABLE eventos_lotes (
    id_evento UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    id_lote UUID NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
    quantidade NUMERIC(10, 3) NOT NULL,
    PRIMARY KEY (id_evento, id_lote)
);

-- ── METAS ─────────────────────────────────────────────────────────────────

CREATE TABLE metas_alimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_tipo UUID NOT NULL REFERENCES tipos(id) ON DELETE CASCADE,
    meta_kg NUMERIC(10, 3) NOT NULL,
    periodo VARCHAR(7) NOT NULL,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),
    UNIQUE(id_tipo, periodo)
);

-- ── LOG DE MOVIMENTAÇÕES ──────────────────────────────────────────────────

CREATE TABLE log_movimentacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tabela VARCHAR(50) NOT NULL,
    operacao VARCHAR(10) NOT NULL,
    id_registro UUID NOT NULL,
    id_usuario UUID REFERENCES usuarios(id),
    dados_anteriores JSONB,
    dados_novos JSONB,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ── ÍNDICES ───────────────────────────────────────────────────────────────

CREATE INDEX idx_lotes_alimento ON lotes(id_alimento);
CREATE INDEX idx_lotes_validade ON lotes(data_validade);
CREATE INDEX idx_lotes_chegada ON lotes(data_chegada);
CREATE INDEX idx_distribuicoes_lote ON distribuicoes(id_lote);
CREATE INDEX idx_distribuicoes_data ON distribuicoes(data);
CREATE INDEX idx_metas_periodo ON metas_alimentos(periodo);
CREATE INDEX idx_metas_tipo ON metas_alimentos(id_tipo);
CREATE INDEX idx_log_criado ON log_movimentacoes(criado_em);

-- ── TRIGGERS DE LOG ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_log_lotes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO log_movimentacoes (tabela, operacao, id_registro, dados_novos)
        VALUES ('lotes', 'INSERT', NEW.id, row_to_json(NEW)::jsonb);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO log_movimentacoes (tabela, operacao, id_registro, dados_anteriores, dados_novos)
        VALUES ('lotes', 'UPDATE', NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_lotes
AFTER INSERT OR UPDATE ON lotes
FOR EACH ROW EXECUTE FUNCTION fn_log_lotes();

CREATE OR REPLACE FUNCTION fn_log_distribuicoes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO log_movimentacoes (tabela, operacao, id_registro, dados_novos)
    VALUES ('distribuicoes', 'INSERT', NEW.id, row_to_json(NEW)::jsonb);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_distribuicoes
AFTER INSERT ON distribuicoes
FOR EACH ROW EXECUTE FUNCTION fn_log_distribuicoes();

-- ── VIEWS ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW vw_estoque_atual AS
SELECT
    a.id AS id_alimento,
    a.nome AS alimento,
    t.nome AS tipo,
    u.nome AS unidade,
    COALESCE(SUM(l.quantidade), 0) AS quantidade_total,
    COUNT(l.id) AS num_lotes,
    MIN(l.data_validade) AS proxima_validade,
    SUM(CASE WHEN l.data_validade <= CURRENT_DATE + 30
             AND l.data_validade IS NOT NULL
             THEN l.quantidade ELSE 0 END) AS quantidade_vencendo_30d
FROM alimentos a
LEFT JOIN tipos t ON t.id = a.id_tipo
LEFT JOIN unidades u ON u.id = a.id_unidade
LEFT JOIN lotes l ON l.id_alimento = a.id AND l.esta_estragado = false
GROUP BY a.id, a.nome, t.nome, u.nome;

CREATE OR REPLACE VIEW vw_dashboard_mensal AS
SELECT
    DATE_TRUNC('month', l.data_chegada) AS mes,
    t.nome AS tipo_alimento,
    a.nome AS alimento,
    SUM(l.quantidade) AS total_recebido,
    COUNT(DISTINCT l.id_parceiro) AS num_doadores
FROM lotes l
JOIN alimentos a ON a.id = l.id_alimento
LEFT JOIN tipos t ON t.id = a.id_tipo
WHERE l.esta_estragado = false
GROUP BY DATE_TRUNC('month', l.data_chegada), t.nome, a.nome;

CREATE OR REPLACE VIEW vw_distribuicao_por_entidade AS
SELECT
    e.nome AS entidade,
    a.nome AS alimento,
    t.nome AS tipo,
    DATE_TRUNC('month', d.data) AS mes,
    SUM(d.quantidade) AS total_distribuido,
    COUNT(d.id) AS num_entregas
FROM distribuicoes d
JOIN lotes l ON l.id = d.id_lote
JOIN alimentos a ON a.id = l.id_alimento
LEFT JOIN tipos t ON t.id = a.id_tipo
LEFT JOIN entidades_beneficiarias e ON e.id = d.id_entidade
GROUP BY e.nome, a.nome, t.nome, DATE_TRUNC('month', d.data);

CREATE OR REPLACE VIEW vw_progresso_metas AS
SELECT
    m.periodo,
    t.nome AS tipo,
    m.meta_kg,
    COALESCE(SUM(l.quantidade), 0) AS recebido_kg,
    COALESCE(SUM(l.quantidade), 0) / NULLIF(m.meta_kg, 0) * 100 AS percentual,
    m.meta_kg - COALESCE(SUM(l.quantidade), 0) AS faltando_kg
FROM metas_alimentos m
JOIN tipos t ON t.id = m.id_tipo
LEFT JOIN alimentos a ON a.id_tipo = m.id_tipo
LEFT JOIN lotes l ON l.id_alimento = a.id
    AND TO_CHAR(l.data_chegada, 'YYYY-MM') = m.periodo
    AND l.esta_estragado = false
GROUP BY m.periodo, t.nome, m.meta_kg;

-- ── SEED DE DADOS BÁSICOS ─────────────────────────────────────────────────

INSERT INTO tipos (nome, descricao) VALUES
    ('Grãos e Cereais', 'Arroz, feijão, lentilha, aveia, milho'),
    ('Enlatados e Conservas', 'Atum, sardinha, extrato de tomate, milho'),
    ('Laticínios', 'Leite em pó, queijo, iogurte'),
    ('Óleos e Gorduras', 'Óleo de soja, azeite, margarina'),
    ('Farinhas e Derivados', 'Farinha de trigo, fubá, amido de milho'),
    ('Açúcar e Doces', 'Açúcar cristal, açúcar mascavo, mel'),
    ('Temperos e Condimentos', 'Sal, vinagre, molho de soja'),
    ('Bebidas', 'Sucos, achocolatados, café, chá'),
    ('Massas e Biscoitos', 'Macarrão, biscoito, bolacha'),
    ('Outros', 'Produtos que não se encaixam nas categorias acima');

INSERT INTO unidades (nome) VALUES
    ('kg'),
    ('g'),
    ('L'),
    ('mL'),
    ('un'),
    ('cx'),
    ('pct');

INSERT INTO marcas (nome) VALUES
    ('Sem marca'),
    ('Camil'),
    ('Kicaldo'),
    ('Cica'),
    ('Nestlé'),
    ('Forno de Minas');

INSERT INTO permissoes (nome, descricao) VALUES
    ('admin', 'Acesso total ao sistema'),
    ('operador', 'Registra entradas e saídas de estoque');