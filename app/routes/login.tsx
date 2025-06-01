import { LoaderFunctionArgs } from "@remix-run/node";
import { ClientActionFunctionArgs, Form, redirect } from "@remix-run/react";
import { authenticator, sessionStorage } from "~/services/auth.server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

export default function Component({
  actionData,
}: {
  actionData?: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          {actionData?.error && (
            <div className="mb-4 rounded bg-destructive px-4 py-2 text-destructive-foreground">
              {actionData.error}
            </div>
          )}
          <Form method="post" className="space-y-6">
            <div>
              <Label htmlFor="email">Emailadres</Label>
              <Input
                type="email"
                name="email"
                id="email"
                required
                autoComplete="email"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="password">Wachtwoord</Label>
              <Input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                required
                className="mt-2"
              />
            </div>
            <CardFooter className="p-0">
              <Button type="submit" className="w-full">
                Inloggen
              </Button>
            </CardFooter>
          </Form>
        </CardContent>
      </Card>
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
