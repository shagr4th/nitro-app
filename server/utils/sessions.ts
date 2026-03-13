import { db } from "../db";

export async function createSession(email: string): Promise<string> {
  const token = crypto.randomUUID();
  await db
    .insertInto("sessions")
    .values({ token, email })
    .execute();
  return token;
}

export async function getSession(token: string): Promise<{ email: string } | undefined> {
  const session = await db
    .selectFrom("sessions")
    .select("email")
    .where("token", "=", token)
    .executeTakeFirst();
  return session || undefined;
}

export async function deleteSession(token: string): Promise<void> {
  await db
    .deleteFrom("sessions")
    .where("token", "=", token)
    .execute();
}
