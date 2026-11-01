import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/content";
import { DEFAULT_FORMS_PUBLIC, type FormsPublicContent } from "@/data/formsPublic";

// Ouverture des formulaires publics : réglage CMS « formsPublic », repli sur
// src/data/formsPublic.ts (qui ouvre tout). Voir ce fichier pour le pourquoi.
export function useFormsPublic(): FormsPublicContent {
  const { data: settings } = useSettings();
  return { ...DEFAULT_FORMS_PUBLIC, ...(settings?.formsPublic ?? {}) };
}

// Panneau affiché à la place d'un formulaire fermé. Le texte est éditable au back-office :
// le client peut y renvoyer vers le formulaire papier de la médiathèque, un numéro, une date
// d'ouverture… sans que nous ayons à redéployer.
export const FormClosed = ({ className }: { className?: string }) => {
  const { closedNotice } = useFormsPublic();
  const paragraphs = (closedNotice || DEFAULT_FORMS_PUBLIC.closedNotice)
    .split(/\n\s*\n/)
    .filter((p) => p.trim());

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-8 text-center shadow-sm", className)}>
      <Info className="mx-auto mb-3 h-10 w-10 text-primary" />
      <div className="mx-auto max-w-prose space-y-2 text-sm leading-relaxed text-muted-foreground">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
};
