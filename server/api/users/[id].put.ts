import { defineHandler, readBody, getRouterParam, HTTPError } from "nitro/h3";
import { db } from "../../db";
import { requireAdmin } from "../../utils/auth";

export default defineHandler(async (event) => {
  await requireAdmin(event);
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const { email, name, admin } = body as { email?: string; name?: string; admin?: number };

  const existing = await db
    .selectFrom("users")
    .select("id")
    .where("id", "=", id)
    .executeTakeFirst();

  if (!existing) {
    throw HTTPError.status(404, "User not found");
  }

  const user = await db
    .updateTable("users")
    .set({
      ...(email !== undefined && { email }),
      ...(name !== undefined && { name }),
      ...(admin !== undefined && { admin }),
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

  return { user: { id: user.id, email: user.email, name: user.name, admin: !!user.admin } };
});
