import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/content";
import { getCurrentLang, setLang, DEFAULT_LANGUAGES, type Language } from "@/lib/translate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sélecteur de langue piloté par Google Website Translate (cf. lib/translate.ts).
// La liste des langues est gérée par l'admin dans le CMS (réglage « languages »).
// Affichage adaptatif : 2 langues → bascule inline ; au-delà → menu déroulant.
// `dark` adapte les couleurs sur fond transparent (hero).
export const LanguageSwitcher = ({ dark = false }: { dark?: boolean }) => {
  const { data: settings } = useSettings();
  const langs: Language[] = settings?.languages?.length ? settings.languages : DEFAULT_LANGUAGES;
  const current = getCurrentLang();
  const active = langs.find((l) => l.code === current) ?? langs[0];

  // 2 langues : bascule inline (comportement historique).
  if (langs.length <= 2) {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full border p-0.5 text-xs font-bold notranslate",
          dark ? "border-white/20" : "border-border"
        )}
        role="group"
        aria-label="Choix de la langue"
        translate="no"
      >
        {langs.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            aria-pressed={current === l.code}
            title={l.label}
            className={cn(
              "px-2.5 py-1 rounded-full uppercase transition-colors",
              current === l.code
                ? "bg-primary text-white"
                : dark
                ? "text-white/70 hover:text-white"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {l.code}
          </button>
        ))}
      </div>
    );
  }

  // 3 langues et plus : menu déroulant (clic sur la langue courante → liste).
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold uppercase transition-colors notranslate",
            dark
              ? "border-white/20 text-white/90 hover:text-white"
              : "border-border text-foreground hover:text-primary"
          )}
          aria-label="Choix de la langue"
          translate="no"
        >
          {active.code}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[11rem] notranslate" translate="no">
        {langs.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className="cursor-pointer gap-2"
          >
            <span className="flex-1">{l.label}</span>
            <span className="text-[10px] uppercase text-muted-foreground">{l.code}</span>
            {current === l.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
