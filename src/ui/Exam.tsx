import { useEffect, useRef, useState } from "react";
import { SECTION_LABEL } from "../lib/catalog";
import { formatClock } from "../lib/format";
import type { InProgress, Question } from "../lib/types";
import { Bilingual, type Lang } from "./text";

export function Exam({
  title,
  questions,
  paper,
  onChange,
  onSubmit,
  onExit,
}: {
  title: string;
  questions: Question[];
  paper: InProgress;
  onChange: (paper: InProgress) => void;
  onSubmit: (auto: boolean) => void;
  onExit: () => void;
}) {
  const [lang, setLang] = useState<Lang>("both");
  const [now, setNow] = useState(Date.now());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [askSubmit, setAskSubmit] = useState(false);
  const sent = useRef(false);
  const index = paper.index;
  const question = questions[index];
  const chosen = paper.answers[index];
  const locked = paper.mode === "practice" && chosen !== null;
  const answered = paper.answers.filter((answer) => answer !== null).length;
  const remaining = paper.endsAt ? paper.endsAt - now : null;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (paper.mode === "exam" && paper.endsAt && now >= paper.endsAt && !sent.current) {
      sent.current = true;
      onSubmit(true);
    }
  }, [now, onSubmit, paper.endsAt, paper.mode]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
      if (event.key >= "1" && event.key <= "4") pick(Number(event.key) - 1);
      if (event.key.toLowerCase() === "m") toggleMark();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function patch(next: Partial<InProgress>) {
    onChange({ ...paper, ...next });
  }

  function go(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= questions.length) return;
    const visited = paper.visited.slice();
    visited[nextIndex] = true;
    patch({ index: nextIndex, visited });
    setPaletteOpen(false);
  }

  function pick(option: number) {
    if (locked || option < 0 || option > 3) return;
    const answers = paper.answers.slice();
    answers[index] = option;
    patch({ answers });
  }

  function toggleMark() {
    const marked = paper.marked.slice();
    marked[index] = !marked[index];
    patch({ marked });
  }

  if (!question) return null;

  return (
    <div className="exam-shell">
      <header className="exam-top">
        <div>
          <h1>{title}</h1>
          <p>{paper.mode === "exam" ? "परीक्षा मोड · उत्तर अंत में खुलेंगे" : "अभ्यास मोड · चुनते ही व्याख्या"}</p>
        </div>
        <div className="exam-tools">
          <div className="lang">
            {(["both", "hi", "en"] as Lang[]).map((item) => (
              <button key={item} type="button" className={lang === item ? "on" : ""} onClick={() => setLang(item)}>
                {item === "both" ? "दोनों" : item === "hi" ? "हिंदी" : "English"}
              </button>
            ))}
          </div>
          {remaining !== null && (
            <div className={remaining < 5 * 60 * 1000 ? "timer danger" : "timer"}>{formatClock(remaining)}</div>
          )}
          <button className="btn secondary menu-btn" type="button" onClick={() => setPaletteOpen((open) => !open)}>
            प्रश्न
          </button>
          <button className="btn secondary" type="button" onClick={onExit}>रोकें</button>
          <button className="btn warn" type="button" onClick={() => setAskSubmit(true)}>जमा करें</button>
        </div>
      </header>

      <div className="exam-body">
        <section className="question-panel">
          <div className="q-meta">
            <span className="chip">प्रश्न {index + 1} / {questions.length}</span>
            <span className="chip">{SECTION_LABEL[question.section]} · {question.topic}</span>
          </div>
          <div className="prompt">
            <Bilingual text={question.q} lang={lang} />
          </div>
          <div className="options">
            {question.options.map((option, optionIndex) => {
              const selected = chosen === optionIndex;
              const showKey = locked;
              const correct = showKey && optionIndex === question.answer;
              const wrong = showKey && selected && optionIndex !== question.answer;
              const className = [
                "option",
                selected && !showKey ? "is-selected" : "",
                correct ? "is-correct" : "",
                wrong ? "is-wrong" : "",
              ].filter(Boolean).join(" ");
              return (
                <button key={option.en} className={className} type="button" disabled={locked} onClick={() => pick(optionIndex)}>
                  <span className="opt-index">{optionIndex + 1}</span>
                  <span>
                    <Bilingual text={option} lang={lang} />
                  </span>
                </button>
              );
            })}
          </div>
          {locked && (
            <div className="explain">
              <strong>{chosen === question.answer ? "सही।" : "सही विकल्प " + (question.answer + 1) + " है।"}</strong>
              <Bilingual text={question.explain} lang={lang} />
            </div>
          )}
          <div className="exam-actions">
            <button className="btn secondary" type="button" onClick={() => go(index - 1)} disabled={index === 0}>पिछला</button>
            <button
              className="btn secondary"
              type="button"
              disabled={locked || chosen === null}
              onClick={() => {
                const answers = paper.answers.slice();
                answers[index] = null;
                patch({ answers });
              }}
            >
              उत्तर हटाएँ
            </button>
            <button className="btn secondary" type="button" onClick={toggleMark}>
              {paper.marked[index] ? "चिह्न हटाएँ" : "समीक्षा चिह्न"}
            </button>
            <button className="btn" type="button" onClick={() => go(index + 1)} disabled={index === questions.length - 1}>
              सहेजें और अगला
            </button>
          </div>
        </section>

        <aside className={paletteOpen ? "palette open" : "palette"}>
          <h2>प्रश्न पत्र</h2>
          <div className="progress-line"><span style={{ width: `${(answered / questions.length) * 100}%` }} /></div>
          <p className="muted">{answered} उत्तर · {paper.marked.filter(Boolean).length} समीक्षा</p>
          <div className="dots" style={{ marginTop: 10 }}>
            {questions.map((item, dotIndex) => {
              const isAnswered = paper.answers[dotIndex] !== null;
              const isMarked = paper.marked[dotIndex];
              const className = [
                "dot",
                dotIndex === index ? "current" : "",
                isAnswered && isMarked ? "both" : "",
                isAnswered && !isMarked ? "answered" : "",
                !isAnswered && isMarked ? "marked" : "",
              ].filter(Boolean).join(" ");
              return (
                <button key={item.id} className={className} type="button" onClick={() => go(dotIndex)}>
                  {dotIndex + 1}
                </button>
              );
            })}
          </div>
          <div className="legend">
            <span><i style={{ background: "#e5f6ec" }} /> उत्तर दिया</span>
            <span><i style={{ background: "#f3edff" }} /> समीक्षा</span>
            <span><i style={{ background: "#6941c6" }} /> दोनों</span>
            <span><i /> बाकी</span>
          </div>
          <p className="muted" style={{ marginTop: 10 }}>कुंजी 1–4 विकल्प, तीर अगला-पिछला, M चिह्न। निगेटिव मार्किंग नहीं है।</p>
        </aside>
      </div>

      {askSubmit && (
        <div className="modal-back">
          <div className="modal">
            <h2>उत्तर जमा करें?</h2>
            <p>{questions.length - answered} प्रश्न अभी खाली हैं। खाली या गलत उत्तर पर अंक नहीं कटेंगे।</p>
            <div className="actions">
              <button className="btn" type="button" onClick={() => onSubmit(false)}>जमा करें</button>
              <button className="btn secondary" type="button" onClick={() => setAskSubmit(false)}>वापस जाएँ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
