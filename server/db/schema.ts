import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface UsersTable {
  id: Generated<number>;
  email: string;
  password_hash: string | null;
  oauth_provider: string | null;
  oauth_id: string | null;
  name: string | null;
  admin: Generated<number>;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

export interface SessionsTable {
  token: string;
  email: string;
  expires_at: string;
  created_at: Generated<string>;
}

export interface UserRightsTable {
  id: Generated<number>;
  user_id: number;
  right: string;
  created_at: Generated<string>;
}

export interface Database {
  users: UsersTable;
  sessions: SessionsTable;
  user_rights: UserRightsTable;
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;
