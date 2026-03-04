import "server-only";

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { DEFAULT_BUDDIES } from "@/lib/default-buddies";

const DEFAULT_DATABASE_URL = "file:./data/aim.sqlite";
const SCHEMA_PATH = path.join(process.cwd(), "src/lib/db-schema.sql");

let dbSingleton: Database.Database | undefined;

function resolveSqlitePath(databaseUrl: string): string {
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

function initializeSchema(db: Database.Database): void {
  const schemaSql = fs.readFileSync(SCHEMA_PATH, "utf8");
  db.exec(schemaSql);
}

function seedDefaultBuddies(db: Database.Database): void {
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

  const insertMany = db.transaction(() => {
    for (const buddy of DEFAULT_BUDDIES) {
      insertBuddy.run(buddy);
    }
  });

  insertMany();
}

export function getDb(): Database.Database {
  if (dbSingleton) {
    return dbSingleton;
  }

  const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
  const sqlitePath = resolveSqlitePath(databaseUrl);
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });

  const db = new Database(sqlitePath);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  initializeSchema(db);
  seedDefaultBuddies(db);

  dbSingleton = db;
  return dbSingleton;
}

export function closeDb(): void {
  if (!dbSingleton) {
    return;
  }

  dbSingleton.close();
  dbSingleton = undefined;
}

export function initializeDb(db: Database.Database): void {
  initializeSchema(db);
  seedDefaultBuddies(db);
}
