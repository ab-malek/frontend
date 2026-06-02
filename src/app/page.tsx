import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#fef3c7_45%,_#fee2e2)] px-6 py-16">
      <main className="mx-auto w-full max-w-3xl rounded-3xl bg-white/75 p-10 shadow-2xl backdrop-blur">

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/signup"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-slate-900">Signup</h2>
            <p className="mt-2 text-slate-600">POST /api/auth/signup</p>
          </Link>

          <Link
            href="/login"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-slate-900">Login</h2>
            <p className="mt-2 text-slate-600">POST /api/auth/login</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
