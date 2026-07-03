import { useEffect, useState } from "react";
import { useSettings } from "@/lib/content";
import { safeHref, isExternalHref } from "@/lib/safeUrl";
import { X } from "lucide-react";

const SESSION_KEY = "ma2e-splash-seen";

// Pop-up publicitaire affichée une fois par session au premier chargement.
// Activée et paramétrée via le CMS (réglage "splash").
export const SplashModal = () => {
  const { data: settings } = useSettings();
  const [open, setOpen] = useState(false);

  const splash = settings?.splash;
  const enabled = !!(splash?.enabled && splash.image);

  useEffect(() => {
    if (!enabled) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setOpen(true);
  }, [enabled]);

  if (!enabled || !open) return null;

  const close = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(false);
  };

  const img = (
    <img src={splash!.image} alt="" className="max-h-[80vh] w-auto max-w-[90vw] rounded-lg object-contain shadow-2xl" />
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Annonce MA2E">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
      <div className="relative z-10 animate-scale-in">
        <button
          onClick={close}
          aria-label="Fermer l'annonce"
          className="absolute -top-3 -right-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white text-primary-dark shadow-lg transition-transform hover:scale-110"
        >
          <X className="h-5 w-5" />
        </button>
        {safeHref(splash!.link) ? (
          <a
            href={safeHref(splash!.link)}
            target={isExternalHref(splash!.link) ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={close}
          >
            {img}
          </a>
        ) : (
          img
        )}
      </div>
    </div>
  );
};

export default SplashModal;
