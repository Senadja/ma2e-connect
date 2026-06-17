import { useEffect } from "react";
import { EBANKING_URL } from "@/data/site";

// L'« Espace MA2E » pointe désormais vers l'e-banking externe (https://ebanking.ma2e.ci/).
// Toute visite de /espace-ema2e (ancien lien ou favori) est redirigée automatiquement.
const EspaceSocietaire = () => {
  useEffect(() => {
    window.location.replace(EBANKING_URL);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background text-center px-6">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-muted-foreground">Redirection vers votre Espace MA2E…</p>
      <a href={EBANKING_URL} className="text-primary font-semibold underline">
        Cliquez ici si la redirection ne démarre pas
      </a>
    </div>
  );
};

export default EspaceSocietaire;
