import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { Database } from "./schema";

const dialect = new SqliteDialect({
  database: new SQLite("data.db"),
});

export const db = new Kysely<Database>({ dialect });

// Run migrations on first import
await db.schema
  .createTable("users")
  .ifNotExists()
  .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
  .addColumn("email", "text", (col) => col.notNull().unique())
  .addColumn("password_hash", "text")
  .addColumn("oauth_provider", "text")
  .addColumn("oauth_id", "text")
  .addColumn("name", "text")
  .addColumn("admin", "integer", (col) => col.notNull().defaultTo(0))
  .addColumn("created_at", "text", (col) => col.notNull().defaultTo(new Date().toISOString()))
  .addColumn("updated_at", "text", (col) => col.notNull().defaultTo(new Date().toISOString()))
  .execute();

await db.schema
  .createTable("sessions")
  .ifNotExists()
  .addColumn("token", "text", (col) => col.primaryKey())
  .addColumn("email", "text", (col) => col.notNull())
  .addColumn("created_at", "text", (col) => col.notNull().defaultTo(new Date().toISOString()))
  .execute();

// Migration: add admin column to existing tables
await db.schema
  .alterTable("users")
  .addColumn("admin", "integer", (col) => col.notNull().defaultTo(0))
  .execute()
  .catch(() => { /* column already exists */ });
