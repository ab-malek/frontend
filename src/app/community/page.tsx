"use client";

import { useRouter } from "next/navigation";

export default function CommunityPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <button type="button" onClick={() => router.push("/")} className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            Back to dashboard
          </button>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Community Highlights</h1>
          <p className="mt-2 text-sm text-slate-600">More updates from members, mentors, and learning activity.</p>
        </header>

        <section className="grid gap-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
            <p className="text-sm text-slate-900"><span className="font-bold">Liam Kim</span> was just nominated for <span className="font-bold">Mentor of the Month</span>!</p>
            <p className="mt-1 text-xs text-slate-500">2 hours ago</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
            <p className="text-sm text-slate-900"><span className="font-bold">Maria J.</span> just completed her <span className="font-bold">Promotion Preparation</span> goal!</p>
            <p className="mt-1 text-xs text-slate-500">Yesterday</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
            <p className="text-sm text-slate-900"><span className="font-bold">Priya Shah</span> hosted a live portfolio review workshop.</p>
            <p className="mt-1 text-xs text-slate-500">2 days ago</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
            <p className="text-sm text-slate-900"><span className="font-bold">Daniel Brooks</span> shared a new interview prep checklist.</p>
            <p className="mt-1 text-xs text-slate-500">Last week</p>
          </article>
        </section>
      </main>
    </div>
  );
}
