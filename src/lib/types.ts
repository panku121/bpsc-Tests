export type SectionId =
  | "science"
  | "pedagogy"
  | "gk"
  | "evs"
  | "math"
  | "reasoning";

export type LangText = { en: string; hi: string };

export type Question = {
  id: string;
  section: SectionId;
  topic: string;
  q: LangText;
  options: LangText[];
  answer: 0 | 1 | 2 | 3;
  explain: LangText;
};

export type Mode = "exam" | "practice";

export type TestDef = {
  id: string;
  title: string;
  subtitle: string;
  kind: "full" | "section" | "demo" | "custom";
  durationMin: number;
  questions: Question[];
};

export type AttemptRecord = {
  id: string;
  testId: string;
  title: string;
  mode: Mode;
  questionIds: string[];
  answers: (number | null)[];
  marked: boolean[];
  startedAt: number;
  submittedAt: number;
  autoSubmitted: boolean;
  score: number;
  total: number;
};

export type InProgress = {
  testId: string;
  title: string;
  mode: Mode;
  questionIds: string[];
  answers: (number | null)[];
  marked: boolean[];
  visited: boolean[];
  index: number;
  startedAt: number;
  endsAt: number | null;
};

export type Progress = {
  attempts: AttemptRecord[];
  inProgress: InProgress | null;
  wrongIds: string[];
  bookmarkIds: string[];
  categoryId: string;
};
