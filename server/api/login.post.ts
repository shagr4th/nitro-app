import { defineHandler, readBody, HTTPError } from "nitro/h3";

const DEMO_USER = {
  email: "admin@example.com",
  password: "password",
};

// In-memory token store (demo only — use a real session store in production)
export const tokenStore = new Map<string, { email: string }>();

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body as { email: string; password: string };

  if (!email || !password) {
    throw HTTPError.status(400, "Email and password are required");
  }

  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    const token = crypto.randomUUID();
    tokenStore.set(token, { email });
    return { ok: true, token, user: { email } };
  }

  throw HTTPError.status(401, "Invalid email or password");
});
