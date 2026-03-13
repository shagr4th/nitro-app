import { defineHandler, getRouterParam, HTTPError } from "nitro/h3";
import { db } from "../../db";
import { requireAdmin } from "../../utils/auth";

export default defineHandler(async (event) => {
  await requireAdmin(event);
  const id = Number(getRouterParam(event, "id"));

  const user = await db
    .selectFrom("users")
    .select(["id", "email", "name", "admin", "oauth_provider", "created_at", "updated_at"])
    .where("id", "=", id)
    .executeTakeFirst();

  if (!user) {
    throw HTTPError.status(404, "User not found");
  }

  return { user };
});
