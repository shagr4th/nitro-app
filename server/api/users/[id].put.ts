import { defineHandler, readBody, getRouterParam, HTTPError } from "nitro/h3";
import { db } from "../../db";

export default defineHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const { email, name } = body as { email?: string; name?: string };

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
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

  return { user: { id: user.id, email: user.email, name: user.name } };
});
