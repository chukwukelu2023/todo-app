"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch, type FieldErrors } from "./api";
import { FieldError } from "./TaskForm";
import { inputClass, labelClass, primaryButton } from "./ui";

const EMPTY = { name: "", email: "", password: "", role: "USER" };

export function UserForm() {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    try {
      await apiFetch("/api/users", { method: "POST", body: JSON.stringify(values) });
      setSuccess(`Created ${values.email}`);
      setValues(EMPTY);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues({ ...values, [key]: e.target.value });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      )}
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input id="name" className={inputClass} value={values.name} onChange={set("name")} required />
        <FieldError messages={fieldErrors.name} />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          className={inputClass}
          value={values.email}
          onChange={set("email")}
          required
        />
        <FieldError messages={fieldErrors.email} />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          type="password"
          className={inputClass}
          value={values.password}
          onChange={set("password")}
          minLength={8}
          autoComplete="new-password"
          required
        />
        <FieldError messages={fieldErrors.password} />
      </div>
      <div>
        <label htmlFor="role" className={labelClass}>
          Role
        </label>
        <select id="role" className={inputClass} value={values.role} onChange={set("role")}>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <button type="submit" className={primaryButton} disabled={saving}>
        {saving ? "Creating…" : "Create user"}
      </button>
    </form>
  );
}
