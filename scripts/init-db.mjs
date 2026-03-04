import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DEFAULT_DATABASE_URL = "file:./data/aim.sqlite";
const SCHEMA_PATH = path.join(process.cwd(), "src/lib/db-schema.sql");
const DEFAULT_BUDDIES = [
  {
    id: "buddy-sonnet",
    displayName: "Sonnet",
    avatarUrl: null,
    provider: "anthropic",
    model: "anthropic/claude-sonnet-4-6",
    systemPrompt: null,
    statusFlavor: "online",
  },
  {
    id: "buddy-codex",
    displayName: "Codex",
    avatarUrl: null,
    provider: "openai-codex",
    model: "openai/codex",
    systemPrompt: null,
    statusFlavor: "online",
  },
  {
    id: "buddy-kimi",
    displayName: "Kimi",
    avatarUrl: null,
    provider: "kimi-coding",
    model: "moonshot/kimi-k2",
    systemPrompt: null,
    statusFlavor: "away",
  },
  {
    id: "buddy-ollama",
    displayName: "Ollama",
    avatarUrl: null,
    provider: "ollama",
    model: "ollama/qwen2.5-coder:latest",
    systemPrompt: null,
    statusFlavor: "invisible",
  },
];

function resolveSqlitePath(databaseUrl) {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error(
      `Invalid DATABASE_URL "${databaseUrl}". Expected SQLite URL starting with file:.`,
    );
  }

  const filePath = databaseUrl.slice("file:".length);
  if (!filePath) {
    throw new Error("DATABASE_URL points to an empty SQLite path.");
  }

  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
}

const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
const sqlitePath = resolveSqlitePath(databaseUrl);

fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });

const db = new Database(sqlitePath);
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");
db.exec(fs.readFileSync(SCHEMA_PATH, "utf8"));

const insertBuddy = db.prepare(`
  INSERT OR IGNORE INTO buddies (
    id,
    displayName,
    avatarUrl,
    provider,
    model,
    systemPrompt,
    statusFlavor
  ) VALUES (
    @id,
    @displayName,
    @avatarUrl,
    @provider,
    @model,
    @systemPrompt,
    @statusFlavor
  )
`);

const insertDefaultBuddies = db.transaction(() => {
  for (const buddy of DEFAULT_BUDDIES) {
    insertBuddy.run(buddy);
  }
});

insertDefaultBuddies();
db.close();

console.log(`SQLite schema initialized and default buddies seeded at ${sqlitePath}`);
