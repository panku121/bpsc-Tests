import { demoQuestions } from "../data/demo";
import { pedagogyQuestions } from "../data/pedagogy";
import { scienceA } from "../data/scienceA";
import { scienceB } from "../data/scienceB";
import {
  evsQuestions,
  gkQuestions,
  mathQuestions,
  reasoningQuestions,
} from "../data/skills";
import type { Progress, Question, SectionId, TestDef } from "./types";

export const scienceQuestions: Question[] = [...scienceA, ...scienceB];

export const allQuestions: Question[] = [
  ...demoQuestions,
  ...scienceQuestions,
  ...pedagogyQuestions,
  ...gkQuestions,
  ...evsQuestions,
  ...mathQuestions,
  ...reasoningQuestions,
];

export const questionById = new Map(allQuestions.map((q) => [q.id, q]));

function checkBank(): void {
  const ids = new Set<string>();
  for (const q of allQuestions) {
    if (ids.has(q.id)) throw new Error(`Duplicate question id: ${q.id}`);
    ids.add(q.id);
    if (q.options.length !== 4) throw new Error(`Need 4 options: ${q.id}`);
    const labels = new Set(q.options.map((o) => o.en.trim()));
    if (labels.size !== 4) throw new Error(`Duplicate options: ${q.id}`);
    if (![0, 1, 2, 3].includes(q.answer)) throw new Error(`Bad answer: ${q.id}`);
    if (!q.q.hi.trim() || !q.q.en.trim() || !q.explain.hi.trim()) {
      throw new Error(`Missing text: ${q.id}`);
    }
  }
  if (scienceQuestions.length !== 100) {
    throw new Error(`Science bank should be 100, got ${scienceQuestions.length}`);
  }
  if (pedagogyQuestions.length < 60) {
    throw new Error("Pedagogy bank is short");
  }
}

checkBank();

export const SECTION_LABEL: Record<SectionId, string> = {
  science: "विज्ञान",
  pedagogy: "शिक्षण कला",
  gk: "सामान्य ज्ञान",
  evs: "पर्यावरण",
  math: "गणितीय योग्यता",
  reasoning: "तार्किक तर्क",
};

export const CATEGORIES = [
  { id: "ur", label: "सामान्य", percent: 50 },
  { id: "bc", label: "पिछड़ा वर्ग", percent: 45 },
  { id: "rest", label: "EBC / SC / ST / महिला / दिव्यांग", percent: 40 },
] as const;

function paper(partial: Omit<TestDef, "questions"> & { questions: Question[] }): TestDef {
  return partial;
}

function commonSet(which: 1 | 2): Question[] {
  const from = which === 1 ? 0 : 5;
  const pedagogyFrom = which === 1 ? 0 : 30;
  return [
    ...pedagogyQuestions.slice(pedagogyFrom, pedagogyFrom + 30),
    ...gkQuestions.slice(from, from + 5),
    ...evsQuestions.slice(from, from + 5),
    ...mathQuestions.slice(from, from + 5),
    ...reasoningQuestions.slice(from, from + 5),
  ];
}

const scienceDrills: TestDef[] = [
  [0, 25, "विज्ञान अभ्यास 1", "बल, गति, गुरुत्व, कार्य और ऊर्जा"],
  [25, 50, "विज्ञान अभ्यास 2", "ध्वनि, प्रकाश, विद्युत और ऊष्मा"],
  [50, 75, "विज्ञान अभ्यास 3", "परमाणु, आबंध, अम्ल और धातु"],
  [75, 100, "विज्ञान अभ्यास 4", "कोशिका, शरीर, आनुवंशिकी और पर्यावरण"],
].map(([start, end, title, subtitle]) =>
  paper({
    id: `sci-${start}-${end}`,
    title: String(title),
    subtitle: `${subtitle} · 25 प्रश्न`,
    kind: "section",
    durationMin: 25,
    questions: scienceQuestions.slice(Number(start), Number(end)),
  }),
);

