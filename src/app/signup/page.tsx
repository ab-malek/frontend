"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signup } from "@/lib/authApi";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await signup({ name, email, password });
      setMessage(response.message || "Signup successful");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      const text = err instanceof Error ? err.message : "Signup failed";
      setError(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 px-6 py-12">
      <main className="mx-auto w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">Sign up using your Express API.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none ring-0 transition focus:border-orange-400 text-slate-900 placeholder-slate-400"
              placeholder="John Doe"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none ring-0 transition focus:border-orange-400 text-slate-900 placeholder-slate-400"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none ring-0 transition focus:border-orange-400 text-slate-900 placeholder-slate-400"
              placeholder="password123"
            />
          </label>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        {message ? <p className="mt-4 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <p className="mt-6 text-sm text-slate-700">
          Already have an account?{" "}
          <Link className="font-semibold text-slate-900 underline" href="/login">
            Go to login
          </Link>
        </p>
      </main>
    </div>
  );
}
