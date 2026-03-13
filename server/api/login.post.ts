import { defineHandler, readBody, HTTPError } from "nitro/h3";
import { db } from "../db";
import { verifyPassword } from "../utils/hash";
import { createSession } from "../utils/sessions";

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body as { email: string; password: string };

  if (!email || !password) {
    throw HTTPError.status(400, "Email and password are required");
  }

  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();

  if (!user || !user.password_hash) {
    throw HTTPError.status(401, "Invalid email or password");
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    throw HTTPError.status(401, "Invalid email or password");
  }

  const token = await createSession(user.email);

  return { ok: true, token, user: { email: user.email, name: user.name, admin: !!user.admin } };
});
