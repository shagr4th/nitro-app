import { defineHandler, readBody, getRouterParam, HTTPError } from "nitro/h3";
import { db } from "../../../db";
import { requireAdmin } from "../../../utils/auth";

export default defineHandler(async (event) => {
  await requireAdmin(event);
  const id = Number(getRouterParam(event, "id"));

  const body = await readBody(event);
  const { rights } = body as { rights: string[] };

  if (!Array.isArray(rights)) {
    throw HTTPError.status(400, "rights must be an array of strings");
  }

  const user = await db
    .selectFrom("users")
    .select("id")
    .where("id", "=", id)
    .executeTakeFirst();

  if (!user) {
    throw HTTPError.status(404, "User not found");
  }

  // Replace all rights: delete existing, insert new
  await db
    .deleteFrom("user_rights")
    .where("user_id", "=", id)
    .execute();

  if (rights.length > 0) {
    await db
      .insertInto("user_rights")
      .values(rights.map((right) => ({ user_id: id, right })))
      .execute();
  }

  return { rights };
});
