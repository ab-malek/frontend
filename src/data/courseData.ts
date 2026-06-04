export type Lesson = {
  id: string;
  title: string;
  durationMinutes: number;
  summary: string;
  content: string;
};

export type CourseModule = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  accentClass: string;
  modules: CourseModule[];
};

export const courses: Course[] = [
  {
    id: "career-growth-foundations",
    title: "Career Growth Foundations",
    description: "Build a practical career plan with goals, feedback loops, and weekly momentum.",
    category: "Career growth",
    level: "Beginner",
    estimatedHours: 4,
    accentClass: "bg-emerald-500",
    modules: [
      {
        id: "career-clarity",
        title: "Career Clarity",
        lessons: [
          {
            id: "define-your-direction",
            title: "Define your direction",
            durationMinutes: 14,
            summary: "Map your current role, strengths, and next career target.",
            content:
              "Start by writing down where you are now, what kind of work gives you energy, and what role you want next. This lesson uses a simple career map so you can connect your goals to concrete actions.",
          },
          {
            id: "set-growth-milestones",
            title: "Set growth milestones",
            durationMinutes: 18,
            summary: "Turn a broad career goal into measurable milestones.",
            content:
              "A strong milestone is specific enough to review each week. Use milestones like shipping a portfolio case study, completing three mock interviews, or asking for feedback from two senior peers.",
          },
        ],
      },
      {
        id: "career-momentum",
        title: "Career Momentum",
        lessons: [
          {
            id: "weekly-progress-review",
            title: "Weekly progress review",
            durationMinutes: 12,
            summary: "Create a lightweight review ritual for your goals.",
            content:
              "Review what moved, what stalled, and what needs support. Keep the ritual short: wins, blockers, one priority, and one person to ask for help.",
          },
        ],
      },
    ],
  },
  {
    id: "portfolio-review-sprint",
    title: "Portfolio Review Sprint",
    description: "Improve your portfolio structure, storytelling, and project presentation.",
    category: "Portfolio review",
    level: "Intermediate",
    estimatedHours: 5,
    accentClass: "bg-blue-500",
    modules: [
      {
        id: "portfolio-structure",
        title: "Portfolio Structure",
        lessons: [
          {
            id: "audit-your-case-studies",
            title: "Audit your case studies",
            durationMinutes: 20,
            summary: "Evaluate each project for clarity, relevance, and proof.",
            content:
              "Review each case study through three questions: what problem did you solve, what decisions did you own, and what changed because of your work. Remove anything that does not support those answers.",
          },
          {
            id: "write-strong-project-narratives",
            title: "Write strong project narratives",
            durationMinutes: 22,
            summary: "Use a simple narrative arc for stronger portfolio stories.",
            content:
              "A useful case study moves from context to constraint, then decision, execution, and result. Keep the story focused on your thinking, tradeoffs, and impact.",
          },
        ],
      },
      {
        id: "presentation-polish",
        title: "Presentation Polish",
        lessons: [
          {
            id: "prepare-a-five-minute-walkthrough",
            title: "Prepare a five-minute walkthrough",
            durationMinutes: 16,
            summary: "Practice a concise walkthrough for interviews and mentor sessions.",
            content:
              "Choose one project and rehearse a five-minute version. Lead with the outcome, then explain the problem, your process, and the decision that mattered most.",
          },
        ],
      },
    ],
  },
  {
    id: "interview-confidence-lab",
    title: "Interview Confidence Lab",
    description: "Practice behavioral answers, technical framing, and follow-up habits.",
    category: "Interview preparation",
    level: "Beginner",
    estimatedHours: 3,
    accentClass: "bg-amber-500",
    modules: [
      {
        id: "interview-basics",
        title: "Interview Basics",
        lessons: [
          {
            id: "answer-with-evidence",
            title: "Answer with evidence",
            durationMinutes: 15,
            summary: "Use specific examples instead of generic claims.",
            content:
              "Interviewers trust evidence. For each strength you mention, prepare a short story with context, action, result, and what you learned.",
          },
          {
            id: "handle-hard-questions",
            title: "Handle hard questions",
            durationMinutes: 17,
            summary: "Respond calmly to gaps, failures, and uncertainty.",
            content:
              "Hard questions are chances to show judgment. Be direct, avoid over-explaining, and explain what you changed after the experience.",
          },
        ],
      },
    ],
  },
];

export function getCourseById(courseId: string) {
  return courses.find((course) => course.id === courseId) ?? null;
}

export function getCourseLessons(course: Course) {
  return course.modules.flatMap((courseModule) => courseModule.lessons);
}
