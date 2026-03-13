import { defineHandler, readBody, HTTPError } from "nitro/h3";
import { db } from "../../db";
import { requireAdmin } from "../../utils/auth";
import { hashPassword } from "../../utils/hash";

export default defineHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody(event);
  const { email, password, name, admin } = body as {
    email: string;
    password?: string;
    name?: string;
    admin?: number;
  };

  if (!email) {
    throw HTTPError.status(400, "Email is required");
  }

  const existing = await db
    .selectFrom("users")
    .select("id")
    .where("email", "=", email)
    .executeTakeFirst();

  if (existing) {
    throw HTTPError.status(409, "A user with this email already exists");
  }

  const user = await db
    .insertInto("users")
    .values({
      email,
      password_hash: password ? await hashPassword(password) : null,
      name: name || null,
      admin: admin ?? 0,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return { user: { id: user.id, email: user.email, name: user.name, admin: !!user.admin } };
});
