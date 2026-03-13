import { defineHandler } from "nitro/h3";
import { db } from "../../db";
import { requireAdmin } from "../../utils/auth";

export default defineHandler(async (event) => {
  await requireAdmin(event);

  const users = await db
    .selectFrom("users")
    .select(["id", "email", "name", "admin", "oauth_provider", "created_at", "updated_at"])
    .orderBy("created_at", "desc")
    .execute();

  return { users };
});
