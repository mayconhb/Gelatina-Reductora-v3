-- SQL para criar a tabela de compras no Supabase
-- Execute este SQL no SQL Editor do Supabase

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

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_purchases_user_email ON purchases(user_email);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_user_email_status ON purchases(user_email, status);

-- Comentários para documentação
COMMENT ON TABLE purchases IS 'Registra as compras de produtos feitas na Hotmart';
COMMENT ON COLUMN purchases.user_email IS 'Email do comprador na Hotmart';
COMMENT ON COLUMN purchases.product_id IS 'ID do produto no app (p1, p2, p3, l1, l2)';
COMMENT ON COLUMN purchases.hotmart_product_id IS 'ID do produto na Hotmart';
COMMENT ON COLUMN purchases.hotmart_transaction_id IS 'ID da transação na Hotmart';
COMMENT ON COLUMN purchases.status IS 'Status da compra: active, refunded, cancelled';
