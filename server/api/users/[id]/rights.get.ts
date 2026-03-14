import { defineHandler, getRouterParam, HTTPError } from "nitro/h3";
import { db } from "../../../db";
import { requireAdmin } from "../../../utils/auth";

export default defineHandler(async (event) => {
  await requireAdmin(event);
  const id = Number(getRouterParam(event, "id"));

  const user = await db
    .selectFrom("users")
    .select("id")
    .where("id", "=", id)
    .executeTakeFirst();

  if (!user) {
    throw HTTPError.status(404, "User not found");
  }

  const rights = await db
    .selectFrom("user_rights")
    .select("right")
    .where("user_id", "=", id)
    .execute();

  return { rights: rights.map((r) => r.right) };
});
