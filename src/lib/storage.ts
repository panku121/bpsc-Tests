import type { AttemptRecord, InProgress, Progress, Question } from "./types";

const KEY = "bpsc-stet-progress-v1";

export function emptyProgress(): Progress {
  return {
    attempts: [],
    inProgress: null,
    wrongIds: [],
    bookmarkIds: [],
    categoryId: "ur",
  };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      ...emptyProgress(),
      ...parsed,
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      wrongIds: Array.isArray(parsed.wrongIds) ? parsed.wrongIds : [],
      bookmarkIds: Array.isArray(parsed.bookmarkIds) ? parsed.bookmarkIds : [],
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function applyAttempt(
  progress: Progress,
  attempt: AttemptRecord,
  questions: Question[],
): Progress {
  const wrong = new Set(progress.wrongIds);
  attempt.questionIds.forEach((id, index) => {
    const question = questions[index];
    if (!question) return;
    if (attempt.answers[index] === question.answer) wrong.delete(id);
    else wrong.add(id);
  });
  return {
    ...progress,
    inProgress:
      progress.inProgress && progress.inProgress.testId === attempt.testId
        ? null
        : progress.inProgress,
    attempts: [attempt, ...progress.attempts].slice(0, 40),
    wrongIds: [...wrong],
  };
}

export function downloadProgress(progress: Progress): void {
  const blob = new Blob([JSON.stringify(progress, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "stet-progress.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function isProgress(value: unknown): value is Progress {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<Progress>;
  return Array.isArray(record.attempts) && Array.isArray(record.wrongIds);
}

export function freshPaper(input: {
  testId: string;
  title: string;
  mode: InProgress["mode"];
  questionIds: string[];
  durationMin: number;
}): InProgress {
  const now = Date.now();
  const count = input.questionIds.length;
  return {
    testId: input.testId,
    title: input.title,
    mode: input.mode,
    questionIds: input.questionIds,
    answers: Array.from({ length: count }, () => null),
    marked: Array.from({ length: count }, () => false),
    visited: Array.from({ length: count }, (_, index) => index === 0),
    index: 0,
    startedAt: now,
    endsAt: input.mode === "exam" ? now + input.durationMin * 60 * 1000 : null,
  };
}
