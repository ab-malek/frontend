"use client";

import { courses, getCourseLessons } from "@/data/courseData";
import { interestTopics, mentorList, upcomingSessions } from "@/data/homeData";
import {
  clearAuthToken,
  getAuthUserProfileSnapshot,
  getAuthUserName,
  getAuthToken,
  getAuthUserOnboardingSnapshot,
  getServerAuthTokenSnapshot,
  hasCompletedOnboarding,
  setAuthUserProfile,
  subscribeToAuthToken,
  type StoredUserOnboarding,
} from "@/lib/authStorage";
import {
  getCourseCompletionPercent,
  getCourseProgressSnapshot,
  startCourse,
  subscribeToCourseProgress,
  type CourseProgressById,
} from "@/lib/courseStorage";
import {
  addProjectGoal,
  getProjectGoalsSnapshot,
  subscribeToProjectGoals,
  updateProjectGoalStatus,
  type ProjectGoal,
  type ProjectGoalStatus,
} from "@/lib/goalStorage";
import {
  addProposedSession,
  getProposedSessionsSnapshot,
  subscribeToProposedSessions,
  type ProposedSession,
} from "@/lib/sessionStorage";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const emptyIntakeForm = {
  background: "",
  interestTopics: [] as string[],
  experience: "",
};

const emptyGoalForm = {
  title: "",
  description: "",
  targetDate: "",
};

const emptySessionForm = {
  mentorId: "",
  topic: "",
  date: "",
  time: "",
  location: "Virtual meeting on TheyAssist platform",
};

const goalStatuses: ProjectGoalStatus[] = ["Not started", "In progress", "Completed"];

function getMentorInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getSessionCalendarParts(date: string) {
  if (!date) {
    return {
      month: "TBD",
      day: "--",
    };
  }

  const sessionDate = new Date(`${date}T00:00:00`);

  return {
    month: sessionDate.toLocaleString("en-US", { month: "short" }),
    day: sessionDate.toLocaleString("en-US", { day: "2-digit" }),
  };
}

