import { getAuthUser, type StoredAuthUser } from "@/lib/authStorage";

const COURSE_PROGRESS_KEY_PREFIX = "theyassist_course_progress";
const COURSE_PROGRESS_CHANGED_EVENT = "theyassist_course_progress_changed";

export type CourseProgress = {
  courseId: string;
  startedAt: string;
  lastAccessedAt: string;
  completedLessonIds: string[];
  currentLessonId: string | null;
};

export type CourseProgressById = Record<string, CourseProgress>;

export function getCourseProgressSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(getCourseProgressKey(getAuthUser()));
}

export function getCourseProgress() {
  const savedProgress = getCourseProgressSnapshot();

  if (!savedProgress) {
    return {};
  }

  try {
    return JSON.parse(savedProgress) as CourseProgressById;
  } catch {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(getCourseProgressKey(getAuthUser()));
    }
    return {};
  }
}

export function getCourseProgressForCourse(courseId: string) {
  return getCourseProgress()[courseId] ?? null;
}

export function startCourse(courseId: string, firstLessonId: string | null) {
  const progress = getCourseProgress();
  const existingProgress = progress[courseId];
  const now = new Date().toISOString();

  progress[courseId] = {
    courseId,
    startedAt: existingProgress?.startedAt ?? now,
    lastAccessedAt: now,
    completedLessonIds: existingProgress?.completedLessonIds ?? [],
    currentLessonId: existingProgress?.currentLessonId ?? firstLessonId,
  };

  saveCourseProgress(progress);
}

export function setCurrentLesson(courseId: string, lessonId: string) {
  const progress = getCourseProgress();
  const existingProgress = progress[courseId];
  const now = new Date().toISOString();

  progress[courseId] = {
    courseId,
    startedAt: existingProgress?.startedAt ?? now,
    lastAccessedAt: now,
    completedLessonIds: existingProgress?.completedLessonIds ?? [],
    currentLessonId: lessonId,
  };

  saveCourseProgress(progress);
}

export function toggleLessonCompletion(courseId: string, lessonId: string, allLessonIds: string[]) {
  const progress = getCourseProgress();
  const existingProgress = progress[courseId];
  const completedLessonIds = new Set(existingProgress?.completedLessonIds ?? []);
  const now = new Date().toISOString();

  if (completedLessonIds.has(lessonId)) {
    completedLessonIds.delete(lessonId);
  } else {
    completedLessonIds.add(lessonId);
  }

  const nextCurrentLessonId =
    allLessonIds.find((candidateLessonId) => !completedLessonIds.has(candidateLessonId)) ??
    lessonId;

  progress[courseId] = {
    courseId,
    startedAt: existingProgress?.startedAt ?? now,
    lastAccessedAt: now,
    completedLessonIds: Array.from(completedLessonIds),
    currentLessonId: nextCurrentLessonId,
  };

  saveCourseProgress(progress);
}

export function getCourseCompletionPercent(progress: CourseProgress | null, totalLessons: number) {
  if (!progress || totalLessons === 0) {
    return 0;
  }

  return Math.round((progress.completedLessonIds.length / totalLessons) * 100);
}

export function subscribeToCourseProgress(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(COURSE_PROGRESS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(COURSE_PROGRESS_CHANGED_EVENT, listener);
  };
}

function saveCourseProgress(progress: CourseProgressById) {
  window.localStorage.setItem(getCourseProgressKey(getAuthUser()), JSON.stringify(progress));
  window.dispatchEvent(new Event(COURSE_PROGRESS_CHANGED_EVENT));
}

function getCourseProgressKey(user: StoredAuthUser | null) {
  const userId = user?.id ?? user?.email ?? "current";
  return `${COURSE_PROGRESS_KEY_PREFIX}:${userId}`;
}
