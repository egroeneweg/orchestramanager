import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { createCookieSessionStorage } from "@remix-run/node";

import { query } from "~/services/pg.server";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets:
      process.env.NODE_ENV === "production"
        ? [process.env.COOKIE_SECRET!]
        : ["s3cr3t"],
    secure: process.env.NODE_ENV === "production",
  },
});

export const authenticator = new Authenticator<User>();

async function login(email: string, password: string): Promise<User | null> {
  const result = await query(
    "SELECT id, email, first_name, last_name FROM users WHERE email = $1 AND password = crypt($2, password)",
    [email, password]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
  };
}

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await login(email, password);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    return user;
  }),
  "user-pass"
);
