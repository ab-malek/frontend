"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { login } from "@/lib/authApi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    setToken("");

    try {
      const response = await login({ email, password });
      setMessage(response.message || "Login successful");
      if (response.token) {
        setToken(response.token);
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : "Login failed";
      setError(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-cyan-100 to-emerald-100 px-6 py-12">
      <main className="mx-auto w-full max-w-md rounded-2xl bg-white/85 p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">Log in with your existing account.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none ring-0 transition focus:border-cyan-400 text-slate-900 placeholder-slate-400"
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
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none ring-0 transition focus:border-cyan-400 text-slate-900 placeholder-slate-400"
              placeholder="password123"
            />
          </label>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message ? <p className="mt-4 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {token ? (
          <p className="mt-4 break-all rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">
            Token: {token}
          </p>
        ) : null}

        <p className="mt-6 text-sm text-slate-700">
          Need an account?{" "}
          <Link className="font-semibold text-slate-900 underline" href="/signup">
            Go to signup
          </Link>
        </p>
      </main>
    </div>
  );
}
