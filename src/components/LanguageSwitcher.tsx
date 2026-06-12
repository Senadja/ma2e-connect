import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// Bascule FR / EN. `dark` adapte les couleurs sur fond transparent (hero).
export const LanguageSwitcher = ({ dark = false }: { dark?: boolean }) => {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.startsWith("en") ? "en" : "fr";

  const change = (lng: "fr" | "en") => {
    if (lng !== current) i18n.changeLanguage(lng);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border p-0.5 text-xs font-bold",
        dark ? "border-white/20" : "border-border"
      )}
      role="group"
      aria-label={t("common.chooseLanguage")}
    >
      {(["fr", "en"] as const).map((lng) => (
        <button
          key={lng}
          onClick={() => change(lng)}
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
