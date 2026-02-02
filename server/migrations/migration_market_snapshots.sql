-- Market Snapshots Migration
-- Creates table to cache daily market data for Smart Investments feature

-- Market snapshots for stocks and crypto data
CREATE TABLE IF NOT EXISTS market_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('stock', 'crypto')),
  payload JSONB NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by type and date
CREATE INDEX IF NOT EXISTS idx_market_snapshots_type_date ON market_snapshots(type, fetched_at DESC);

-- Comment for clarity
COMMENT ON TABLE market_snapshots IS 'Caches daily snapshots of stock and crypto market data to avoid rate limits';
COMMENT ON COLUMN market_snapshots.type IS 'Type of market data: stock or crypto';
COMMENT ON COLUMN market_snapshots.payload IS 'JSON payload containing market data from external APIs';
COMMENT ON COLUMN market_snapshots.fetched_at IS 'Timestamp when the data was fetched from external API';
