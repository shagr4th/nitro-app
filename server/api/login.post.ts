import { defineHandler, readBody, HTTPError } from "nitro/h3";
import { db } from "../db";
import { verifyPassword } from "../utils/hash";

// In-memory token store (use a real session store in production)
export const tokenStore = new Map<string, { email: string; admin: boolean }>();

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

  const token = crypto.randomUUID();
  const admin = !!user.admin;
  tokenStore.set(token, { email: user.email, admin });

  return { ok: true, token, user: { email: user.email, name: user.name, admin } };
});
