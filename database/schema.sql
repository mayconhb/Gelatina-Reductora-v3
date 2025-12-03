-- SQL para criar as tabelas no Supabase
-- Execute este SQL no SQL Editor do Supabase

-- =============================================
-- TABELA DE COMPRAS (já existente)
-- =============================================
CREATE TABLE IF NOT EXISTS purchases (
  id BIGSERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  hotmart_product_id VARCHAR(100) NOT NULL,
  hotmart_transaction_id VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'refunded', 'cancelled')),
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_email ON purchases(user_email);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_user_email_status ON purchases(user_email, status);

COMMENT ON TABLE purchases IS 'Registra as compras de produtos feitas na Hotmart';
COMMENT ON COLUMN purchases.user_email IS 'Email do comprador na Hotmart';
COMMENT ON COLUMN purchases.product_id IS 'ID do produto no app (p1, p2, p3, l1, l2)';
COMMENT ON COLUMN purchases.hotmart_product_id IS 'ID do produto na Hotmart';
COMMENT ON COLUMN purchases.hotmart_transaction_id IS 'ID da transação na Hotmart';
COMMENT ON COLUMN purchases.status IS 'Status da compra: active, refunded, cancelled';

-- =============================================
-- TABELA DE PERFIL DE USUÁRIOS
-- =============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

COMMENT ON TABLE user_profiles IS 'Armazena o perfil dos usuários do app';
COMMENT ON COLUMN user_profiles.email IS 'Email do usuário (chave única)';
COMMENT ON COLUMN user_profiles.name IS 'Nome do usuário';
COMMENT ON COLUMN user_profiles.avatar IS 'URL ou base64 do avatar do usuário';

-- =============================================
-- TABELA DE PROGRESSO DO PROTOCOLO
-- =============================================
CREATE TABLE IF NOT EXISTS protocol_progress (
  id BIGSERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  completed_days INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_email, product_id)
);

CREATE INDEX IF NOT EXISTS idx_protocol_progress_user_email ON protocol_progress(user_email);
CREATE INDEX IF NOT EXISTS idx_protocol_progress_product_id ON protocol_progress(product_id);

COMMENT ON TABLE protocol_progress IS 'Armazena o progresso do usuário nos protocolos (dias completados)';
COMMENT ON COLUMN protocol_progress.user_email IS 'Email do usuário';
COMMENT ON COLUMN protocol_progress.product_id IS 'ID do produto/protocolo';
COMMENT ON COLUMN protocol_progress.completed_days IS 'Array de dias completados';

-- =============================================
-- TABELA DE REGISTROS DE PESO
-- =============================================
CREATE TABLE IF NOT EXISTS weight_entries (
  id BIGSERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_entries_user_email ON weight_entries(user_email);
CREATE INDEX IF NOT EXISTS idx_weight_entries_recorded_at ON weight_entries(recorded_at);

COMMENT ON TABLE weight_entries IS 'Armazena os registros de peso dos usuários';
COMMENT ON COLUMN weight_entries.user_email IS 'Email do usuário';
COMMENT ON COLUMN weight_entries.weight IS 'Peso em kg';
COMMENT ON COLUMN weight_entries.recorded_at IS 'Data/hora do registro';
