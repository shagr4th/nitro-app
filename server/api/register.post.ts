import { defineHandler, readBody, HTTPError } from "nitro/h3";
import { db } from "../db";
import { hashPassword } from "../utils/hash";
import { createSession } from "../utils/sessions";

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const { email, password, name } = body as { email: string; password: string; name?: string };

  if (!email || !password) {
    throw HTTPError.status(400, "Email and password are required");
  }

  const existing = await db
    .selectFrom("users")
    .select("id")
    .where("email", "=", email)
    .executeTakeFirst();

  if (existing) {
    throw HTTPError.status(409, "A user with this email already exists");
  }

  const passwordHash = await hashPassword(password);

  const user = await db
    .insertInto("users")
    .values({
      email,
      password_hash: passwordHash,
      name: name || null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  const token = await createSession(user.email);

  return { ok: true, token, user: { email: user.email, name: user.name, admin: false } };
});
