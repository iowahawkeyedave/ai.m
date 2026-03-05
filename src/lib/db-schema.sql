PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS buddies (
  id TEXT PRIMARY KEY,
  displayName TEXT NOT NULL,
  avatarUrl TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  systemPrompt TEXT,
  statusFlavor TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  buddyId TEXT NOT NULL,
  title TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buddyId) REFERENCES buddies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversationId TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  modelUsed TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  conversationId TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('model_switch', 'fallback', 'tool_start', 'tool_end', 'error')),
  payloadJson TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_conversations_buddy_updated
  ON conversations (buddyId, updatedAt DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages (conversationId, createdAt ASC);

CREATE INDEX IF NOT EXISTS idx_events_conversation_created
  ON events (conversationId, createdAt ASC);
