import { defineHandler, getRouterParam, HTTPError } from "nitro/h3";
import { db } from "../../db";

export default defineHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  const result = await db
    .deleteFrom("users")
    .where("id", "=", id)
    .executeTakeFirst();

  if (result.numDeletedRows === 0n) {
    throw HTTPError.status(404, "User not found");
  }

  return { ok: true };
});
