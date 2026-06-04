"use client";

import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <button type="button" onClick={() => router.push("/")} className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            Back to dashboard
          </button>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Industry & Company Analytics</h1>
          <p className="mt-2 text-sm text-slate-600">Expanded market, company, and hiring insights.</p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-black">Maryland Cybersecurity Market</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5"><p className="text-sm text-slate-600">Job Growth</p><p className="mt-2 text-2xl font-black text-emerald-600">+40%</p></div>
            <div className="rounded-2xl bg-slate-50 p-5"><p className="text-sm text-slate-600">Open Positions</p><p className="mt-2 text-2xl font-black">~6,500</p></div>
            <div className="rounded-2xl bg-slate-50 p-5"><p className="text-sm text-slate-600">Average Salary</p><p className="mt-2 text-2xl font-black">$102k+</p></div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-black">Company Spotlight: reAlpha Tech Corp (AIRE)</h2>
          <div className="mt-5 grid gap-3 text-sm">
            <p><span className="font-semibold">Current Stock Price:</span> $0.36 USD</p>
            <p><span className="font-semibold">1-Year Change:</span> <span className="font-black text-red-500">-74.82%</span></p>
            <p><span className="font-semibold">Market Cap:</span> $17.9M</p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-black">Hiring Trends</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Strong focus on roles related to AI and real estate technology.</li>
              <li>Looking for talent with US GAAP and SEC reporting experience.</li>
              <li>Finance operations roles remain active across emerging technology companies.</li>
            </ul>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-black">In-Demand Positions</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>US Accountant</li>
              <li>Senior Finance Associate</li>
              <li>SEC Reporting Analyst</li>
              <li>Cybersecurity Operations Specialist</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
