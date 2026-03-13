import { defineHandler, getHeader, HTTPError } from "nitro/h3";
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
    .select(["id", "email", "name", "admin"])
    .where("email", "=", session.email)
    .executeTakeFirst();

  if (!user) {
    throw HTTPError.status(401, "User not found");
  }

  return { user: { email: user.email, name: user.name, admin: !!user.admin } };
});
