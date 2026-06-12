import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initMatomo, trackPageView } from "@/lib/matomo";

// Suit les changements de page dans le SPA (indispensable : Matomo ne voit
// pas les navigations React Router sans ce déclencheur).
export const MatomoTracker = () => {
  const location = useLocation();

  useEffect(() => {
    initMatomo();
  }, []);

  useEffect(() => {
    // Laisse le temps au <title> (react-helmet) de se mettre à jour.
    const t = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title);
    }, 0);
    return () => clearTimeout(t);
  }, [location]);

  return null;
};
