import { useState } from "react";
import { allQuestions, CATEGORIES, makeSmartTest, tests } from "../lib/catalog";
import { formatWhen } from "../lib/format";
import { downloadProgress, isProgress } from "../lib/storage";
import type { Mode, Progress, TestDef } from "../lib/types";

type Scope = "all" | "common" | "science" | "weak";

const groups: { title: string; hint: string; ids: string[] }[] = [
  {
    title: "पूर्ण मॉक",
    hint: "असली पेपर जैसा समय और लंबाई",
    ids: ["mock-1"],
  },
  {
    title: "सभी विषयों का सामान्य खंड",
    hint: "शिक्षण कला 30 और अन्य दक्षता 20। यह हिस्सा हर विषय में समान है।",
    ids: ["common-1", "common-2", "ped-a", "ped-b"],
  },
  {
    title: "आपका डेमो सेट",
    hint: "जो द्विभाषी सैंपल आपने भेजा था",
    ids: ["demo"],
  },
  {
    title: "विज्ञान के खंड",
    hint: "पूर्ण मॉक का विषय-भाग अभी विज्ञान है",
    ids: ["sci-0-25", "sci-25-50", "sci-50-75", "sci-75-100", "phy", "chem", "bio"],
  },
  {
    title: "अन्य दक्षता",
    hint: "पाँच-पाँच अंक वाले छोटे हिस्से का अलग अभ्यास",
    ids: ["gk", "evs", "math", "reasoning"],
  },
];

