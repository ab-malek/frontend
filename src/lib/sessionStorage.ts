import { getAuthUser, type StoredAuthUser } from "@/lib/authStorage";

const PROPOSED_SESSIONS_KEY_PREFIX = "theyassist_proposed_sessions";
const PROPOSED_SESSIONS_CHANGED_EVENT = "theyassist_proposed_sessions_changed";

export type ProposedSession = {
  id: string;
  mentorId: string;
  mentorName: string;
  topic: string;
  date: string;
  time: string;
  location: string;
  createdAt: string;
  completedAt?: string;
};

export function getProposedSessionsSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(getProposedSessionsKey(getAuthUser()));
}

export function getProposedSessions() {
  const savedSessions = getProposedSessionsSnapshot();

  if (!savedSessions) {
    return [];
  }

  try {
    return JSON.parse(savedSessions) as ProposedSession[];
  } catch {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(getProposedSessionsKey(getAuthUser()));
    }
    return [];
  }
}

export function addProposedSession(
  input: Pick<ProposedSession, "mentorId" | "mentorName" | "topic" | "date" | "time" | "location">
) {
  const sessions = getProposedSessions();
  const now = new Date().toISOString();

  saveProposedSessions([
    {
      id: `session-${Date.now()}`,
      mentorId: input.mentorId,
      mentorName: input.mentorName,
      topic: input.topic,
      date: input.date,
      time: input.time,
      location: input.location,
      createdAt: now,
    },
    ...sessions,
  ]);
}

export function toggleProposedSessionCompletion(sessionId: string) {
  const sessions = getProposedSessions();
  const now = new Date().toISOString();

  saveProposedSessions(
    sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            completedAt: session.completedAt ? undefined : now,
          }
        : session
    )
  );
}

export function subscribeToProposedSessions(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(PROPOSED_SESSIONS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(PROPOSED_SESSIONS_CHANGED_EVENT, listener);
  };
}

function saveProposedSessions(sessions: ProposedSession[]) {
  window.localStorage.setItem(getProposedSessionsKey(getAuthUser()), JSON.stringify(sessions));
  window.dispatchEvent(new Event(PROPOSED_SESSIONS_CHANGED_EVENT));
}

function getProposedSessionsKey(user: StoredAuthUser | null) {
  const userId = user?.id ?? user?.email ?? "current";
  return `${PROPOSED_SESSIONS_KEY_PREFIX}:${userId}`;
}
