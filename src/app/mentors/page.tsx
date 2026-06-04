"use client";

import { mentorList } from "@/data/homeData";
import { useRouter } from "next/navigation";

function getMentorInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function MentorsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <button type="button" onClick={() => router.push("/")} className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            Back to dashboard
          </button>
          <h1 className="mt-4 text-3xl font-black tracking-tight">All Mentors</h1>
          <p className="mt-2 text-sm text-slate-600">Browse mentors available for sessions and recommendations.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {mentorList.map((mentor) => (
            <article key={mentor.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-400 text-sm font-bold text-white">
                  {getMentorInitials(mentor.name)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{mentor.name}</h2>
                  <p className="text-sm text-slate-600">{mentor.title}</p>
                  <p className="mt-2 text-sm font-semibold text-blue-700">{mentor.interestTopic}</p>
                  <p className="mt-2 text-sm text-slate-600">{mentor.focus}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Availability: {mentor.availability}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
