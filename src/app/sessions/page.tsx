"use client";

import { upcomingSessions } from "@/data/homeData";
import {
  getProposedSessionsSnapshot,
  subscribeToProposedSessions,
  toggleProposedSessionCompletion,
  type ProposedSession,
} from "@/lib/sessionStorage";
import { useRouter } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";

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

export default function SessionsPage() {
  const router = useRouter();
  const savedProposedSessionsJson = useSyncExternalStore(
    subscribeToProposedSessions,
    getProposedSessionsSnapshot,
    () => null
  );
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

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <button type="button" onClick={() => router.push("/")} className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            Back to dashboard
          </button>
          <h1 className="mt-4 text-3xl font-black tracking-tight">All Sessions</h1>
          <p className="mt-2 text-sm text-slate-600">Review proposed sessions and upcoming mentorship meetings.</p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold">Proposed Sessions</h2>
          <div className="mt-5 grid gap-4">
            {proposedSessions.length > 0 ? (
              proposedSessions.map((session) => {
                const calendarParts = getSessionCalendarParts(session.date);

                return (
                  <article key={session.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-emerald-50 p-4">
                    <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <span className="text-xs font-semibold">{calendarParts.month}</span>
                      <span className="text-sm font-bold">{calendarParts.day}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{session.topic} with {session.mentorName}</h3>
                      <p className="text-xs text-slate-600">{getSessionDateTime(session.date, session.time)}</p>
                      <p className="text-xs text-slate-500">{session.location}</p>
                    </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleProposedSessionCompletion(session.id)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold ${
                        session.completedAt
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      {session.completedAt ? "Completed" : "Mark complete"}
                    </button>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                No proposed sessions yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold">Upcoming Sessions</h2>
          <div className="mt-5 grid gap-4">
            {upcomingSessions.map((session) => (
              <article key={session.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <span className="text-xs font-semibold">{session.month}</span>
                  <span className="text-sm font-bold">{session.day}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{session.title}</h3>
                  <p className="text-xs text-slate-600">{session.dateTime}</p>
                  <p className="text-xs text-slate-500">{session.location}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