function getSessionDateTime(date: string, time: string) {
  if (!date || !time) {
    return "Date and time to be confirmed";
  }

  const sessionDate = new Date(`${date}T${time}`);
  return sessionDate.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Home() {
  const router = useRouter();
  const authToken = useSyncExternalStore(
    subscribeToAuthToken,
    getAuthToken,
    getServerAuthTokenSnapshot
  );
  const authUserName = useSyncExternalStore(subscribeToAuthToken, getAuthUserName, () => null);
  const savedProfileJson = useSyncExternalStore(subscribeToAuthToken, getAuthUserProfileSnapshot, () => null);
  const savedOnboardingJson = useSyncExternalStore(
    subscribeToAuthToken,
    getAuthUserOnboardingSnapshot,
    () => null
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
  const savedProfile = useMemo(() => {
    if (!savedProfileJson) {
      return null;
    }

    try {
      const profile = JSON.parse(savedProfileJson) as typeof emptyIntakeForm & {
        interestTopic?: string;
      };

      return {
        background: profile.background ?? "",
        interestTopics:
          profile.interestTopics ??
          (profile.interestTopic ? [profile.interestTopic] : []),
        experience: profile.experience ?? "",
      };
    } catch {
      return null;
    }
  }, [savedProfileJson]);
  const savedOnboarding = useMemo(() => {
    if (!savedOnboardingJson) {
      return null;
    }

    try {
      return JSON.parse(savedOnboardingJson) as StoredUserOnboarding;
    } catch {
      return null;
    }
  }, [savedOnboardingJson]);
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
  const greetingName = authUserName || "Member";
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isSessionProposalOpen, setIsSessionProposalOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [intakeForm, setIntakeForm] = useState(emptyIntakeForm);
  const [goalForm, setGoalForm] = useState(emptyGoalForm);
  const [sessionForm, setSessionForm] = useState(emptySessionForm);

  const recommendedMentors = useMemo(() => {
    const recommendationTopics = savedOnboarding?.interestTopics.length
      ? savedOnboarding.interestTopics
      : savedProfile?.interestTopics ?? [];

    if (!recommendationTopics.length) {
      return [];
    }

    return mentorList
      .filter((mentor) => recommendationTopics.includes(mentor.interestTopic))
      .slice(0, 3);
  }, [savedOnboarding, savedProfile]);
  const recommendedCourses = useMemo(() => {
    const recommendationTopics = savedOnboarding?.interestTopics.length
      ? savedOnboarding.interestTopics
      : savedProfile?.interestTopics ?? [];

    if (!recommendationTopics.length) {
      return courses;
    }

    return [...courses].sort((firstCourse, secondCourse) => {
      const firstMatches = recommendationTopics.includes(firstCourse.category);
      const secondMatches = recommendationTopics.includes(secondCourse.category);

      if (firstMatches === secondMatches) {
        return 0;
      }

    return firstMatches ? -1 : 1;
    });
  }, [savedOnboarding, savedProfile]);
  const topRatedResourceCourses = useMemo(() => recommendedCourses.slice(0, 2), [recommendedCourses]);
  const sortedMentorList = useMemo(() => {
    const selectedTopics = savedProfile?.interestTopics.length
      ? savedProfile.interestTopics
      : intakeForm.interestTopics;

    if (!selectedTopics.length) {
      return mentorList;
    }

    return [...mentorList].sort((firstMentor, secondMentor) => {
      const firstMatches = selectedTopics.includes(firstMentor.interestTopic);
      const secondMatches = selectedTopics.includes(secondMentor.interestTopic);

      if (firstMatches === secondMatches) {
        return 0;
      }

      return firstMatches ? -1 : 1;
    });
  }, [intakeForm.interestTopics, savedProfile]);

  const startedCourses = useMemo(
    () => courses.filter((course) => Boolean(courseProgress[course.id])),
    [courseProgress]
  );
  const sessionMentors = useMemo(() => {
    const mentorIds = new Set(proposedSessions.map((session) => session.mentorId));

    return mentorList.filter((mentor) => mentorIds.has(mentor.id));
  }, [proposedSessions]);
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
        description: "Connect with a mentor through a session.",
        unlocked: sessionMentors.length > 0,
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
      sessionMentors.length,
    ]
  );
  const unlockedAchievementCount = achievements.filter((achievement) => achievement.unlocked).length;
  const rewardPoints = 550 + unlockedAchievementCount * 100;

  function handleIntakeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (intakeForm.interestTopics.length === 0) {
      return;
    }

    setAuthUserProfile(intakeForm);
    setIsIntakeOpen(false);
  }

  useEffect(() => {
    if (authToken === null) {
      router.replace("/login");
      return;
    }

    if (authToken && !hasCompletedOnboarding()) {
      router.replace("/onboarding");
    }
  }, [authToken, router]);

  function handleLogout() {
    clearAuthToken();
    router.replace("/login");
  }

  function handleStartCourse(courseId: string) {
    const course = courses.find((candidateCourse) => candidateCourse.id === courseId);

    if (!course) {
      return;
    }

    const firstLessonId = getCourseLessons(course)[0]?.id ?? null;
    startCourse(course.id, firstLessonId);
    router.push(`/courses/${course.id}`);
  }

  function handleGoalSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!goalForm.title.trim()) {
      return;
    }

    addProjectGoal({
      title: goalForm.title.trim(),
      description: goalForm.description.trim(),
      targetDate: goalForm.targetDate,
    });
    setGoalForm(emptyGoalForm);
  }

  function openSessionProposal() {
    setSessionForm({
      ...emptySessionForm,
      mentorId: selectedMentorId ?? "",
    });
    setIsSessionProposalOpen(true);
  }

  function handleSessionProposalSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const mentor = mentorList.find((candidateMentor) => candidateMentor.id === sessionForm.mentorId);

    if (!mentor || !sessionForm.topic.trim() || !sessionForm.date || !sessionForm.time) {
      return;
    }

    addProposedSession({
      mentorId: mentor.id,
      mentorName: mentor.name,
      topic: sessionForm.topic.trim(),
      date: sessionForm.date,
      time: sessionForm.time,
      location: sessionForm.location.trim() || emptySessionForm.location,
    });
    setSessionForm(emptySessionForm);
    setIsSessionProposalOpen(false);
  }

  if (authToken === undefined || authToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-sm font-semibold text-slate-600">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold">
              TA
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">TheyAssist</p>
              <h1 className="text-3xl font-black tracking-tight">Good morning, {greetingName}!</h1>
            </div>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            Member dashboard
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Logout
          </button>
        </header>


        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-8">

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Project Goals</h2>
              <p className="mt-1 text-sm text-slate-600">
                Set the projects you want to complete and track their status.
              </p>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {projectGoals.length} saved
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
            <form className="rounded-2xl border border-slate-200 bg-slate-50 p-5" onSubmit={handleGoalSubmit}>
              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">Project name</span>
                  <input
                    value={goalForm.title}
                    onChange={(event) =>
                      setGoalForm((currentGoalForm) => ({
                        ...currentGoalForm,
                        title: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="Portfolio redesign"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">Goal details</span>
                  <textarea
                    value={goalForm.description}
                    onChange={(event) =>
                      setGoalForm((currentGoalForm) => ({
                        ...currentGoalForm,
                        description: event.target.value,
                      }))
                    }
                    className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="What do you want to finish?"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">Target date</span>
                  <input
                    type="date"
                    value={goalForm.targetDate}
                    onChange={(event) =>
                      setGoalForm((currentGoalForm) => ({
                        ...currentGoalForm,
                        targetDate: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="mt-5 w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Add goal
              </button>
            </form>

            <div className="grid content-start gap-3">
              {projectGoals.length > 0 ? (
                projectGoals.map((goal) => (
                  <article
                    key={goal.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900">{goal.title}</h3>
                        {goal.description ? (
                          <p className="mt-1 text-sm text-slate-600">{goal.description}</p>
                        ) : null}
                        {goal.targetDate ? (
                          <p className="mt-2 text-xs font-semibold text-slate-500">
                            Target: {goal.targetDate}
                          </p>
                        ) : null}
                      </div>

                      <select
                        value={goal.status}
                        onChange={(event) =>
                          updateProjectGoalStatus(goal.id, event.target.value as ProjectGoalStatus)
                        }
                        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      >
                        {goalStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  No project goals yet. Add the project you want to complete first.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Your Mentors</h2>
              <p className="mt-1 text-sm text-slate-600">Mentors appear here from your scheduled or proposed sessions.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMentorOpen(true)}
              className="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
            >
              View All
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            {sessionMentors.length > 0 ? (
              sessionMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-sm font-semibold text-slate-700">
                    {getMentorInitials(mentor.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{mentor.name}</p>
                    <p className="text-xs text-slate-600">{mentor.title}</p>
                    <p className="text-xs text-slate-500">{mentor.interestTopic}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                No session mentors yet. Propose a session to add one.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-bold">Recommendations for You</h2>
            <button
              type="button"
              onClick={() => setIsMentorOpen(true)}
              className="rounded-full bg-purple-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-600"
            >
              View All
            </button>
          </div>

          {recommendedMentors.length > 0 ? (
            <div className="mt-5 grid gap-4">
              {recommendedMentors.map((mentor) => (
                <div key={mentor.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-100 px-4 py-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-400 text-sm font-bold text-white">
                      {getMentorInitials(mentor.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{mentor.name}</p>
                      <p className="truncate text-xs text-slate-600">{mentor.title}</p>
                      <p className="truncate text-xs text-slate-500">{mentor.interestTopic}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMentorId(mentor.id)}
                    className="shrink-0 rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-bold">Community Highlights</h2>
            <button
              type="button"
              className="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
            >
              View All
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            <article className="flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-400 text-sm font-bold text-white">
                LK
              </div>
              <div>
                <p className="text-sm text-slate-900">
                  <span className="font-bold">Liam Kim</span> was just nominated for{" "}
                  <span className="font-bold">Mentor of the Month</span>!
                </p>
                <p className="mt-1 text-xs text-slate-500">2 hours ago</p>
              </div>
            </article>

            <article className="flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-400 text-sm font-bold text-white">
                MJ
              </div>
              <div>
                <p className="text-sm text-slate-900">
                  <span className="font-bold">Maria J.</span> just completed her{" "}
                  <span className="font-bold">Promotion Preparation</span> goal!
                </p>
                <p className="mt-1 text-xs text-slate-500">Yesterday</p>
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-bold">Top-Rated Resources</h2>
            <button
              type="button"
              className="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
            >
              View All
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            {topRatedResourceCourses.map((course, index) => (
              <article
                key={course.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${course.accentClass}`}
                  >
                    {index === 0 ? "▰" : "▦"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{course.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {index === 0 ? "5.0" : "4.8"} ⭐ ({index === 0 ? "120" : "85"} ratings)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartCourse(course.id)}
                  className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
                >
                  View
                </button>
              </article>
            ))}
          </div>
        </section>

        {startedCourses.length > 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">My Courses</h2>
                <p className="mt-1 text-sm text-slate-600">Continue the courses you have started.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {startedCourses.length} active
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {startedCourses.map((course) => {
                const lessons = getCourseLessons(course);
                const progress = courseProgress[course.id] ?? null;
                const completionPercent = getCourseCompletionPercent(progress, lessons.length);

                return (
                  <article key={course.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-2 rounded-full ${course.accentClass}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {course.category}
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">{course.title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>{completionPercent}% complete</span>
                        <span>
                          {progress?.completedLessonIds.length ?? 0}/{lessons.length} lessons
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${course.accentClass}`}
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartCourse(course.id)}
                      className="mt-5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Continue course
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Recommended Courses</h2>
              <p className="mt-1 text-sm text-slate-600">Start a guided course and track your progress.</p>
            </div>
            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Dummy content
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {recommendedCourses.map((course) => {
              const lessons = getCourseLessons(course);
              const progress = courseProgress[course.id] ?? null;
              const completionPercent = getCourseCompletionPercent(progress, lessons.length);
              const isStarted = Boolean(progress);

              return (
                <article key={course.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className={`h-2 w-16 rounded-full ${course.accentClass}`} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {course.level}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {course.estimatedHours}h
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{course.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{course.description}</p>

                  {isStarted ? (
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>{completionPercent}% complete</span>
                        <span>
                          {progress.completedLessonIds.length}/{lessons.length}
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${course.accentClass}`}
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleStartCourse(course.id)}
                    className="mt-5 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    {isStarted ? "Continue" : "Start course"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Upcoming Sessions</h2>
              <p className="mt-1 text-sm text-slate-600">Keep track of the next mentorship meetings.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
              >
                View All
              </button>
              <button
                type="button"
                onClick={openSessionProposal}
                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
              >
                Propose New
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {proposedSessions.map((session) => {
              const calendarParts = getSessionCalendarParts(session.date);

              return (
                <div
                  key={session.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl bg-emerald-50 px-4 py-4"
                >
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <span className="text-xs font-semibold">{calendarParts.month}</span>
                    <span className="text-sm font-bold">{calendarParts.day}</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {session.topic} with {session.mentorName}
                      </p>
                      <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-emerald-700">
                        Proposed
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {getSessionDateTime(session.date, session.time)}
                    </p>
                    <p className="text-xs text-slate-500">{session.location}</p>
                  </div>
                </div>
              );
            })}
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-slate-50 px-4 py-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <span className="text-xs font-semibold">{session.month}</span>
                  <span className="text-sm font-bold">{session.day}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{session.title}</p>
                  <p className="text-xs text-slate-600">{session.dateTime}</p>
                  <p className="text-xs text-slate-500">{session.location}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        
          </div>

          <aside className="flex min-w-0 flex-col gap-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-black leading-tight text-slate-900">
                  Achievements <br />& Rewards
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAchievementsOpen(true)}
                    className="rounded-full bg-blue-500 px-4 py-3 text-xs font-semibold leading-tight text-white transition hover:bg-blue-600"
                  >
                    View <br />More
                  </button>
                  <div className="rounded-full bg-amber-100 px-4 py-3 text-center text-xs font-black text-amber-700">
                    ✨ {rewardPoints}
                    <br />
                    Points
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-bold text-slate-900">Your Badges</h3>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="text-center">
                      <div
                        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                          achievement.unlocked ? "bg-amber-300" : "bg-slate-200 grayscale"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <p className={`mt-2 text-xs ${achievement.unlocked ? "text-slate-700" : "text-slate-400"}`}>
                        {achievement.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-900">Prize Store</h3>
                <div className="mt-3 grid gap-3">
                  <article className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">50% off AWS re:Invent Conference</h4>
                      <p className="mt-1 text-xs text-slate-500">
                        A significant discount on a major industry event.
                      </p>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500 text-center text-xs font-black text-white">
                      1500
                      <br />
                      Pts
                    </div>
                  </article>

                  <article className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">LinkedIn Profile Review</h4>
                      <p className="mt-1 text-xs text-slate-500">A professional review of your profile.</p>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500 text-center text-xs font-black text-white">
                      500
                      <br />
                      Pts
                    </div>
                  </article>

                  <article className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Virtual Coffee with a Mentor</h4>
                      <p className="mt-1 text-xs text-slate-500">A 30-minute informal chat.</p>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500 text-center text-xs font-black text-white">
                      250
                      <br />
                      Pts
                    </div>
                  </article>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-black leading-tight text-slate-900">
                  Industry & Company <br />Analytics
                </h2>
                <button
                  type="button"
                  className="rounded-full bg-blue-500 px-4 py-3 text-xs font-semibold leading-tight text-white transition hover:bg-blue-600"
                >
                  View <br />More
                </button>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Maryland Cybersecurity Market</h3>
                  <div className="mt-3 grid gap-2 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-600">Job Growth (Next 10 Years)</span>
                      <span className="font-black text-emerald-600">+40%</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-600">Open Positions (MD/DC)</span>
                      <span className="font-black text-slate-900">~6,500</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-600">Average Salary</span>
                      <span className="font-black text-slate-900">$102k+</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Company Spotlight: reAlpha Tech Corp (AIRE)
                  </h3>
                  <div className="mt-3 grid gap-2 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-600">Current Stock Price</span>
                      <span className="font-black text-slate-900">$0.36 USD</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-600">1-Year Change</span>
                      <span className="font-black text-red-500">-74.82%</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-600">Market Cap</span>
                      <span className="font-black text-slate-900">$17.9M</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-black text-slate-900">Hiring Trends</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-600">
                    <li>Strong focus on roles related to AI and real estate technology.</li>
                    <li>Looking for talent with US GAAP and SEC reporting experience.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900">In-Demand Positions</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-600">
                    <li>US Accountant (Finance & Accounting)</li>
                    <li>Senior Finance Associate (Finance & Accounting)</li>
                  </ul>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {isIntakeOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Onboard & Profile</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Tell us what you want help with so we can recommend the right mentors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsIntakeOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600 transition hover:bg-slate-200"
                aria-label="Close intake form"
              >
                x
              </button>
            </div>

            <form className="mt-6 grid gap-5" onSubmit={handleIntakeSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Background</span>
                <textarea
                  value={intakeForm.background}
                  onChange={(event) =>
                    setIntakeForm((currentForm) => ({
                      ...currentForm,
                      background: event.target.value,
                    }))
                  }
                  className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  placeholder="Share your role, goals, or current situation"
                />
              </label>

              <div className="grid gap-2">
                <p className="text-sm font-semibold text-slate-700">Interest topics</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {interestTopics.map((topic) => {
                    const isSelected = intakeForm.interestTopics.includes(topic);

                    return (
                      <label
                        key={topic}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                          isSelected
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            setIntakeForm((currentForm) => {
                              const nextTopics = isSelected
                                ? currentForm.interestTopics.filter((selectedTopic) => selectedTopic !== topic)
                                : [...currentForm.interestTopics, topic];

                              return {
                                ...currentForm,
                                interestTopics: nextTopics,
                              };
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        <span className="font-medium">{topic}</span>
                      </label>
                    );
                  })}
                </div>
                {intakeForm.interestTopics.length === 0 ? (
                  <p className="text-xs font-medium text-amber-600">Choose at least one topic to continue.</p>
                ) : null}
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Experience</span>
                <textarea
                  value={intakeForm.experience}
                  onChange={(event) =>
                    setIntakeForm((currentForm) => ({
                      ...currentForm,
                      experience: event.target.value,
                    }))
                  }
                  className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  placeholder="Tell us about your experience level or past mentorship"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsIntakeOpen(false)}
                  className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Save profile
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isSessionProposalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Propose a Session</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Pick a mentor, topic, and time for your next mentorship session.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSessionProposalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600 transition hover:bg-slate-200"
                aria-label="Close session proposal form"
              >
                x
              </button>
            </div>

            <form className="mt-6 grid gap-5" onSubmit={handleSessionProposalSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Mentor</span>
                <select
                  value={sessionForm.mentorId}
                  onChange={(event) =>
                    setSessionForm((currentForm) => ({
                      ...currentForm,
                      mentorId: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Choose a mentor</option>
                  {mentorList.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.name} - {mentor.interestTopic}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Session topic</span>
                <input
                  value={sessionForm.topic}
                  onChange={(event) =>
                    setSessionForm((currentForm) => ({
                      ...currentForm,
                      topic: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  placeholder="Portfolio review, mock interview, project planning"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">Date</span>
                  <input
                    type="date"
                    value={sessionForm.date}
                    onChange={(event) =>
                      setSessionForm((currentForm) => ({
                        ...currentForm,
                        date: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">Time</span>
                  <input
                    type="time"
                    value={sessionForm.time}
                    onChange={(event) =>
                      setSessionForm((currentForm) => ({
                        ...currentForm,
                        time: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Location</span>
                <input
                  value={sessionForm.location}
                  onChange={(event) =>
                    setSessionForm((currentForm) => ({
                      ...currentForm,
                      location: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  placeholder="Virtual meeting on TheyAssist platform"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSessionProposalOpen(false)}
                  className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  Propose session
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isAchievementsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">All Achievements</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {unlockedAchievementCount} of {achievements.length} achievements unlocked.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAchievementsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600 transition hover:bg-slate-200"
                aria-label="Close achievements"
              >
                x
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {achievements.map((achievement) => (
                <article
                  key={achievement.id}
                  className={`rounded-2xl border p-4 ${
                    achievement.unlocked
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${
                        achievement.unlocked ? "bg-amber-300" : "bg-slate-200 grayscale"
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{achievement.label}</h3>
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
                      <p className="mt-1 text-xs leading-5 text-slate-600">{achievement.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {isMentorOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Choose a Mentor</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Mentors matching your interests appear first.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMentorOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600 transition hover:bg-slate-200"
                aria-label="Close mentor list"
              >
                x
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              {sortedMentorList.map((mentor) => (
                <div
                  key={mentor.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-400 text-sm font-bold text-white">
                      {getMentorInitials(mentor.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{mentor.name}</p>
                      <p className="truncate text-xs text-slate-600">{mentor.title}</p>
                      <p className="truncate text-xs text-slate-500">{mentor.interestTopic}</p>
                      <p className="truncate text-xs text-slate-500">{mentor.focus}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMentorId(mentor.id);
                      setIsMentorOpen(false);
                    }}
                    className="shrink-0 rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
                  >
                    {selectedMentorId === mentor.id ? "Selected" : "Select"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
