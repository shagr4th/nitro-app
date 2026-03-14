import { db } from "../db";

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(email: string): Promise<string> {
  const token = crypto.randomUUID();
  const expires_at = new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString();
  await db
    .insertInto("sessions")
    .values({ token, email, expires_at })
    .execute();
  return token;
}

export async function getSession(token: string): Promise<{ email: string } | undefined> {
  const session = await db
    .selectFrom("sessions")
    .select(["email", "expires_at"])
    .where("token", "=", token)
    .executeTakeFirst();

  if (!session) return undefined;

  if (new Date(session.expires_at) <= new Date()) {
    await deleteSession(token);
    return undefined;
  }

  return { email: session.email };
}

export async function deleteSession(token: string): Promise<void> {
  await db
    .deleteFrom("sessions")
    .where("token", "=", token)
    .execute();
}
