"use client";

import { courses } from "@/data/courseData";
import { useRouter } from "next/navigation";

export default function ResourcesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <button type="button" onClick={() => router.push("/")} className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            Back to dashboard
          </button>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Top-Rated Resources</h1>
          <p className="mt-2 text-sm text-slate-600">Courses and learning resources with strong member ratings.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {courses.map((course, index) => (
            <article key={course.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <div className={`h-2 w-16 rounded-full ${course.accentClass}`} />
              <h2 className="mt-4 text-lg font-bold text-slate-900">{course.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{course.description}</p>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                {index === 0 ? "5.0" : index === 1 ? "4.8" : "4.7"} ⭐ ({index === 0 ? "120" : index === 1 ? "85" : "64"} ratings)
              </p>
              <button type="button" onClick={() => router.push(`/courses/${course.id}`)} className="mt-4 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white">
                View
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
