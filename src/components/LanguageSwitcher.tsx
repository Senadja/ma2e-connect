import { cn } from "@/lib/utils";
import { getCurrentLang, setLang, type Lang } from "@/lib/translate";

// Sélecteur FR / EN. La traduction est assurée par Google Website Translate
// (cf. lib/translate.ts) : on écrit le cookie googtrans et la page se recharge.
// `dark` adapte les couleurs sur fond transparent (hero).
export const LanguageSwitcher = ({ dark = false }: { dark?: boolean }) => {
  const current = getCurrentLang();

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
      {(["fr", "en"] as const).map((lng: Lang) => (
        <button
          key={lng}
          onClick={() => setLang(lng)}
          aria-pressed={current === lng}
          className={cn(
            "px-2.5 py-1 rounded-full uppercase transition-colors",
            current === lng
              ? "bg-primary text-white"
              : dark
              ? "text-white/70 hover:text-white"
              : "text-muted-foreground hover:text-primary"
          )}
        >
          {lng}
        </button>
      ))}
    </div>
  );
};
