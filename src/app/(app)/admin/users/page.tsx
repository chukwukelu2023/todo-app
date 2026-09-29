import type { Metadata } from "next";
import Link from "next/link";
import { LocalTime } from "@/components/LocalTime";
import { UserForm } from "@/components/UserForm";
import { requireAdmin } from "@/lib/authz";
import { listUsers } from "@/lib/users";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  await requireAdmin();
  const users = await listUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">Create accounts and see who owns which tasks.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm md:col-span-2">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Role</th>
                <th scope="col" className="px-4 py-3">Tasks</th>
                <th scope="col" className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{u.role === "ADMIN" ? "Admin" : "User"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/?userId=${u.id}`} className="text-blue-700 hover:underline">
                      {u._count.tasks}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    <LocalTime value={u.createdAt} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Create user</h2>
          <UserForm />
        </section>
      </div>
    </div>
  );
}
