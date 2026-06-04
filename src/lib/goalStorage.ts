import { getAuthUser, type StoredAuthUser } from "@/lib/authStorage";

const GOALS_KEY_PREFIX = "theyassist_project_goals";
const GOALS_CHANGED_EVENT = "theyassist_project_goals_changed";

export type ProjectGoalStatus = "Not started" | "In progress" | "Completed";

export type ProjectGoal = {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: ProjectGoalStatus;
  createdAt: string;
};

export function getProjectGoalsSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(getProjectGoalsKey(getAuthUser()));
}

export function getProjectGoals() {
  const savedGoals = getProjectGoalsSnapshot();

  if (!savedGoals) {
    return [];
  }

  try {
    return JSON.parse(savedGoals) as ProjectGoal[];
  } catch {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(getProjectGoalsKey(getAuthUser()));
    }
    return [];
  }
}

export function addProjectGoal(input: Pick<ProjectGoal, "title" | "description" | "targetDate">) {
  const now = new Date().toISOString();
  const goals = getProjectGoals();

  saveProjectGoals([
    {
      id: `goal-${Date.now()}`,
      title: input.title,
      description: input.description,
      targetDate: input.targetDate,
      status: "Not started",
      createdAt: now,
    },
    ...goals,
  ]);
}

export function updateProjectGoalStatus(goalId: string, status: ProjectGoalStatus) {
  saveProjectGoals(
    getProjectGoals().map((goal) => (goal.id === goalId ? { ...goal, status } : goal))
  );
}

export function subscribeToProjectGoals(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(GOALS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(GOALS_CHANGED_EVENT, listener);
  };
}

function saveProjectGoals(goals: ProjectGoal[]) {
  window.localStorage.setItem(getProjectGoalsKey(getAuthUser()), JSON.stringify(goals));
  window.dispatchEvent(new Event(GOALS_CHANGED_EVENT));
}

function getProjectGoalsKey(user: StoredAuthUser | null) {
  const userId = user?.id ?? user?.email ?? "current";
  return `${GOALS_KEY_PREFIX}:${userId}`;
}
