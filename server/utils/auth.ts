import type { H3Event } from "nitro/h3";
import { getHeader, HTTPError } from "nitro/h3";
import { getSession } from "./sessions";
import { db } from "../db";

export async function requireAdmin(event: H3Event) {
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
    .selectAll()
    .where("email", "=", session.email)
    .executeTakeFirst();

  if (!user || !user.admin) {
    throw HTTPError.status(403, "Admin access required");
  }

  return user;
}
