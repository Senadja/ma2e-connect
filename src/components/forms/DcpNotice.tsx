import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/content";
import { DEFAULT_FORMS_DCP } from "@/data/formsDcp";

const DCP_EMAIL_FALLBACK = "privacyMA2E@ma2e.ci";

// Textes DCP des formulaires : réglage CMS « formsDcp », repli sur src/data/formsDcp.ts.
// `fill()` remplace le gabarit {dcpEmail} par l'adresse DCP éditée au back-office,
// pour que les mentions et la politique DCP ne puissent pas diverger.
export function useFormsDcp() {
  const { data: settings } = useSettings();
  const dcp = { ...DEFAULT_FORMS_DCP, ...(settings?.formsDcp ?? {}) };
  const dcpEmail = settings?.contact?.dcpEmail || DCP_EMAIL_FALLBACK;
  return { dcp, fill: (text: string) => text.replace(/\{dcpEmail\}/g, dcpEmail) };
}

// Mention d'information DCP + rappel des champs obligatoires. À placer EN TÊTE de chaque
// formulaire collectant des données personnelles (exigence SD_PDCP : visible, pas repliée).
export const DcpNotice = ({ className }: { className?: string }) => {
  const { dcp, fill } = useFormsDcp();
  const paragraphs = fill(dcp.body).split(/\n\s*\n/).filter((p) => p.trim());

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

// Consigne de cadrage affichée au-dessus d'une zone de commentaire libre
// (minimisation + interdiction des données sensibles — 6 principes RGPD rappelés par SD_PDCP).
export const FreeTextHint = ({ className }: { className?: string }) => {
  const { dcp, fill } = useFormsDcp();
  if (!dcp.freeTextHint?.trim()) return null;
  return (
    <p className={cn("text-[11px] leading-relaxed text-muted-foreground", className)}>
      {fill(dcp.freeTextHint)}
    </p>
  );
};
