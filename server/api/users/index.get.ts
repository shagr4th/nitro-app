import { defineHandler } from "nitro/h3";
import { db } from "../../db";

export default defineHandler(async () => {
  const users = await db
    .selectFrom("users")
    .select(["id", "email", "name", "oauth_provider", "created_at", "updated_at"])
    .orderBy("created_at", "desc")
    .execute();

  return { users };
});
