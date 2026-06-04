"use client";

import { courses, getCourseLessons } from "@/data/courseData";
import {
  getAuthToken,
  getServerAuthTokenSnapshot,
  subscribeToAuthToken,
} from "@/lib/authStorage";
import {
  getCourseProgressSnapshot,
  subscribeToCourseProgress,
  type CourseProgressById,
} from "@/lib/courseStorage";
import {
  getProjectGoalsSnapshot,
  subscribeToProjectGoals,
  type ProjectGoal,
} from "@/lib/goalStorage";
import {
  getProposedSessionsSnapshot,
  subscribeToProposedSessions,
  type ProposedSession,
} from "@/lib/sessionStorage";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useSyncExternalStore } from "react";

export default function AchievementsPage() {
  const router = useRouter();
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
  const savedProjectGoalsJson = useSyncExternalStore(
    subscribeToProjectGoals,
    getProjectGoalsSnapshot,
    () => null
  );
  const savedProposedSessionsJson = useSyncExternalStore(
    subscribeToProposedSessions,
    getProposedSessionsSnapshot,
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
  const projectGoals = useMemo(() => {
    if (!savedProjectGoalsJson) {
      return [];
    }

    try {
      return JSON.parse(savedProjectGoalsJson) as ProjectGoal[];
    } catch {
      return [];
    }
  }, [savedProjectGoalsJson]);
  const proposedSessions = useMemo(() => {
    if (!savedProposedSessionsJson) {
      return [];
    }

    try {
      return JSON.parse(savedProposedSessionsJson) as ProposedSession[];
    } catch {
      return [];
    }
  }, [savedProposedSessionsJson]);
  const hasCompletedCourseLesson = useMemo(
    () =>
      Object.values(courseProgress).some(
        (progress) => progress.completedLessonIds.length > 0
      ),
    [courseProgress]
  );
  const hasCompletedCourse = useMemo(
    () =>
      courses.some((course) => {
        const lessons = getCourseLessons(course);
        const progress = courseProgress[course.id];

        return Boolean(progress && lessons.length > 0 && progress.completedLessonIds.length === lessons.length);
      }),
    [courseProgress]
  );
  const achievements = useMemo(
    () => [
      {
        id: "goal-setter",
        icon: "🎯",
        label: "Goal Setter",
        description: "Set your first project goal.",
        unlocked: projectGoals.length > 0,
      },
      {
        id: "first-session",
        icon: "🚀",
        label: "First Session",
        description: "Propose your first mentor session.",
        unlocked: proposedSessions.length > 0,
      },
      {
        id: "mentor-circle",
        icon: "🤝",
        label: "Mentor Circle",
        description: "Connect with a mentor through a proposed session.",
        unlocked: proposedSessions.length > 0,
      },
      {
        id: "course-starter",
        icon: "📘",
        label: "Course Starter",
        description: "Start your first course.",
        unlocked: Object.keys(courseProgress).length > 0,
      },
      {
        id: "lesson-finisher",
        icon: "✅",
        label: "Lesson Finisher",
        description: "Complete your first course lesson.",
        unlocked: hasCompletedCourseLesson,
      },
      {
        id: "course-complete",
        icon: "🏆",
        label: "Course Complete",
        description: "Complete every lesson in a course.",
        unlocked: hasCompletedCourse,
      },
    ],
    [
      courseProgress,
      hasCompletedCourse,
      hasCompletedCourseLesson,
      projectGoals.length,
      proposedSessions.length,
    ]
  );
  const unlockedAchievementCount = achievements.filter((achievement) => achievement.unlocked).length;
  const rewardPoints = 550 + unlockedAchievementCount * 100;

  useEffect(() => {
    if (authToken === null) {
      router.replace("/login");
    }
  }, [authToken, router]);

  if (authToken === undefined || authToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-sm font-semibold text-slate-600">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            Back to dashboard
          </button>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Achievements
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Achievements & Rewards</h1>
              <p className="mt-2 text-sm text-slate-600">
                {unlockedAchievementCount} of {achievements.length} achievements unlocked.
              </p>
            </div>
            <div className="rounded-full bg-amber-100 px-5 py-3 text-center text-sm font-black text-amber-700">
              ✨ {rewardPoints}
              <br />
              Points
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold">All Badges</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <article
                key={achievement.id}
                className={`rounded-2xl border p-5 ${
                  achievement.unlocked
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
                    achievement.unlocked ? "bg-amber-300" : "bg-slate-200 grayscale"
                  }`}
                >
                  {achievement.icon}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{achievement.label}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      achievement.unlocked
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {achievement.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{achievement.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
