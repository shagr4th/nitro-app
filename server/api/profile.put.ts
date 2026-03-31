import { defineHandler, readBody, getHeader, HTTPError } from "nitro/h3";
import { getSession } from "../utils/sessions";
import { db } from "../db";

export default defineHandler(async (event) => {
  const auth = getHeader(event, "authorization");
  const token = auth?.replace("Bearer ", "");

  if (!token) {
    throw HTTPError.status(401, "Not authenticated");
  }

  const session = await getSession(token);
  if (!session) {
    throw HTTPError.status(401, "Invalid token");
  }

  const user = await db
    .selectFrom("users")
    .select(["id", "email", "name"])
    .where("email", "=", session.email)
    .executeTakeFirst();

  if (!user) {
    throw HTTPError.status(401, "User not found");
  }

  const body = await readBody(event);
  const { name } = body as { name?: string };

  // Only update name (the fields supported by DB schema)
  const updated = await db
    .updateTable("users")
    .set({
      ...(name !== undefined && { name }),
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", user.id)
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      admin: !!updated.admin,
    },
  };
});
