import { defineHandler, getRouterParam, HTTPError } from "nitro/h3";
import { db } from "../../db";

export default defineHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  const user = await db
    .selectFrom("users")
    .select(["id", "email", "name", "oauth_provider", "created_at", "updated_at"])
    .where("id", "=", id)
    .executeTakeFirst();

  if (!user) {
    throw HTTPError.status(404, "User not found");
  }

  return { user };
});
