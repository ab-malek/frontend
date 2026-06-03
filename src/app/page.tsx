"use client";

import { interestTopics, journeySteps, mentorList, upcomingSessions } from "@/data/homeData";
import {
  clearAuthToken,
  getAuthUserProfileSnapshot,
  getAuthUserName,
  getAuthToken,
  getServerAuthTokenSnapshot,
  setAuthUserProfile,
  subscribeToAuthToken,
} from "@/lib/authStorage";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const emptyIntakeForm = {
  background: "",
  interestTopics: [] as string[],
  experience: "",
};

function getMentorInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
  const greetingName = authUserName || "Member";
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isFirstSessionVisible, setIsFirstSessionVisible] = useState(false);
  const [intakeSubmitted, setIntakeSubmitted] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [intakeForm, setIntakeForm] = useState(emptyIntakeForm);

  const selectedMentor = useMemo(
    () => mentorList.find((mentor) => mentor.id === selectedMentorId) ?? null,
    [selectedMentorId]
  );
  const recommendedMentors = useMemo(() => {
    if (!savedProfile?.interestTopics.length) {
      return [];
    }

    return mentorList
      .filter((mentor) => savedProfile.interestTopics.includes(mentor.interestTopic))
      .slice(0, 3);
  }, [savedProfile]);
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

  const nextSession = upcomingSessions[0];

  const currentStep = useMemo(() => {
    if (!intakeSubmitted && !savedProfile) {
      return 1;
    }
    if (!selectedMentorId) {
      return 2;
    }
    return 3;
  }, [intakeSubmitted, savedProfile, selectedMentorId]);

  const selectedMentorInitials = selectedMentor ? getMentorInitials(selectedMentor.name) : "";

  function handleIntakeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (intakeForm.interestTopics.length === 0) {
      return;
    }

    setAuthUserProfile(intakeForm);
    setIntakeSubmitted(true);
    setIsIntakeOpen(false);
  }

  function openIntakeForm() {
    setIntakeForm(savedProfile ?? { ...emptyIntakeForm, interestTopics: [] });
    setIsIntakeOpen(true);
  }

  useEffect(() => {
    if (authToken === null) {
      router.replace("/login");
    }
  }, [authToken, router]);

  function handleLogout() {
    clearAuthToken();
    router.replace("/login");
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

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <p className="text-sm text-slate-600">
            Welcome back! Here&apos;s a quick look at your progress and upcoming sessions.
          </p>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-center">
              <h2 className="text-lg font-bold">Your Mentorship Journey</h2>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              {journeySteps.map((step, index) => {
                const isComplete =
                  (step.id === 1 && intakeSubmitted) ||
                  (step.id === 2 && Boolean(selectedMentorId)) ||
                  step.id < currentStep;
                const isCurrent = step.id === currentStep;

                return (
                  <div key={step.id} className="flex flex-1 flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (step.id === 1) {
                          openIntakeForm();
                        }
                        if (step.id === 2) {
                          setIsMentorOpen(true);
                        }
                        if (step.id === 3) {
                          setIsFirstSessionVisible(true);
                        }
                      }}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold transition ${
                        isComplete
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isComplete ? "✓" : step.id}
                    </button>
                    <p className={`text-center text-xs font-medium ${isCurrent ? "text-blue-600" : "text-slate-600"}`}>
                      {step.id}. {step.label}
                    </p>
                    {step.id === 3 && nextSession && isFirstSessionVisible ? (
                      <p className="text-center text-xs text-slate-500">
                        {nextSession.month} {nextSession.day} · {nextSession.title}
                      </p>
                    ) : null}
                    {index < journeySteps.length - 1 ? (
                      <div className="hidden h-px w-full max-w-30 bg-slate-200 md:block" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Your Mentors</h2>
              <p className="mt-1 text-sm text-slate-600">See the mentor you selected for your journey.</p>
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
            {selectedMentor ? (
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-sm font-semibold text-slate-700">
                  {selectedMentorInitials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selectedMentor.name}</p>
                  <p className="text-xs text-slate-600">{selectedMentor.title}</p>
                  <p className="text-xs text-slate-500">{selectedMentor.interestTopic}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                No mentor selected yet. Use View All to choose one.
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
                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
              >
                Propose New
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
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

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step 1</p>
                <h3 className="mt-2 text-xl font-bold">Onboard & Profile</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Tell us about your background, interest topic, and experience.
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${intakeSubmitted || savedProfile ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {intakeSubmitted || savedProfile ? "Completed" : "Pending"}
              </span>
            </div>
            <button
              type="button"
              onClick={openIntakeForm}
              className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open intake form
            </button>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step 2</p>
                <h3 className="mt-2 text-xl font-bold">Find a Mentor</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Choose a mentor from the suggested list.
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedMentorId ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {selectedMentorId ? "Completed" : "Pending"}
              </span>
            </div>
            {selectedMentor ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Selected mentor</p>
                <p className="mt-1 text-sm text-slate-600">{selectedMentor.name}</p>
                <p className="text-xs text-slate-500">{selectedMentor.title}</p>
                <p className="text-xs text-slate-500">{selectedMentor.interestTopic}</p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setIsMentorOpen(true)}
              className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View mentors
            </button>
          </article>
        </section>
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
