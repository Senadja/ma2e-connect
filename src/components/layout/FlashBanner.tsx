import { useState } from "react";
import { X } from "lucide-react";

export const FlashBanner = () => {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="relative z-[60] bg-gradient-gold text-accent-foreground">
      <div className="container flex items-center gap-3 py-2.5 text-sm">
        <span aria-hidden>🔔</span>
        <p className="flex-1 font-medium">
          Depuis le 01/12/2022, ouverture officielle de la plateforme <strong>E-MA2E</strong>. Coût du service : 500 F/mois.
        </p>
        <button onClick={() => setOpen(false)} aria-label="Fermer" className="p-1 hover:bg-black/10 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
