import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "@/lib/content";

export const FlashBanner = () => {
  const [open, setOpen] = useState(true);
  const [idx, setIdx] = useState(0);
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

  const visible = open && items.length > 0;

  // Rotation automatique si plusieurs messages.
  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  // Prévient le header (Navbar) pour qu'il repositionne son offset.
  useEffect(() => {
    window.dispatchEvent(new Event("layoutchange"));
  }, [visible]);

  if (!visible) return null;

  const current = items[idx % items.length];
  const text = <p>{current.text}</p>;
  const isExternal = !!current.url && /^https?:\/\//.test(current.url);

  return (
    <div data-flash-banner className="relative z-40 bg-gradient-gold text-accent-foreground">
      <div className="container flex items-center py-2.5 text-sm relative">
        <div className="flex-1 flex justify-center items-center gap-3 text-center font-medium">
          <span aria-hidden>🔔</span>
          {current.url ? (
            isExternal ? (
              <a href={current.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{text}</a>
            ) : (
              <Link to={current.url} className="hover:underline">{text}</Link>
            )
          ) : (
            text
          )}
        </div>
        <button onClick={() => setOpen(false)} aria-label="Fermer" className="absolute right-4 p-1 hover:bg-black/10 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
