-- Gemini Bot - Database Migration
-- Creates table for storing bot conversation history

-- Bot conversations history
CREATE TABLE IF NOT EXISTS bot_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bot_conversations_user ON bot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_conversations_created ON bot_conversations(user_id, created_at DESC);
