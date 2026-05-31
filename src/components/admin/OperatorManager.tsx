"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Operator = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

type Props = { initial: Operator[] };

export function OperatorManager({ initial }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initial);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"OPERATOR" | "SUPER_ADMIN">("OPERATOR");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add user");
      setUsers((u) => [...u, data]);
      setEmail("");
      setName("");
      setPassword("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function removeUser(id: string) {
    if (!confirm("Remove this operator?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Delete failed");
      return;
    }
    setUsers((u) => u.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={addUser} className="border border-[var(--color-border)] bg-white p-6">
        <h2 className="font-bold text-[var(--color-ink)]">Add operator</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Operators can edit resources and curriculum. Super admins can also manage accounts.
        </p>
        {error && (
          <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
            />
          </label>
          <label className="text-sm font-semibold">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
            />
          </label>
          <label className="text-sm font-semibold">
            Password (min 8)
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
            />
          </label>
          <label className="text-sm font-semibold">
            Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "OPERATOR" | "SUPER_ADMIN")}
              className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
            >
              <option value="OPERATOR">Operator</option>
              <option value="SUPER_ADMIN">Super admin</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-[var(--color-accent)] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {loading ? "Adding…" : "Add operator"}
        </button>
      </form>

      <table className="w-full border-collapse border border-[var(--color-border)] bg-white text-sm">
        <thead className="bg-[var(--color-surface)] text-left">
          <tr>
            <th className="p-3">Email</th>
            <th className="p-3">Name</th>
            <th className="p-3">Role</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border-t border-[var(--color-border)] p-3">{u.email}</td>
              <td className="border-t border-[var(--color-border)] p-3">{u.name ?? "—"}</td>
              <td className="border-t border-[var(--color-border)] p-3">{u.role}</td>
              <td className="border-t border-[var(--color-border)] p-3 text-right">
                <button
                  type="button"
                  onClick={() => void removeUser(u.id)}
                  className="text-sm font-semibold text-red-700 hover:underline"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
