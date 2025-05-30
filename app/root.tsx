import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col items-center py-6">
        {/* Logo */}
        <div className="mb-8">
          <img src="/logo.png" alt="Logo" className="h-12 w-12 rounded-full" />
        </div>
        {/* Navigation Links */}
      </aside>
      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <Layout>
      {" "}
      {isLogin ? (
        <Outlet />
      ) : (
        <SidebarLayout>
          <Outlet />
        </SidebarLayout>
      )}
    </Layout>
  );
}
