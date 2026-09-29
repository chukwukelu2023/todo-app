import Link from "next/link";
import { signOut } from "@/auth";
import type { CurrentUser } from "@/lib/authz";

export function Header({ user }: { user: CurrentUser }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <nav className="flex items-center gap-5">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Todo
          </Link>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            Tasks
          </Link>
          {user.role === "ADMIN" && (
            <Link href="/admin/users" className="text-sm text-slate-600 hover:text-slate-900">
              Users
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-700">{user.name}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-medium ${
              user.role === "ADMIN" ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-600"
            }`}
          >
            {user.role === "ADMIN" ? "Admin" : "User"}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="text-slate-600 underline-offset-2 hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
