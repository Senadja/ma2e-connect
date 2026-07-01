import { useEffect } from "react";
import { EBANKING_URL } from "@/data/site";
import { useSettings } from "@/lib/content";

// L'« Espace MA2E » pointe vers l'e-banking externe (éditable au CMS, repli sur la constante).
// Toute visite de /espace-ema2e (ancien lien ou favori) est redirigée automatiquement.
const EspaceSocietaire = () => {
  const { data: settings } = useSettings();
  const ebanking = settings?.links?.ebanking || EBANKING_URL;
  useEffect(() => {
    // petit délai pour laisser les réglages se charger (le repli reste correct)
    const id = setTimeout(() => window.location.replace(ebanking), 300);
    return () => clearTimeout(id);
  }, [ebanking]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background text-center px-6">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-muted-foreground">Redirection vers votre Espace MA2E…</p>
      <a href={ebanking} className="text-primary font-semibold underline">
        Cliquez ici si la redirection ne démarre pas
      </a>
    </div>
  );
};

export default EspaceSocietaire;
