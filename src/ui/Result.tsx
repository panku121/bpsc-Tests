import { useMemo, useState } from "react";
import { CATEGORIES, questionById, questionsFromIds, SECTION_LABEL } from "../lib/catalog";
import { formatClock, formatWhen } from "../lib/format";
import type { AttemptRecord, Progress, Question, SectionId } from "../lib/types";
import { Bilingual, type Lang } from "./text";

export function Result({
  attempt,
  progress,
  onHome,
  onRetryWrong,
}: {
  attempt: AttemptRecord;
  progress: Progress;
  onHome: () => void;
  onRetryWrong: (questions: Question[]) => void;
}) {
  const [filter, setFilter] = useState<"wrong" | "all" | "right">("wrong");
  const [lang, setLang] = useState<Lang>("both");
  const questions = useMemo(() => {
    try {
      return questionsFromIds(attempt.questionIds);
    } catch {
      return [];
    }
  }, [attempt.questionIds]);

  const rows = questions.map((question, index) => {
    const chosen = attempt.answers[index];
    const correct = chosen === question.answer;
    return { question, index, chosen, correct, skipped: chosen === null };
  });
  const wrongRows = rows.filter((row) => !row.correct);
  const visible = rows.filter((row) => {
    if (filter === "all") return true;
    if (filter === "right") return row.correct;
    return !row.correct;
  });

  const sections = new Map<SectionId, { correct: number; total: number }>();
  rows.forEach((row) => {
    const current = sections.get(row.question.section) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (row.correct) current.correct += 1;
    sections.set(row.question.section, current);
  });

  const percent = attempt.total ? Math.round((attempt.score / attempt.total) * 100) : 0;
  const category = CATEGORIES.find((item) => item.id === progress.categoryId) ?? CATEGORIES[0];
  const fullPaper = attempt.total === 150;
  const needed = Math.ceil((category.percent / 100) * 150);
  const cleared = attempt.score >= needed;

  return (
    <main className="result">
      <div className="section-head">
        <div>
          <h2>{attempt.title}</h2>
          <p className="muted">
            {formatWhen(attempt.submittedAt)} · {attempt.mode === "exam" ? "परीक्षा मोड" : "अभ्यास मोड"}
            {attempt.autoSubmitted ? " · समय समाप्त" : ""}
          </p>
        </div>
        <button className="btn secondary" type="button" onClick={onHome}>होम</button>
      </div>

      <section className="card score-hero">
        <div className="score-ring" style={{ ["--p" as string]: percent }}>
          <div>
            <strong>{attempt.score}/{attempt.total}</strong>
            <span>{percent}%</span>
          </div>
        </div>
        <div>
          <h2>{percent}% अंक</h2>
          <p className="muted">
            समय {formatClock(attempt.submittedAt - attempt.startedAt)}। निगेटिव मार्किंग नहीं है।
          </p>
          {fullPaper ? (
            <p>
              {category.label} के लिए अक्सर {category.percent}% ({needed}/150) पात्रता बताई जाती है।
              इस प्रयास में आप {cleared ? "उस रेखा पर या उससे ऊपर हैं" : "उस रेखा से नीचे हैं"}।
              अंतिम कट-ऑफ उसी वर्ष की बीएसईबी अधिसूचना से मिला लें। एसटीईटी पात्रता है, नियुक्ति अलग प्रक्रिया है।
            </p>
          ) : (
            <p>पूरे पेपर का कट-ऑफ 150 अंकों पर लगता है। इस छोटे सेट का प्रतिशत केवल अभ्यास का संकेत है।</p>
          )}
          <div className="bars">
            {[...sections.entries()].map(([section, score]) => (
              <div className="bar-row" key={section}>
                <span>{SECTION_LABEL[section]}</span>
                <div className="bar"><span style={{ width: `${(score.correct / score.total) * 100}%` }} /></div>
                <strong>{score.correct}/{score.total}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-head">
        <div className="filters">
          <button className={filter === "wrong" ? "btn" : "btn secondary"} type="button" onClick={() => setFilter("wrong")}>
            गलत और छूटे ({wrongRows.length})
          </button>
          <button className={filter === "right" ? "btn" : "btn secondary"} type="button" onClick={() => setFilter("right")}>सही</button>
          <button className={filter === "all" ? "btn" : "btn secondary"} type="button" onClick={() => setFilter("all")}>सभी</button>
          <div className="filters">
            {(["both", "hi", "en"] as Lang[]).map((item) => (
              <button key={item} type="button" className={lang === item ? "btn" : "btn secondary"} onClick={() => setLang(item)}>
                {item === "both" ? "दोनों" : item === "hi" ? "हिंदी" : "English"}
              </button>
            ))}
          </div>
        </div>
        <button
          className="btn"
          type="button"
          disabled={wrongRows.length === 0}
          onClick={() => onRetryWrong(wrongRows.map((row) => row.question))}
        >
          गलत प्रश्नों का सेट
        </button>
      </div>

      <div className="review">
        {questions.length === 0 && <p>इस प्रयास के प्रश्न बैंक में अब नहीं मिले।</p>}
        {visible.map((row) => {
          const known = questionById.get(row.question.id);
          if (!known) return null;
          return (
            <article key={known.id}>
              <div className="q-meta">
                <span className="chip">प्रश्न {row.index + 1} · {SECTION_LABEL[known.section]}</span>
                <span className={row.correct ? "tag-ok" : "tag-bad"}>
                  {row.skipped ? "छोड़ा" : row.correct ? "सही" : "गलत"}
                </span>
              </div>
              <div className="prompt"><Bilingual text={known.q} lang={lang} /></div>
              <p>
                आपका उत्तर: {row.chosen === null ? "कोई नहीं" : known.options[row.chosen].hi}
                {" · "}सही: {known.options[known.answer].hi}
              </p>
              <div className="explain"><Bilingual text={known.explain} lang={lang} /></div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