export const tests: TestDef[] = [
  paper({
    id: "mock-1",
    title: "पूर्ण मॉक टेस्ट 1",
    subtitle: "150 प्रश्न · विज्ञान 100 + शिक्षण कला व अन्य दक्षता 50 · 2 घंटे 30 मिनट",
    kind: "full",
    durationMin: 150,
    questions: [...scienceQuestions, ...commonSet(1)],
  }),
  paper({
    id: "common-1",
    title: "सामान्य खंड — सेट 1",
    subtitle: "शिक्षण कला 30 + सामान्य ज्ञान, पर्यावरण, गणित, तर्क प्रत्येक 5",
    kind: "section",
    durationMin: 50,
    questions: commonSet(1),
  }),
  paper({
    id: "common-2",
    title: "सामान्य खंड — सेट 2",
    subtitle: "सेट 1 से अलग प्रश्न · सभी विषयों के अभ्यर्थियों के लिए",
    kind: "section",
    durationMin: 50,
    questions: commonSet(2),
  }),
  paper({
    id: "demo",
    title: "डेमो प्रश्नपत्र",
    subtitle: "आपके सैंपल वाले द्विभाषी प्रश्न · विज्ञान और अंकगणित",
    kind: "demo",
    durationMin: 20,
    questions: demoQuestions,
  }),
  paper({
    id: "ped-a",
    title: "शिक्षण कला — सेट अ",
    subtitle: "ब्लूम, सूक्ष्म शिक्षण, विधियाँ और अधिगम · 30 प्रश्न",
    kind: "section",
    durationMin: 30,
    questions: pedagogyQuestions.slice(0, 30),
  }),
  paper({
    id: "ped-b",
    title: "शिक्षण कला — सेट ब",
    subtitle: "मूल्यांकन, पाठ्यक्रम, कक्षा और पुनर्बलन · 30 प्रश्न",
    kind: "section",
    durationMin: 30,
    questions: pedagogyQuestions.slice(30, 60),
  }),
  ...scienceDrills,
  paper({
    id: "phy",
    title: "भौतिक विज्ञान",
    subtitle: "34 प्रश्न · कक्षा 11–12 का मूल भाग",
    kind: "section",
    durationMin: 34,
    questions: scienceQuestions.slice(0, 34),
  }),
  paper({
    id: "chem",
    title: "रसायन विज्ञान",
    subtitle: "33 प्रश्न",
    kind: "section",
    durationMin: 33,
    questions: scienceQuestions.slice(34, 67),
  }),
  paper({
    id: "bio",
    title: "जीव विज्ञान",
    subtitle: "33 प्रश्न",
    kind: "section",
    durationMin: 33,
    questions: scienceQuestions.slice(67, 100),
  }),
  paper({
    id: "gk",
    title: "सामान्य ज्ञान",
    subtitle: "बिहार और परीक्षा से जुड़े 12 प्रश्न",
    kind: "section",
    durationMin: 12,
    questions: gkQuestions,
  }),
  paper({
    id: "evs",
    title: "पर्यावरण विज्ञान",
    subtitle: "12 प्रश्न",
    kind: "section",
    durationMin: 12,
    questions: evsQuestions,
  }),
  paper({
    id: "math",
    title: "गणितीय योग्यता",
    subtitle: "प्रतिशत, अनुपात, ब्याज और क्षेत्रफल · 12 प्रश्न",
    kind: "section",
    durationMin: 12,
    questions: mathQuestions,
  }),
  paper({
    id: "reasoning",
    title: "तार्किक तर्क",
    subtitle: "शृंखला, सादृश्य, कूट और दिशा · 12 प्रश्न",
    kind: "section",
    durationMin: 12,
    questions: reasoningQuestions,
  }),
];

export function questionsFromIds(ids: string[]): Question[] {
  return ids.map((id) => {
    const question = questionById.get(id);
    if (!question) throw new Error(`Missing question ${id}`);
    return question;
  });
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = copy[i];
    copy[i] = copy[j];
    copy[j] = current;
  }
  return copy;
}

export function makeSmartTest(
  count: number,
  scope: "all" | "common" | "science" | "weak",
  progress: Progress,
): TestDef {
  const commonIds = new Set<SectionId>(["pedagogy", "gk", "evs", "math", "reasoning"]);
  let pool = allQuestions.filter((q) => !q.id.startsWith("demo-"));
  if (scope === "common") pool = pool.filter((q) => commonIds.has(q.section));
  if (scope === "science") pool = pool.filter((q) => q.section === "science");
  if (scope === "weak") {
    const weak = new Set(progress.wrongIds);
    pool = pool.filter((q) => weak.has(q.id));
  }

  const attempted = new Set(progress.attempts.flatMap((a) => a.questionIds));
  const wrong = new Set(progress.wrongIds);
  const ranked = shuffle(pool).sort((a, b) => {
    const rank = (q: Question) => (wrong.has(q.id) ? 0 : attempted.has(q.id) ? 2 : 1);
    return rank(a) - rank(b);
  });
  const picked = shuffle(ranked.slice(0, Math.min(count, ranked.length)));
  const titles: Record<typeof scope, string> = {
    all: "मिश्रित स्मार्ट सेट",
    common: "सामान्य खंड स्मार्ट सेट",
    science: "विज्ञान स्मार्ट सेट",
    weak: "गलत और छूटे प्रश्न",
  };
  return {
    id: `smart-${scope}-${Date.now()}`,
    title: titles[scope],
    subtitle: `${picked.length} प्रश्न · पहले कमजोर, फिर नए`,
    kind: "custom",
    durationMin: Math.max(10, picked.length),
    questions: picked,
  };
}

if (tests[0].questions.length !== 150) {
  throw new Error(`Full mock length ${tests[0].questions.length}`);
}
if (commonSet(1).length !== 50 || commonSet(2).length !== 50) {
  throw new Error("Common set length");
}
