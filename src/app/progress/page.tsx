"use client";

import { courses, getCourseLessons } from "@/data/courseData";
import {
  getCourseCompletionPercent,
  getCourseProgressSnapshot,
  subscribeToCourseProgress,
  type CourseProgressById,
} from "@/lib/courseStorage";
import { useRouter } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";

export default function ProgressPage() {
  const router = useRouter();
  const savedCourseProgressJson = useSyncExternalStore(
    subscribeToCourseProgress,
    getCourseProgressSnapshot,
    () => null
  );
  const courseProgress = useMemo(() => {
    if (!savedCourseProgressJson) {
      return {};
    }

    try {
      return JSON.parse(savedCourseProgressJson) as CourseProgressById;
    } catch {
      return {};
    }
  }, [savedCourseProgressJson]);
  const startedCourses = courses
    .map((course) => {
      const lessons = getCourseLessons(course);
      const progress = courseProgress[course.id] ?? null;

      return {
        course,
        lessons,
        progress,
        completionPercent: getCourseCompletionPercent(progress, lessons.length),
      };
    })
    .filter((summary) => summary.progress);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <button type="button" onClick={() => router.push("/")} className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            Back to dashboard
          </button>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Course Progress</h1>
          <p className="mt-2 text-sm text-slate-600">Track your ongoing course progress and completed lessons.</p>
        </header>

        <section className="grid gap-4">
          {startedCourses.length > 0 ? (
            startedCourses.map(({ course, lessons, progress, completionPercent }) => (
              <article key={course.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{course.category}</p>
                    <h2 className="mt-2 text-xl font-black text-slate-900">{course.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                  </div>
                  <button type="button" onClick={() => router.push(`/courses/${course.id}`)} className="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white">
                    Continue
                  </button>
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>{completionPercent}% complete</span>
                    <span>{progress?.completedLessonIds.length ?? 0}/{lessons.length} lessons</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full ${course.accentClass}`} style={{ width: `${completionPercent}%` }} />
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-lg">
              No course progress yet. Start a course from recommendations.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
