"use client";

import { courses } from "@/data/courseData";
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

export default function RecommendationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <button type="button" onClick={() => router.push("/")} className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            Back to dashboard
          </button>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Recommendations</h1>
          <p className="mt-2 text-sm text-slate-600">Expanded mentor and course recommendations for your development path.</p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold">Recommended Mentors</h2>
          <div className="mt-5 grid gap-4">
            {mentorList.slice(0, 6).map((mentor) => (
              <article key={mentor.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-400 text-sm font-bold text-white">
                    {getMentorInitials(mentor.name)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{mentor.name}</h3>
                    <p className="text-xs text-slate-600">{mentor.title}</p>
                    <p className="text-xs text-slate-500">{mentor.interestTopic}</p>
                  </div>
                </div>
                <button type="button" className="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white">Connect</button>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold">Recommended Courses</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {courses.map((course) => (
              <article key={course.id} className="rounded-2xl bg-slate-50 p-5">
                <div className={`h-2 w-16 rounded-full ${course.accentClass}`} />
                <h3 className="mt-4 text-base font-bold text-slate-900">{course.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                <button type="button" onClick={() => router.push(`/courses/${course.id}`)} className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                  Open course
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
