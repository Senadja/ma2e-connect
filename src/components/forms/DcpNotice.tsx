import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/content";
import { DEFAULT_FORMS_DCP, type DcpForm, type FormsDcpContent } from "@/data/formsDcp";

const DCP_EMAIL_FALLBACK = "privacyMA2E@ma2e.ci";

// Textes DCP des formulaires : réglage CMS « formsDcp », repli sur src/data/formsDcp.ts.
// `fill()` remplace le gabarit {dcpEmail} par l'adresse DCP éditée au back-office,
// pour que les mentions et la politique DCP ne puissent pas diverger.
//
// La fusion est faite champ par champ sur les deux sous-objets (`bodies`, `freeTextHint`) :
// un réglage partiel ou corrompu en base ne doit JAMAIS faire disparaître une mention
// d'information — à défaut, on retombe sur le texte SD_PDCP livré avec le code.
export function useFormsDcp() {
  const { data: settings } = useSettings();
  const stored = settings?.formsDcp ?? {};
  const storedBullets = stored.freeTextHint?.bullets;
  const dcp: FormsDcpContent = {
    ...DEFAULT_FORMS_DCP,
    ...stored,
    bodies: { ...DEFAULT_FORMS_DCP.bodies, ...(stored.bodies ?? {}) },
    freeTextHint: {
      intro: stored.freeTextHint?.intro ?? DEFAULT_FORMS_DCP.freeTextHint.intro,
      bullets:
        Array.isArray(storedBullets) && storedBullets.length > 0
          ? storedBullets
          : DEFAULT_FORMS_DCP.freeTextHint.bullets,
    },
  };
  const dcpEmail = settings?.contact?.dcpEmail || DCP_EMAIL_FALLBACK;
  return { dcp, fill: (text: string) => text.replace(/\{dcpEmail\}/g, dcpEmail) };
}

// Mention d'information DCP + rappel des champs obligatoires. À placer EN TÊTE de chaque
// formulaire collectant des données personnelles (exigence SD_PDCP : visible, pas repliée).
//
// `form` sélectionne la mention : SD_PDCP en a livré UNE PAR FORMULAIRE (prérequis R02), les
// catégories de données, les destinataires et les durées de conservation étant différents.
// Ne pas réutiliser la mention d'un formulaire pour un autre.
export const DcpNotice = ({ form, className }: { form: DcpForm; className?: string }) => {
  const { dcp, fill } = useFormsDcp();
  const paragraphs = fill(dcp.bodies[form]).split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div className={cn("rounded-xl border border-border/60 bg-secondary/30 p-4", className)}>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
        <h3 className="font-display text-sm font-bold">{dcp.title}</h3>
      </div>
      <div className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <p className="mt-3 text-xs font-semibold">{dcp.requiredNote}</p>
      <Link to="/politique-dcp" className="mt-1 inline-block text-xs text-primary font-semibold hover:underline">
        Consulter la politique de protection des données personnelles
      </Link>
    </div>
  );
};

// Consignes de cadrage affichées au-dessus d'une zone de commentaire libre.
// Texte et puces livrés par SD_PDCP (R02) : ne pas mentionner de nom, éviter les détails
// identifiants, éviter les données sensibles.
export const FreeTextHint = ({ className }: { className?: string }) => {
  const { dcp, fill } = useFormsDcp();
  const { intro, bullets } = dcp.freeTextHint;
  if (!intro?.trim() && bullets.length === 0) return null;
  return (
    <div className={cn("space-y-1 text-[11px] leading-relaxed text-muted-foreground", className)}>
      {intro?.trim() && <p>{fill(intro)}</p>}
      {bullets.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-4">
          {bullets.map((b, i) => (
            <li key={i}>{fill(b)}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
