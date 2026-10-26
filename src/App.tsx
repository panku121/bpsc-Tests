import { useEffect, useState } from "react";
import { questionsFromIds } from "./lib/catalog";
import { applyAttempt, freshPaper, loadProgress, saveProgress } from "./lib/storage";
import type { AttemptRecord, InProgress, Mode, Progress, Question, TestDef } from "./lib/types";
import { Exam } from "./ui/Exam";
import { Home } from "./ui/Home";
import { Result } from "./ui/Result";

type Screen =
  | { name: "home" }
  | { name: "exam"; title: string; questions: Question[] }
  | { name: "result"; attemptId: string };

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [screen, setScreen] = useState<Screen>({ name: "home" });

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  function start(test: TestDef, mode: Mode) {
    if (test.questions.length === 0) return;
    const paper = freshPaper({
      testId: test.id,
      title: test.title,
      mode,
      questionIds: test.questions.map((question) => question.id),
      durationMin: test.durationMin,
    });
    setProgress((current) => ({ ...current, inProgress: paper }));
    setScreen({ name: "exam", title: test.title, questions: test.questions });
  }

  function resume() {
    const paper = progress.inProgress;
    if (!paper) return;
    setScreen({
      name: "exam",
      title: paper.title,
      questions: questionsFromIds(paper.questionIds),
    });
  }

  function updatePaper(paper: InProgress) {
    setProgress((current) => ({ ...current, inProgress: paper }));
  }

  function submit(auto: boolean) {
    const paper = progress.inProgress;
    if (!paper || screen.name !== "exam") return;
    const questions = screen.questions;
    const score = questions.reduce(
      (sum, question, index) => sum + (paper.answers[index] === question.answer ? 1 : 0),
      0,
    );
    const attempt: AttemptRecord = {
      id: `attempt-${Date.now()}`,
      testId: paper.testId,
      title: paper.title,
      mode: paper.mode,
      questionIds: paper.questionIds,
      answers: paper.answers,
      marked: paper.marked,
      startedAt: paper.startedAt,
      submittedAt: Date.now(),
      autoSubmitted: auto,
      score,
      total: questions.length,
    };
    setProgress((current) => applyAttempt(current, attempt, questions));
    setScreen({ name: "result", attemptId: attempt.id });
  }

  function retryWrong(questions: Question[]) {
    start(
      {
        id: `retry-${Date.now()}`,
        title: "गलत और छूटे प्रश्न",
        subtitle: "पिछले प्रयास से",
        kind: "custom",
        durationMin: Math.max(10, questions.length),
        questions,
      },
      "practice",
    );
  }

  const attempt = progress.attempts.find((item) => screen.name === "result" && item.id === screen.attemptId);

  return (
    <>
      {screen.name === "home" && (
        <Home
          progress={progress}
          onCategory={(categoryId) => setProgress((current) => ({ ...current, categoryId }))}
          onStart={start}
          onResume={resume}
          onAbandon={() => setProgress((current) => ({ ...current, inProgress: null }))}
          onOpenAttempt={(attemptId) => setScreen({ name: "result", attemptId })}
          onImport={setProgress}
        />
      )}
      {screen.name === "exam" && progress.inProgress && (
        <Exam
          title={screen.title}
          questions={screen.questions}
          paper={progress.inProgress}
          onChange={updatePaper}
          onSubmit={submit}
          onExit={() => setScreen({ name: "home" })}
        />
      )}
      {screen.name === "result" && attempt && (
        <Result
          attempt={attempt}
          progress={progress}
          onHome={() => setScreen({ name: "home" })}
          onRetryWrong={retryWrong}
        />
      )}
      {screen.name === "result" && !attempt && (
        <main className="result">
          <p>यह प्रयास नहीं मिला।</p>
          <button className="btn" type="button" onClick={() => setScreen({ name: "home" })}>होम</button>
        </main>
      )}
    </>
  );
}
