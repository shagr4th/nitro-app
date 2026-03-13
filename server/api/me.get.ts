import { defineHandler, getHeader, HTTPError } from "nitro/h3";
import { tokenStore } from "./login.post";

export default defineHandler((event) => {
  const auth = getHeader(event, "authorization");
  const token = auth?.replace("Bearer ", "");

  if (!token) {
    throw HTTPError.status(401, "Not authenticated");
  }

  const user = tokenStore.get(token);
  if (!user) {
    throw HTTPError.status(401, "Invalid token");
  }

  return { user };
});
