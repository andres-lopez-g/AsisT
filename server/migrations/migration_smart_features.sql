-- Phase 1A: Smart Rules Engine - Database Migration
-- Creates tables for smart categorization, recurring detection, and forecasting

-- Categorization rules learned from user behavior
CREATE TABLE IF NOT EXISTS categorization_rules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  pattern VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  confidence DECIMAL(3, 2) DEFAULT 0.80,
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, pattern)
);

-- Detected recurring transactions
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  merchant_pattern VARCHAR(255) NOT NULL,
  amount_avg DECIMAL(10, 2) NOT NULL,
  amount_variance DECIMAL(10, 2) DEFAULT 0,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
  next_expected_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User forecast preferences and thresholds
CREATE TABLE IF NOT EXISTS forecast_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  low_balance_threshold DECIMAL(10, 2) DEFAULT 100.00,
  alert_days_ahead INTEGER DEFAULT 7,
  include_variable_spending BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_categorization_rules_user ON categorization_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_categorization_rules_pattern ON categorization_rules(user_id, pattern);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_active ON recurring_transactions(user_id, is_active);
