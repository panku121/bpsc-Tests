import type { Question, SectionId } from "../lib/types";

export function Q(
  id: string,
  section: SectionId,
  topic: string,
  en: string,
  hi: string,
  enOpts: [string, string, string, string],
  hiOpts: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,
  exEn: string,
  exHi: string,
): Question {
  return {
    id,
    section,
    topic,
    q: { en, hi },
    options: [0, 1, 2, 3].map((i) => ({ en: enOpts[i], hi: hiOpts[i] })),
    answer,
    explain: { en: exEn, hi: exHi },
  };
}
