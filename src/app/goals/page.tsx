"use client";

import {
  addProjectGoal,
  getProjectGoalsSnapshot,
  subscribeToProjectGoals,
  updateProjectGoalStatus,
  type ProjectGoal,
  type ProjectGoalStatus,
} from "@/lib/goalStorage";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";

const emptyGoalForm = {
  title: "",
  description: "",
  targetDate: "",
};

const goalStatuses: ProjectGoalStatus[] = ["Not started", "In progress", "Completed"];

export default function GoalsPage() {
  const router = useRouter();
  const savedProjectGoalsJson = useSyncExternalStore(
    subscribeToProjectGoals,
    getProjectGoalsSnapshot,
    () => null
  );
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
  const [goalForm, setGoalForm] = useState(emptyGoalForm);

  function handleGoalSubmit(event: FormEvent<HTMLFormElement>) {
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

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <button type="button" onClick={() => router.push("/")} className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            Back to dashboard
          </button>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Project Goals</h1>
          <p className="mt-2 text-sm text-slate-600">Set the projects you want to complete and track their status.</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg" onSubmit={handleGoalSubmit}>
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Project name</span>
                <input
                  value={goalForm.title}
                  onChange={(event) => setGoalForm((current) => ({ ...current, title: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  placeholder="Portfolio redesign"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Goal details</span>
                <textarea
                  value={goalForm.description}
                  onChange={(event) => setGoalForm((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  placeholder="What do you want to finish?"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Target date</span>
                <input
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(event) => setGoalForm((current) => ({ ...current, targetDate: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            </div>
            <button type="submit" className="mt-5 w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Add goal
            </button>
          </form>

          <div className="grid content-start gap-3">
            {projectGoals.length > 0 ? (
              projectGoals.map((goal) => (
                <article key={goal.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{goal.title}</h2>
                      {goal.description ? <p className="mt-1 text-sm text-slate-600">{goal.description}</p> : null}
                      {goal.targetDate ? <p className="mt-2 text-xs font-semibold text-slate-500">Target: {goal.targetDate}</p> : null}
                    </div>
                    <select
                      value={goal.status}
                      onChange={(event) => updateProjectGoalStatus(goal.id, event.target.value as ProjectGoalStatus)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
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
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-lg">
                No project goals yet. Add the project you want to complete first.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
