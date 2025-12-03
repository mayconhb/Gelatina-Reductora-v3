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

-- =============================================
-- TABELAS DE ANALYTICS
-- =============================================

-- Tabela principal de eventos (append-only)
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  user_email VARCHAR(255),
  event_name VARCHAR(100) NOT NULL,
  product_id VARCHAR(50),
  properties JSONB DEFAULT '{}',
  session_id VARCHAR(100),
  device_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_email ON analytics_events(user_email);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_id ON analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

COMMENT ON TABLE analytics_events IS 'Eventos de uso do app para analytics';
COMMENT ON COLUMN analytics_events.event_name IS 'Nome do evento: app_open, product_view, checkout_click, protocol_complete, weight_add, etc';
COMMENT ON COLUMN analytics_events.properties IS 'Propriedades adicionais do evento em JSON';
COMMENT ON COLUMN analytics_events.session_id IS 'ID da sessão do usuário';
COMMENT ON COLUMN analytics_events.device_type IS 'Tipo de dispositivo: mobile, desktop, tablet';

-- Tabela de usuários ativos diários (agregação)
CREATE TABLE IF NOT EXISTS daily_active_users (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_users INTEGER NOT NULL DEFAULT 0,
  new_users INTEGER NOT NULL DEFAULT 0,
  returning_users INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_active_users_date ON daily_active_users(date);

COMMENT ON TABLE daily_active_users IS 'Contagem de usuários ativos por dia';

-- Tabela de uso de funcionalidades por dia
CREATE TABLE IF NOT EXISTS feature_usage_daily (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  product_id VARCHAR(50),
  event_count INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(date, event_name, product_id)
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_daily_date ON feature_usage_daily(date);
CREATE INDEX IF NOT EXISTS idx_feature_usage_daily_event_name ON feature_usage_daily(event_name);

COMMENT ON TABLE feature_usage_daily IS 'Uso de funcionalidades agregado por dia';

-- Tabela de visualizações de produtos por dia
CREATE TABLE IF NOT EXISTS product_views_daily (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,
  checkout_clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(date, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_views_daily_date ON product_views_daily(date);
CREATE INDEX IF NOT EXISTS idx_product_views_daily_product_id ON product_views_daily(product_id);

COMMENT ON TABLE product_views_daily IS 'Visualizações de produtos agregadas por dia';

-- Tabela de sessões de usuários
CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  device_type VARCHAR(50),
  is_first_session BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_email ON user_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);

COMMENT ON TABLE user_sessions IS 'Sessões de usuários para tracking de engagement';
