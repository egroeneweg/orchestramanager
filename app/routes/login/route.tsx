import { LoaderFunctionArgs } from "@remix-run/node";
import { ClientActionFunctionArgs, Form, redirect } from "@remix-run/react";
import { authenticator, sessionStorage } from "~/services/auth.server";

export default function Component({
  actionData,
}: {
  actionData?: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Login</h1>

        {actionData?.error ? (
          <div className="mb-4 rounded bg-destructive px-4 py-2 text-destructive-foreground">
            {actionData.error}
          </div>
        ) : null}

        <Form method="post">
          <div className="mb-6">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Emailadres
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Wachtwoord
            </label>
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Inloggen
          </button>
        </Form>
      </div>
    </div>
  );
}

export async function action({ request }: ClientActionFunctionArgs) {
  try {
    const user = await authenticator.authenticate("user-pass", request);

    const session = await sessionStorage.getSession(
      request.headers.get("cookie")
    );

    session.set("user", user);

    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message });
    }

    throw error;
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const user = session.get("user");
  const referer = request.headers.get("referer");

  if (user) {
    return redirect(referer ?? "/");
  }

  return Response.json(null);
}
