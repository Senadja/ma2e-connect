import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "@/lib/content";

export const FlashBanner = () => {
  const [open, setOpen] = useState(true);
  const { data: settings } = useSettings();

  // Nouveau modèle multi (flashInfos) ; repli sur l'ancien bandeau unique (flashBanner).
  const flash = settings?.flashInfos;
  const legacy = settings?.flashBanner;
  const items =
    flash?.enabled && flash.items?.length
      ? flash.items.filter((i) => i.text?.trim())
      : legacy?.enabled && legacy.text
      ? [{ text: legacy.text, url: legacy.link }]
      : [];
  const speed = Math.max(5, Number(flash?.speed) || 25); // secondes pour un défilement complet

  const visible = open && items.length > 0;

  // Prévient le header (Navbar) pour qu'il repositionne son offset.
  useEffect(() => {
    window.dispatchEvent(new Event("layoutchange"));
  }, [visible]);

  if (!visible) return null;

  const renderItem = (it: { text: string; url?: string }, key: string) => {
    const text = <span className="font-medium">{it.text}</span>;
    const isExternal = !!it.url && /^https?:\/\//.test(it.url);
    return (
      <span key={key} className="flex items-center">
        {it.url ? (
          isExternal ? (
            <a href={it.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{text}</a>
          ) : (
            <Link to={it.url} className="hover:underline">{text}</Link>
          )
        ) : (
          text
        )}
        <span className="mx-8 opacity-60" aria-hidden>•</span>
      </span>
    );
  };

  // Un segment regroupe tous les messages ; on le duplique pour une boucle sans couture (-50%).
  const segment = (dup: "a" | "b") => (
    <div className="flex shrink-0 items-center whitespace-nowrap" aria-hidden={dup === "b" ? true : undefined}>
      <span className="mr-8" aria-hidden>🔔</span>
      {items.map((it, i) => renderItem(it, `${dup}-${i}`))}
    </div>
  );

  return (
    <div data-flash-banner className="relative z-40 bg-gradient-gold text-accent-foreground">
      <div className="flex items-center gap-2 py-2.5 pl-4 text-sm">
        <div className="flex-1 overflow-hidden min-w-0">
          <div
            className="flex w-max animate-marquee hover:[animation-play-state:paused]"
            style={{ animationDuration: `${speed}s` }}
          >
            {segment("a")}
            {segment("b")}
          </div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Fermer" className="shrink-0 mr-3 p-1 rounded hover:bg-black/10">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
