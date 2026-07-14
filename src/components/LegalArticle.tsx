import { Fragment, type ReactNode } from "react";
import type { LegalPage } from "@/data/legal";

// Transforme les e-mails et liens http(s) d'un texte en liens cliquables,
// sans injecter de HTML (pas de dangerouslySetInnerHTML) → pas de risque XSS.
const LINK_RE = /([\w.+-]+@[\w-]+\.[a-zA-Z]{2,}|https?:\/\/[^\s]+)/g;
function linkify(text: string): ReactNode[] {
  return text.split(LINK_RE).map((part, i) => {
    if (/^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(part)) {
      return <a key={i} href={`mailto:${part}`} className="text-primary underline">{part}</a>;
    }
    if (/^https?:\/\//.test(part)) {
      return <a key={i} href={part} target="_blank" rel="noreferrer noopener" className="text-primary underline">{part}</a>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

// Rend un corps de section : blocs séparés par une ligne vide ; un bloc dont toutes
// les lignes commencent par « - » devient une liste à puces, sinon un paragraphe.
function renderBody(body: string): ReactNode[] {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, bi) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      const isList = lines.length > 0 && lines.every((l) => /^-\s+/.test(l));
      if (isList) {
        return (
          <ul key={bi} className="mt-3 list-disc pl-6 text-muted-foreground space-y-1">
            {lines.map((l, li) => <li key={li}>{linkify(l.replace(/^-\s+/, ""))}</li>)}
          </ul>
        );
      }
      return <p key={bi} className="text-muted-foreground leading-relaxed">{linkify(lines.join(" "))}</p>;
    });
}

export function LegalArticle({ page }: { page: LegalPage }) {
  return (
    <section className="container py-16">
      <article className="mx-auto max-w-3xl space-y-8">
        {page.intro && (
          <div className="rounded-2xl border bg-primary/5 p-6 text-sm text-muted-foreground leading-relaxed">
            {linkify(page.intro)}
          </div>
        )}
        {page.sections.map((s, i) => (
          <section key={i}>
            {s.heading && <h2 className="font-display text-2xl text-primary mb-3">{s.heading}</h2>}
            <div className="space-y-3">{renderBody(s.body)}</div>
          </section>
        ))}
      </article>
    </section>
  );
}
