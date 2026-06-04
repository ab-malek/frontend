"use client";

import { getCourseById, getCourseLessons } from "@/data/courseData";
import {
  getAuthToken,
  getServerAuthTokenSnapshot,
  subscribeToAuthToken,
} from "@/lib/authStorage";
import {
  getCourseCompletionPercent,
  getCourseProgressSnapshot,
  setCurrentLesson,
  startCourse,
  subscribeToCourseProgress,
  toggleLessonCompletion,
  type CourseProgressById,
} from "@/lib/courseStorage";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const authToken = useSyncExternalStore(
    subscribeToAuthToken,
    getAuthToken,
    getServerAuthTokenSnapshot
  );
  const savedCourseProgressJson = useSyncExternalStore(
    subscribeToCourseProgress,
    getCourseProgressSnapshot,
    () => null
  );
  const course = getCourseById(courseId);
  const lessons = useMemo(() => (course ? getCourseLessons(course) : []), [course]);
  const allLessonIds = useMemo(() => lessons.map((lesson) => lesson.id), [lessons]);
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
  const progress = course ? courseProgress[course.id] ?? null : null;
  const completionPercent = getCourseCompletionPercent(progress, lessons.length);
  const firstLessonId = lessons[0]?.id ?? null;
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const selectedLesson =
    lessons.find((lesson) => lesson.id === selectedLessonId) ??
    lessons.find((lesson) => lesson.id === progress?.currentLessonId) ??
    lessons[0] ??
    null;

  useEffect(() => {
    if (authToken === null) {
      router.replace("/login");
    }
  }, [authToken, router]);

  function handleStartCourse() {
    if (!course) {
      return;
    }

    startCourse(course.id, firstLessonId);
    if (firstLessonId) {
      setSelectedLessonId(firstLessonId);
    }
  }

  function handleSelectLesson(lessonId: string) {
    setSelectedLessonId(lessonId);
    if (course) {
      setCurrentLesson(course.id, lessonId);
    }
  }

  function handleToggleLesson(lessonId: string) {
    if (!course) {
      return;
    }

    toggleLessonCompletion(course.id, lessonId, allLessonIds);
  }

  if (authToken === undefined || authToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-sm font-semibold text-slate-600">
        Checking authentication...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <main className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <p className="text-sm font-semibold text-slate-500">Course not found</p>
          <h1 className="mt-2 text-2xl font-black">This course does not exist.</h1>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to dashboard
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            Back to dashboard
          </button>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {course.category}
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">{course.title}</h1>
              <p className="mt-3 text-sm text-slate-600">{course.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {course.level}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {course.estimatedHours} hours
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {lessons.length} lessons
                </span>
              </div>
            </div>

            <div className="w-full rounded-2xl bg-slate-50 p-5 md:w-72">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>Progress</span>
                <span>{completionPercent}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${course.accentClass}`}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {progress?.completedLessonIds.length ?? 0} of {lessons.length} lessons completed
              </p>
              {!progress ? (
                <button
                  type="button"
                  onClick={handleStartCourse}
                  className="mt-4 w-full rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  Start course
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
            <h2 className="text-lg font-bold">Lessons</h2>
            <div className="mt-5 grid gap-5">
              {course.modules.map((courseModule) => (
                <div key={courseModule.id}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {courseModule.title}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {courseModule.lessons.map((lesson) => {
                      const isComplete = Boolean(progress?.completedLessonIds.includes(lesson.id));
                      const isSelected = selectedLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => handleSelectLesson(lesson.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                            isSelected
                              ? "border-blue-300 bg-blue-50"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              isComplete ? "bg-emerald-500 text-white" : "bg-white text-slate-500"
                            }`}
                          >
                            {isComplete ? "✓" : ""}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-slate-900">{lesson.title}</span>
                            <span className="block text-xs text-slate-500">{lesson.durationMinutes} min</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            {selectedLesson ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Current lesson
                    </p>
                    <h2 className="mt-2 text-2xl font-black">{selectedLesson.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{selectedLesson.summary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleLesson(selectedLesson.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      progress?.completedLessonIds.includes(selectedLesson.id)
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {progress?.completedLessonIds.includes(selectedLesson.id)
                      ? "Completed"
                      : "Mark complete"}
                  </button>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm leading-7 text-slate-700">{selectedLesson.content}</p>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Start this course to open the first lesson.
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
