import type { LangText } from "../lib/types";

export type Lang = "both" | "hi" | "en";

export function Bilingual({ text, lang }: { text: LangText; lang: Lang }) {
  if (lang === "en") return <span className="en">{text.en}</span>;
  if (lang === "hi") return <span className="hi">{text.hi}</span>;
  return (
    <>
      <span className="en">{text.en}</span>
      <span className="hi">{text.hi}</span>
    </>
  );
}
