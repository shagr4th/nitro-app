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
  .addColumn("created_at", "text", (col) => col.notNull().defaultTo(new Date().toISOString()))
  .addColumn("updated_at", "text", (col) => col.notNull().defaultTo(new Date().toISOString()))
  .execute();
