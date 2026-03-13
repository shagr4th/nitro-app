import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface UsersTable {
  id: Generated<number>;
  email: string;
  password_hash: string | null;
  oauth_provider: string | null;
  oauth_id: string | null;
  name: string | null;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

export interface Database {
  users: UsersTable;
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;
