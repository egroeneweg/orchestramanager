import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { query } from "~/services/pg.server";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { sessionStorage } from "~/services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  //   const session = await sessionStorage.getSession(
  //     request.headers.get("Cookie")
  //   );
  //   const user = session.get("user");
  //   if (!user || !user.isAdmin) {
  //     throw redirect("/login");
  //   }

  const result = await query<{
    user_id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    is_admin: boolean;
    created_at: string;
  }>(
    "SELECT user_id, username, first_name, last_name, email, is_admin, created_at FROM users ORDER BY last_name, first_name"
  );

  return Response.json({ users: result.rows });
};

export default function MembersPage() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <Card className="max-w-4xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.user_id}>
                <TableCell>
                  {u.first_name} {u.last_name}
                </TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {u.is_admin ? (
                    <span className="text-green-600 font-semibold">Yes</span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(u.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