export function Home({
  progress,
  onCategory,
  onStart,
  onResume,
  onAbandon,
  onOpenAttempt,
  onImport,
}: {
  progress: Progress;
  onCategory: (id: string) => void;
  onStart: (test: TestDef, mode: Mode) => void;
  onResume: () => void;
  onAbandon: () => void;
  onOpenAttempt: (id: string) => void;
  onImport: (progress: Progress) => void;
}) {
  const [count, setCount] = useState(20);
  const [scope, setScope] = useState<Scope>("common");
  const [message, setMessage] = useState("");
  const byId = new Map(tests.map((test) => [test.id, test]));
  const current = progress.inProgress;

  function launchSmart() {
    const test = makeSmartTest(count, scope, progress);
    if (test.questions.length === 0) {
      setMessage("इस दायरे में अभी प्रश्न नहीं हैं। पहले कोई टेस्ट दीजिए, फिर गलत प्रश्नों का सेट बनेगा।");
      return;
    }
    setMessage("");
    onStart(test, "practice");
  }

  return (
    <main className="app-home">
      <header className="topbar">
        <div className="brand">
          <div className="mark">STET</div>
          <div>
            <h1>बिहार एसटीईटी अभ्यास</h1>
            <p>माध्यमिक शिक्षक पात्रता परीक्षा · बीएसईबी पैटर्न</p>
          </div>
        </div>
        <label className="category">
          पात्रता की जाँच इस वर्ग से करें
          <select value={progress.categoryId} onChange={(event) => onCategory(event.target.value)}>
            {CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} · {item.percent}%
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="pattern">
        <article className="card">
          <h2>प्रश्नपत्र पैटर्न</h2>
          <p>कंप्यूटर आधारित परीक्षा। हर प्रश्न 1 अंक। गलत उत्तर पर अंक नहीं कटते। समय 2 घंटे 30 मिनट।</p>
          <div className="marks">
            <span>निर्दिष्ट विषय वस्तु</span><span>100</span>
            <span>शिक्षण कला</span><span>30</span>
            <span>सामान्य ज्ञान</span><span>05</span>
            <span>पर्यावरण विज्ञान</span><span>05</span>
            <span>गणितीय योग्यता</span><span>05</span>
            <span>तार्किक तर्क</span><span>05</span>
            <span className="total">कुल अंक</span><span className="total">150</span>
          </div>
        </article>
        <article className="card">
          <h2>कैसे अभ्यास करें</h2>
          <p>परीक्षा मोड में उत्तर छिपे रहते हैं और घड़ी चलती है। अभ्यास मोड में विकल्प चुनते ही सही उत्तर और व्याख्या खुलती है।</p>
          <p>गलत या छूटे प्रश्न अपने आप एक दोहराने वाले सेट में जुड़ जाते हैं। प्रगति इसी ब्राउज़र में रहती है। बैकअप फ़ाइल डाउनलोड कर सकते हैं।</p>
        </article>
      </section>

      <aside className="note">
        <strong>विषय: </strong>
        आपके सैंपल विज्ञान के थे, इसलिए पूर्ण मॉक का 100 अंकीय हिस्सा विज्ञान का है। शिक्षण कला वाला 50 अंकीय खंड हर विषय में एक जैसा होता है, इसलिए गणित, हिंदी या सामाजिक विज्ञान वाले अभ्यर्थी भी उसे यहीं से करें। अपना विषय बताएँ तो उसी का अलग बैंक जोड़ दिया जाएगा। प्रश्न मूल अभ्यास के लिए लिखे गए हैं, किसी पुस्तक से काटकर नहीं रखे गए।
      </aside>

      {current && (
        <div className="continue">
          <div>
            <strong>अधूरा पेपर: {current.title}</strong>
            <p>
              {current.answers.filter((answer) => answer !== null).length} / {current.questionIds.length} उत्तर दिए गए
            </p>
          </div>
          <div className="actions">
            <button className="btn" type="button" onClick={onResume}>जारी रखें</button>
            <button className="btn secondary" type="button" onClick={onAbandon}>हटाएँ</button>
          </div>
        </div>
      )}

      <div className="section-head">
        <div>
          <h2>नया सेट बनाएँ</h2>
          <p className="muted">हर बार क्रम बदलता है। पहले गलत प्रश्न आते हैं, फिर वे जो अभी तक नहीं पूछे गए।</p>
        </div>
      </div>
      <div className="card builder">
        <select value={scope} onChange={(event) => setScope(event.target.value as Scope)}>
          <option value="common">सामान्य खंड</option>
          <option value="science">विज्ञान</option>
          <option value="all">पूरा बैंक</option>
          <option value="weak">केवल गलत और छूटे</option>
        </select>
        <select value={count} onChange={(event) => setCount(Number(event.target.value))}>
          <option value={10}>10 प्रश्न</option>
          <option value={20}>20 प्रश्न</option>
          <option value={40}>40 प्रश्न</option>
          <option value={50}>50 प्रश्न</option>
        </select>
        <button className="btn" type="button" onClick={launchSmart}>अभ्यास शुरू करें</button>
        <span className="muted">बैंक में {allQuestions.length} प्रश्न हैं।</span>
      </div>
      {message && <p className="note">{message}</p>}

      {groups.map((group) => (
        <section key={group.title}>
          <div className="section-head">
            <div>
              <h2>{group.title}</h2>
              <p className="muted">{group.hint}</p>
            </div>
          </div>
          <div className="grid">
            {group.ids.map((id) => {
              const test = byId.get(id);
              if (!test) return null;
              return (
                <article className="test-card" key={test.id}>
                  <span className="chip">{test.questions.length} प्रश्न · {test.durationMin} मि</span>
                  <h3>{test.title}</h3>
                  <p>{test.subtitle}</p>
                  <div className="actions">
                    <button className="btn" type="button" onClick={() => onStart(test, "exam")}>परीक्षा</button>
                    <button className="btn secondary" type="button" onClick={() => onStart(test, "practice")}>अभ्यास</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <div className="section-head">
        <div>
          <h2>पिछले प्रयास</h2>
          <p className="muted">गलत प्रश्न: {progress.wrongIds.length}</p>
        </div>
        <div className="actions">
          <button className="btn secondary" type="button" onClick={() => downloadProgress(progress)}>प्रगति डाउनलोड</button>
          <label className="btn secondary">
            प्रगति लोड
            <input
              hidden
              type="file"
              accept="application/json"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                try {
                  const parsed: unknown = JSON.parse(await file.text());
                  if (!isProgress(parsed)) {
                    setMessage("यह फ़ाइल प्रगति की फ़ाइल नहीं लगती।");
                    return;
                  }
                  onImport({
                    attempts: parsed.attempts ?? [],
                    inProgress: parsed.inProgress ?? null,
                    wrongIds: parsed.wrongIds ?? [],
                    bookmarkIds: parsed.bookmarkIds ?? [],
                    categoryId: parsed.categoryId || "ur",
                  });
                  setMessage("प्रगति लोड हो गई।");
                } catch {
                  setMessage("फ़ाइल पढ़ी नहीं जा सकी।");
                }
              }}
            />
          </label>
        </div>
      </div>
      <div className="history">
        {progress.attempts.length === 0 && <p className="muted">अभी कोई प्रयास जमा नहीं हुआ।</p>}
        {progress.attempts.map((attempt) => (
          <button key={attempt.id} type="button" onClick={() => onOpenAttempt(attempt.id)}>
            <span>
              <strong>{attempt.title}</strong>
              <span className="muted"> · {formatWhen(attempt.submittedAt)} · {attempt.mode === "exam" ? "परीक्षा" : "अभ्यास"}</span>
            </span>
            <span className="score-pill">{attempt.score}/{attempt.total}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
